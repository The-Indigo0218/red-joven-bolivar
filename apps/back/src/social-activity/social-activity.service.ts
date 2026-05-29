import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialActivity } from './social-activity.entity';

// Catálogo de actividades sociales que otorgan CivicCoins (Diferenciador 2).
@Injectable()
export class SocialActivityService {
  constructor(
    @InjectRepository(SocialActivity)
    private readonly activityRepo: Repository<SocialActivity>,
  ) {}

  findAll(): Promise<SocialActivity[]> {
    return this.activityRepo.find({ order: { pointsReward: 'DESC' } });
  }

  async findOne(id: string): Promise<SocialActivity> {
    const activity = await this.activityRepo.findOne({ where: { id } });
    if (!activity) {
      throw new NotFoundException(`Actividad social ${id} no encontrada`);
    }
    return activity;
  }
}
