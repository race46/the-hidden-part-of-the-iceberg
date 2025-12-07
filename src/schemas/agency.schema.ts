import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AgencyDocument = HydratedDocument<Agency>;

@Schema({ timestamps: true })
export class Agency {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  earning: number = 0;
}

export const AgencySchema = SchemaFactory.createForClass(Agency);
