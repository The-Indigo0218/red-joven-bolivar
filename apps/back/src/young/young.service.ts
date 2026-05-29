import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CreateYoungProfileDto } from './dto/create-young-profile.dto';
import { YoungProfile } from './young.entity';

// Perfil del joven, intereses y disponibilidad. Cada perfil creado es una
// señal de demanda que DemandModule agrega en vivo.
@Injectable()
export class YoungService {
  constructor(
    @InjectRepository(YoungProfile)
    private readonly youngRepo: Repository<YoungProfile>,
  ) {}

  create(dto: CreateYoungProfileDto): Promise<YoungProfile> {
    const profile = this.youngRepo.create(dto);
    return this.youngRepo.save(profile);
  }

  async update(id: string, dto: CreateYoungProfileDto): Promise<YoungProfile> {
    const profile = await this.findOne(id);
    Object.assign(profile, dto);
    return this.youngRepo.save(profile);
  }

  async findOne(id: string): Promise<YoungProfile> {
    const profile = await this.youngRepo.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Perfil de joven ${id} no encontrado`);
    }
    return profile;
  }
}
