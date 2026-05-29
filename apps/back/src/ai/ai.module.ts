import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Opportunity } from '../opportunities/opportunity.entity';
import { Skill } from '../skills/skill.entity';
import { YoungProfile } from '../young/young.entity';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';

@Module({
  imports: [TypeOrmModule.forFeature([YoungProfile, Opportunity, Skill])],
  providers: [AiService, GeminiService],
  exports: [AiService],
})
export class AiModule {}
