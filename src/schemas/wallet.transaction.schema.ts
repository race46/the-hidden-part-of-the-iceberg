import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type WalletTransactionDocument = HydratedDocument<WalletTransaction>;

@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  wallet_id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  main_process: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ required: true })
  balance_before: number;

  @Prop({ required: true })
  balance_after: number;
}

export const WalletTransactionSchema =
  SchemaFactory.createForClass(WalletTransaction);
