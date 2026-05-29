# Red Joven Bolívar

> Una red inteligente que conecta a los jóvenes de Cartagena y Bolívar con oportunidades reales de empleo, voluntariado y estudio, les dice exactamente qué les falta para alcanzarlas, premia el conocimiento que comparten con la comunidad, y convierte sus intereses —y sus listas de espera— en evidencia colectiva para que las instituciones abran los cupos que la juventud realmente necesita.

## El problema que resuelve

En Cartagena y el departamento de Bolívar hay miles de jóvenes con ganas de
crecer, pero desconectados de las oportunidades que ya existen. Y, al mismo
tiempo, instituciones como el **SENA**, las universidades, la **Alcaldía** y
las empresas locales toman decisiones de oferta **a ciegas**, sin saber qué
quieren estudiar, dónde viven ni qué habilidades buscan desarrollar esos
jóvenes.

**Red Joven Bolívar no es una bolsa de empleo.** Es una red de **demanda
ciudadana juvenil**: cada joven que declara sus intereses —o que se anota en una
lista de espera cuando no hay cupos— genera una señal, y la suma de esas señales
se convierte en evidencia geográfica y temática que le dice a las instituciones
*qué* ofrecer y *dónde*.

## Los tres diferenciadores

### 1. Motor de Rutas de Crecimiento

No basta con decirle al joven que *no* clasifica para una oportunidad. La IA lee
su CV (texto plano o PDF), detecta exactamente **qué habilidades le faltan** y lo
conecta con el **curso gratis del SENA o el taller de Mi Sangre, en su barrio**,
que cierra esa brecha. Si el curso está lleno, lo invita a la lista de espera.

### 2. CivicCoins — economía circular del conocimiento

El joven **gana puntos** enseñando lo que sabe, haciendo voluntariado o aportando
en su comunidad (cada actividad la **valida** un coordinador, anti-fraude). Esos
puntos se **canjean** por insumos escolares, cursos del SENA o descuentos en
plataformas y universidades aliadas. La IA le **sugiere dónde aportar** según su
barrio y habilidades. El conocimiento circula: el que aprende, enseña; el que
enseña, se forma.

### 3. Lista de espera = demanda accionable

Cuando un joven quiere un cupo y no lo hay, ese "no" **no se pierde**: entra en
una lista de espera. El SENA y las instituciones ven en un dashboard *"47 jóvenes
en El Pozón esperan un cupo de tecnología"* — una orden de compra para abrir el
próximo curso donde de verdad hace falta.

## Cómo funciona (en una frase por actor)

- **El joven** crea su perfil, sube su CV, ve oportunidades filtradas por afinidad
  y modalidad, recibe su ruta de crecimiento y gana/canjea CivicCoins.
- **La institución** (SENA, Alcaldía, empresas, universidades) ve un dashboard de
  demanda agregada por barrio e interés, con la lista de espera real, y responde
  abriendo cupos.
- **Fundación Mi Sangre** usa los datos de habilidades y barrio para formar
  grupos sociales juveniles donde más se necesitan.

## Stack técnico

| Capa      | Tecnologías                                                                 |
|-----------|-----------------------------------------------------------------------------|
| Front     | React 18 · TypeScript · Vite · Tailwind CSS · Leaflet · React-Leaflet · Recharts · pdfjs-dist |
| Back      | NestJS 11 · TypeScript · TypeORM · PostgreSQL · class-validator             |
| Monorepo  | npm workspaces                                                              |
| IA        | `AIModule` con **Google Gemini** detrás de hooks `// MCP_HOOK`, con **fallback heurístico** por reglas |
| Infra     | Docker Compose (PostgreSQL)                                                  |

> **Reglas de arquitectura clave:**
> 1. El front nunca llama a la IA directamente — toda inferencia pasa por el back.
> 2. Si la IA (Gemini) falla o no hay key, cada hook cae a una heurística
>    determinista: **la plataforma nunca se rompe por la IA.**

### Dónde actúa la IA (hooks `MCP_HOOK`)

| Hook | Qué hace |
|------|----------|
| `AI_MATCHING` | Ordena el feed de oportunidades por afinidad con el joven. |
| `CV_PARSING` | Extrae habilidades del CV en texto. |
| `GAP_ANALYSIS` | Calcula qué habilidades le faltan para una oportunidad. |
| `ROUTE_GENERATION` | Redacta el titular de la ruta de crecimiento. |
| `SOCIAL_MATCHING` | Sugiere actividades de CivicCoins por afinidad. |
| `DEMAND_PREDICTION` | Proyecta la demanda futura por zona. |

## Estructura del repositorio

```
red-joven-bolivar/
├── apps/
│   ├── front/        # React 18 + TS + Vite + Tailwind
│   └── back/         # NestJS + TS + TypeORM + PostgreSQL
├── docs/
│   ├── PLAN.md           # Plan de desarrollo y diferenciadores
│   ├── ENTITIES.md       # Instituciones aliadas y sus roles
│   ├── API_CONTRACTS.md  # Endpoints + shapes en TypeScript
│   ├── PITCH.md          # Pitch de 3 minutos
│   └── TESTING.md        # Prueba de humo del flujo completo
├── docker-compose.yml    # PostgreSQL local (puerto 5433)
├── package.json          # Raíz del monorepo (npm workspaces)
└── README.md
```

## Cómo correr el proyecto

```bash
# 1. Instalar dependencias de todo el monorepo
npm install

# 2. Levantar PostgreSQL (Docker). Expone el puerto 5433 (5432 suele estar ocupado).
docker compose up -d

# 3. Configurar el back: copiar el ejemplo de variables de entorno
cp apps/back/.env.example apps/back/.env
#    (opcional) pegar tu GEMINI_API_KEY de https://aistudio.google.com/apikey
#    Si lo dejás vacío, el back funciona igual con la heurística por reglas.

# 4. Poblar la base con datos de demo (oportunidades, jóvenes, habilidades, etc.)
npm run seed --workspace=apps/back

# 5. Levantar el backend (NestJS) → http://localhost:3000
npm run back

# 6. Levantar el frontend (Vite) en otra terminal → http://localhost:5173
npm run front
```

Para que el front consuma el back real (en vez de los datos mock), configurá en
`apps/front`:

```
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3000
```

> Para una demo sin backend, dejá `VITE_USE_MOCK=true`: las pantallas funcionan
> con datos simulados.

### Pruebas

```bash
# Tests unitarios del back
npm test --workspace=apps/back
```

La prueba de humo end-to-end (CV → ruta → lista de espera → dashboard) está en
[`docs/TESTING.md`](docs/TESTING.md).

## Documentación

- [`docs/PLAN.md`](docs/PLAN.md) — visión, pantallas, módulos del back, modelo de datos y diferenciadores.
- [`docs/ENTITIES.md`](docs/ENTITIES.md) — instituciones aliadas, qué consumen y qué aportan.
- [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md) — contratos de los endpoints.
- [`docs/PITCH.md`](docs/PITCH.md) — pitch de 3 minutos.
- [`docs/TESTING.md`](docs/TESTING.md) — prueba de humo del flujo completo.

---

Desarrollado para el **Genius Fest 2026** · Fundación **Mi Sangre** · Cartagena, Bolívar.
