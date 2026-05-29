import type {
  CivicCoinsBalanceResponse,
  GrowthRouteResponse,
  RedemptionCatalogResponse,
  Skill,
  SuggestedActivitiesResponse,
} from '../types';
import { SKILL_CATALOG } from './skillCatalog';

const MOCK_OPPORTUNITY_SKILL_SLUGS: Record<string, string[]> = {
  'Practicante de soporte técnico de redes': ['redes', 'logica-programacion'],
  'Auxiliar de recepción turística bilingüe': ['ingles-conversacional', 'atencion-cliente'],
  'Tecnólogo en Análisis y Desarrollo de Software': [
    'logica-programacion',
    'bases-datos',
    'redes',
  ],
  'Curso técnico de inglés para servicios turísticos': [
    'ingles-tecnico',
    'ingles-conversacional',
  ],
};

function skillsFromSlugs(slugs: string[]): Skill[] {
  return slugs
    .map((slug) => SKILL_CATALOG.find((entry) => entry.slug === slug))
    .filter((entry): entry is (typeof SKILL_CATALOG)[number] => Boolean(entry))
    .map((entry) => ({
      id: `skill-${entry.slug}`,
      slug: entry.slug,
      label: entry.label,
      category: entry.category,
    }));
}

function analyzeSkillGap(youngSkills: Skill[], targetSkills: Skill[]) {
  const haveIds = new Set(youngSkills.map((skill) => skill.id));
  return {
    matchingSkills: targetSkills.filter((skill) => haveIds.has(skill.id)),
    missingSkills: targetSkills.filter((skill) => !haveIds.has(skill.id)),
  };
}

export function buildMockRoute(
  opportunityId: string,
  youngId: string,
  opportunityTitle?: string,
  youngSkills: Skill[] = [],
): GrowthRouteResponse {
  const targetSlugs = opportunityTitle
    ? (MOCK_OPPORTUNITY_SKILL_SLUGS[opportunityTitle] ?? [])
    : [];
  const targetSkills = skillsFromSlugs(targetSlugs);
  const { matchingSkills, missingSkills } = analyzeSkillGap(youngSkills, targetSkills);
  const total = matchingSkills.length + missingSkills.length;
  const affinityScore = total ? Math.round((100 * matchingSkills.length) / total) : 100;

  let headline = 'Tu ruta personalizada en Cartagena.';
  if (missingSkills.length === 0 && matchingSkills.length > 0) {
    headline = 'Vas muy bien: ya cubres las habilidades clave para esta oportunidad.';
  } else if (missingSkills.length > 0) {
    headline = `Estas cerca: refuerza ${missingSkills.map((s) => s.label).join(' y ')}.`;
  }

  return {
    opportunityId,
    youngId,
    affinityScore,
    headline,
    matchingSkills,
    missingSkills,
    closingOpportunities: [],
  };
}

export const mockCivicCoinsBalance = (youngId: string): CivicCoinsBalanceResponse => ({
  youngId,
  balance: 120,
  history: [
    {
      id: 'tx1',
      type: 'earned',
      amount: 50,
      description: 'Limpieza de playa en La Boquilla',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'tx2',
      type: 'earned',
      amount: 70,
      description: 'Bono de bienvenida a Red Joven Bolivar',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ],
});

export const mockSuggestedActivities: SuggestedActivitiesResponse = {
  items: [
    {
      id: 'act1',
      title: 'Limpieza comunitaria La Boquilla',
      description: 'Jornada de recoleccion de residuos en la playa.',
      pointsReward: 50,
      category: 'medio-ambiente',
      barrio: 'La Boquilla',
      requiredSkills: [],
      affinityScore: 85,
    },
    {
      id: 'act2',
      title: 'Taller de emprendimiento juvenil',
      description: 'Sesion grupal para ideas de negocio local.',
      pointsReward: 40,
      category: 'emprendimiento',
      barrio: 'Chiquinquira',
      requiredSkills: [
        { id: 'skill-comunicacion', slug: 'comunicacion', label: 'Comunicacion', category: 'blanda' },
      ],
      affinityScore: 72,
    },
  ],
};

export const mockRedemptionCatalog: RedemptionCatalogResponse = {
  items: [
    {
      id: 'cat1',
      partner: 'Almacenes Exito',
      description: 'Descuento en insumos escolares',
      pointsCost: 100,
      category: 'insumos',
      discount: 15,
    },
    {
      id: 'cat2',
      partner: 'SENA Cartagena',
      description: 'Prioridad en inscripcion a curso corto',
      pointsCost: 200,
      category: 'educacion',
      discount: null,
    },
  ],
};
