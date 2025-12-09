import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SchemasModule } from './schemas/schemas.module';
import { ConfigModule } from '@nestjs/config';
import { PropertyModule } from './modules/property/property.module';
import { AgencyModule } from './modules/agency/agency.module';
import { AgentModule } from './modules/agent/agent.module';
import { AgreementModule } from './modules/agreement/agreement.module';
import { UtilsModule } from './modules/utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV
        ? `.env.${process.env.NODE_ENV}`
        : '.env',
    }),
    MongooseModule.forRoot(
      process.env.DATABASE_URL ?? 'mongodb://mongo-test:27018/nest_test',
    ),
    SchemasModule,
    PropertyModule,
    AgencyModule,
    AgentModule,
    AgreementModule,
    UtilsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
