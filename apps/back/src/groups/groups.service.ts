import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService, type GroupSuggestion } from '../ai/ai.service';
import { YoungService } from '../young/young.service';
import type { InterestSlug } from '../young/young.entity';
import { GroupMember } from './group-member.entity';
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

interface MemberCountRow {
  groupId: string;
  count: string;
}

// Grupos sociales por barrio y habilidad (Mi Sangre).
@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly memberRepo: Repository<GroupMember>,
    private readonly youngService: YoungService,
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
    return this.toResponse(group, 0);
  }

  async findAll(query: GroupsQuery): Promise<GroupsResponse> {
    const where: { barrio?: string; interest?: InterestSlug } = {};
    if (query.barrio) where.barrio = query.barrio;
    if (query.interest) where.interest = query.interest;

    const [groups, total] = await this.groupRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
    });

    const counts = await this.countMembersByGroupIds(groups.map((g) => g.id));
    return {
      items: groups.map((g) => this.toResponse(g, counts.get(g.id) ?? 0)),
      total,
    };
  }

  async addMember(groupId: string, youngId: string): Promise<GroupResponse> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException(`Grupo ${groupId} no encontrado`);
    }

    await this.youngService.findOne(youngId);

    const existing = await this.memberRepo.findOne({
      where: { groupId, youngId },
    });
    if (existing) {
      throw new ConflictException('El joven ya es miembro de este grupo');
    }

    await this.memberRepo.save(
      this.memberRepo.create({ groupId, youngId }),
    );

    const memberCount = await this.memberRepo.count({ where: { groupId } });
    return this.toResponse(group, memberCount);
  }

  private async countMembersByGroupIds(
    groupIds: string[],
  ): Promise<Map<string, number>> {
    if (groupIds.length === 0) return new Map();

    const rows = await this.memberRepo
      .createQueryBuilder('member')
      .select('member.groupId', 'groupId')
      .addSelect('COUNT(*)', 'count')
      .where('member.groupId IN (:...groupIds)', { groupIds })
      .groupBy('member.groupId')
      .getRawMany<MemberCountRow>();

    return new Map(rows.map((r) => [r.groupId, parseInt(r.count, 10)]));
  }

  private toResponse(group: Group, memberCount: number): GroupResponse {
    return {
      id: group.id,
      name: group.name,
      barrio: group.barrio,
      interest: group.interest,
      memberCount,
      createdAt: group.createdAt.toISOString(),
    };
  }
}
