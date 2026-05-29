import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { SkillsModule } from '../skills/skills.module';
import { SocialActivityModule } from '../social-activity/social-activity.module';
import { YoungModule } from '../young/young.module';
import { CivicCoinTransaction } from './civiccoin-transaction.entity';
import { CivicCoinsController } from './civiccoins.controller';
import { CivicCoinsService } from './civiccoins.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CivicCoinTransaction]),
    YoungModule,
    SocialActivityModule,
    SkillsModule,
    AiModule,
  ],
  controllers: [CivicCoinsController],
  providers: [CivicCoinsService],
  exports: [CivicCoinsService],
})
export class CivicCoinsModule {}
