import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AiService, type CvExtractionResult } from '../ai/ai.service';
import { YoungService } from '../young/young.service';
import { OpportunitySkill } from './opportunity-skill.entity';
import { Skill } from './skill.entity';
import { YoungSkill } from './young-skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(YoungSkill)
    private readonly youngSkillRepo: Repository<YoungSkill>,
    @InjectRepository(OpportunitySkill)
    private readonly opportunitySkillRepo: Repository<OpportunitySkill>,
    private readonly aiService: AiService,
    private readonly youngService: YoungService,
  ) {}

  getCatalog(): Promise<Skill[]> {
    return this.skillRepo.find({ order: { label: 'ASC' } });
  }

  getByIds(ids: string[]): Promise<Skill[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.skillRepo.find({ where: { id: In(ids) } });
  }

  // Habilidades actuales del joven (resueltas contra el catálogo).
  async getYoungSkills(youngId: string): Promise<Skill[]> {
    const links = await this.youngSkillRepo.find({ where: { youngId } });
    if (links.length === 0) return [];
    return this.skillRepo.find({ where: { id: In(links.map((l) => l.skillId)) } });
  }

  // Habilidades vinculadas a una oportunidad (requisitos / desarrolladas).
  async getOpportunitySkills(opportunityId: string): Promise<Skill[]> {
    const links = await this.opportunitySkillRepo.find({
      where: { opportunityId },
    });
    if (links.length === 0) return [];
    return this.skillRepo.find({ where: { id: In(links.map((l) => l.skillId)) } });
  }

  // Oportunidades que DESARROLLAN (required=false) alguna de las habilidades
  // dadas: candidatas a cerrar la brecha de una ruta.
  findClosingLinks(skillIds: string[]): Promise<OpportunitySkill[]> {
    if (skillIds.length === 0) return Promise.resolve([]);
    return this.opportunitySkillRepo.find({
      where: { skillId: In(skillIds), required: false },
    });
  }

  // POST /young/cv — extrae habilidades del CV (MCP_HOOK: CV_PARSING). Si se
  // pasa youngId, persiste las halladas con origen 'cv'.
  async uploadCv(cvText: string, youngId?: string): Promise<CvExtractionResult> {
    const result = await this.aiService.extractSkillsFromCV(cvText);

    if (youngId) {
      await this.youngService.findOne(youngId); // 404 si no existe
      for (const skill of result.skills) {
        const exists = await this.youngSkillRepo.findOne({
          where: { youngId, skillId: skill.id },
        });
        if (!exists) {
          await this.youngSkillRepo.save(
            this.youngSkillRepo.create({
              youngId,
              skillId: skill.id,
              source: 'cv',
              level: 'basico',
            }),
          );
        }
      }
    }

    return result;
  }
}
