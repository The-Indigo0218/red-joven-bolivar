import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService, type DemandForecast } from '../ai/ai.service';
import { coordsForBarrio } from '../common/barrios';
import { labelForInterest } from '../common/interests';
import { Opportunity } from '../opportunities/opportunity.entity';
import { YoungProfile, type InterestSlug } from '../young/young.entity';

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

// Filas crudas de las agregaciones SQL.
interface ZoneRow {
  barrio: string;
  youngCount: number;
}
interface InterestRow {
  interest: InterestSlug;
  youngCount: number;
}
interface PairDemandRow {
  barrio: string;
  interest: InterestSlug;
  youngCount: number;
}
interface PairOfferRow {
  barrio: string;
  interest: InterestSlug;
  slotsOffered: number;
}

const MAX_GAPS = 10;

// Agregación de la demanda declarada. Núcleo de valor de la plataforma.
// Hoy se computa en vivo sobre young_profiles + opportunities (volumen de
// hackathon). El diseño con demand_snapshots queda para escalar y para que la
// IA proyecte series (Fase 4).
@Injectable()
export class DemandService {
  constructor(
    @InjectRepository(YoungProfile)
    private readonly youngRepo: Repository<YoungProfile>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
    private readonly aiService: AiService,
  ) {}

  async getDashboard(): Promise<DemandDashboard> {
    const [byZone, topInterests, gaps] = await Promise.all([
      this.getByZone(),
      this.getByInterest(),
      this.getGaps(),
    ]);
    return {
      byZone,
      topInterests,
      gaps,
      generatedAt: new Date().toISOString(),
    };
  }

  // Concentración de jóvenes por barrio (mapa Leaflet). Opcionalmente filtrada
  // por un interés declarado.
  async getByZone(interest?: InterestSlug): Promise<ZoneDemand[]> {
    const rows = await this.youngRepo.query<ZoneRow[]>(
      `SELECT barrio, COUNT(*)::int AS "youngCount"
         FROM young_profiles
        WHERE ($1::text IS NULL OR $1 = ANY(interests))
        GROUP BY barrio
        ORDER BY "youngCount" DESC`,
      [interest ?? null],
    );
    return rows.map((r) => ({
      barrio: r.barrio,
      ...coordsForBarrio(r.barrio),
      youngCount: r.youngCount,
    }));
  }

  // Top de intereses declarados (gráfico de barras). Opcionalmente acotado a
  // un barrio.
  async getByInterest(barrio?: string): Promise<InterestDemand[]> {
    const rows = await this.youngRepo.query<InterestRow[]>(
      `SELECT i AS interest, COUNT(*)::int AS "youngCount"
         FROM young_profiles, unnest(interests) AS i
        WHERE ($1::text IS NULL OR barrio = $1)
        GROUP BY i
        ORDER BY "youngCount" DESC`,
      [barrio ?? null],
    );
    return rows.map((r) => ({
      interest: r.interest,
      label: labelForInterest(r.interest),
      youngCount: r.youngCount,
    }));
  }

  // Brecha demanda/oferta por (barrio, interés): jóvenes que lo quieren vs.
  // cupos disponibles. La métrica estrella del dashboard.
  async getGaps(): Promise<DemandGap[]> {
    const [demandRows, offerRows] = await Promise.all([
      this.youngRepo.query<PairDemandRow[]>(
        `SELECT barrio, i AS interest, COUNT(*)::int AS "youngCount"
           FROM young_profiles, unnest(interests) AS i
          GROUP BY barrio, i`,
      ),
      this.opportunityRepo.query<PairOfferRow[]>(
        `SELECT barrio, i AS interest,
                COALESCE(SUM("slotsAvailable"), 0)::int AS "slotsOffered"
           FROM opportunities, unnest(interests) AS i
          GROUP BY barrio, i`,
      ),
    ]);

    const offerByKey = new Map<string, number>();
    for (const o of offerRows) {
      offerByKey.set(`${o.barrio}|${o.interest}`, o.slotsOffered);
    }

    const gaps: DemandGap[] = [];
    for (const d of demandRows) {
      const slotsOffered = offerByKey.get(`${d.barrio}|${d.interest}`) ?? 0;
      const gap = d.youngCount - slotsOffered;
      if (gap <= 0) continue;
      gaps.push({
        interest: d.interest,
        barrio: d.barrio,
        youngCount: d.youngCount,
        slotsOffered,
        gap,
        headline: `${d.youngCount} jóvenes quieren ${labelForInterest(
          d.interest,
        ).toLowerCase()} en ${d.barrio} — solo ${slotsOffered} cupos disponibles`,
      });
    }

    return gaps.sort((a, b) => b.gap - a.gap).slice(0, MAX_GAPS);
  }

  forecast(barrio: string, horizonMonths: number): Promise<DemandForecast[]> {
    // MCP_HOOK: DEMAND_PREDICTION
    return this.aiService.predictDemandByZone(barrio, horizonMonths);
  }
}
