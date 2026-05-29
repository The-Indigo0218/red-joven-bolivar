import { Injectable } from '@nestjs/common';
import { AiService, type DemandForecast } from '../ai/ai.service';
import type { InterestSlug } from '../young/young.entity';

export interface ZoneDemand {
  barrio: string;
  lat: number;
  lng: number;
  youngCount: number;
}

export interface InterestDemand {
  interest: InterestSlug;
  label: string;
  youngCount: number;
}

export interface DemandGap {
  interest: InterestSlug;
  barrio: string;
  youngCount: number;
  slotsOffered: number;
  gap: number;
  headline: string;
}

export interface DemandDashboard {
  byZone: ZoneDemand[];
  topInterests: InterestDemand[];
  gaps: DemandGap[];
  generatedAt: string;
}

// Agregación de intereses por zona geográfica y categoría. Núcleo de valor.
// Estructura lista para construir — sin lógica de agregación todavía.
@Injectable()
export class DemandService {
  constructor(private readonly aiService: AiService) {}

  getDashboard(): Promise<DemandDashboard> {
    // TODO: componer desde demand_snapshots.
    throw new Error('Not implemented');
  }

  getByZone(_interest?: InterestSlug): Promise<ZoneDemand[]> {
    // TODO: agregar youngCount por barrio.
    throw new Error('Not implemented');
  }

  getByInterest(_barrio?: string): Promise<InterestDemand[]> {
    // TODO: agregar youngCount por interés.
    throw new Error('Not implemented');
  }

  forecast(barrio: string, horizonMonths: number): Promise<DemandForecast[]> {
    // MCP_HOOK: DEMAND_PREDICTION
    return this.aiService.predictDemandByZone(barrio, horizonMonths);
  }
}
