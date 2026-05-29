// Tipos compartidos de Red Joven Bolívar.
// Copiados exactamente desde docs/API_CONTRACTS.md — fuente de verdad entre front y back.

// ───────────────────────── Tipos base compartidos ─────────────────────────

export type InterestSlug =
  | 'tecnologia'
  | 'arte'
  | 'deporte'
  | 'emprendimiento'
  | 'medio-ambiente'
  | 'liderazgo';

export type OpportunityKind = 'empleo' | 'voluntariado' | 'estudio';

export type SeekingType = OpportunityKind | 'todos';

export type EducationLevel =
  | 'primaria'
  | 'bachillerato-en-curso'
  | 'bachiller'
  | 'tecnico'
  | 'tecnologo'
  | 'universitario'
  | 'ninguno';

export type Availability =
  | 'manana'
  | 'tarde'
  | 'noche'
  | 'fines-de-semana'
  | 'tiempo-completo';

export type MatchStatus = 'interesado' | 'contactado' | 'vinculado';

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

// ───────────────────────── POST /young/profile ─────────────────────────

export interface CreateYoungProfileRequest {
  name: string;
  age: number; // @IsInt @Min(12) @Max(35)
  barrio: string;
  educationLevel: EducationLevel;
  seeking: SeekingType;
  availability: Availability[]; // @ArrayNotEmpty
  interests: InterestSlug[]; // @ArrayNotEmpty
}

export interface YoungProfileResponse {
  id: string;
  name: string;
  age: number;
  barrio: string;
  educationLevel: EducationLevel;
  seeking: SeekingType;
  availability: Availability[];
  interests: InterestSlug[];
  createdAt: string; // ISO 8601
}

// ───────────────────────── GET /opportunities ─────────────────────────

export interface OpportunitiesQuery {
  type?: OpportunityKind; // tab seleccionado
  interest?: InterestSlug;
  barrio?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  kind: OpportunityKind;
  requirements: string[];
  slotsTotal: number;
  slotsAvailable: number;
  barrio: string;
  interests: InterestSlug[];
}

export interface OpportunitiesResponse {
  items: Opportunity[];
  total: number;
}

// ───────────────────────── POST /opportunities/:id/interest ─────────────────────────

export interface ExpressInterestRequest {
  youngId: string;
}

export interface MatchResponse {
  id: string;
  youngId: string;
  opportunityId: string;
  status: MatchStatus; // arranca en 'interesado'
  score: number; // afinidad 0..1 (reglas hoy, IA mañana)
  slotsAvailable: number; // cupos restantes tras la expresión de interés
  createdAt: string;
}

// ───────────────────────── GET /demand/dashboard ─────────────────────────

export interface DemandDashboardResponse {
  // Para el mapa Leaflet: concentración por barrio
  byZone: ZoneDemand[];
  // Para el gráfico de barras Recharts: top intereses
  topInterests: InterestDemand[];
  // Para el contador estrella (brecha demanda/oferta)
  gaps: DemandGap[];
  generatedAt: string;
}

export interface ZoneDemand {
  barrio: string;
  lat: number;
  lng: number;
  youngCount: number;
}

export interface InterestDemand {
  interest: InterestSlug;
  label: string;
  youngCount: number;
}

export interface DemandGap {
  interest: InterestSlug;
  barrio: string;
  youngCount: number; // jóvenes que lo quieren
  slotsOffered: number; // cupos disponibles
  gap: number; // youngCount - slotsOffered
  headline: string; // "200 jóvenes quieren estudiar sistemas — solo 30 cupos en el SENA"
}

// ───────────────────────── GET /demand/by-zone ─────────────────────────

export interface DemandByZoneQuery {
  interest?: InterestSlug;
}

export interface DemandByZoneResponse {
  items: ZoneDemand[]; // mismo shape que en el dashboard
  total: number;
}

// ───────────────────────── GET /demand/by-interest ─────────────────────────

export interface DemandByInterestQuery {
  barrio?: string;
}

export interface DemandByInterestResponse {
  items: InterestDemand[]; // mismo shape que en el dashboard
  total: number;
}

// ───────────────────────── POST /groups ─────────────────────────

export interface CreateGroupRequest {
  name: string;
  barrio: string;
  interest: InterestSlug;
}

export interface GroupResponse {
  id: string;
  name: string;
  barrio: string;
  interest: InterestSlug;
  memberCount: number; // arranca en 0
  createdAt: string;
}

// ───────────────────────── GET /groups ─────────────────────────

export interface GroupsQuery {
  barrio?: string;
  interest?: InterestSlug;
}

export interface GroupsResponse {
  items: GroupResponse[];
  total: number;
}
