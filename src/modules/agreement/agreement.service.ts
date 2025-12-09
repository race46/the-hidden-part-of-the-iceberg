import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Agreement, AgreementStatus } from 'src/schemas/agreement.schema';
import { ClientSession, Connection, Model } from 'mongoose';
import { Agent } from 'src/schemas/agent.schema';
import { Property } from 'src/schemas/property.schema';
import { PropertyUtils } from '../utils/property.utils';
import { AgentUtils } from '../utils/agent.utils';
import { AgreementStage } from 'src/schemas/agreement.stage.schema';
import {
  calculateListingAgencyPortion,
  calculateListingAgentPortion,
  calculateSellingAgencyPortion,
  calculateSellingAgentPortion,
} from './agreement.helper';
import { WalletUtils } from '../utils/wallet.utils';
import { TransactionType } from 'src/schemas/wallet.schema';

@Injectable()
export class AgreementService {
  constructor(
    @InjectModel(Agreement.name) private agreementModel: Model<Agreement>,
    @InjectModel(Agent.name) private agentModel: Model<Agent>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    @InjectModel(AgreementStage.name)
    private agreementStageModel: Model<AgreementStage>,
    @InjectConnection() private connection: Connection,
    private readonly propertyUtils: PropertyUtils,
    private readonly agentUtils: AgentUtils,
    private readonly walletUtils: WalletUtils,
  ) {}

  async create(createAgreementDto: CreateAgreementDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.agentUtils.checkListingRight(
        session,
        createAgreementDto.listing_agent_id,
      );
      await this.agentUtils.checkSellingRight(
        session,
        createAgreementDto.selling_agent_id,
      );

      await this.propertyUtils.integrateToTransaction(
        session,
        createAgreementDto.property_id,
      );

      const [agreement] = await this.agreementModel.create(
        [
          {
            listing_agent: createAgreementDto.listing_agent_id,
            selling_agent: createAgreementDto.selling_agent_id,
            price: createAgreementDto.price,
            property: createAgreementDto.property_id,
            type: createAgreementDto.type,
          },
        ],
        { session: session },
      );

      await this.createAgreementStage(
        session,
        agreement._id.toString(),
        AgreementStatus.AGREEMENT,
      );

      await session.commitTransaction();
      await session.endSession();

      return { _id: agreement._id.toString() };
    } catch (exception) {
      await session.abortTransaction();
      await session.endSession();

      throw exception;
    }
  }

  async findAll() {
    return this.agreementModel.find({}, { _id: true });
  }

  findOne(id: string) {
    return this.agreementModel.findById(id);
  }

  update(id: number, updateAgreementDto: UpdateAgreementDto) {
    return `This action updates a #${id} agreement ${updateAgreementDto.listing_agent_id}`;
  }

  remove(id: number) {
    return `This action removes a #${id} agreement`;
  }

  async earnestMoney(agreementId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const agreement = await this.agreementModel
        .findById(agreementId)
        .session(session);

      if (agreement == null) {
        throw new NotFoundException('agreement is not found');
      }

      if (agreement.status !== AgreementStatus.AGREEMENT) {
        throw new BadRequestException(
          'agreement status is not suitable for this operation',
        );
      }

      agreement.status = AgreementStatus.EARNEST_MONEY;
      await Promise.all([
        agreement.save(),
        this.createAgreementStage(
          session,
          agreementId,
          AgreementStatus.EARNEST_MONEY,
        ),
      ]);

      await session.commitTransaction();
      await session.endSession();

      return { _id: agreement._id };
    } catch (exception) {
      await session.abortTransaction();
      await session.endSession();

      throw exception;
    }
  }

  async titleDeed(agreementId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const agreement = await this.agreementModel
        .findById(agreementId)
        .session(session);

      if (agreement == null) {
        throw new NotFoundException('agreement is not found');
      }

      if (agreement.status !== AgreementStatus.EARNEST_MONEY) {
        throw new BadRequestException(
          'agreement status is not suitable for this operation',
        );
      }

      agreement.status = AgreementStatus.TITLE_DEED;
      await Promise.all([
        agreement.save(),
        this.createAgreementStage(
          session,
          agreementId,
          AgreementStatus.TITLE_DEED,
        ),
      ]);

      await session.commitTransaction();
      await session.endSession();

      return { _id: agreement._id };
    } catch (exception) {
      await session.abortTransaction();
      await session.endSession();

      throw exception;
    }
  }

  async complete(agreementId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const agreement = await this.agreementModel
        .findById(agreementId)
        .session(session);

      if (agreement == null) {
        throw new NotFoundException('agreement is not found');
      }

      if (agreement.status !== AgreementStatus.TITLE_DEED) {
        throw new BadRequestException(
          'agreement status is not suitable for this operation',
        );
      }

      agreement.status = AgreementStatus.COMPLETED;
      await this.createAgreementStage(
        session,
        agreementId,
        AgreementStatus.COMPLETED,
      );

      await this.allocatePortions(session, agreement._id.toString(), agreement);

      await agreement.save();

      await session.commitTransaction();
      await session.endSession();

      return { _id: agreement?._id.toString() };
    } catch (exception) {
      await session.abortTransaction();
      await session.endSession();

      throw exception;
    }
  }

  async allocatePortions(
    session: ClientSession,
    agreementId: string,
    agreement: Agreement,
  ) {
    const sellingAgent = await this.agentModel
      .findById(agreement.selling_agent)
      .session(session);

    const listingAgent = await this.agentModel
      .findById(agreement.listing_agent)
      .session(session);

    if (listingAgent == null || sellingAgent == null) {
      throw new NotFoundException('related agent is not found');
    }

    const listingAgentPortion = calculateListingAgentPortion();
    const sellingAgentPortion = calculateSellingAgentPortion();
    const listingAgencyPortion = calculateListingAgencyPortion();
    const sellingAgencyPortion = calculateSellingAgencyPortion();

    await this.walletUtils.doTransaction(
      session,
      listingAgent._id.toString(),
      agreementId,
      TransactionType.LISTING_AGENT_COMMISSION,
      listingAgentPortion,
    );

    await this.walletUtils.doTransaction(
      session,
      sellingAgent._id.toString(),
      agreementId,
      TransactionType.SELLING_AGENT_COMMISSION,
      sellingAgentPortion,
    );

    await this.walletUtils.doTransaction(
      session,
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      listingAgent.agency_id.toString(),
      agreementId,
      TransactionType.LISTING_AGENCY_PORTION,
      listingAgencyPortion,
    );

    await this.walletUtils.doTransaction(
      session,
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      sellingAgent.agency_id.toString(),
      agreementId,
      TransactionType.SELLING_AGENCY_PORTION,
      sellingAgencyPortion,
    );
  }

  async createAgreementStage(
    session: ClientSession,
    agreementId: string,
    status: AgreementStatus,
  ) {
    return await this.agreementStageModel.create(
      [{ agreement: agreementId, status: status }],
      { session: session },
    );
  }

  getStages(agreementId: string) {
    return this.agreementStageModel.find({ agreement: agreementId });
  }
}
