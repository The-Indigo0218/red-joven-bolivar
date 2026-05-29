import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CivicCoinsModule } from '../civiccoins/civiccoins.module';
import { YoungModule } from '../young/young.module';
import { RedemptionCatalog } from './redemption-catalog.entity';
import { Redemption } from './redemption.entity';
import { RedemptionsController } from './redemptions.controller';
import { RedemptionsService } from './redemptions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RedemptionCatalog, Redemption]),
    YoungModule,
    CivicCoinsModule,
  ],
  controllers: [RedemptionsController],
  providers: [RedemptionsService],
  exports: [RedemptionsService],
})
export class RedemptionsModule {}
