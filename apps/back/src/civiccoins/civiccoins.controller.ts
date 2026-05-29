import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { IsUUID } from 'class-validator';
import {
  CivicCoinsService,
  type CivicCoinsBalanceResponse,
  type EarnCivicCoinsResponse,
  type SuggestedActivitiesResponse,
} from './civiccoins.service';

export class EarnCivicCoinsDto {
  @IsUUID()
  youngId!: string;

  @IsUUID()
  activityId!: string;

  @IsUUID()
  validatorId!: string;
}

@Controller('civiccoins')
export class CivicCoinsController {
  constructor(private readonly civicCoinsService: CivicCoinsService) {}

  // GET /civiccoins/activities?youngId=   (MCP_HOOK: SOCIAL_MATCHING)
  // Declarada antes que :youngId para no ser capturada como parámetro.
  @Get('activities')
  suggestActivities(
    @Query('youngId', ParseUUIDPipe) youngId: string,
  ): Promise<SuggestedActivitiesResponse> {
    return this.civicCoinsService.suggestActivities(youngId);
  }

  // POST /civiccoins/earn
  @Post('earn')
  earn(@Body() dto: EarnCivicCoinsDto): Promise<EarnCivicCoinsResponse> {
    return this.civicCoinsService.earn(
      dto.youngId,
      dto.activityId,
      dto.validatorId,
    );
  }

  // GET /civiccoins/:youngId
  @Get(':youngId')
  getBalance(
    @Param('youngId', ParseUUIDPipe) youngId: string,
  ): Promise<CivicCoinsBalanceResponse> {
    return this.civicCoinsService.getBalance(youngId);
  }
}
