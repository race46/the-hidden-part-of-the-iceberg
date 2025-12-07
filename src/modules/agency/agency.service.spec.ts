import { Test, TestingModule } from '@nestjs/testing';
import { AgencyService } from './agency.service';
import { AppModule } from 'src/app.module';

describe('AgencyService', () => {
  let service: AgencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AgencyService],
    }).compile();

    service = module.get<AgencyService>(AgencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
