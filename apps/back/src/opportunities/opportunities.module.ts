import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingModule } from '../matching/matching.module';
import { YoungModule } from '../young/young.module';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { Match } from './match.entity';
import { Opportunity } from './opportunity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Opportunity, Match]),
    MatchingModule,
    YoungModule,
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
