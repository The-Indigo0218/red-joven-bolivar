import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import type { CvExtractionResult } from '../ai/ai.service';
import { SkillsService } from './skills.service';
import type { Skill } from './skill.entity';

export class UploadCvDto {
  @IsString()
  @IsNotEmpty()
  cvText!: string;

  // Opcional: si se incluye, las habilidades extraídas se persisten al joven.
  @IsOptional()
  @IsUUID()
  youngId?: string;
}

export interface SkillsCatalogResponse {
  items: Skill[];
  total: number;
}

@Controller()
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // GET /skills — catálogo de habilidades.
  @Get('skills')
  async getCatalog(): Promise<SkillsCatalogResponse> {
    const items = await this.skillsService.getCatalog();
    return { items, total: items.length };
  }

  // POST /young/cv   (MCP_HOOK: CV_PARSING)
  @Post('young/cv')
  uploadCv(@Body() dto: UploadCvDto): Promise<CvExtractionResult> {
    return this.skillsService.uploadCv(dto.cvText, dto.youngId);
  }
}
