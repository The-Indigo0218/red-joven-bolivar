import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { Opportunity } from '../opportunities/opportunity.entity';
import { YoungProfile } from '../young/young.entity';
import { DemandController } from './demand.controller';
import { DemandService } from './demand.service';
import { DemandSnapshot } from './demand-snapshot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DemandSnapshot, YoungProfile, Opportunity]),
    AiModule,
  ],
  controllers: [DemandController],
  providers: [DemandService],
  exports: [DemandService],
})
export class DemandModule {}
