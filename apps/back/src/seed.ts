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
  YoungProfile,
  type Availability,
  type EducationLevel,
  type InterestSlug,
  type SeekingType,
} from './young/young.entity';

// ─────────────────────────── Datos semilla (pitch demo) ───────────────────────────

const OPPORTUNITIES: Array<Omit<Opportunity, 'id'>> = [
  // ── Empleos ──
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
    barrio: 'El Pozón',
    modalidad: 'hibrido',
    interests: ['tecnologia'],
  },
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
    title: 'Operario de bodega y logística',
    organization: 'Almacenes Éxito — El Pozón',
    kind: 'empleo',
    requirements: ['Bachiller', 'Disponibilidad turnos rotativos', 'Manejo básico de Excel'],
    slotsTotal: 12,
    slotsAvailable: 5,
    barrio: 'El Pozón',
    modalidad: 'presencial',
    interests: ['emprendimiento'],
  },
  {
    title: 'Asistente administrativo',
    organization: 'Alcaldía Distrital de Cartagena',
    kind: 'empleo',
    requirements: ['Bachiller', 'Excel intermedio', 'Redacción de documentos'],
    slotsTotal: 6,
    slotsAvailable: 1,
    barrio: 'Centro Histórico',
    modalidad: 'presencial',
    interests: ['liderazgo', 'emprendimiento'],
  },
  {
    title: 'Repartidor/a de domicilios',
    organization: 'Rappi — Cartagena',
    kind: 'empleo',
    requirements: ['Mayor de 18 años', 'Bicicleta o moto propia', 'Conocimiento de la ciudad'],
    slotsTotal: 40,
    slotsAvailable: 22,
    barrio: 'Olaya Herrera',
    modalidad: 'presencial',
    interests: ['emprendimiento', 'deporte'],
  },
  {
    title: 'Auxiliar de cocina',
    organization: 'Restaurante La Mulata — Getsemaní',
    kind: 'empleo',
    requirements: ['Experiencia básica en cocina', 'Disponibilidad noche y fines de semana'],
    slotsTotal: 4,
    slotsAvailable: 2,
    barrio: 'Getsemaní',
    modalidad: 'presencial',
    interests: ['emprendimiento', 'arte'],
  },
  {
    title: 'Diseñador gráfico junior',
    organization: 'Agencia Caribe Digital',
    kind: 'empleo',
    requirements: ['Portafolio básico', 'Canva o Photoshop', 'Creatividad'],
    slotsTotal: 3,
    slotsAvailable: 1,
    barrio: 'Manga',
    modalidad: 'virtual',
    interests: ['arte', 'tecnologia'],
  },
  {
    title: 'Técnico en mantenimiento de equipos de cómputo',
    organization: 'Informática Popular — Manga',
    kind: 'empleo',
    requirements: ['Diagnóstico de hardware', 'Instalación de software', 'Atención al usuario'],
    slotsTotal: 4,
    slotsAvailable: 2,
    barrio: 'Manga',
    modalidad: 'presencial',
    interests: ['tecnologia'],
  },

  // ── Estudios / cursos SENA y aliados ──
  {
    title: 'Técnico laboral en Redes de Datos — SENA El Pozón',
    organization: 'SENA Regional Bolívar — El Pozón',
    kind: 'estudio',
    requirements: ['Bachiller', 'Prueba de aptitud SENA', 'Disponibilidad tiempo completo'],
    slotsTotal: 35,
    slotsAvailable: 0,
    barrio: 'El Pozón',
    modalidad: 'presencial',
    interests: ['tecnologia'],
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
    title: 'Tecnólogo en Análisis y Desarrollo de Software — jornada El Pozón',
    organization: 'SENA Regional Bolívar — El Pozón',
    kind: 'estudio',
    requirements: ['Bachiller', 'Residir en zona sur de Cartagena', 'Tiempo completo'],
    slotsTotal: 25,
    slotsAvailable: 3,
    barrio: 'El Pozón',
    modalidad: 'presencial',
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
  {
    title: 'Técnico en Contabilidad y Finanzas',
    organization: 'SENA — Olaya Herrera',
    kind: 'estudio',
    requirements: ['Bachiller', 'Matemáticas básicas', 'Jornada mañana'],
    slotsTotal: 28,
    slotsAvailable: 6,
    barrio: 'Olaya Herrera',
    modalidad: 'presencial',
    interests: ['emprendimiento'],
  },
  {
    title: 'Curso corto Excel para empleabilidad',
    organization: 'SENA — Chiquinquirá',
    kind: 'estudio',
    requirements: ['Bachiller', 'Interés en oficina y administración'],
    slotsTotal: 50,
    slotsAvailable: 14,
    barrio: 'Chiquinquirá',
    modalidad: 'presencial',
    interests: ['emprendimiento', 'tecnologia'],
  },
  {
    title: 'Técnico en Turismo y Guianza',
    organization: 'Universidad de Cartagena — Centro',
    kind: 'estudio',
    requirements: ['Bachiller', 'Inglés básico deseable'],
    slotsTotal: 20,
    slotsAvailable: 7,
    barrio: 'Centro Histórico',
    modalidad: 'presencial',
    interests: ['emprendimiento', 'liderazgo'],
  },
  {
    title: 'Diplomado en Marketing Digital',
    organization: 'SENA + Platzi — Cartagena',
    kind: 'estudio',
    requirements: ['Mayor de 16 años', 'Acceso a internet'],
    slotsTotal: 60,
    slotsAvailable: 18,
    barrio: 'Bocagrande',
    modalidad: 'virtual',
    interests: ['emprendimiento', 'tecnologia'],
  },
  {
    title: 'Técnico en Electricidad Industrial',
    organization: 'SENA — La Boquilla',
    kind: 'estudio',
    requirements: ['Bachiller', 'Disponibilidad tiempo completo'],
    slotsTotal: 22,
    slotsAvailable: 4,
    barrio: 'La Boquilla',
    modalidad: 'presencial',
    interests: ['tecnologia'],
  },
  {
    title: 'Bachillerato Plus nocturno para jóvenes trabajadores',
    organization: 'I.E. Nelson Mandela',
    kind: 'estudio',
    requirements: ['Mayor de 15 años', 'Disponibilidad noche'],
    slotsTotal: 45,
    slotsAvailable: 11,
    barrio: 'Nelson Mandela',
    modalidad: 'presencial',
    interests: ['liderazgo', 'deporte'],
  },

  // ── Voluntariados ──
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
    title: 'Mentoría de lectura en biblioteca comunitaria',
    organization: 'Biblioteca Distrital — El Bosque',
    kind: 'voluntariado',
    requirements: ['Mayor de 16 años', 'Paciencia con niños', '2 horas semanales'],
    slotsTotal: 15,
    slotsAvailable: 8,
    barrio: 'El Bosque',
    modalidad: 'presencial',
    interests: ['arte', 'liderazgo'],
  },
  {
    title: 'Escuela de fútbol comunitaria',
    organization: 'IDRD Cartagena — Nelson Mandela',
    kind: 'voluntariado',
    requirements: ['Mayor de 15 años', 'Trabajo en equipo', 'Fines de semana'],
    slotsTotal: 25,
    slotsAvailable: 15,
    barrio: 'Nelson Mandela',
    modalidad: 'presencial',
    interests: ['deporte', 'liderazgo'],
  },
  {
    title: 'Red juvenil de primeros auxilios',
    organization: 'Cruz Roja Colombiana — Cartagena',
    kind: 'voluntariado',
    requirements: ['Mayor de 16 años', 'Compromiso de 6 meses'],
    slotsTotal: 18,
    slotsAvailable: 10,
    barrio: 'Manga',
    modalidad: 'hibrido',
    interests: ['liderazgo', 'deporte'],
  },
  {
    title: 'Huerta urbana comunitaria',
    organization: 'Corporación Sembrando Futuro',
    kind: 'voluntariado',
    requirements: ['Interés en agricultura urbana', 'Fines de semana'],
    slotsTotal: 12,
    slotsAvailable: 6,
    barrio: 'Olaya Herrera',
    modalidad: 'presencial',
    interests: ['medio-ambiente', 'emprendimiento'],
  },
];

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
    opportunityTitle: 'Operario de bodega y logística',
    required: true,
    skillSlugs: ['excel-avanzado'],
  },
  {
    opportunityTitle: 'Asistente administrativo',
    required: true,
    skillSlugs: ['excel-avanzado', 'comunicacion'],
  },
  {
    opportunityTitle: 'Diseñador gráfico junior',
    required: true,
    skillSlugs: ['comunicacion'],
  },
  {
    opportunityTitle: 'Técnico en mantenimiento de equipos de cómputo',
    required: true,
    skillSlugs: ['logica-programacion', 'atencion-cliente'],
  },
  {
    opportunityTitle: 'Técnico laboral en Redes de Datos — SENA El Pozón',
    required: false,
    skillSlugs: ['redes', 'logica-programacion'],
  },
  {
    opportunityTitle: 'Tecnólogo en Análisis y Desarrollo de Software',
    required: false,
    skillSlugs: ['logica-programacion', 'bases-datos', 'redes'],
  },
  {
    opportunityTitle: 'Tecnólogo en Análisis y Desarrollo de Software — jornada El Pozón',
    required: false,
    skillSlugs: ['logica-programacion', 'bases-datos', 'redes'],
  },
  {
    opportunityTitle: 'Curso técnico de inglés para servicios turísticos',
    required: false,
    skillSlugs: ['ingles-tecnico', 'ingles-conversacional'],
  },
  {
    opportunityTitle: 'Curso corto Excel para empleabilidad',
    required: false,
    skillSlugs: ['excel-avanzado'],
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

// Títulos clave para el guion del pitch de 3 minutos.
const PITCH = {
  mariaName: 'María Torres',
  practicanteTitle: 'Practicante de soporte técnico de redes',
  fullCourseTitle: 'Técnico laboral en Redes de Datos — SENA El Pozón',
  waitlistTarget: 47,
};

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
      name: PITCH.mariaName,
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
  const fullCourseId = oppIdByTitle.get(PITCH.fullCourseTitle);
  if (fullCourseId) {
    const waitlistCandidates = await youngRepo
      .createQueryBuilder('y')
      .where('y.barrio = :barrio', { barrio: 'El Pozón' })
      .andWhere("'tecnologia' = ANY(y.interests)")
      .andWhere('y.id != :mariaId', { mariaId: maria.id })
      .orderBy('y.createdAt', 'ASC')
      .limit(PITCH.waitlistTarget)
      .getMany();

    if (waitlistCandidates.length > 0) {
      await waitlistRepo.save(
        waitlistCandidates.map((young) =>
          waitlistRepo.create({ opportunityId: fullCourseId, youngId: young.id }),
        ),
      );
    }
    console.log(
      `✓ ${waitlistCandidates.length} jóvenes en lista de espera — "${PITCH.fullCourseTitle}"`,
    );
  }

  // ── Matches: señales de interés repartidas ──
  const practicanteId = oppIdByTitle.get(PITCH.practicanteTitle);
  const matchTargets = savedOpps.filter(
    (o) => o.slotsAvailable > 0 && o.title !== PITCH.practicanteTitle,
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
  console.log(`   Dashboard: ~${PITCH.waitlistTarget} en espera tecnología El Pozón`);
  console.log('');
  console.log('🌱  Seed completo.');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed falló:', err);
  process.exit(1);
});
