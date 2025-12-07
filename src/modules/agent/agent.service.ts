import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Agent } from 'src/schemas/agent.schema';
import { Connection, Model } from 'mongoose';
import { Agency } from 'src/schemas/agency.schema';
import { AccountType, Wallet } from 'src/schemas/wallet.schema';
import { WalletTransaction } from 'src/schemas/wallet.transaction.schema';

@Injectable()
export class AgentService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<Agent>,
    @InjectModel(Agency.name) private agencyModel: Model<Agency>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(WalletTransaction.name)
    private walletTransactionModel: Model<WalletTransaction>,
    @InjectConnection() private connection: Connection,
  ) {}

  async create(createAgentDto: CreateAgentDto) {
    const agency_id = createAgentDto.agency_id;
    const name = createAgentDto.name;

    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      const agency = await this.agencyModel
        .findById(agency_id)
        .session(session);

      if (!agency) throw new NotFoundException('Agency not found');

      const [agent] = await this.agentModel.create(
        [
          {
            name,
            agency_id,
          },
        ],
        { session: session },
      );

      await this.walletModel.create(
        [
          {
            account_type: AccountType.AGENT,
            owner_id: agent._id,
          },
        ],
        { session: session },
      );

      await session.commitTransaction();
      await session.endSession();

      return { name: agent.name };
    } catch (e) {
      await session.abortTransaction();
      await session.endSession();
      throw e;
    }
  }

  findAll() {
    return this.agentModel.find({}, { _id: true, name: true, agency_id: true });
  }

  async findOne(id: string) {
    const agent = await this.agentModel.findById(id);
    if (agent == null) {
      throw new NotFoundException('user does not exists');
    }
    const [agency, wallet] = await Promise.all([
      this.agencyModel.findById(agent.agency_id),
      this.walletModel.find({ owner_id: agent._id }),
    ]);
    return {
      agent,
      agency,
      wallet,
    };
  }

  async getWalletTransactions(id: string) {
    const wallet = await this.walletModel.findOne({ owner_id: id });
    if (wallet == null || wallet.account_type !== AccountType.AGENT) {
      return [];
    }
    return this.walletTransactionModel.find(
      { wallet_id: wallet?._id },
      {
        _id: false,
        type: true,
        createdAt: true,
        balance_before: true,
        balance_after: true,
        main_process: true,
      },
    );
  }
}
