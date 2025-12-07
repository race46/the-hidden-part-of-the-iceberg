import { Test, TestingModule } from '@nestjs/testing';
import { AgreementController } from './agreement.controller';
import { AgreementService } from './agreement.service';
import { UtilsModule } from '../utils/utils.module';
import { AppModule } from 'src/app.module';

describe('AgreementController', () => {
  let controller: AgreementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UtilsModule],
      controllers: [AgreementController],
      providers: [AgreementService],
    }).compile();

    controller = module.get<AgreementController>(AgreementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
