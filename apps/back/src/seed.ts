import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { CivicCoinTransaction } from './civiccoins/civiccoin-transaction.entity';
import { Group } from './groups/group.entity';
import { Match } from './opportunities/match.entity';
import { Opportunity } from './opportunities/opportunity.entity';
import { RedemptionCatalog } from './redemptions/redemption-catalog.entity';
import { Redemption } from './redemptions/redemption.entity';
import { GrowthRoute } from './route/growth-route.entity';
import { OpportunitySkill } from './skills/opportunity-skill.entity';
import { Skill, type SkillCategory } from './skills/skill.entity';
import { YoungSkill } from './skills/young-skill.entity';
import {
  SocialActivity,
  type SocialActivityCategory,
} from './social-activity/social-activity.entity';
import {
  YoungProfile,
  type Availability,
  type EducationLevel,
  type InterestSlug,
  type SeekingType,
} from './young/young.entity';

// ─────────────────────────── Datos semilla ───────────────────────────

// Las 6 oportunidades del demo (fieles a apps/front/src/data/mockOpportunities.ts),
// para que el feed real se vea igual que la versión con mocks.
const OPPORTUNITIES: Array<Omit<Opportunity, 'id'>> = [
  {
    title: 'Auxiliar de recepción turística bilingüe',
    organization: 'Hotel Las Américas — Turismo Cartagena',
    kind: 'empleo',
    requirements: [
      'Bachiller',
      'Inglés conversacional básico',
      'Disponibilidad fines de semana',
    ],
    slotsTotal: 8,
    slotsAvailable: 3,
    barrio: 'Bocagrande',
    modalidad: 'presencial',
    interests: ['emprendimiento', 'liderazgo'],
  },
  {
    title: 'Practicante de soporte técnico de redes',
    organization: 'Cartagena Tech Solutions',
    kind: 'empleo',
    requirements: [
      'Cursando técnico/tecnólogo en sistemas',
      'Conocimientos básicos de redes',
      'Disponibilidad jornada mañana',
    ],
    slotsTotal: 5,
    slotsAvailable: 2,
    barrio: 'Manga',
    modalidad: 'hibrido',
    interests: ['tecnologia'],
  },
  {
    title: 'Tallerista de liderazgo juvenil comunitario',
    organization: 'Fundación Mi Sangre',
    kind: 'voluntariado',
    requirements: [
      'Mayor de 16 años',
      'Habilidades de comunicación',
      'Compromiso de 4 horas semanales',
    ],
    slotsTotal: 20,
    slotsAvailable: 12,
    barrio: 'El Pozón',
    modalidad: 'presencial',
    interests: ['liderazgo', 'arte'],
  },
  {
    title: 'Brigada de recuperación de la Ciénaga de la Virgen',
    organization: 'Fundación Mi Sangre',
    kind: 'voluntariado',
    requirements: [
      'Mayor de 15 años',
      'Disponibilidad fines de semana',
      'Interés en medio ambiente',
    ],
    slotsTotal: 30,
    slotsAvailable: 18,
    barrio: 'La Boquilla',
    modalidad: 'presencial',
    interests: ['medio-ambiente', 'liderazgo'],
  },
  {
    title: 'Tecnólogo en Análisis y Desarrollo de Software',
    organization: 'SENA Regional Bolívar — Cartagena',
    kind: 'estudio',
    requirements: [
      'Bachiller',
      'Prueba de aptitud SENA',
      'Disponibilidad tiempo completo',
    ],
    slotsTotal: 30,
    slotsAvailable: 4,
    barrio: 'Chiquinquirá',
    modalidad: 'virtual',
    interests: ['tecnologia', 'emprendimiento'],
  },
  {
    title: 'Curso técnico de inglés para servicios turísticos',
    organization: 'SENA Regional Bolívar — Cartagena',
    kind: 'estudio',
    requirements: ['Bachillerato en curso o bachiller', 'Disponibilidad jornada tarde'],
    slotsTotal: 40,
    slotsAvailable: 9,
    barrio: 'Getsemaní',
    modalidad: 'hibrido',
    interests: ['emprendimiento', 'liderazgo'],
  },
];

// Distribución de jóvenes por barrio (espejo de mockDemand.byZone). Cada unidad
// es un perfil real: así el dashboard agrega demanda viva con magnitudes creíbles.
const BARRIO_DISTRIBUTION: Array<{ barrio: string; count: number }> = [
  { barrio: 'El Pozón', count: 84 },
  { barrio: 'Olaya Herrera', count: 72 },
  { barrio: 'Nelson Mandela', count: 62 },
  { barrio: 'El Bosque', count: 46 },
  { barrio: 'Chiquinquirá', count: 39 },
  { barrio: 'Manga', count: 28 },
  { barrio: 'Getsemaní', count: 24 },
  { barrio: 'Bocagrande', count: 18 },
];

// Pesos de interés (espejo de mockDemand.topInterests). Sesgan el dashboard
// hacia tecnología/emprendimiento → brechas marcadas frente a los pocos cupos.
const INTEREST_WEIGHTS: Array<{ slug: InterestSlug; weight: number }> = [
  { slug: 'tecnologia', weight: 34 },
  { slug: 'emprendimiento', weight: 26 },
  { slug: 'arte', weight: 21 },
  { slug: 'deporte', weight: 18 },
  { slug: 'liderazgo', weight: 15 },
  { slug: 'medio-ambiente', weight: 10 },
];

const GROUPS: Array<Omit<Group, 'id' | 'createdAt'>> = [
  { name: 'Jóvenes Tech El Pozón', barrio: 'El Pozón', interest: 'tecnologia' },
  {
    name: 'Semillero de Emprendimiento Olaya',
    barrio: 'Olaya Herrera',
    interest: 'emprendimiento',
  },
  {
    name: 'Guardianes de la Ciénaga',
    barrio: 'La Boquilla',
    interest: 'medio-ambiente',
  },
];

const EDUCATION_LEVELS: EducationLevel[] = [
  'primaria',
  'bachillerato-en-curso',
  'bachiller',
  'tecnico',
  'tecnologo',
  'universitario',
  'ninguno',
];
const SEEKING_TYPES: SeekingType[] = ['empleo', 'voluntariado', 'estudio', 'todos'];
const AVAILABILITY: Availability[] = [
  'manana',
  'tarde',
  'noche',
  'fines-de-semana',
  'tiempo-completo',
];
const FIRST_NAMES = [
  'María', 'José', 'Luisa', 'Carlos', 'Valentina', 'Andrés', 'Daniela',
  'Sebastián', 'Camila', 'Juan', 'Sofía', 'Miguel', 'Laura', 'David',
  'Isabella', 'Santiago', 'Mariana', 'Diego', 'Gabriela', 'Felipe',
];
const LAST_NAMES = [
  'Pérez', 'Martínez', 'Torres', 'Romero', 'Cabrera', 'Salgado', 'Padilla',
  'Mendoza', 'Castro', 'Ríos', 'Herrera', 'Beltrán', 'Vergara', 'Olivares',
];

// ─────────────────────────── Utilidades random ───────────────────────────

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const TOTAL_WEIGHT = INTEREST_WEIGHTS.reduce((s, i) => s + i.weight, 0);
function pickInterest(): InterestSlug {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const { slug, weight } of INTEREST_WEIGHTS) {
    r -= weight;
    if (r <= 0) return slug;
  }
  return INTEREST_WEIGHTS[0].slug;
}
function pickInterests(): InterestSlug[] {
  const n = randInt(1, 3);
  const set = new Set<InterestSlug>();
  while (set.size < n) set.add(pickInterest());
  return [...set];
}

// ─────────────────── Diferenciador 1: Skills / Rutas ───────────────────

const SKILLS: Array<{ slug: string; label: string; category: SkillCategory }> = [
  { slug: 'logica-programacion', label: 'Lógica de programación', category: 'tecnica' },
  { slug: 'bases-datos', label: 'Bases de datos', category: 'tecnica' },
  { slug: 'redes', label: 'Redes y conectividad', category: 'tecnica' },
  { slug: 'ingles-tecnico', label: 'Inglés técnico', category: 'tecnica' },
  { slug: 'ingles-conversacional', label: 'Inglés conversacional', category: 'blanda' },
  { slug: 'excel-avanzado', label: 'Excel avanzado', category: 'digital' },
  { slug: 'atencion-cliente', label: 'Atención al cliente', category: 'blanda' },
  { slug: 'comunicacion', label: 'Comunicación', category: 'blanda' },
  { slug: 'educacion-ambiental', label: 'Educación ambiental', category: 'tecnica' },
];

// Vínculo oportunidad → habilidades. En empleos son requisitos (required=true);
// en estudios/voluntariados son las que la oportunidad desarrolla (false), y
// por tanto sirven para cerrar brechas en una ruta.
const OPPORTUNITY_SKILLS: Array<{
  opportunityTitle: string;
  required: boolean;
  skillSlugs: string[];
}> = [
  {
    opportunityTitle: 'Practicante de soporte técnico de redes',
    required: true,
    skillSlugs: ['redes', 'logica-programacion'],
  },
  {
    opportunityTitle: 'Auxiliar de recepción turística bilingüe',
    required: true,
    skillSlugs: ['ingles-conversacional', 'atencion-cliente'],
  },
  {
    opportunityTitle: 'Tecnólogo en Análisis y Desarrollo de Software',
    required: false,
    skillSlugs: ['logica-programacion', 'bases-datos', 'redes'],
  },
  {
    opportunityTitle: 'Curso técnico de inglés para servicios turísticos',
    required: false,
    skillSlugs: ['ingles-tecnico', 'ingles-conversacional'],
  },
  {
    opportunityTitle: 'Tallerista de liderazgo juvenil comunitario',
    required: false,
    skillSlugs: ['comunicacion'],
  },
  {
    opportunityTitle: 'Brigada de recuperación de la Ciénaga de la Virgen',
    required: false,
    skillSlugs: ['educacion-ambiental'],
  },
];

// ─────────────────── Diferenciador 2: CivicCoins ───────────────────

const SOCIAL_ACTIVITIES: Array<{
  title: string;
  description: string;
  pointsReward: number;
  category: SocialActivityCategory;
  barrio: string;
  skillSlugs: string[];
}> = [
  {
    title: 'Enseña lógica de programación a otros jóvenes',
    description: 'Dicta un taller básico de programación en tu barrio.',
    pointsReward: 120,
    category: 'enseñanza',
    barrio: 'El Pozón',
    skillSlugs: ['logica-programacion'],
  },
  {
    title: 'Jornada de limpieza de la Ciénaga de la Virgen',
    description: 'Participa en la recuperación ambiental del ecosistema.',
    pointsReward: 80,
    category: 'obra',
    barrio: 'La Boquilla',
    skillSlugs: ['educacion-ambiental'],
  },
  {
    title: 'Tutoría de inglés para niños del barrio',
    description: 'Apoya a niños con inglés conversacional básico.',
    pointsReward: 90,
    category: 'enseñanza',
    barrio: 'Getsemaní',
    skillSlugs: ['ingles-conversacional'],
  },
  {
    title: 'Apoyo en feria de emprendimiento juvenil',
    description: 'Suma horas de voluntariado en la feria local.',
    pointsReward: 60,
    category: 'voluntariado',
    barrio: 'Olaya Herrera',
    skillSlugs: [],
  },
];

const REDEMPTION_CATALOG: Array<Omit<RedemptionCatalog, 'id'>> = [
  {
    partner: 'Papelería El Estudiante',
    description: 'Kit escolar completo (cuadernos y útiles)',
    pointsCost: 200,
    category: 'insumos',
    discount: null,
  },
  {
    partner: 'SENA',
    description: 'Cupo prioritario en curso corto',
    pointsCost: 300,
    category: 'educacion',
    discount: null,
  },
  {
    partner: 'Platzi',
    description: '1 mes de acceso a cursos online',
    pointsCost: 500,
    category: 'educacion',
    discount: 100,
  },
  {
    partner: 'Universidad de Cartagena',
    description: '30% de descuento en matrícula de pregrado',
    pointsCost: 1000,
    category: 'universidad',
    discount: 30,
  },
];

// ─────────────────────────── Seed ───────────────────────────

async function seed(): Promise<void> {
  const force = process.argv.includes('--force');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const youngRepo = app.get<Repository<YoungProfile>>(
    getRepositoryToken(YoungProfile),
  );
  const oppRepo = app.get<Repository<Opportunity>>(
    getRepositoryToken(Opportunity),
  );
  const groupRepo = app.get<Repository<Group>>(getRepositoryToken(Group));
  const matchRepo = app.get<Repository<Match>>(getRepositoryToken(Match));
  const skillRepo = app.get<Repository<Skill>>(getRepositoryToken(Skill));
  const youngSkillRepo = app.get<Repository<YoungSkill>>(
    getRepositoryToken(YoungSkill),
  );
  const oppSkillRepo = app.get<Repository<OpportunitySkill>>(
    getRepositoryToken(OpportunitySkill),
  );
  const routeRepo = app.get<Repository<GrowthRoute>>(
    getRepositoryToken(GrowthRoute),
  );
  const activityRepo = app.get<Repository<SocialActivity>>(
    getRepositoryToken(SocialActivity),
  );
  const txRepo = app.get<Repository<CivicCoinTransaction>>(
    getRepositoryToken(CivicCoinTransaction),
  );
  const catalogRepo = app.get<Repository<RedemptionCatalog>>(
    getRepositoryToken(RedemptionCatalog),
  );
  const redemptionRepo = app.get<Repository<Redemption>>(
    getRepositoryToken(Redemption),
  );

  const existing = await oppRepo.count();
  if (existing > 0 && !force) {
    console.log(
      `↩︎  La base ya tiene ${existing} oportunidades. Usa "npm run seed -- --force" para reiniciar.`,
    );
    await app.close();
    return;
  }

  if (force) {
    console.log('🧹  --force: limpiando datos previos…');
    await redemptionRepo.deleteAll();
    await txRepo.deleteAll();
    await catalogRepo.deleteAll();
    await activityRepo.deleteAll();
    await routeRepo.deleteAll();
    await oppSkillRepo.deleteAll();
    await youngSkillRepo.deleteAll();
    await skillRepo.deleteAll();
    await matchRepo.deleteAll();
    await oppRepo.deleteAll();
    await groupRepo.deleteAll();
    await youngRepo.deleteAll();
  }

  // Oportunidades (capturamos ids para vincular habilidades)
  const savedOpps = await oppRepo.save(OPPORTUNITIES.map((o) => oppRepo.create(o)));
  const oppIdByTitle = new Map(savedOpps.map((o) => [o.title, o.id]));
  console.log(`✓ ${OPPORTUNITIES.length} oportunidades`);

  // Catálogo de habilidades
  const savedSkills = await skillRepo.save(SKILLS.map((s) => skillRepo.create(s)));
  const skillIdBySlug = new Map(savedSkills.map((s) => [s.slug, s.id]));
  console.log(`✓ ${SKILLS.length} habilidades`);

  // Habilidades por oportunidad
  const oppSkillRows = OPPORTUNITY_SKILLS.flatMap((link) => {
    const opportunityId = oppIdByTitle.get(link.opportunityTitle);
    if (!opportunityId) return [];
    return link.skillSlugs.flatMap((slug) => {
      const skillId = skillIdBySlug.get(slug);
      return skillId
        ? [oppSkillRepo.create({ opportunityId, skillId, required: link.required })]
        : [];
    });
  });
  await oppSkillRepo.save(oppSkillRows);
  console.log(`✓ ${oppSkillRows.length} vínculos oportunidad↔habilidad`);

  // Actividades sociales (resolviendo skills requeridas)
  await activityRepo.save(
    SOCIAL_ACTIVITIES.map((a) =>
      activityRepo.create({
        title: a.title,
        description: a.description,
        pointsReward: a.pointsReward,
        category: a.category,
        barrio: a.barrio,
        requiredSkillIds: a.skillSlugs
          .map((slug) => skillIdBySlug.get(slug))
          .filter((id): id is string => Boolean(id)),
      }),
    ),
  );
  console.log(`✓ ${SOCIAL_ACTIVITIES.length} actividades sociales`);

  // Catálogo de canje
  await catalogRepo.save(REDEMPTION_CATALOG.map((c) => catalogRepo.create(c)));
  console.log(`✓ ${REDEMPTION_CATALOG.length} ítems de canje`);

  // Grupos
  await groupRepo.save(GROUPS.map((g) => groupRepo.create(g)));
  console.log(`✓ ${GROUPS.length} grupos`);

  // Jóvenes (señales de demanda)
  const profiles: Array<Partial<YoungProfile>> = [];
  for (const { barrio, count } of BARRIO_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      profiles.push({
        name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        age: randInt(14, 30),
        barrio,
        educationLevel: pick(EDUCATION_LEVELS),
        seeking: pick(SEEKING_TYPES),
        availability: [pick(AVAILABILITY)],
        interests: pickInterests(),
      });
    }
  }
  // Inserción por lotes para no saturar la sentencia.
  const CHUNK = 200;
  for (let i = 0; i < profiles.length; i += CHUNK) {
    await youngRepo.insert(profiles.slice(i, i + CHUNK));
  }
  console.log(`✓ ${profiles.length} perfiles de jóvenes`);

  // Joven destacado: habilidades declaradas + saldo inicial de CivicCoins,
  // para que las pantallas de Ruta y CivicCoins tengan datos al abrir.
  const [showcase, validator] = await youngRepo.find({
    take: 2,
    order: { createdAt: 'ASC' },
  });
  if (showcase) {
    const showcaseSkillSlugs = ['logica-programacion', 'excel-avanzado'];
    await youngSkillRepo.save(
      showcaseSkillSlugs
        .map((slug) => skillIdBySlug.get(slug))
        .filter((id): id is string => Boolean(id))
        .map((skillId) =>
          youngSkillRepo.create({
            youngId: showcase.id,
            skillId,
            source: 'declarado',
            level: 'intermedio',
          }),
        ),
    );

    await txRepo.save(
      txRepo.create({
        youngId: showcase.id,
        type: 'earned',
        amount: 300,
        activityId: null,
        validatorId: validator?.id ?? null,
        description: 'Bono de bienvenida a Red Joven Bolívar',
      }),
    );
    console.log(
      `✓ joven destacado ${showcase.name} (${showcase.id}) con skills y 300 CivicCoins`,
    );
  }

  console.log('🌱  Seed completo.');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed falló:', err);
  process.exit(1);
});
