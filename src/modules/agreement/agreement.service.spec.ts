import { Test, TestingModule } from '@nestjs/testing';
import { AgreementService } from './agreement.service';
import { AppModule } from 'src/app.module';
import { UtilsModule } from '../utils/utils.module';

describe('AgreementService', () => {
  let service: AgreementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UtilsModule],
      providers: [AgreementService],
    }).compile();

    service = module.get<AgreementService>(AgreementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
