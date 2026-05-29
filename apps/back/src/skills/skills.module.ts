import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { YoungModule } from '../young/young.module';
import { OpportunitySkill } from './opportunity-skill.entity';
import { Skill } from './skill.entity';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { YoungSkill } from './young-skill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, YoungSkill, OpportunitySkill]),
    AiModule,
    YoungModule,
  ],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
