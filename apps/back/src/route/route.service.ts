import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AiService, type ClosingOpportunityInput } from '../ai/ai.service';
import { Opportunity } from '../opportunities/opportunity.entity';
import { SkillsService } from '../skills/skills.service';
import type { Skill } from '../skills/skill.entity';
import { YoungService } from '../young/young.service';
import { GrowthRoute } from './growth-route.entity';

export interface ClosingOpportunity {
  skill: Skill;
  opportunity: Opportunity;
  slotsAvailable: number;
}

export interface GrowthRouteResponse {
  opportunityId: string;
  youngId: string;
  affinityScore: number; // 0..100
  matchingSkills: Skill[];
  missingSkills: Skill[];
  closingOpportunities: ClosingOpportunity[];
  headline: string;
}

// Motor de Rutas de Crecimiento (Diferenciador 1): combina gap analysis +
// oferta de cierre disponible para decirle al joven qué le falta y dónde
// conseguirlo, gratis y en Cartagena.
@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(GrowthRoute)
    private readonly routeRepo: Repository<GrowthRoute>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
    private readonly skillsService: SkillsService,
    private readonly youngService: YoungService,
    private readonly aiService: AiService,
  ) {}

  async generateRoute(
    opportunityId: string,
    youngId: string,
  ): Promise<GrowthRouteResponse> {
    const target = await this.opportunityRepo.findOne({
      where: { id: opportunityId },
    });
    if (!target) {
      throw new NotFoundException(`Oportunidad ${opportunityId} no encontrada`);
    }
    await this.youngService.findOne(youngId); // 404 si no existe

    const youngSkills = await this.skillsService.getYoungSkills(youngId);
    const requiredSkills =
      await this.skillsService.getOpportunitySkills(opportunityId);

    // MCP_HOOK: GAP_ANALYSIS
    const { matchingSkills, missingSkills } = this.aiService.analyzeSkillGap(
      youngSkills,
      requiredSkills,
    );

    const closingOpportunities = await this.findClosingOpportunities(
      missingSkills,
      opportunityId,
    );

    // MCP_HOOK: ROUTE_GENERATION
    const { affinityScore, headline } = this.aiService.generateGrowthRoute({
      targetTitle: target.title,
      matchingSkills,
      missingSkills,
      closingOpportunities: closingOpportunities.map<ClosingOpportunityInput>(
        (c) => ({
          skill: c.skill,
          opportunityTitle: c.opportunity.title,
          barrio: c.opportunity.barrio,
          slotsAvailable: c.slotsAvailable,
        }),
      ),
    });

    await this.routeRepo.save(
      this.routeRepo.create({
        youngId,
        targetOpportunityId: opportunityId,
        affinityScore,
        missingSkillIds: missingSkills.map((s) => s.id),
        closingOpportunityIds: closingOpportunities.map((c) => c.opportunity.id),
        headline,
      }),
    );

    return {
      opportunityId,
      youngId,
      affinityScore,
      matchingSkills,
      missingSkills,
      closingOpportunities,
      headline,
    };
  }

  // Para cada habilidad faltante, busca cursos/talleres que la desarrollan y
  // tienen cupo, distintos de la oportunidad objetivo.
  private async findClosingOpportunities(
    missingSkills: Skill[],
    targetOpportunityId: string,
  ): Promise<ClosingOpportunity[]> {
    if (missingSkills.length === 0) return [];

    const links = await this.skillsService.findClosingLinks(
      missingSkills.map((s) => s.id),
    );
    if (links.length === 0) return [];

    const opportunities = await this.opportunityRepo.find({
      where: { id: In(links.map((l) => l.opportunityId)) },
    });
    const oppById = new Map(opportunities.map((o) => [o.id, o]));
    const skillById = new Map(missingSkills.map((s) => [s.id, s]));

    const result: ClosingOpportunity[] = [];
    const seen = new Set<string>();
    for (const link of links) {
      if (link.opportunityId === targetOpportunityId) continue;
      const opportunity = oppById.get(link.opportunityId);
      const skill = skillById.get(link.skillId);
      if (!opportunity || !skill || opportunity.slotsAvailable <= 0) continue;

      const key = `${skill.id}|${opportunity.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      result.push({
        skill,
        opportunity,
        slotsAvailable: opportunity.slotsAvailable,
      });
    }
    return result;
  }
}
