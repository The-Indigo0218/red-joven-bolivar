import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import {
  RedemptionsService,
  type RedemptionCatalogResponse,
  type RedemptionResponse,
} from './redemptions.service';

export class CreateRedemptionDto {
  @IsUUID()
  youngId!: string;

  @IsUUID()
  catalogItemId!: string;
}

@Controller('redemptions')
export class RedemptionsController {
  constructor(private readonly redemptionsService: RedemptionsService) {}

  // GET /redemptions/catalog
  @Get('catalog')
  getCatalog(): Promise<RedemptionCatalogResponse> {
    return this.redemptionsService.getCatalog();
  }

  // POST /redemptions
  @Post()
  redeem(@Body() dto: CreateRedemptionDto): Promise<RedemptionResponse> {
    return this.redemptionsService.redeem(dto.youngId, dto.catalogItemId);
  }
}
