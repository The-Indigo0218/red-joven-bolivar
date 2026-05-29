import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { YoungModule } from '../young/young.module';
import { GroupMember } from './group-member.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { Group } from './group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupMember]),
    AiModule,
    YoungModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
