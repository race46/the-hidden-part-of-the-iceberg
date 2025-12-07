import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Agent } from 'src/schemas/agent.schema';

@Injectable()
export class AgentUtils {
  constructor(@InjectModel(Agent.name) private agentModel: Model<Agent>) {}

  async checkPropertyCreationRight(agentId: string) {
    const agent = await this.agentModel.findById(agentId);

    if (!agent) throw new NotFoundException('Agent not found');

    // do other logic below ...
  }

  async checkSellingRight(session: ClientSession, agentId: string) {
    const agent = await this.agentModel.findById(agentId).session(session);

    if (!agent) throw new NotFoundException('Agent not found');

    // do other logic below ...
  }

  async checkListingRight(session: ClientSession, agentId: string) {
    const agent = await this.agentModel.findById(agentId).session(session);

    if (!agent) throw new NotFoundException('Agent not found');

    // do other logic below ...
  }
}
