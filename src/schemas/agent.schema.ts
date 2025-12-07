import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type AgentDocument = HydratedDocument<Agent>;

@Schema({ timestamps: true })
export class Agent {
  @Prop({ required: true, minLength: 3 })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  agency_id: MongooseSchema.Types.ObjectId;

  @Prop()
  earning: number = 0;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
