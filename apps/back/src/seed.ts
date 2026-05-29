import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { CivicCoinTransaction } from './civiccoins/civiccoin-transaction.entity';
import { Group } from './groups/group.entity';
import { Match } from './opportunities/match.entity';
import { Opportunity } from './opportunities/opportunity.entity';
import { WaitlistEntry } from './opportunities/waitlist-entry.entity';
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
  OPPORTUNITIES,
  OPPORTUNITY_SKILLS,
  PITCH_DEMO,
} from './seed-opportunities.data';
import {
  YoungProfile,
  type Availability,
  type EducationLevel,
  type InterestSlug,
  type SeekingType,
} from './young/young.entity';

const BARRIO_DISTRIBUTION: Array<{ barrio: string; count: number }> = [
  { barrio: 'El Pozón', count: 130 },
  { barrio: 'Olaya Herrera', count: 95 },
  { barrio: 'Nelson Mandela', count: 78 },
  { barrio: 'El Bosque', count: 62 },
  { barrio: 'Chiquinquirá', count: 48 },
  { barrio: 'San Fernando', count: 55 },
  { barrio: 'La Boquilla', count: 42 },
  { barrio: 'Manga', count: 35 },
  { barrio: 'Getsemaní', count: 32 },
  { barrio: 'Bocagrande', count: 24 },
  { barrio: 'Centro Histórico', count: 18 },
  { barrio: 'Pie de la Popa', count: 28 },
];

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
  { name: 'Semillero de Emprendimiento Olaya', barrio: 'Olaya Herrera', interest: 'emprendimiento' },
  { name: 'Guardianes de la Ciénaga', barrio: 'La Boquilla', interest: 'medio-ambiente' },
  { name: 'Código Caribe — Chiquinquirá', barrio: 'Chiquinquirá', interest: 'tecnologia' },
  { name: 'Arte y Cultura Getsemaní', barrio: 'Getsemaní', interest: 'arte' },
  { name: 'Deporte y Paz — Nelson Mandela', barrio: 'Nelson Mandela', interest: 'deporte' },
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
  'Yuliana', 'Stiven', 'Natalia', 'Jhon', 'Paola', 'Kevin', 'Diana',
];
const LAST_NAMES = [
  'Pérez', 'Martínez', 'Torres', 'Romero', 'Cabrera', 'Salgado', 'Padilla',
  'Mendoza', 'Castro', 'Ríos', 'Herrera', 'Beltrán', 'Vergara', 'Olivares',
  'Mosquera', 'De la Hoz', 'Zambrano', 'Córdoba',
];

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
  {
    title: 'Reparación de computadores en punto digital',
    description: 'Voluntariado técnico en el barrio El Pozón.',
    pointsReward: 100,
    category: 'obra',
    barrio: 'El Pozón',
    skillSlugs: ['logica-programacion'],
  },
  {
    title: 'Censo juvenil de habilidades digitales',
    description: 'Entrevista a jóvenes sobre sus competencias TI.',
    pointsReward: 70,
    category: 'voluntariado',
    barrio: 'Chiquinquirá',
    skillSlugs: ['comunicacion'],
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
  {
    partner: 'Éxito El Pozón',
    description: 'Bono de $50.000 en mercado',
    pointsCost: 250,
    category: 'insumos',
    discount: null,
  },
];

async function seed(): Promise<void> {
  const force = process.argv.includes('--force');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const youngRepo = app.get<Repository<YoungProfile>>(getRepositoryToken(YoungProfile));
  const oppRepo = app.get<Repository<Opportunity>>(getRepositoryToken(Opportunity));
  const groupRepo = app.get<Repository<Group>>(getRepositoryToken(Group));
  const matchRepo = app.get<Repository<Match>>(getRepositoryToken(Match));
  const waitlistRepo = app.get<Repository<WaitlistEntry>>(getRepositoryToken(WaitlistEntry));
  const skillRepo = app.get<Repository<Skill>>(getRepositoryToken(Skill));
  const youngSkillRepo = app.get<Repository<YoungSkill>>(getRepositoryToken(YoungSkill));
  const oppSkillRepo = app.get<Repository<OpportunitySkill>>(getRepositoryToken(OpportunitySkill));
  const routeRepo = app.get<Repository<GrowthRoute>>(getRepositoryToken(GrowthRoute));
  const activityRepo = app.get<Repository<SocialActivity>>(getRepositoryToken(SocialActivity));
  const txRepo = app.get<Repository<CivicCoinTransaction>>(getRepositoryToken(CivicCoinTransaction));
  const catalogRepo = app.get<Repository<RedemptionCatalog>>(getRepositoryToken(RedemptionCatalog));
  const redemptionRepo = app.get<Repository<Redemption>>(getRepositoryToken(Redemption));

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
    await waitlistRepo.deleteAll();
    await oppSkillRepo.deleteAll();
    await youngSkillRepo.deleteAll();
    await skillRepo.deleteAll();
    await matchRepo.deleteAll();
    await oppRepo.deleteAll();
    await groupRepo.deleteAll();
    await youngRepo.deleteAll();
  }

  const savedOpps = await oppRepo.save(OPPORTUNITIES.map((o) => oppRepo.create(o)));
  const oppIdByTitle = new Map(savedOpps.map((o) => [o.title, o.id]));
  console.log(`✓ ${OPPORTUNITIES.length} oportunidades`);

  const savedSkills = await skillRepo.save(SKILLS.map((s) => skillRepo.create(s)));
  const skillIdBySlug = new Map(savedSkills.map((s) => [s.slug, s.id]));
  console.log(`✓ ${SKILLS.length} habilidades`);

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

  await catalogRepo.save(REDEMPTION_CATALOG.map((c) => catalogRepo.create(c)));
  console.log(`✓ ${REDEMPTION_CATALOG.length} ítems de canje`);

  await groupRepo.save(GROUPS.map((g) => groupRepo.create(g)));
  console.log(`✓ ${GROUPS.length} grupos`);

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

  const CHUNK = 200;
  for (let i = 0; i < profiles.length; i += CHUNK) {
    await youngRepo.insert(profiles.slice(i, i + CHUNK));
  }
  console.log(`✓ ${profiles.length} perfiles de jóvenes`);

  // ── Protagonista del pitch: María, 19, El Pozón ──
  const maria = await youngRepo.save(
    youngRepo.create({
      name: PITCH_DEMO.mariaName,
      age: 19,
      barrio: 'El Pozón',
      educationLevel: 'bachiller',
      seeking: 'empleo',
      availability: ['manana', 'tarde'],
      interests: ['tecnologia'],
    }),
  );
  const mariaSkillSlugs = ['logica-programacion', 'excel-avanzado', 'comunicacion'];
  await youngSkillRepo.save(
    mariaSkillSlugs
      .map((slug) => skillIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id))
      .map((skillId) =>
        youngSkillRepo.create({
          youngId: maria.id,
          skillId,
          source: 'cv',
          level: 'intermedio',
        }),
      ),
  );
  await txRepo.save(
    txRepo.create({
      youngId: maria.id,
      type: 'earned',
      amount: 300,
      activityId: null,
      validatorId: null,
      description: 'Bono de bienvenida a Red Joven Bolívar',
    }),
  );
  console.log(`✓ pitch demo: ${maria.name} (${maria.id}) — El Pozón, tecnología`);

  // ── Lista de espera: 47 jóvenes en curso SENA Redes (lleno) ──
  const fullCourseId = oppIdByTitle.get(PITCH_DEMO.fullCourseTitle);
  if (fullCourseId) {
    const waitlistCandidates = await youngRepo
      .createQueryBuilder('y')
      .where('y.barrio = :barrio', { barrio: 'El Pozón' })
      .andWhere("'tecnologia' = ANY(y.interests)")
      .andWhere('y.id != :mariaId', { mariaId: maria.id })
      .orderBy('y.createdAt', 'ASC')
      .limit(PITCH_DEMO.waitlistTarget)
      .getMany();

    if (waitlistCandidates.length > 0) {
      await waitlistRepo.save(
        waitlistCandidates.map((young) =>
          waitlistRepo.create({ opportunityId: fullCourseId, youngId: young.id }),
        ),
      );
    }
    console.log(
      `✓ ${waitlistCandidates.length} jóvenes en lista de espera — "${PITCH_DEMO.fullCourseTitle}"`,
    );
  }

  // ── Matches: señales de interés repartidas ──
  const practicanteId = oppIdByTitle.get(PITCH_DEMO.practicanteTitle);
  const matchTargets = savedOpps.filter(
    (o) => o.slotsAvailable > 0 && o.title !== PITCH_DEMO.practicanteTitle,
  );
  const matchYoungs = await youngRepo.find({ take: 35, order: { createdAt: 'ASC' } });
  const matches: Match[] = [];
  for (let i = 0; i < Math.min(matchYoungs.length, matchTargets.length); i++) {
    const young = matchYoungs[i];
    const opp = matchTargets[i % matchTargets.length];
    matches.push(
      matchRepo.create({
        youngId: young.id,
        opportunityId: opp.id,
        status: 'interesado',
        score: Math.round((0.55 + Math.random() * 0.35) * 100) / 100,
      }),
    );
  }
  if (practicanteId) {
    matches.push(
      matchRepo.create({
        youngId: maria.id,
        opportunityId: practicanteId,
        status: 'interesado',
        score: 0.72,
      }),
    );
  }
  await matchRepo.save(matches);
  console.log(`✓ ${matches.length} matches (interés registrado)`);

  console.log('');
  console.log('🎤  GUÍA RÁPIDA DEL PITCH');
  console.log('   Perfil demo: María Torres — crea perfil en El Pozón + tecnología');
  console.log('   CV demo: docs/fixtures/cvs/maria-torres-pitch.txt');
  console.log('   Empleo WOW: Practicante soporte técnico de redes (El Pozón)');
  console.log('   Curso lleno: Técnico Redes SENA El Pozón → lista de espera');
  console.log(`   Dashboard: ~${PITCH_DEMO.waitlistTarget} en espera tecnología El Pozón`);
  console.log('');
  console.log('🌱  Seed completo.');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed falló:', err);
  process.exit(1);
});

