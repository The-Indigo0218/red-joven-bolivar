# API_CONTRACTS.md — Contratos de la API

Endpoints principales de Red Joven Bolívar, con sus shapes en TypeScript.

**Convenciones**

- Base URL (dev): `http://localhost:3000`
- Formato: JSON. Tipado estricto, sin `any`.
- Validación de entrada con `class-validator` en cada DTO de escritura.
- Estos shapes son la **fuente de verdad compartida** entre front y back: los
  archivos mock del front (`mockOpportunities.ts`, `mockDemand.ts`) implementan
  exactamente estos tipos, de modo que el cambio de mock → API real no toca los
  componentes.

```typescript
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
```

---

## POST /young/profile

Crea el perfil del joven (genera la señal de demanda).

```typescript
// Request body
export interface CreateYoungProfileRequest {
  name: string;
  age: number;                  // @IsInt @Min(12) @Max(35)
  barrio: string;
  educationLevel: EducationLevel;
  seeking: SeekingType;
  availability: Availability[]; // @ArrayNotEmpty
  interests: InterestSlug[];    // @ArrayNotEmpty
}

// Response 201
export interface YoungProfileResponse {
  id: string;
  name: string;
  age: number;
  barrio: string;
  educationLevel: EducationLevel;
  seeking: SeekingType;
  availability: Availability[];
  interests: InterestSlug[];
  createdAt: string;            // ISO 8601
}
```

---

## GET /opportunities?type=&interest=&barrio=

Feed de oportunidades, filtrable. Todos los query params son opcionales.

```typescript
// Query params
export interface OpportunitiesQuery {
  type?: OpportunityKind;       // tab seleccionado
  interest?: InterestSlug;
  barrio?: string;
}

// Elemento del feed
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

// Response 200
export interface OpportunitiesResponse {
  items: Opportunity[];
  total: number;
}
```

---

## POST /opportunities/:id/interest

Registra el "Me interesa" del joven sobre una oportunidad. Crea un `match` y
alimenta la demanda.

```typescript
// Path param: id (uuid de la oportunidad)

// Request body
export interface ExpressInterestRequest {
  youngId: string;
}

// Response 201
export interface MatchResponse {
  id: string;
  youngId: string;
  opportunityId: string;
  status: MatchStatus;          // arranca en 'interesado'
  score: number;                // afinidad 0..1 (reglas hoy, IA mañana)
  slotsAvailable: number;       // cupos restantes tras la expresión de interés
  createdAt: string;
}
```

---

## GET /demand/dashboard

Vista agregada para instituciones. Alimenta las tres visualizaciones de
`DemandDashboard`.

```typescript
// Response 200
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
  youngCount: number;     // jóvenes que lo quieren
  slotsOffered: number;   // cupos disponibles
  gap: number;            // youngCount - slotsOffered
  headline: string;       // "200 jóvenes quieren estudiar sistemas — solo 30 cupos en el SENA"
}
```

---

## GET /demand/by-zone

Demanda agregada por zona geográfica (barrio). Para el mapa y para que
Alcaldía/Mi Sangre prioricen territorio.

```typescript
// Query params (opcionales)
export interface DemandByZoneQuery {
  interest?: InterestSlug;
}

// Response 200
export interface DemandByZoneResponse {
  items: ZoneDemand[];     // mismo shape que en el dashboard
  total: number;
}
```

---

## GET /demand/by-interest

Demanda agregada por categoría de interés. Para SENA y universidades.

```typescript
// Query params (opcionales)
export interface DemandByInterestQuery {
  barrio?: string;
}

// Response 200
export interface DemandByInterestResponse {
  items: InterestDemand[]; // mismo shape que en el dashboard
  total: number;
}
```

---

## POST /groups

Crea un grupo social por barrio y habilidad (Mi Sangre).

```typescript
// Request body
export interface CreateGroupRequest {
  name: string;
  barrio: string;
  interest: InterestSlug;
}

// Response 201
export interface GroupResponse {
  id: string;
  name: string;
  barrio: string;
  interest: InterestSlug;
  memberCount: number;     // arranca en 0
  createdAt: string;
}
```

---

## GET /groups?barrio=&interest=

Lista grupos, filtrable por barrio e interés.

```typescript
// Query params (opcionales)
export interface GroupsQuery {
  barrio?: string;
  interest?: InterestSlug;
}

// Response 200
export interface GroupsResponse {
  items: GroupResponse[];
  total: number;
}
```

---

# DIFERENCIADOR 1 — Motor de Rutas de Crecimiento

```typescript
// Habilidad del catálogo (ver entidad Skill en ENTITIES.md).
export interface Skill {
  id: string;
  slug: string;
  label: string;
  category: 'tecnica' | 'blanda' | 'digital';
}
```

## POST /young/cv

Sube el CV en texto y extrae habilidades con IA.

```typescript
// Request body
export interface UploadCvRequest {
  cvText: string;
}

// Response 200
export interface UploadCvResponse {
  skills: Skill[];
  confidence: number; // 0..1
}
// MCP_HOOK: CV_PARSING
```

## GET /opportunities/:id/route?youngId=

Genera el Plan de Ruta personal del joven hacia una oportunidad.

```typescript
// Path param: id (uuid de la oportunidad). Query param: youngId

export interface ClosingOpportunity {
  skill: Skill;
  opportunity: Opportunity;
  slotsAvailable: number;
}

// Response 200
export interface GrowthRouteResponse {
  opportunityId: string;
  youngId: string;
  affinityScore: number; // 0..100
  matchingSkills: Skill[];
  missingSkills: Skill[];
  closingOpportunities: ClosingOpportunity[];
  headline: string;
}
// MCP_HOOK: GAP_ANALYSIS + ROUTE_GENERATION
```

---

# DIFERENCIADOR 2 — Sistema CivicCoins

## GET /civiccoins/:youngId

Saldo e historial de CivicCoins del joven.

```typescript
export interface CivicCoinHistoryItem {
  id: string;
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  validatedBy?: string;
  createdAt: string;
}

// Response 200
export interface CivicCoinsBalanceResponse {
  youngId: string;
  balance: number;
  history: CivicCoinHistoryItem[];
}
```

## POST /civiccoins/earn

Acredita puntos por una actividad social validada.

```typescript
// Request body
export interface EarnCivicCoinsRequest {
  youngId: string;
  activityId: string;
  validatorId: string;
}

// Response 201
export interface EarnCivicCoinsResponse {
  transactionId: string;
  pointsEarned: number;
  newBalance: number;
  activity: string;
}
```

## GET /civiccoins/activities?youngId=

Lista de actividades sociales sugeridas por IA para ese joven.

```typescript
export interface SuggestedActivity {
  id: string;
  title: string;
  description: string;
  pointsReward: number;
  category: string;
  barrio: string;
  requiredSkills: Skill[];
  affinityScore: number; // 0..100
}

// Response 200
export interface SuggestedActivitiesResponse {
  items: SuggestedActivity[];
}
// MCP_HOOK: SOCIAL_MATCHING
```

## GET /redemptions/catalog

Catálogo de aliados donde canjear CivicCoins.

```typescript
export interface RedemptionCatalogItem {
  id: string;
  partner: string;
  description: string;
  pointsCost: number;
  category: 'insumos' | 'educacion' | 'universidad' | 'otro';
  discount?: number; // porcentaje
}

// Response 200
export interface RedemptionCatalogResponse {
  items: RedemptionCatalogItem[];
}
```

## POST /redemptions

Canjea puntos por un ítem del catálogo.

```typescript
// Request body
export interface CreateRedemptionRequest {
  youngId: string;
  catalogItemId: string;
}

// Response 201
export interface RedemptionResponse {
  redemptionId: string;
  partner: string;
  pointsSpent: number;
  newBalance: number;
  voucherCode: string;
}
```

---

## Notas de integración con IA

Los endpoints de matching y predicción de demanda son los puntos donde el back
delega en `AIModule`. El front **nunca** llama a la IA directamente.

- `score` en `MatchResponse` → `// MCP_HOOK: AI_MATCHING`
  (`matchJovenToOpportunity()`).
- Un futuro `GET /demand/forecast?barrio=&horizon=` →
  `// MCP_HOOK: DEMAND_PREDICTION` (`predictDemandByZone()`).
- La formación de grupos puede sugerirse con `suggestGroupFormation()` antes de
  un `POST /groups`.

**Diferenciador 1 — Motor de Rutas de Crecimiento**

- `POST /young/cv` → `// MCP_HOOK: CV_PARSING` (`extractSkillsFromCV()`).
- `GET /opportunities/:id/route` → `// MCP_HOOK: GAP_ANALYSIS` +
  `// MCP_HOOK: ROUTE_GENERATION` (`analyzeSkillGap()` + `generateGrowthRoute()`).

**Diferenciador 2 — CivicCoins**

- `GET /civiccoins/activities` → `// MCP_HOOK: SOCIAL_MATCHING`
  (`suggestSocialActivities()`).
