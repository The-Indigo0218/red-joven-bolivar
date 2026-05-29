import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialActivityController } from './social-activity.controller';
import { SocialActivity } from './social-activity.entity';
import { SocialActivityService } from './social-activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([SocialActivity])],
  controllers: [SocialActivityController],
  providers: [SocialActivityService],
  exports: [SocialActivityService],
})
export class SocialActivityModule {}
