import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { MatchingService } from './matching.service';

@Module({
  imports: [AiModule],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
