import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { Opportunity } from '../opportunities/opportunity.entity';
import { SkillsModule } from '../skills/skills.module';
import { YoungModule } from '../young/young.module';
import { GrowthRoute } from './growth-route.entity';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GrowthRoute, Opportunity]),
    SkillsModule,
    AiModule,
    YoungModule,
  ],
  controllers: [RouteController],
  providers: [RouteService],
  exports: [RouteService],
})
export class RouteModule {}
