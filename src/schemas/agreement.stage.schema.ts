import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Agreement, AgreementStatus } from './agreement.schema';

export type AgreementStageDocument = HydratedDocument<AgreementStage>;

@Schema({ timestamps: true })
export class AgreementStage {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
  })
  agreement: Agreement;

  @Prop({ type: String, enum: AgreementStatus, required: true })
  status: AgreementStatus;
}

export const AgreementStageSchema =
  SchemaFactory.createForClass(AgreementStage);
