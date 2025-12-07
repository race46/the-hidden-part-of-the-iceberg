import { Test, TestingModule } from '@nestjs/testing';
import { AgencyController } from './agency.controller';
import { AgencyService } from './agency.service';
import { UtilsModule } from '../utils/utils.module';
import { SchemasModule } from 'src/schemas/schemas.module';
import { AppModule } from 'src/app.module';

describe('AgencyController', () => {
  let controller: AgencyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UtilsModule, SchemasModule, AppModule],
      controllers: [AgencyController],
      providers: [AgencyService],
    }).compile();

    controller = module.get<AgencyController>(AgencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
