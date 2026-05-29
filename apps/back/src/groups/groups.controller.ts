import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { InterestSlug } from '../young/young.entity';
import {
  CreateGroupInput,
  GroupsService,
} from './groups.service';
import type { Group } from './group.entity';

export class CreateGroupDto implements CreateGroupInput {
  name!: string;
  barrio!: string;
  interest!: InterestSlug;
}

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // POST /groups
  @Post()
  create(@Body() dto: CreateGroupDto): Promise<Group> {
    return this.groupsService.create(dto);
  }

  // GET /groups?barrio=&interest=
  @Get()
  findAll(
    @Query('barrio') barrio?: string,
    @Query('interest') interest?: InterestSlug,
  ): Promise<Group[]> {
    return this.groupsService.findAll({ barrio, interest });
  }
}
