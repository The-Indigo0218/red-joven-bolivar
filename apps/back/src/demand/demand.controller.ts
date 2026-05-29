import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import type { DemandForecast } from '../ai/ai.service';
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

export interface DemandForecastResponse {
  barrio: string;
  horizonMonths: number;
  items: DemandForecast[];
  total: number;
}

const DEFAULT_HORIZON_MONTHS = 6;
const MAX_HORIZON_MONTHS = 36;

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

  // GET /demand/forecast?barrio=&horizon=   (MCP_HOOK: DEMAND_PREDICTION)
  @Get('forecast')
  async forecast(
    @Query('barrio') barrio?: string,
    @Query('horizon') horizon?: string,
  ): Promise<DemandForecastResponse> {
    if (!barrio) {
      throw new BadRequestException('El parámetro "barrio" es requerido');
    }
    const parsed = horizon ? Number.parseInt(horizon, 10) : DEFAULT_HORIZON_MONTHS;
    const horizonMonths =
      Number.isInteger(parsed) && parsed > 0 && parsed <= MAX_HORIZON_MONTHS
        ? parsed
        : DEFAULT_HORIZON_MONTHS;

    const items = await this.demandService.forecast(barrio, horizonMonths);
    return { barrio, horizonMonths, items, total: items.length };
  }
}
