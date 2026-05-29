import { Module } from '@nestjs/common';
import { BarriosController } from './barrios.controller';

// Datos de referencia compartidos (catálogos) expuestos a través de la API.
@Module({
  controllers: [BarriosController],
})
export class CommonModule {}
