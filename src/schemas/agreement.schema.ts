import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Property } from './property.schema';

export type AgreementDocument = HydratedDocument<Agreement>;

export enum AgreementType {
  SALE = 'sale',
  RENTAL = 'rental',
}

export enum AgreementStatus {
  AGREEMENT = 'agreement',
  EARNEST_MONEY = 'earnest_money',
  TITLE_DEED = 'title_deed',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Agreement {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agent', required: true })
  listing_agent: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agent', required: true })
  selling_agent: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Property',
    required: true,
  })
  property: Property;

  @Prop({ enum: AgreementType, required: true })
  type: AgreementType;

  @Prop({
    type: String,
    enum: AgreementStatus,
    required: true,
    default: AgreementStatus.AGREEMENT,
  })
  status: AgreementStatus;

  @Prop({ required: true })
  price: number;
}

export const AgreementSchema = SchemaFactory.createForClass(Agreement);
