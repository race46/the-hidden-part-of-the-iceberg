import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from './property.service';
import { AppModule } from 'src/app.module';
import { SchemasModule } from 'src/schemas/schemas.module';
import { UtilsModule } from '../utils/utils.module';

describe('PropertyService', () => {
  let service: PropertyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SchemasModule, UtilsModule],
      providers: [PropertyService],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
