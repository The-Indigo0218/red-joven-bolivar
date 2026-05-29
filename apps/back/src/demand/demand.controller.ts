import { Controller, Get, Query } from '@nestjs/common';
import type { InterestSlug } from '../young/young.entity';
import {
  DemandService,
  type DemandDashboard,
  type InterestDemand,
  type ZoneDemand,
} from './demand.service';

export interface DemandByZoneResponse {
  items: ZoneDemand[];
  total: number;
}

export interface DemandByInterestResponse {
  items: InterestDemand[];
  total: number;
}

@Controller('demand')
export class DemandController {
  constructor(private readonly demandService: DemandService) {}

  // GET /demand/dashboard
  @Get('dashboard')
  getDashboard(): Promise<DemandDashboard> {
    return this.demandService.getDashboard();
  }

  // GET /demand/by-zone?interest=
  @Get('by-zone')
  async getByZone(
    @Query('interest') interest?: InterestSlug,
  ): Promise<DemandByZoneResponse> {
    const items = await this.demandService.getByZone(interest);
    return { items, total: items.length };
  }

  // GET /demand/by-interest?barrio=
  @Get('by-interest')
  async getByInterest(
    @Query('barrio') barrio?: string,
  ): Promise<DemandByInterestResponse> {
    const items = await this.demandService.getByInterest(barrio);
    return { items, total: items.length };
  }
}
