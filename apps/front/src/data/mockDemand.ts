import type {
  DemandDashboardResponse,
  ZoneDemand,
  InterestDemand,
  DemandGap,
} from '../types';

// Datos simulados de demanda agregada para el DemandDashboard.
// Diseñados para reemplazarse por GET /demand/dashboard sin tocar los componentes.

// Concentración de jóvenes por barrio (mapa Leaflet) — 8 barrios de Cartagena.
export const mockZoneDemand: ZoneDemand[] = [
  { barrio: 'El Pozón', lat: 10.4083, lng: -75.4793, youngCount: 420 },
  { barrio: 'Olaya Herrera', lat: 10.4122, lng: -75.4981, youngCount: 360 },
  { barrio: 'Nelson Mandela', lat: 10.3872, lng: -75.4831, youngCount: 310 },
  { barrio: 'Manga', lat: 10.4131, lng: -75.5342, youngCount: 140 },
  { barrio: 'Bocagrande', lat: 10.3984, lng: -75.5566, youngCount: 90 },
  { barrio: 'Getsemaní', lat: 10.4211, lng: -75.5461, youngCount: 120 },
  { barrio: 'El Bosque', lat: 10.4041, lng: -75.5031, youngCount: 230 },
  { barrio: 'Chiquinquirá', lat: 10.4052, lng: -75.5102, youngCount: 195 },
];

// Top 6 intereses declarados (gráfico de barras Recharts).
export const mockInterestDemand: InterestDemand[] = [
  { interest: 'tecnologia', label: 'Tecnología', youngCount: 340 },
  { interest: 'emprendimiento', label: 'Emprendimiento', youngCount: 260 },
  { interest: 'arte', label: 'Arte', youngCount: 210 },
  { interest: 'deporte', label: 'Deporte', youngCount: 180 },
  { interest: 'liderazgo', label: 'Liderazgo', youngCount: 150 },
  { interest: 'medio-ambiente', label: 'Medio ambiente', youngCount: 95 },
];

// 3 brechas reales demanda/oferta — el corazón del valor de la plataforma.
export const mockGaps: DemandGap[] = [
  {
    interest: 'tecnologia',
    barrio: 'El Pozón',
    youngCount: 52,
    slotsOffered: 5,
    gap: 47,
    waitlistCount: 47,
    headline:
      '52 jóvenes quieren tecnología en El Pozón — solo 5 cupos y 47 en lista de espera',
  },
  {
    interest: 'tecnologia',
    barrio: 'Chiquinquirá',
    youngCount: 200,
    slotsOffered: 30,
    gap: 170,
    waitlistCount: 45,
    headline:
      '200 jóvenes quieren estudiar sistemas en Cartagena — solo 30 cupos y 45 en lista de espera',
  },
  {
    interest: 'emprendimiento',
    barrio: 'Getsemaní',
    youngCount: 130,
    slotsOffered: 40,
    gap: 90,
    waitlistCount: 22,
    headline:
      '130 jóvenes buscan inglés técnico para turismo — solo 40 cupos y 22 en lista de espera',
  },
  {
    interest: 'emprendimiento',
    barrio: 'El Pozón',
    youngCount: 180,
    slotsOffered: 25,
    gap: 155,
    waitlistCount: 38,
    headline:
      '180 jóvenes quieren formación en emprendimiento juvenil — solo 25 cupos y 38 en lista de espera',
  },
];

// Respuesta agregada completa (shape de GET /demand/dashboard).
export const mockDemand: DemandDashboardResponse = {
  byZone: mockZoneDemand,
  topInterests: mockInterestDemand,
  gaps: mockGaps,
  generatedAt: '2026-05-29T00:00:00.000Z',
};
