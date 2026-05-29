import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialActivity } from './social-activity.entity';
import { SocialActivityService } from './social-activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([SocialActivity])],
  providers: [SocialActivityService],
  exports: [SocialActivityService],
})
export class SocialActivityModule {}
