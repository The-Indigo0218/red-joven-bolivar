// Catálogo de barrios de Cartagena de Indias con coordenadas reales (lat/lng).
// Espejo de apps/front/src/data/mockBarrios.ts — fuente geográfica del mapa de
// demanda. La agregación de DemandModule resuelve las coordenadas de cada
// barrio contra este catálogo.

export interface BarrioCoords {
  name: string;
  lat: number;
  lng: number;
}

export const BARRIOS: readonly BarrioCoords[] = [
  { name: 'El Pozón', lat: 10.4083, lng: -75.4793 },
  { name: 'Olaya Herrera', lat: 10.4122, lng: -75.4981 },
  { name: 'Nelson Mandela', lat: 10.3872, lng: -75.4831 },
  { name: 'Manga', lat: 10.4131, lng: -75.5342 },
  { name: 'Bocagrande', lat: 10.3984, lng: -75.5566 },
  { name: 'Getsemaní', lat: 10.4211, lng: -75.5461 },
  { name: 'El Bosque', lat: 10.4041, lng: -75.5031 },
  { name: 'Chiquinquirá', lat: 10.4052, lng: -75.5102 },
  { name: 'Centro Histórico', lat: 10.4236, lng: -75.5511 },
  { name: 'Crespo', lat: 10.4442, lng: -75.5151 },
  { name: 'La Boquilla', lat: 10.4701, lng: -75.4991 },
  { name: 'Pie de la Popa', lat: 10.4182, lng: -75.5271 },
  { name: 'Torices', lat: 10.4301, lng: -75.5272 },
  { name: 'San Fernando', lat: 10.3881, lng: -75.4702 },
  { name: 'Blas de Lezo', lat: 10.3852, lng: -75.4872 },
] as const;

const BARRIO_INDEX: ReadonlyMap<string, BarrioCoords> = new Map(
  BARRIOS.map((b) => [b.name, b]),
);

// Devuelve las coordenadas de un barrio del catálogo. Si el barrio fue
// declarado por un joven pero no está en el catálogo (texto libre), cae a
// (0, 0) para no romper el mapa.
export function coordsForBarrio(name: string): { lat: number; lng: number } {
  const found = BARRIO_INDEX.get(name);
  return found ? { lat: found.lat, lng: found.lng } : { lat: 0, lng: 0 };
}
