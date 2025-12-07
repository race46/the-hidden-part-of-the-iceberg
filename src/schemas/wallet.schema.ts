import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

export enum AccountType {
  AGENT = 'agent',
  AGENCY = 'agency',
}

export enum TransactionType {
  SELLING_AGENT_COMMISSION = 'selling_agent_commission',
  LISTING_AGENT_COMMISSION = 'listing_agent_commission',
  SELLING_AGENCY_PORTION = 'selling_agency_portion',
  LISTING_AGENCY_PORTION = 'listing_agency_portion',
}

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  owner_id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, enum: AccountType, required: true })
  account_type: AccountType;

  @Prop({ default: 0 })
  balance: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
