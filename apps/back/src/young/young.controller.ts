import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CreateYoungProfileDto } from './dto/create-young-profile.dto';
import { YoungService } from './young.service';
import type { YoungProfile } from './young.entity';

@Controller('young')
export class YoungController {
  constructor(private readonly youngService: YoungService) {}

  // POST /young/profile
  @Post('profile')
  create(@Body() dto: CreateYoungProfileDto): Promise<YoungProfile> {
    return this.youngService.create(dto);
  }

  // PATCH /young/:id — actualiza el perfil sin cambiar el id (conserva skills del CV).
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateYoungProfileDto,
  ): Promise<YoungProfile> {
    return this.youngService.update(id, dto);
  }

  // GET /young/:id — recargar el perfil (404 si no existe).
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<YoungProfile> {
    return this.youngService.findOne(id);
  }
}
