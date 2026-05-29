import type { Opportunity } from '../types';

// Datos simulados de oportunidades en Cartagena.
// Diseñados para reemplazarse por la respuesta de GET /opportunities sin tocar los componentes.
// 2 empleos, 2 voluntariados, 2 estudios.

export const mockOpportunities: Opportunity[] = [
  // ───────────── Empleos ─────────────
  {
    id: 'opp-001',
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
    id: 'opp-002',
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

  // ───────────── Voluntariados ─────────────
  {
    id: 'opp-003',
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
    id: 'opp-004',
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

  // ───────────── Estudios ─────────────
  {
    id: 'opp-005',
    title: 'Tecnólogo en Análisis y Desarrollo de Software',
    organization: 'SENA Regional Bolívar — Cartagena',
    kind: 'estudio',
    requirements: [
      'Bachiller',
      'Prueba de aptitud SENA',
      'Disponibilidad tiempo completo',
    ],
    slotsTotal: 30,
    slotsAvailable: 0,
    barrio: 'Chiquinquirá',
    modalidad: 'presencial',
    interests: ['tecnologia', 'emprendimiento'],
  },
  {
    id: 'opp-006',
    title: 'Curso técnico de inglés para servicios turísticos',
    organization: 'SENA Regional Bolívar — Cartagena',
    kind: 'estudio',
    requirements: [
      'Bachillerato en curso o bachiller',
      'Disponibilidad jornada tarde',
    ],
    slotsTotal: 40,
    slotsAvailable: 9,
    barrio: 'Getsemaní',
    modalidad: 'virtual',
    interests: ['emprendimiento', 'liderazgo'],
  },
];
