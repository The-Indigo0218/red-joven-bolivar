import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingModule } from '../matching/matching.module';
import { YoungModule } from '../young/young.module';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { YoungProfile } from '../young/young.entity';
import { Match } from './match.entity';
import { Opportunity } from './opportunity.entity';
import { WaitlistEntry } from './waitlist-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Opportunity, Match, WaitlistEntry, YoungProfile]),
    MatchingModule,
    YoungModule,
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
