import type { Repository } from 'typeorm';
import { Opportunity } from '../opportunities/opportunity.entity';
import { Skill } from '../skills/skill.entity';
import type { SocialActivity } from '../social-activity/social-activity.entity';
import { YoungProfile } from '../young/young.entity';
import { AiService } from './ai.service';
import type { GeminiService } from './gemini.service';

// Gemini deshabilitado: los hooks ejercitan el camino heurístico determinista.
const geminiDisabled = { isEnabled: () => false } as unknown as GeminiService;

function skill(id: string, label: string): Skill {
  return {
    id,
    slug: id,
    label,
    category: 'tecnica',
  };
}

function activity(
  id: string,
  barrio: string,
  requiredSkillIds: string[],
): SocialActivity {
  return {
    id,
    title: `Actividad ${id}`,
    description: 'Descripción',
    pointsReward: 10,
    category: 'voluntariado',
    barrio,
    requiredSkillIds,
  };
}

describe('AiService (métodos puros)', () => {
  let aiService: AiService;

  beforeEach(() => {
    aiService = new AiService(
      {} as Repository<YoungProfile>,
      {} as Repository<Opportunity>,
      {} as Repository<Skill>,
      geminiDisabled,
    );
  });

  describe('analyzeSkillGap', () => {
    it('separa habilidades coincidentes y faltantes por id', () => {
      const s1 = skill('s1', 'Excel');
      const s2 = skill('s2', 'Python');
      const s3 = skill('s3', 'Comunicación');

      const result = aiService.analyzeSkillGap([s1, s2], [s1, s3]);

      expect(result.matchingSkills).toEqual([s1]);
      expect(result.missingSkills).toEqual([s3]);
    });

    it('devuelve todo como faltante si el joven no tiene habilidades', () => {
      const required = [skill('s1', 'Excel'), skill('s2', 'Python')];
      const result = aiService.analyzeSkillGap([], required);

      expect(result.matchingSkills).toEqual([]);
      expect(result.missingSkills).toEqual(required);
    });

    it('devuelve todo como coincidente si exige un subconjunto del joven', () => {
      const young = [skill('s1', 'Excel'), skill('s2', 'Python')];
      const result = aiService.analyzeSkillGap(young, [young[0]!]);

      expect(result.matchingSkills).toEqual([young[0]]);
      expect(result.missingSkills).toEqual([]);
    });
  });

  describe('generateGrowthRoute', () => {
    it('devuelve score 100 y titular de postulación sin brecha', async () => {
      const result = await aiService.generateGrowthRoute({
        targetTitle: 'Dev junior',
        matchingSkills: [skill('s1', 'Git')],
        missingSkills: [],
        closingOpportunities: [],
      });

      expect(result.affinityScore).toBe(100);
      expect(result.headline).toBe(
        '¡Ya cumplís el perfil para «Dev junior»! Postúlate.',
      );
    });

    it('calcula score por cobertura y titular con curso de cierre', async () => {
      const result = await aiService.generateGrowthRoute({
        targetTitle: 'Analista de datos',
        matchingSkills: [skill('s1', 'Excel')],
        missingSkills: [skill('s2', 'Python'), skill('s3', 'SQL')],
        closingOpportunities: [
          {
            skill: skill('s2', 'Python'),
            opportunityTitle: 'Curso Python SENA',
            barrio: 'Manga',
            slotsAvailable: 15,
          },
        ],
      });

      expect(result.affinityScore).toBe(33);
      expect(result.headline).toBe(
        'Para «Analista de datos» te falta Python, SQL. Curso Python SENA en Manga tiene 15 cupos — ¿te conectamos?',
      );
    });

    it('avisa cuando no hay curso de cierre disponible', async () => {
      const result = await aiService.generateGrowthRoute({
        targetTitle: 'Diseñador UX',
        matchingSkills: [],
        missingSkills: [skill('s1', 'Figma')],
        closingOpportunities: [],
      });

      expect(result.affinityScore).toBe(0);
      expect(result.headline).toBe(
        'Para «Diseñador UX» te falta Figma. Aún no hay un curso de cierre disponible en tu zona.',
      );
    });

    it('ofrece lista de espera si el único curso de cierre está lleno', async () => {
      const result = await aiService.generateGrowthRoute({
        targetTitle: 'Dev backend',
        matchingSkills: [],
        missingSkills: [skill('s1', 'Python')],
        closingOpportunities: [
          {
            skill: skill('s1', 'Python'),
            opportunityTitle: 'Tecnólogo en Software SENA',
            barrio: 'Chiquinquirá',
            slotsAvailable: 0,
            isFull: true,
          },
        ],
      });

      expect(result.headline).toBe(
        'Para «Dev backend» te falta Python. Tecnólogo en Software SENA en Chiquinquirá no tiene cupos ahora — te anotamos en la lista de espera y avisamos al SENA.',
      );
    });

    it('prioriza un curso con cupo aunque también haya uno lleno', async () => {
      const result = await aiService.generateGrowthRoute({
        targetTitle: 'Dev backend',
        matchingSkills: [],
        missingSkills: [skill('s1', 'Python')],
        closingOpportunities: [
          {
            skill: skill('s1', 'Python'),
            opportunityTitle: 'Curso lleno',
            barrio: 'Manga',
            slotsAvailable: 0,
            isFull: true,
          },
          {
            skill: skill('s1', 'Python'),
            opportunityTitle: 'Curso con cupo',
            barrio: 'El Pozón',
            slotsAvailable: 5,
            isFull: false,
          },
        ],
      });

      expect(result.headline).toBe(
        'Para «Dev backend» te falta Python. Curso con cupo en El Pozón tiene 5 cupos — ¿te conectamos?',
      );
    });
  });

  describe('suggestSocialActivities', () => {
    it('ordena por afinidad descendente', async () => {
      const activities = [
        activity('low', 'Bocagrande', ['s1', 's2']),
        activity('high', 'Manga', ['s1']),
        activity('mid', 'Manga', ['s1', 's2', 's3']),
      ];

      const result = await aiService.suggestSocialActivities(
        { barrio: 'Manga', skillIds: ['s1', 's2'] },
        activities,
      );

      expect(result.map((r) => r.activityId)).toEqual(['high', 'mid', 'low']);
      expect(result[0]!.affinityScore).toBe(100);
      expect(result[1]!.affinityScore).toBe(80);
      expect(result[2]!.affinityScore).toBe(60);
    });

    it('asigna cobertura 0.5 cuando la actividad no exige habilidades', async () => {
      const result = await aiService.suggestSocialActivities(
        { barrio: 'Manga', skillIds: ['s1'] },
        [activity('open', 'Manga', [])],
      );

      // 0.6 * 0.5 + 0.4 * 1 = 0.7 → 70
      expect(result[0]).toEqual({ activityId: 'open', affinityScore: 70 });
    });

    it('penaliza barrio distinto aunque cubra todas las habilidades', async () => {
      const sameBarrio = await aiService.suggestSocialActivities(
        { barrio: 'Manga', skillIds: ['s1'] },
        [activity('a1', 'Manga', ['s1'])],
      );
      const otherBarrio = await aiService.suggestSocialActivities(
        { barrio: 'Manga', skillIds: ['s1'] },
        [activity('a2', 'Bocagrande', ['s1'])],
      );

      expect(sameBarrio[0]!.affinityScore).toBe(100);
      expect(otherBarrio[0]!.affinityScore).toBe(60);
    });
  });
});
