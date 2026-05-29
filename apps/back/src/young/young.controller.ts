import { Body, Controller, Post } from '@nestjs/common';
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
}
