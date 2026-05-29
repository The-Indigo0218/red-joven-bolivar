import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
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

  // GET /young/:id — recargar el perfil (404 si no existe).
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<YoungProfile> {
    return this.youngService.findOne(id);
  }
}
