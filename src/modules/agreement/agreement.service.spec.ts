import { Test, TestingModule } from '@nestjs/testing';
import { AgreementService } from './agreement.service';
import { AppModule } from 'src/app.module';
import { UtilsModule } from '../utils/utils.module';
import { Agent } from 'src/schemas/agent.schema';
import { Model } from 'mongoose';
import { Agency } from 'src/schemas/agency.schema';
import { getModelToken } from '@nestjs/mongoose';
import { AgentService } from '../agent/agent.service';
import { AgencyService } from '../agency/agency.service';
import { AgencyModule } from '../agency/agency.module';
import { AgentModule } from '../agent/agent.module';
import { PropertyModule } from '../property/property.module';
import { PropertyService } from '../property/property.service';
import {
  Agreement,
  AgreementStatus,
  AgreementType,
} from 'src/schemas/agreement.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Property } from 'src/schemas/property.schema';
import { AgreementStage } from 'src/schemas/agreement.stage.schema';
import { TransactionType, Wallet } from 'src/schemas/wallet.schema';
import { WalletTransaction } from 'src/schemas/wallet.transaction.schema';

describe('AgreementService', () => {
  let service: AgreementService;
  let agencyService: AgencyService;
  let agentService: AgentService;
  let propertyService: PropertyService;

  let agentModel: Model<Agent>;
  let agencyModel: Model<Agency>;
  let walletModel: Model<Wallet>;
  let walletTransactionModel: Model<WalletTransaction>;
  let propertyModel: Model<Property>;
  let agreementModel: Model<Agreement>;
  let agreementStageModel: Model<AgreementStage>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        UtilsModule,
        AgentModule,
        AgencyModule,
        PropertyModule,
      ],
      providers: [AgreementService, AgentService, AgencyService],
    }).compile();

    service = module.get<AgreementService>(AgreementService);
    agencyService = module.get<AgencyService>(AgencyService);
    agentService = module.get<AgentService>(AgentService);
    propertyService = module.get<PropertyService>(PropertyService);

    agentModel = module.get<Model<Agent>>(getModelToken(Agent.name));
    walletModel = module.get<Model<Wallet>>(getModelToken(Wallet.name));
    walletTransactionModel = module.get<Model<WalletTransaction>>(
      getModelToken(WalletTransaction.name),
    );
    agencyModel = module.get<Model<Agency>>(getModelToken(Agency.name));
    propertyModel = module.get<Model<Property>>(getModelToken(Property.name));
    agreementModel = module.get<Model<Agreement>>(
      getModelToken(Agreement.name),
    );
    agreementStageModel = module.get<Model<AgreementStage>>(
      getModelToken(AgreementStage.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Creating a New Agreement', () => {
    let agencyA_id: string;
    let agencyB_id: string;

    let agentA_id: string;
    let agentB_id: string;

    let propertyId: string;

    beforeEach(async () => {
      agencyA_id = (await agencyService.create({ name: 'Agency A' }))._id;
      agencyB_id = (await agencyService.create({ name: 'Agency B' }))._id;

      agentA_id = (
        await agentService.create({
          name: 'Agent A',
          agency_id: agencyA_id,
        })
      )._id;

      agentB_id = (
        await agentService.create({
          name: 'Agent B',
          agency_id: agencyB_id,
        })
      )._id;

      propertyId = (
        await propertyService.create({
          name: 'Property',
          agent_id: agentA_id,
        })
      )._id;
    });

    afterEach(async () => {
      await agencyModel.findByIdAndDelete(agencyA_id);
      await agencyModel.findByIdAndDelete(agencyB_id);
      await agentModel.findByIdAndDelete(agentA_id);
      await agentModel.findByIdAndDelete(agentB_id);
    });

    it('should not create an agreement with non exist agent', async () => {
      const dummyId1 = '693874000ab9a2b0477c1d68';
      const dummyId2 = '693874000ab9a2b0477c1d6c';

      await expect(
        service.create({
          listing_agent_id: dummyId1,
          selling_agent_id: dummyId2,
          price: 1000,
          property_id: propertyId,
          type: AgreementType.RENTAL,
        }),
      ).rejects.toThrow(new NotFoundException('Agent not found'));
    });

    it('should not create an agreement with a property which has an active transaction', async () => {
      await propertyModel.findByIdAndUpdate(propertyId, {
        has_active_transaction: true,
      });

      await expect(
        service.create({
          listing_agent_id: agentA_id,
          selling_agent_id: agentB_id,
          price: 1000,
          property_id: propertyId,
          type: AgreementType.RENTAL,
        }),
      ).rejects.toThrow(new BadRequestException('invalid property'));
    });

    it('should create and agreement with valid parameters, the stage must be created and property should become not listed and active transaction', async () => {
      const result = await service.create({
        listing_agent_id: agentA_id,
        selling_agent_id: agentB_id,
        price: 1000,
        property_id: propertyId,
        type: AgreementType.RENTAL,
      });
      const property = await propertyModel.findById(propertyId);
      const agreementStages = await agreementStageModel.find({
        agreement: result._id,
      });

      expect(result._id).toBeDefined();
      expect(result._id).toMatch(/^[a-fA-F0-9]{24}$/);

      expect(property?.has_active_transaction).toBeTruthy();
      expect(property?.is_listing).toBeFalsy();

      expect(agreementStages.length).toEqual(1);
      expect(agreementStages[0].status).toBe('agreement');
    });

    it('should not complete and agreement whose status is not title-deed', async () => {
      const result = await service.create({
        listing_agent_id: agentA_id,
        selling_agent_id: agentB_id,
        price: 1000,
        property_id: propertyId,
        type: AgreementType.RENTAL,
      });
      await expect(service.complete(result._id)).rejects.toThrow(
        new BadRequestException(
          'agreement status is not suitable for this operation',
        ),
      );

      for (const status of Object.values(AgreementStatus)) {
        if (status === AgreementStatus.TITLE_DEED) continue;

        await agreementModel.findByIdAndUpdate(result._id, { status: status });

        await expect(service.complete(result._id)).rejects.toThrow(
          new BadRequestException(
            'agreement status is not suitable for this operation',
          ),
        );
      }
    });

    it('should complete and agreement whose status is not title-deed and commission should be shared among agents and agencies', async () => {
      const result = await service.create({
        listing_agent_id: agentA_id,
        selling_agent_id: agentB_id,
        price: 1000,
        property_id: propertyId,
        type: AgreementType.RENTAL,
      });

      await agreementModel.findByIdAndUpdate(result._id, {
        status: AgreementStatus.TITLE_DEED,
      });

      const completeResult = await service.complete(result._id);
      expect(completeResult._id).toEqual(result._id);

      const wallets = await walletModel.find({
        owner_id: { $in: [agencyA_id, agencyB_id, agentA_id, agentB_id] },
      });

      const walletTransactions = await walletTransactionModel.find({
        main_process: result._id,
      });

      expect(wallets.length).toEqual(4);
      for (const wallet of wallets) {
        expect(wallet.balance).toEqual(25);
      }

      expect(walletTransactions.map((wt) => wt.type)).toEqual(
        expect.arrayContaining([
          TransactionType.LISTING_AGENCY_PORTION,
          TransactionType.SELLING_AGENCY_PORTION,
          TransactionType.LISTING_AGENT_COMMISSION,
          TransactionType.SELLING_AGENT_COMMISSION,
        ]),
      );
    });

    it('should complete and agreement whose status is not title-deed and commission should be shared among agents and agencies when selling agent and listing agent is the same', async () => {
      const result = await service.create({
        listing_agent_id: agentA_id,
        selling_agent_id: agentA_id,
        price: 1000,
        property_id: propertyId,
        type: AgreementType.RENTAL,
      });

      await agreementModel.findByIdAndUpdate(result._id, {
        status: AgreementStatus.TITLE_DEED,
      });

      const completeResult = await service.complete(result._id);
      expect(completeResult._id).toEqual(result._id);

      const wallets = await walletModel.find({
        owner_id: { $in: [agencyA_id, agentA_id] },
      });

      const walletTransactions = await walletTransactionModel.find({
        main_process: result._id,
      });

      expect(wallets.length).toEqual(2);
      for (const wallet of wallets) {
        expect(wallet.balance).toEqual(50);
      }

      expect(walletTransactions.map((wt) => wt.type)).toEqual(
        expect.arrayContaining([
          TransactionType.LISTING_AGENCY_PORTION,
          TransactionType.SELLING_AGENCY_PORTION,
          TransactionType.LISTING_AGENT_COMMISSION,
          TransactionType.SELLING_AGENT_COMMISSION,
        ]),
      );
    });
  });
});
