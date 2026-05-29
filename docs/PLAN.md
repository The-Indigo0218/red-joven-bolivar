# PLAN.md — Plan de desarrollo de Red Joven Bolívar

## Visión

```
Joven crea perfil → declara intereses → ve oportunidades filtradas
        │
        ▼
Data agregada → instituciones ven demanda real → abren nuevos cupos
        │
        ▼
Mi Sangre conecta grupos sociales por barrio según habilidades
```

El valor no está solo en conectar a un joven con una oportunidad. Está en que
**cada declaración de interés es un voto de demanda**. Mil jóvenes declarando
"quiero estudiar sistemas en el barrio El Pozón" no es ruido: es una orden de
compra que el SENA, la Alcaldía y las universidades pueden leer y atender.

El sistema tiene, por tanto, **dos caras**:

1. **Cara joven** → experiencia de descubrimiento y conexión (pantallas 1 y 2).
2. **Cara institución** → inteligencia de demanda agregada (pantalla 3, el
   diferenciador).

---

## FRONT — 3 pantallas MVP

> Stack: React 18 + TypeScript (estricto, sin `any`) + Vite + Tailwind +
> Leaflet/React-Leaflet + Recharts. Datos simulados en archivos mock separados,
> diseñados para reemplazarse por llamadas reales al back sin tocar los componentes.

### 1. OnboardingProfile

Captura del perfil del joven. Es el punto donde se genera la señal de demanda.

**Campos:**
- **Nombre**
- **Edad**
- **Barrio de Cartagena** (selector con catálogo de barrios)
- **Intereses múltiples** (selección múltiple): `tecnología`, `arte`,
  `deporte`, `emprendimiento`, `medio ambiente`, `liderazgo`
- **Nivel educativo actual** (primaria, bachillerato en curso, bachiller,
  técnico, tecnólogo, universitario, ninguno)
- **Qué busca**: `empleo` / `voluntariado` / `estudio` / `los tres`
- **Disponibilidad horaria** (mañana, tarde, noche, fines de semana, tiempo completo)

**Salida:** un objeto `YoungProfile` que se envía a `POST /young/profile`.
En modo demo se guarda en estado local / `localStorage`.

### 2. OpportunitiesFeed

Feed de oportunidades filtrado según el perfil declarado.

- **Tres tabs:** `Empleos` | `Voluntariados` | `Estudios`
- **Cards** con: nombre de la oportunidad, organización, requisitos,
  cupos disponibles y botón **"Me interesa"**.
- El filtrado combina: tipo (tab), intereses del joven y barrio.
- Al pulsar "Me interesa" se dispara `POST /opportunities/:id/interest`
  (en demo, decrementa cupos en estado local y registra la señal de demanda).
- **Datos simulados:** `front/src/data/mockOpportunities.ts`

### 3. DemandDashboard ← el diferenciador

Pantalla orientada a **instituciones** (Mi Sangre, SENA, Alcaldía, empresas,
universidades). Visualiza la demanda agregada.

- **Mapa de Cartagena (Leaflet + React-Leaflet):** concentración de jóvenes por
  barrio mediante marcadores/círculos proporcionales o capa de calor.
- **Gráfico de barras (Recharts):** top de intereses declarados.
- **Contador de brecha (gap):**
  > "X jóvenes quieren estudiar sistemas en Cartagena — solo Y cupos
  > disponibles en el SENA"

  Es la métrica estrella: demanda declarada vs. oferta existente.
- **Datos simulados:** `front/src/data/mockDemand.ts`

---

## BACK — Módulos NestJS

> Stack: NestJS + TypeScript + TypeORM + PostgreSQL + class-validator.
> Tipado estricto, sin `any`. Validación de DTOs con class-validator en cada
> endpoint de escritura.

| Módulo                | Responsabilidad |
|-----------------------|-----------------|
| **YoungModule**       | Perfil del joven, intereses declarados, disponibilidad. CRUD de `young_profiles` y sus relaciones con `interests`. |
| **OpportunitiesModule** | CRUD de oportunidades (empleos, voluntariados, cursos). Filtrado por tipo, interés y barrio. Gestión de cupos. |
| **MatchingModule**    | Lógica de conexión perfil ↔ oportunidad. Hoy: reglas (intereses + barrio + disponibilidad). Preparado para delegar en `AIModule`. |
| **DemandModule**      | **Núcleo de valor.** Agregación de intereses por zona geográfica y categoría. Genera `demand_snapshots`. Calcula brechas demanda/oferta. |
| **GroupsModule**      | Grupos sociales por barrio y habilidad, vinculados a Mi Sangre. CRUD de `groups` y `group_members`. |
| **AIModule**          | Módulo desacoplado con interfaces (ver abajo). El front nunca lo llama directo. |

### AIModule — interfaces (vacío, listo para integrar)

```typescript
export interface AIService {
  // MCP_HOOK: AI_MATCHING
  matchJovenToOpportunity(
    profileId: string,
    opportunityIds: string[],
  ): Promise<MatchResult[]>;

  // MCP_HOOK: DEMAND_PREDICTION
  predictDemandByZone(
    barrio: string,
    horizonMonths: number,
  ): Promise<DemandForecast[]>;

  suggestGroupFormation(
    barrio: string,
    interest: string,
  ): Promise<GroupSuggestion[]>;
}
```

Las funciones `matchJovenToOpportunity()`, `predictDemandByZone()` y
`suggestGroupFormation()` quedan declaradas con implementación pendiente
(stub que lanza `NotImplementedException` o retorna heurística básica), y los
puntos de integración marcados con `// MCP_HOOK: [nombre]`.

### Por qué DemandModule es el núcleo

- Es lo que diferencia a la plataforma de una bolsa de empleo.
- Debe **escalar**: la agregación se materializa en `demand_snapshots`
  (datos pre-calculados por zona + categoría + fecha), no se computa en vivo
  sobre toda la tabla de intereses en cada request.
- Está diseñado para que `predictDemandByZone()` (IA) consuma series de
  snapshots y proyecte demanda futura.

---

## BASE DE DATOS

| Tabla               | Propósito |
|---------------------|-----------|
| `young_profiles`    | Perfil del joven: nombre, edad, barrio, nivel educativo, qué busca, disponibilidad. |
| `interests`         | Catálogo de intereses (tecnología, arte, deporte, emprendimiento, medio ambiente, liderazgo). |
| `young_interests`   | (Relación N:M) intereses declarados por cada joven. |
| `opportunities`     | Oportunidades publicadas: nombre, organización, requisitos, cupos, barrio, tipo. |
| `opportunity_types` | Catálogo: empleo / voluntariado / estudio. |
| `matches`           | Vínculo joven ↔ oportunidad (señal "Me interesa" + estado del match). |
| `groups`            | Grupos sociales por barrio y habilidad (Mi Sangre). |
| `group_members`     | (Relación) miembros de cada grupo. |
| `demand_snapshots`  | **Datos agregados** por zona (barrio) + categoría/interés + fecha. Núcleo de DemandModule. |

> El detalle de columnas y relaciones está en
> [`ENTITIES.md`](ENTITIES.md) (entidades de negocio) y en
> [`API_CONTRACTS.md`](API_CONTRACTS.md) (shapes que viajan por la API).

---

## Roadmap de implementación (hackathon)

1. **Fase 0 — Estructura y docs** *(actual)*: monorepo + planificación.
2. **Fase 1 — Front demo**: 3 pantallas con datos mock. Es lo que se presenta.
3. **Fase 2 — Back base**: módulos, entidades TypeORM, endpoints del contrato.
4. **Fase 3 — Conexión real**: el front cambia los imports de mocks por el
   cliente de API; los shapes ya coinciden por diseño.
5. **Fase 4 — IA**: implementar `AIModule` detrás de los `// MCP_HOOK`.
