import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IsIn, IsString } from 'class-validator';
import { INTEREST_SLUGS } from '../common/interests';
import type { InterestSlug } from '../young/young.entity';
import {
  CreateGroupInput,
  GroupsService,
  type GroupResponse,
  type GroupsResponse,
} from './groups.service';

export class CreateGroupDto implements CreateGroupInput {
  @IsString()
  name!: string;

  @IsString()
  barrio!: string;

  @IsIn(INTEREST_SLUGS)
  interest!: InterestSlug;
}

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // POST /groups
  @Post()
  create(@Body() dto: CreateGroupDto): Promise<GroupResponse> {
    return this.groupsService.create(dto);
  }

  // GET /groups?barrio=&interest=
  @Get()
  findAll(
    @Query('barrio') barrio?: string,
    @Query('interest') interest?: InterestSlug,
  ): Promise<GroupsResponse> {
    return this.groupsService.findAll({ barrio, interest });
  }
}
