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

### Checklist de tareas del FRONT

Estado al momento de armar el punto de partida. Lo marcado `[x]` ya funciona;
lo marcado `[ ]` es lo que queda por construir.

**Ya hecho (base lista)**
- [x] Scaffold Vite + React 18 + TS + Tailwind v3 + variables CSS + fuentes.
- [x] Estructura de carpetas (`components/`, `data/`, `types/`).
- [x] Tipos compartidos en `types/index.ts` (calcan con `API_CONTRACTS.md`).
- [x] Mocks: `mockOpportunities.ts`, `mockDemand.ts`, `mockBarrios.ts`.
- [x] `App.tsx` + `Navbar`: navegación local entre las 3 vistas.
- [x] **DemandDashboard completo** (el diferenciador): `DemandMap` (Leaflet),
      `DemandChart` (Recharts) y `GapCounter`, alimentados por `mockDemand`.
- [x] `OpportunitiesFeed`: tabs Empleos/Voluntariados/Estudios + render de
      `OpportunityCard` filtrando por tipo (tab).

**Pendiente (lo que sigue)**
- [ ] **OnboardingProfile — formulario real.** Hoy es un esqueleto. Construir
      todos los campos (nombre, edad, barrio desde `mockBarrios`, intereses
      múltiples, nivel educativo, qué busca, disponibilidad) y armar el objeto
      `CreateYoungProfileRequest`.
- [ ] **Compartir el perfil entre pantallas.** Subir el `YoungProfile` a `App`
      (o un Context) para que el feed pueda usarlo. Persistir en `localStorage`
      en modo demo.
- [ ] **Filtrado del feed por perfil.** `OpportunitiesFeed` hoy filtra solo por
      tab; falta combinar también `interests` y `barrio` del joven.
- [ ] **Acción "Me interesa".** Cablear el prop `onInterest` de
      `OpportunityCard`: en demo, decrementar cupos en estado local y registrar
      la señal de demanda.
- [ ] **Capa de API real (Fase 3).** Reemplazar los imports de `mock*` por un
      cliente que llame al back. Los tipos ya calzan, así que no se tocan los
      componentes.
- [ ] **Pulido UX.** Estados vacíos, loading, responsive y validación visual
      del formulario.

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
| `skills`            | Catálogo de habilidades (técnica/blanda/digital). *(Diferenciador 1)* |
| `young_skills`      | Habilidades de cada joven (origen CV o declarado + nivel). *(Diferenciador 1)* |
| `opportunity_skills`| Habilidades requeridas por cada oportunidad (obligatoria o no). *(Diferenciador 1)* |
| `growth_routes`     | Plan de Ruta personal: afinidad, habilidades faltantes y oportunidades de cierre. *(Diferenciador 1)* |
| `social_activities` | Catálogo de actividades sociales que otorgan CivicCoins. *(Diferenciador 2)* |
| `civiccoins_transactions` | Registro inmutable de puntos ganados/canjeados. *(Diferenciador 2)* |
| `redemption_catalog`| Aliados y descuentos donde canjear CivicCoins. *(Diferenciador 2)* |
| `redemptions`       | Canjes realizados por jóvenes (voucher + puntos gastados). *(Diferenciador 2)* |

> El detalle de columnas y relaciones está en
> [`ENTITIES.md`](ENTITIES.md) (entidades de negocio) y en
> [`API_CONTRACTS.md`](API_CONTRACTS.md) (shapes que viajan por la API).

---

## DIFERENCIADOR 1 — Motor de Rutas de Crecimiento

> "La IA no solo filtra oportunidades según el CV del joven — le dice
> exactamente qué le falta para conseguir ese empleo y lo conecta con el curso
> del SENA o taller de Mi Sangre que cierra esa brecha. En Cartagena. Gratis."

No basta con decirle al joven que *no* clasifica. El motor le dice **qué hacer
para clasificar** y lo conecta con quién se lo enseña, gratis y en su barrio.

### Flujo

1. El joven sube su CV o llena su perfil de habilidades.
2. La IA analiza sus habilidades actuales (extracción de CV).
3. El joven selecciona una oportunidad que le interesa.
4. La IA compara su perfil vs. los requisitos de la oportunidad.
5. La IA genera un **Plan de Ruta** personalizado:
   - "Para este empleo te falta inglés técnico y Excel avanzado"
   - "El SENA tiene inglés técnico en El Pozón con 12 cupos"
   - "¿Te conecto?"

### Tres capas

- **Capa 1 — Matching inteligente:** CV vs. oportunidad, con un score de afinidad.
- **Capa 2 — Gap Analysis personal:** las habilidades que faltan exactamente.
- **Capa 3 — Ruta de cierre:** el curso/taller disponible en Cartagena que da
  esa habilidad (SENA y Mi Sangre).

### Cambios en el perfil del joven

El perfil incorpora dos dimensiones nuevas de habilidades:

- **Habilidades actuales** — extraídas del CV o declaradas manualmente.
- **Habilidades objetivo** — inferidas de las oportunidades marcadas como
  "Me interesa".

### Nueva pantalla — Pantalla 4: RutaPersonal *(solo documentación)*

- **Score de afinidad** del joven con la oportunidad (0–100%).
- Lista de habilidades que **tiene** ✓.
- Lista de habilidades que le **faltan** ✗.
- Para cada habilidad faltante: la **oportunidad concreta** (curso SENA, taller
  Mi Sangre) que la desarrolla.
- Botón **"Iniciar mi ruta"** que registra el match y conecta con las
  oportunidades de cierre.

### Nuevos módulos en el BACK

| Módulo            | Responsabilidad |
|-------------------|-----------------|
| **SkillsModule**  | Catálogo de habilidades, extracción de CV y habilidades por joven. |
| **RouteModule**   | Genera el Plan de Ruta personal combinando gap analysis + oferta disponible. |

### AIModule — nuevas interfaces

```typescript
// MCP_HOOK: CV_PARSING
extractSkillsFromCV(cvText: string): Promise<Skill[]>;

// MCP_HOOK: GAP_ANALYSIS
analyzeSkillGap(
  youngSkills: Skill[],
  opportunityRequirements: Skill[],
): Promise<GapAnalysisResult>;

// MCP_HOOK: ROUTE_GENERATION
generateGrowthRoute(
  gap: GapAnalysisResult,
  availableOpportunities: Opportunity[],
): Promise<GrowthRoute>;
```

---

## DIFERENCIADOR 2 — Sistema de Puntos por Impacto Social (CivicCoins)

> "Tus habilidades tienen valor. Enseñás lo que sabés, ganás puntos, y esos
> puntos te pagan la próxima clase. El conocimiento circula, la comunidad crece
> y nadie se queda atrás por no tener plata."

### Cómo gana CivicCoins el joven

- Enseñando una habilidad a otro joven.
- Participando en una obra de carácter social.
- Completando un voluntariado verificado.
- Aportando sus habilidades en un grupo comunitario.
- La IA filtra y sugiere **dónde puede aportar** según su perfil.

### Dónde se canjean

Los puntos son canjeables en aliados de Red Joven Bolívar:

- Insumos escolares (cuadernos, útiles).
- Descuentos en Platzi u otras plataformas de educación online.
- Descuentos en universidades aliadas.
- Descuentos en entidades privadas aliadas.
- Cursos y talleres del SENA y Mi Sangre.

### Verificación de la obra social (anti-fraude)

- El líder del grupo o coordinador de Mi Sangre **confirma** la actividad
  realizada.
- Se requiere **mínimo 1 validador** para acreditar los puntos.
- Las actividades tienen **puntos predefinidos** según su impacto.

### El ciclo completo

```
Joven declara intereses
        ↓
Consigue oportunidad con ayuda de la IA
        ↓
Aporta sus habilidades a la comunidad
        ↓
Gana CivicCoins canjeables en formación
        ↓
Se forma → tiene más habilidades
        ↓
Consigue mejores oportunidades
        ↓
Vuelve a aportar más a la comunidad
```

### Nueva pantalla — Pantalla 5: CivicCoins *(solo documentación)*

- **Saldo actual** de CivicCoins del joven.
- **Historial de puntos ganados** (actividad, fecha, puntos).
- **Historial de canjes** (aliado, descuento, fecha).
- **Actividades sociales disponibles** sugeridas por la IA según el perfil.
- **Catálogo de aliados** donde canjear puntos.

### Nuevos módulos en el BACK

| Módulo                   | Responsabilidad |
|--------------------------|-----------------|
| **CivicCoinsModule**     | Saldo, historial, acreditación y validación de actividades sociales. |
| **RedemptionModule**     | Catálogo de aliados, canjes y descuentos disponibles. |
| **SocialActivityModule** | Catálogo de actividades sociales, verificación por validador y asignación de puntos. |

### AIModule — nuevas interfaces

```typescript
// MCP_HOOK: SOCIAL_MATCHING
suggestSocialActivities(
  youngProfile: YoungProfile,
  availableActivities: SocialActivity[],
): Promise<ActivitySuggestion[]>;
```

---

## Roadmap de implementación (hackathon)

1. **Fase 0 — Estructura y docs** *(actual)*: monorepo + planificación.
2. **Fase 1 — Front demo**: 3 pantallas con datos mock. Es lo que se presenta.
3. **Fase 2 — Back base**: módulos, entidades TypeORM, endpoints del contrato.
4. **Fase 3 — Conexión real**: el front cambia los imports de mocks por el
   cliente de API; los shapes ya coinciden por diseño.
5. **Fase 4 — IA**: implementar `AIModule` detrás de los `// MCP_HOOK`.
6. **Fase 5 — Diferenciadores**: Motor de Rutas de Crecimiento (SkillsModule +
   RouteModule, pantalla RutaPersonal) y CivicCoins (CivicCoinsModule +
   RedemptionModule + SocialActivityModule, pantalla CivicCoins).
