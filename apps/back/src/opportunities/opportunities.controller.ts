import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  IsArray,
  IsIn,
  IsInt,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { INTEREST_SLUGS } from '../common/interests';
import type { InterestSlug, OpportunityKind } from '../young/young.entity';
import {
  Opportunity,
  type OpportunityModality,
} from './opportunity.entity';
import {
  OpportunitiesService,
  type CreateOpportunityInput,
  type InterestResult,
  type OpportunitiesResponse,
  type RecommendationsResponse,
  type WaitlistResponse,
} from './opportunities.service';

const OPPORTUNITY_KINDS: OpportunityKind[] = [
  'empleo',
  'voluntariado',
  'estudio',
];

const OPPORTUNITY_MODALITIES: OpportunityModality[] = [
  'presencial',
  'virtual',
  'hibrido',
];

export class CreateOpportunityDto implements CreateOpportunityInput {
  @IsString()
  title!: string;

  @IsString()
  organization!: string;

  @IsIn(OPPORTUNITY_KINDS)
  kind!: OpportunityKind;

  @IsArray()
  @IsString({ each: true })
  requirements!: string[];

  @IsInt()
  @Min(1)
  slotsTotal!: number;

  @IsString()
  barrio!: string;

  @IsIn(OPPORTUNITY_MODALITIES)
  modalidad!: OpportunityModality;

  @IsArray()
  @IsIn(INTEREST_SLUGS, { each: true })
  interests!: InterestSlug[];
}

export class ExpressInterestDto {
  @IsUUID()
  youngId!: string;
}

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  // GET /opportunities?type=&interest=&barrio=&modalidad=
  @Get()
  findAll(
    @Query('type') type?: OpportunityKind,
    @Query('interest') interest?: InterestSlug,
    @Query('barrio') barrio?: string,
    @Query('modalidad') modalidad?: OpportunityModality,
  ): Promise<OpportunitiesResponse> {
    return this.opportunitiesService.findAll({
      type,
      interest,
      barrio,
      modalidad,
    });
  }

  // GET /opportunities/recommendations?youngId=   (MCP_HOOK: AI_MATCHING)
  @Get('recommendations')
  recommend(
    @Query('youngId', ParseUUIDPipe) youngId: string,
  ): Promise<RecommendationsResponse> {
    return this.opportunitiesService.getRecommendations(youngId);
  }

  // POST /opportunities
  @Post()
  create(@Body() dto: CreateOpportunityDto): Promise<Opportunity> {
    return this.opportunitiesService.create(dto);
  }

  // POST /opportunities/:id/interest
  @Post(':id/interest')
  expressInterest(
    @Param('id') id: string,
    @Body() dto: ExpressInterestDto,
  ): Promise<InterestResult> {
    return this.opportunitiesService.expressInterest(id, dto.youngId);
  }

  // GET /opportunities/:id/waitlist — lista de espera para el panel del SENA.
  @Get(':id/waitlist')
  waitlist(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WaitlistResponse> {
    return this.opportunitiesService.getWaitlist(id);
  }
}
