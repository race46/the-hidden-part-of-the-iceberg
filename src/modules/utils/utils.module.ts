import { Module } from '@nestjs/common';
import { PropertyUtils } from './property.utils';
import { AgentUtils } from './agent.utils';
import { WalletUtils } from './wallet.utils';

@Module({
  providers: [PropertyUtils, AgentUtils, WalletUtils],
  exports: [PropertyUtils, AgentUtils, WalletUtils],
})
export class UtilsModule {}
