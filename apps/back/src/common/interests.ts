import type { InterestSlug } from '../young/young.entity';

// Etiquetas legibles de cada interés del catálogo, para los gráficos del
// DemandDashboard (Recharts) y los titulares de brecha.
export const INTEREST_LABELS: Record<InterestSlug, string> = {
  tecnologia: 'Tecnología',
  arte: 'Arte',
  deporte: 'Deporte',
  emprendimiento: 'Emprendimiento',
  'medio-ambiente': 'Medio ambiente',
  liderazgo: 'Liderazgo',
};

export function labelForInterest(slug: InterestSlug): string {
  return INTEREST_LABELS[slug] ?? slug;
}

// Slugs válidos del catálogo, para validar DTOs de escritura con class-validator.
export const INTEREST_SLUGS = Object.keys(INTEREST_LABELS) as InterestSlug[];
