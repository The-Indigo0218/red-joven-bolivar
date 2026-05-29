import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import type { InterestSlug, OpportunityKind } from '../young/young.entity';
import {
  OpportunitiesService,
  type MatchResult,
  type OpportunitiesResponse,
} from './opportunities.service';

export class ExpressInterestDto {
  @IsUUID()
  youngId!: string;
}

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  // GET /opportunities?type=&interest=&barrio=
  @Get()
  findAll(
    @Query('type') type?: OpportunityKind,
    @Query('interest') interest?: InterestSlug,
    @Query('barrio') barrio?: string,
  ): Promise<OpportunitiesResponse> {
    return this.opportunitiesService.findAll({ type, interest, barrio });
  }

  // POST /opportunities/:id/interest
  @Post(':id/interest')
  expressInterest(
    @Param('id') id: string,
    @Body() dto: ExpressInterestDto,
  ): Promise<MatchResult> {
    return this.opportunitiesService.expressInterest(id, dto.youngId);
  }
}
