import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { IsIn, IsString } from 'class-validator';
import { INTEREST_SLUGS } from '../common/interests';
import type { InterestSlug } from '../young/young.entity';
import {
  CreateGroupInput,
  GroupsService,
  type GroupResponse,
  type GroupsResponse,
  type GroupSuggestionsResponse,
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

  // GET /groups/suggestions?barrio=&interest=   (sugerencia de IA)
  @Get('suggestions')
  suggest(
    @Query('barrio') barrio?: string,
    @Query('interest') interest?: InterestSlug,
  ): Promise<GroupSuggestionsResponse> {
    if (!barrio || !interest) {
      throw new BadRequestException(
        'Los parámetros "barrio" e "interest" son requeridos',
      );
    }
    if (!INTEREST_SLUGS.includes(interest)) {
      throw new BadRequestException(`Interés inválido: ${interest}`);
    }
    return this.groupsService.suggest(barrio, interest);
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
