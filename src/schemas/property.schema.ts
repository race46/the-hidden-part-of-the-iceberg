import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Agent } from 'http';
import mongoose, { HydratedDocument } from 'mongoose';

export type PropertyDocument = HydratedDocument<Property>;

@Schema({ timestamps: true })
export class Property {
  @Prop({ required: true, minLength: 3 })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  agent_id: Agent;

  @Prop({ required: true, default: false })
  has_active_transaction: boolean;

  @Prop({ required: true, default: true })
  is_listing: boolean;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
