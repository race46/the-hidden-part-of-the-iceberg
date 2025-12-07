import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isInstance } from 'class-validator';
import { ClientSession, Model } from 'mongoose';
import { TransactionType, Wallet } from 'src/schemas/wallet.schema';
import { WalletTransaction } from 'src/schemas/wallet.transaction.schema';

@Injectable()
export class WalletUtils {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(WalletTransaction.name)
    private walletTransactionModel: Model<WalletTransaction>,
  ) {}

  async createWallet() {}

  async doTransaction(
    session: ClientSession,
    user_id: string,
    main_process_id: string,
    transaction_type: TransactionType,
    amount: number,
  ) {
    if (amount == null || isInstance(amount, Number) || amount <= 0) {
      throw new BadRequestException('invalid amount');
    }

    const wallet = await this.walletModel
      .findOne({ owner_id: user_id })
      .session(session);

    if (wallet == null) {
      throw new NotFoundException('owner wallet is now found');
    }

    const isIncrease: boolean =
      transaction_type === TransactionType.LISTING_AGENCY_PORTION ||
      transaction_type === TransactionType.SELLING_AGENCY_PORTION ||
      transaction_type === TransactionType.SELLING_AGENT_COMMISSION ||
      transaction_type === TransactionType.LISTING_AGENT_COMMISSION;

    const isDecrease: boolean = false;

    if (isIncrease === isDecrease) {
      throw new BadRequestException(
        'wallet transaction cannot be both increase and decrease',
      );
    }

    if (isDecrease) {
      amount *= -1;
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = wallet.balance + amount;

    wallet.balance += amount;
    await wallet.save({ session: session });
    await this.createTransactionState(
      session,
      wallet._id.toString(),
      main_process_id,
      transaction_type,
      balanceBefore,
      balanceAfter,
    );
  }

  async createTransactionState(
    session: ClientSession,
    walletId: string,
    mainProcess: string,
    type: TransactionType,
    balanceBefore: number,
    balanceAfter: number,
  ) {
    return await this.walletTransactionModel.create(
      [
        {
          wallet_id: walletId,
          main_process: mainProcess,
          type: type,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
        },
      ],
      { session: session },
    );
  }
}
