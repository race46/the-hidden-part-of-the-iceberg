import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Agent } from 'src/schemas/agent.schema';
import { Property } from 'src/schemas/property.schema';
import { AgentUtils } from '../utils/agent.utils';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<Agent>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    @InjectConnection() private connection: Connection,
    private readonly agentUtils: AgentUtils,
  ) {}

  async create(createPropertyDto: CreatePropertyDto) {
    const agent_id = createPropertyDto.agent_id;
    const name = createPropertyDto.name;

    await this.agentUtils.checkPropertyCreationRight(agent_id);

    const property = await this.propertyModel.create({
      name,
      agent_id,
    });

    return { name: property.name, _id: property._id.toString() };
  }

  findAll() {
    return this.propertyModel.find(
      { is_listing: true },
      { agent_id: true, name: true },
    );
  }

  findOne(id: number) {
    return `This action returns a #${id} property`;
  }

  update(id: number, updatePropertyDto: UpdatePropertyDto) {
    return `This action updates a #${id} $P}${updatePropertyDto.agent_id}property`;
  }

  remove(id: number) {
    return `This action removes a #${id} property`;
  }
}
