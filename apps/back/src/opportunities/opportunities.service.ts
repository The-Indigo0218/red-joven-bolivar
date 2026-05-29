import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MatchingService } from '../matching/matching.service';
import { YoungService } from '../young/young.service';
import {
  YoungProfile,
  type InterestSlug,
  type OpportunityKind,
} from '../young/young.entity';
import { Match } from './match.entity';
import { Opportunity, type OpportunityModality } from './opportunity.entity';
import { WaitlistEntry } from './waitlist-entry.entity';

export interface OpportunitiesQuery {
  type?: OpportunityKind;
  interest?: InterestSlug;
  barrio?: string;
  modalidad?: OpportunityModality;
}

export interface CreateOpportunityInput {
  title: string;
  organization: string;
  kind: OpportunityKind;
  requirements: string[];
  slotsTotal: number;
  barrio: string;
  modalidad: OpportunityModality;
  interests: InterestSlug[];
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

// Contrato POST /opportunities/:id/interest.
// Si hay cupo, el joven queda 'interesado' (se crea un Match y se descuenta un
// cupo). Si no hay cupo, queda 'en-espera' (se registra en la lista de espera y
// no se pierde la señal de demanda).
export interface InterestResult {
  status: 'interesado' | 'en-espera';
  waitlisted: boolean;
  youngId: string;
  opportunityId: string;
  score: number;
  slotsAvailable: number;
  // Presente cuando quedó 'interesado'.
  matchId?: string;
  // Presentes cuando quedó 'en-espera'.
  waitlistId?: string;
  waitlistPosition?: number;
  createdAt: string;
}

// Una entrada de la lista de espera enriquecida con el nombre del joven, para el
// panel del SENA (GET /opportunities/:id/waitlist).
export interface WaitlistItem {
  id: string;
  youngId: string;
  youngName: string;
  position: number;
  createdAt: string;
}

export interface WaitlistResponse {
  opportunityId: string;
  items: WaitlistItem[];
  total: number;
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
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepo: Repository<WaitlistEntry>,
    @InjectRepository(YoungProfile)
    private readonly youngRepo: Repository<YoungProfile>,
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
    if (query.modalidad) {
      qb.andWhere('opportunity.modalidad = :modalidad', {
        modalidad: query.modalidad,
      });
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

  async create(input: CreateOpportunityInput): Promise<Opportunity> {
    const opportunity = await this.opportunityRepo.save(
      this.opportunityRepo.create({
        ...input,
        slotsAvailable: input.slotsTotal,
      }),
    );
    return opportunity;
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

  async expressInterest(id: string, youngId: string): Promise<InterestResult> {
    const opportunity = await this.opportunityRepo.findOne({ where: { id } });
    if (!opportunity) {
      throw new NotFoundException(`Oportunidad ${id} no encontrada`);
    }

    // Valida que el joven exista (lanza NotFound si no).
    const profile = await this.youngService.findOne(youngId);

    const score = this.matchingService.score(profile, opportunity);

    // Sin cupos: en vez de rechazar, encolamos la intención (señal de demanda).
    if (opportunity.slotsAvailable <= 0) {
      return this.joinWaitlist(opportunity.id, youngId, score);
    }

    const existing = await this.matchRepo.findOne({
      where: { youngId, opportunityId: id },
    });
    if (existing) {
      throw new ConflictException(
        'El joven ya expresó interés en esta oportunidad',
      );
    }

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
      status: 'interesado',
      waitlisted: false,
      youngId: match.youngId,
      opportunityId: match.opportunityId,
      score: match.score,
      slotsAvailable: opportunity.slotsAvailable,
      matchId: match.id,
      createdAt: match.createdAt.toISOString(),
    };
  }

  // Registra (o devuelve, si ya existe) la entrada en la lista de espera y
  // calcula la posición del joven en la cola.
  private async joinWaitlist(
    opportunityId: string,
    youngId: string,
    score: number,
  ): Promise<InterestResult> {
    let entry = await this.waitlistRepo.findOne({
      where: { opportunityId, youngId },
    });
    if (!entry) {
      entry = await this.waitlistRepo.save(
        this.waitlistRepo.create({ opportunityId, youngId }),
      );
    }

    // Posición = cuántos llegaron antes (o al mismo tiempo) que este joven.
    const position = await this.waitlistRepo.count({
      where: { opportunityId },
    });

    return {
      status: 'en-espera',
      waitlisted: true,
      youngId,
      opportunityId,
      score,
      slotsAvailable: 0,
      waitlistId: entry.id,
      waitlistPosition: position,
      createdAt: entry.createdAt.toISOString(),
    };
  }

  // Lista de espera de una oportunidad, ordenada por antigüedad. Es la demanda
  // insatisfecha que el SENA usa para decidir abrir nuevos cupos/cursos.
  async getWaitlist(opportunityId: string): Promise<WaitlistResponse> {
    const opportunity = await this.opportunityRepo.findOne({
      where: { id: opportunityId },
    });
    if (!opportunity) {
      throw new NotFoundException(`Oportunidad ${opportunityId} no encontrada`);
    }

    const [entries, total] = await this.waitlistRepo.findAndCount({
      where: { opportunityId },
      order: { createdAt: 'ASC' },
    });

    const profiles = entries.length
      ? await this.youngRepo.find({
          where: { id: In(entries.map((e) => e.youngId)) },
        })
      : [];
    const nameById = new Map(profiles.map((p) => [p.id, p.name]));

    const items: WaitlistItem[] = entries.map((entry, index) => ({
      id: entry.id,
      youngId: entry.youngId,
      youngName: nameById.get(entry.youngId) ?? 'Joven',
      position: index + 1,
      createdAt: entry.createdAt.toISOString(),
    }));

    return { opportunityId, items, total };
  }
}
