import { Controller, Get } from '@nestjs/common';
import { BARRIOS, type BarrioCoords } from './barrios';

export interface BarriosResponse {
  items: BarrioCoords[];
  total: number;
}

// Catálogo de barrios de Cartagena para el selector del OnboardingProfile.
// Datos de referencia estáticos (no cambian entre requests).
@Controller('barrios')
export class BarriosController {
  // GET /barrios
  @Get()
  findAll(): BarriosResponse {
    const items = [...BARRIOS];
    return { items, total: items.length };
  }
}
