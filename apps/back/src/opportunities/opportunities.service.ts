import { Injectable } from '@nestjs/common';
import type { InterestSlug, OpportunityKind } from '../young/young.entity';
import type { Opportunity } from './opportunity.entity';

export interface OpportunitiesQuery {
  type?: OpportunityKind;
  interest?: InterestSlug;
  barrio?: string;
}

export interface MatchResult {
  id: string;
  youngId: string;
  opportunityId: string;
  status: 'interesado' | 'contactado' | 'vinculado';
  score: number;
  slotsAvailable: number;
  createdAt: string;
}

// CRUD de oportunidades (empleos, voluntariados, cursos).
// Estructura lista para construir — sin lógica de persistencia todavía.
@Injectable()
export class OpportunitiesService {
  findAll(_query: OpportunitiesQuery): Promise<Opportunity[]> {
    // TODO: filtrar por tipo, interés y barrio con TypeORM.
    throw new Error('Not implemented');
  }

  expressInterest(_id: string, _youngId: string): Promise<MatchResult> {
    // TODO: crear match, decrementar cupos y alimentar la demanda.
    throw new Error('Not implemented');
  }
}
