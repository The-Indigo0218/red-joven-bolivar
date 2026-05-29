import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { Group } from './groups/group.entity';
import { Match } from './opportunities/match.entity';
import { Opportunity } from './opportunities/opportunity.entity';
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
    await matchRepo.deleteAll();
    await oppRepo.deleteAll();
    await groupRepo.deleteAll();
    await youngRepo.deleteAll();
  }

  // Oportunidades
  await oppRepo.save(OPPORTUNITIES.map((o) => oppRepo.create(o)));
  console.log(`✓ ${OPPORTUNITIES.length} oportunidades`);

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

  console.log('🌱  Seed completo.');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed falló:', err);
  process.exit(1);
});
