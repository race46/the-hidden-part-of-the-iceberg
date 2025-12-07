import { Test, TestingModule } from '@nestjs/testing';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AppModule } from 'src/app.module';
import { SchemasModule } from 'src/schemas/schemas.module';
import { CreateAgentDto } from './dto/create-agent.dto';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Agency } from 'src/schemas/agency.schema';
import { Wallet } from 'src/schemas/wallet.schema';

describe('AgentController', () => {
  let controller: AgentController;
  let agencyModel: Model<Agency>;
  let walletModel: Model<Wallet>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SchemasModule],
      controllers: [AgentController],
      providers: [AgentService],
    }).compile();

    controller = module.get<AgentController>(AgentController);
    agencyModel = module.get<Model<Agency>>(getModelToken(Agency.name));
    walletModel = module.get<Model<Wallet>>(getModelToken(Wallet.name));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw Agency not found exception', () => {
    const dto: CreateAgentDto = {
      name: 'Agent 1',
    };

    expect(controller.create(dto)).rejects.toThrow(
      new NotFoundException('Agency not found'),
    );
  });

  it('should create an agent and a wallet object', async () => {
    const agency = await agencyModel.create({ name: 'Agency 1' });
    const dto: CreateAgentDto = {
      name: 'Agent 1',
      agency_id: agency._id.toString(),
    };

    const result = await controller.create(dto);
    const wallets = await walletModel.find();

    expect(result).toEqual({ name: 'Agent 1' });
    expect(wallets.length).toEqual(1);
  });

  it('should retrieve created agents and ', async () => {
    const agents = await controller.findAll();

    expect(agents.length).toEqual(1);
    expect(agents[0].name).toEqual('Agent 1');
  });
});
