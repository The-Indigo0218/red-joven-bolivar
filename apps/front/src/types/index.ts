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

export type OpportunityModality = 'presencial' | 'virtual' | 'hibrido';

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
  modalidad?: OpportunityModality;
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
  modalidad: OpportunityModality;
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

export type InterestStatus = 'interesado' | 'en-espera';

export interface InterestResult {
  status: InterestStatus;
  waitlisted: boolean;
  youngId: string;
  opportunityId: string;
  score: number;
  slotsAvailable: number;
  matchId?: string;
  waitlistId?: string;
  waitlistPosition?: number;
  createdAt: string;
}

export interface WaitlistItem {
  id: string;
  youngId: string;
  youngName: string;
  position: number;
  createdAt: string;
}

export interface WaitlistResponse {
  opportunityId: string;
  items: WaitlistItem[];
  total: number;
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
  waitlistCount: number; // jóvenes en lista de espera
  headline: string;
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

// ───────────────────────── Skills / Growth Route / CV ─────────────────────────

export type SkillCategory = 'tecnica' | 'blanda' | 'digital';

export interface Skill {
  id: string;
  slug: string;
  label: string;
  category: SkillCategory;
}

export interface ClosingOpportunity {
  skill: Skill;
  opportunity: Opportunity;
  slotsAvailable: number;
  isFull: boolean;
}

export interface GrowthRouteResponse {
  opportunityId: string;
  youngId: string;
  affinityScore: number;
  matchingSkills: Skill[];
  missingSkills: Skill[];
  closingOpportunities: ClosingOpportunity[];
  headline: string;
}

export interface UploadCvRequest {
  cvText: string;
  youngId?: string;
}

export interface UploadCvResponse {
  skills: Skill[];
  confidence: number;
}

// ───────────────────────── CivicCoins ─────────────────────────

export interface CivicCoinHistoryItem {
  id: string;
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  validatedBy?: string;
  createdAt: string;
}

export interface CivicCoinsBalanceResponse {
  youngId: string;
  balance: number;
  history: CivicCoinHistoryItem[];
}

export interface EarnCivicCoinsRequest {
  youngId: string;
  activityId: string;
  validatorId: string;
}

export interface EarnCivicCoinsResponse {
  transactionId: string;
  pointsEarned: number;
  newBalance: number;
  activity: string;
}

export interface SuggestedActivity {
  id: string;
  title: string;
  description: string;
  pointsReward: number;
  category: string;
  barrio: string;
  requiredSkills: Skill[];
  affinityScore: number;
}

export interface SuggestedActivitiesResponse {
  items: SuggestedActivity[];
}

// ───────────────────────── Redemptions ─────────────────────────

export type RedemptionCategory = 'insumos' | 'educacion' | 'universidad' | 'otro';

export interface RedemptionCatalogItem {
  id: string;
  partner: string;
  description: string;
  pointsCost: number;
  category: RedemptionCategory;
  discount: number | null;
}

export interface RedemptionCatalogResponse {
  items: RedemptionCatalogItem[];
}

export interface CreateRedemptionRequest {
  youngId: string;
  catalogItemId: string;
}

export interface RedemptionResponse {
  redemptionId: string;
  partner: string;
  pointsSpent: number;
  newBalance: number;
  voucherCode: string;
}
