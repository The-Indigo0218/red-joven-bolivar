import { Injectable } from '@nestjs/common';
import type { InterestSlug } from '../young/young.entity';
import type { Group } from './group.entity';

export interface CreateGroupInput {
  name: string;
  barrio: string;
  interest: InterestSlug;
}

export interface GroupsQuery {
  barrio?: string;
  interest?: InterestSlug;
}

// Grupos sociales por barrio y habilidad (Mi Sangre).
// Estructura lista para construir — sin lógica de persistencia todavía.
@Injectable()
export class GroupsService {
  create(_input: CreateGroupInput): Promise<Group> {
    // TODO: persistir el grupo con TypeORM.
    throw new Error('Not implemented');
  }

  findAll(_query: GroupsQuery): Promise<Group[]> {
    // TODO: filtrar por barrio e interés.
    throw new Error('Not implemented');
  }
}
