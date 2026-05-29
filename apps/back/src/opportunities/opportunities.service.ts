import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchingService } from '../matching/matching.service';
import { YoungService } from '../young/young.service';
import type { InterestSlug, OpportunityKind } from '../young/young.entity';
import { Match } from './match.entity';
import { Opportunity } from './opportunity.entity';

export interface OpportunitiesQuery {
  type?: OpportunityKind;
  interest?: InterestSlug;
  barrio?: string;
}

// Contrato GET /opportunities → { items, total }.
export interface OpportunitiesResponse {
  items: Opportunity[];
  total: number;
}

// Oportunidad con su afinidad para el joven (GET /opportunities/recommendations).
export interface RecommendedOpportunity extends Opportunity {
  score: number; // afinidad 0..1
}

export interface RecommendationsResponse {
  youngId: string;
  items: RecommendedOpportunity[];
  total: number;
}

// Contrato POST /opportunities/:id/interest → MatchResponse.
export interface MatchResult {
  id: string;
  youngId: string;
  opportunityId: string;
  status: 'interesado' | 'contactado' | 'vinculado';
  score: number;
  slotsAvailable: number;
  createdAt: string;
}

// CRUD de oportunidades y gestión de cupos. El "Me interesa" crea un match,
// puntúa por reglas y decrementa cupos.
@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    private readonly youngService: YoungService,
    private readonly matchingService: MatchingService,
  ) {}

  async findAll(query: OpportunitiesQuery): Promise<OpportunitiesResponse> {
    const qb = this.opportunityRepo.createQueryBuilder('opportunity');

    if (query.type) {
      qb.andWhere('opportunity.kind = :type', { type: query.type });
    }
    if (query.barrio) {
      qb.andWhere('opportunity.barrio = :barrio', { barrio: query.barrio });
    }
    if (query.interest) {
      // text[]: la oportunidad cubre el interés si está en su arreglo.
      qb.andWhere(':interest = ANY(opportunity.interests)', {
        interest: query.interest,
      });
    }

    qb.orderBy('opportunity.title', 'ASC');

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  // Feed ordenado por afinidad para un joven (MCP_HOOK: AI_MATCHING vía
  // MatchingService → AiService).
  async getRecommendations(youngId: string): Promise<RecommendationsResponse> {
    // Valida que el joven exista (lanza NotFound si no).
    await this.youngService.findOne(youngId);

    const opportunities = await this.opportunityRepo.find();
    const scores = await this.matchingService.scoreOpportunities(
      youngId,
      opportunities.map((o) => o.id),
    );
    const scoreById = new Map(scores.map((s) => [s.opportunityId, s.score]));

    const items: RecommendedOpportunity[] = opportunities
      .map((opp) => ({ ...opp, score: scoreById.get(opp.id) ?? 0 }))
      .sort((a, b) => b.score - a.score);

    return { youngId, items, total: items.length };
  }

  async expressInterest(id: string, youngId: string): Promise<MatchResult> {
    const opportunity = await this.opportunityRepo.findOne({ where: { id } });
    if (!opportunity) {
      throw new NotFoundException(`Oportunidad ${id} no encontrada`);
    }

    // Valida que el joven exista (lanza NotFound si no).
    const profile = await this.youngService.findOne(youngId);

    const existing = await this.matchRepo.findOne({
      where: { youngId, opportunityId: id },
    });
    if (existing) {
      throw new ConflictException(
        'El joven ya expresó interés en esta oportunidad',
      );
    }

    if (opportunity.slotsAvailable <= 0) {
      throw new ConflictException('No quedan cupos disponibles');
    }

    const score = this.matchingService.score(profile, opportunity);

    opportunity.slotsAvailable -= 1;
    await this.opportunityRepo.save(opportunity);

    const match = await this.matchRepo.save(
      this.matchRepo.create({
        youngId,
        opportunityId: id,
        status: 'interesado',
        score,
      }),
    );

    return {
      id: match.id,
      youngId: match.youngId,
      opportunityId: match.opportunityId,
      status: match.status,
      score: match.score,
      slotsAvailable: opportunity.slotsAvailable,
      createdAt: match.createdAt.toISOString(),
    };
  }
}
