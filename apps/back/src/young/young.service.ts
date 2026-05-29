import { Injectable } from '@nestjs/common';
import type { CreateYoungProfileDto } from './dto/create-young-profile.dto';
import type { YoungProfile } from './young.entity';

// Perfil del joven, intereses y disponibilidad.
// Estructura lista para construir — sin lógica de persistencia todavía.
@Injectable()
export class YoungService {
  create(_dto: CreateYoungProfileDto): Promise<YoungProfile> {
    // TODO: persistir con el repositorio de TypeORM y registrar la señal de demanda.
    throw new Error('Not implemented');
  }

  findOne(_id: string): Promise<YoungProfile> {
    // TODO: buscar perfil por id.
    throw new Error('Not implemented');
  }
}
