import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService, type GroupSuggestion } from '../ai/ai.service';
import type { InterestSlug } from '../young/young.entity';
import { Group } from './group.entity';

export interface CreateGroupInput {
  name: string;
  barrio: string;
  interest: InterestSlug;
}

export interface GroupsQuery {
  barrio?: string;
  interest?: InterestSlug;
}

// Contrato de respuesta: incluye memberCount (arranca en 0 hasta que exista
// la gestión de miembros).
export interface GroupResponse {
  id: string;
  name: string;
  barrio: string;
  interest: InterestSlug;
  memberCount: number;
  createdAt: string;
}

export interface GroupsResponse {
  items: GroupResponse[];
  total: number;
}

export interface GroupSuggestionsResponse {
  items: GroupSuggestion[];
  total: number;
}

// Grupos sociales por barrio y habilidad (Mi Sangre).
@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    private readonly aiService: AiService,
  ) {}

  // Sugerencia de formación de grupo antes de crearlo (delegada a IA).
  async suggest(
    barrio: string,
    interest: InterestSlug,
  ): Promise<GroupSuggestionsResponse> {
    const items = await this.aiService.suggestGroupFormation(barrio, interest);
    return { items, total: items.length };
  }

  async create(input: CreateGroupInput): Promise<GroupResponse> {
    const group = await this.groupRepo.save(this.groupRepo.create(input));
    return this.toResponse(group);
  }

  async findAll(query: GroupsQuery): Promise<GroupsResponse> {
    const where: { barrio?: string; interest?: InterestSlug } = {};
    if (query.barrio) where.barrio = query.barrio;
    if (query.interest) where.interest = query.interest;

    const [groups, total] = await this.groupRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
    });
    return { items: groups.map((g) => this.toResponse(g)), total };
  }

  private toResponse(group: Group): GroupResponse {
    return {
      id: group.id,
      name: group.name,
      barrio: group.barrio,
      interest: group.interest,
      memberCount: 0,
      createdAt: group.createdAt.toISOString(),
    };
  }
}
