import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from './modules/utils/utils.module';
import { SchemasModule } from './schemas/schemas.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';
import { ConfigModule } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;
  let app: TestingModule;
  let connection: Connection;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `.env.test`,
        }),
        MongooseModule.forRoot(process.env.DATABASE_URL ?? '', {
          serverSelectionTimeoutMS: 3000,
        }),
        UtilsModule,
        SchemasModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    connection = app.get(getConnectionToken());
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    await mongoose.disconnect();
    await app.close();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.hello()).toBe('hello');
    });
  });
});
