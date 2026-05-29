import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SocialActivity,
  type SocialActivityCategory,
} from './social-activity.entity';

export interface CreateSocialActivityInput {
  title: string;
  description: string;
  pointsReward: number;
  category: SocialActivityCategory;
  barrio: string;
  requiredSkillIds?: string[];
}

export interface SocialActivitiesResponse {
  items: SocialActivity[];
  total: number;
}

// Catálogo de actividades sociales que otorgan CivicCoins (Diferenciador 2).
@Injectable()
export class SocialActivityService {
  constructor(
    @InjectRepository(SocialActivity)
    private readonly activityRepo: Repository<SocialActivity>,
  ) {}

  async findAll(): Promise<SocialActivitiesResponse> {
    const [items, total] = await this.activityRepo.findAndCount({
      order: { pointsReward: 'DESC' },
    });
    return { items, total };
  }

  async create(input: CreateSocialActivityInput): Promise<SocialActivity> {
    const activity = await this.activityRepo.save(
      this.activityRepo.create({
        ...input,
        requiredSkillIds: input.requiredSkillIds ?? [],
      }),
    );
    return activity;
  }

  async findOne(id: string): Promise<SocialActivity> {
    const activity = await this.activityRepo.findOne({ where: { id } });
    if (!activity) {
      throw new NotFoundException(`Actividad social ${id} no encontrada`);
    }
    return activity;
  }
}
