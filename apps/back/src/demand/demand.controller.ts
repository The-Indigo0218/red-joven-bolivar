import { Controller, Get, Query } from '@nestjs/common';
import type { InterestSlug } from '../young/young.entity';
import {
  DemandService,
  type DemandDashboard,
  type InterestDemand,
  type ZoneDemand,
} from './demand.service';

@Controller('demand')
export class DemandController {
  constructor(private readonly demandService: DemandService) {}

  // GET /demand/dashboard
  @Get('dashboard')
  getDashboard(): Promise<DemandDashboard> {
    return this.demandService.getDashboard();
  }

  // GET /demand/by-zone
  @Get('by-zone')
  getByZone(@Query('interest') interest?: InterestSlug): Promise<ZoneDemand[]> {
    return this.demandService.getByZone(interest);
  }

  // GET /demand/by-interest
  @Get('by-interest')
  getByInterest(@Query('barrio') barrio?: string): Promise<InterestDemand[]> {
    return this.demandService.getByInterest(barrio);
  }
}
