import { Injectable } from '@nestjs/common';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Agency } from 'src/schemas/agency.schema';
import { AccountType, Wallet } from 'src/schemas/wallet.schema';
import { WalletTransaction } from 'src/schemas/wallet.transaction.schema';

@Injectable()
export class AgencyService {
  constructor(
    @InjectModel(Agency.name) private agencyModel: Model<Agency>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(WalletTransaction.name)
    private walletTransactionModel: Model<WalletTransaction>,
    @InjectConnection() private connection: Connection,
  ) {}

  async create(createAgencyDto: CreateAgencyDto) {
    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      const [agency] = await this.agencyModel.create([createAgencyDto], {
        session: session,
      });

      await this.walletModel.create(
        [
          {
            account_type: AccountType.AGENCY,
            owner_id: agency._id,
          },
        ],
        { session: session },
      );

      await session.commitTransaction();
      await session.endSession();

      return {
        _id: agency._id.toString(),
        name: agency.name,
      };
    } catch (e) {
      console.log(e);
      await session.abortTransaction();
      await session.endSession();
      throw e;
    }
  }

  findAll() {
    return this.agencyModel.find({}, { name: true, _id: true });
  }

  findOne(id: number) {
    return `This action returns a #${id} agency`;
  }

  update(id: number, updateAgencyDto: UpdateAgencyDto) {
    return `This action updates a #${id} agency ${updateAgencyDto.name}`;
  }

  remove(id: number) {
    return `This action removes a #${id} agency`;
  }

  async getWalletTransactions(id: string) {
    const wallet = await this.walletModel.findOne({ owner_id: id });
    if (wallet == null || wallet.account_type !== AccountType.AGENCY) {
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
