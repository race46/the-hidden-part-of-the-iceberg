import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from './property.schema';
import { Agent, AgentSchema } from './agent.schema';
import { Agency, AgencySchema } from './agency.schema';
import { Wallet, WalletSchema } from './wallet.schema';
import { Agreement, AgreementSchema } from './agreement.schema';
import { AgreementStage, AgreementStageSchema } from './agreement.stage.schema';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from './wallet.transaction.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
      { name: Agent.name, schema: AgentSchema },
      { name: Agency.name, schema: AgencySchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Agreement.name, schema: AgreementSchema },
      { name: AgreementStage.name, schema: AgreementStageSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SchemasModule {}
