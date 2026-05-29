# Red Joven Bolívar

> Una red inteligente que conecta a los jóvenes de Cartagena y Bolívar con oportunidades reales de empleo, voluntariado y estudio, y convierte sus intereses en evidencia colectiva para que las instituciones abran los cupos que la juventud realmente necesita.

## El problema que resuelve

En Cartagena y el departamento de Bolívar hay miles de jóvenes con ganas de
crecer, pero desconectados de las oportunidades que ya existen. Y, al mismo
tiempo, instituciones como el **SENA**, las universidades, la **Alcaldía** y
las empresas locales toman decisiones de oferta **a ciegas**, sin saber qué
quieren estudiar, dónde viven ni qué habilidades buscan desarrollar esos
jóvenes.

**Red Joven Bolívar no es una bolsa de empleo.** Es una red de **demanda
ciudadana juvenil**: cada joven que declara sus intereses genera una señal, y
la suma de esas señales se convierte en evidencia geográfica y temática que le
dice a las instituciones *qué* ofrecer y *dónde*.

## Cómo funciona (en una frase por actor)

- **El joven** crea su perfil, declara intereses y disponibilidad, y ve un feed
  de oportunidades filtradas para él.
- **La institución** (Mi Sangre, SENA, Alcaldía, empresas, universidades) ve un
  dashboard de demanda agregada por barrio e interés y responde abriendo cupos.
- **Fundación Mi Sangre** usa los datos de habilidades y barrio para formar
  grupos sociales juveniles donde más se necesitan.

## Stack técnico

| Capa      | Tecnologías                                                                 |
|-----------|-----------------------------------------------------------------------------|
| Front     | React 18 · TypeScript · Vite · Tailwind CSS · Leaflet · React-Leaflet · Recharts |
| Back      | NestJS · TypeScript · TypeORM · PostgreSQL · class-validator                |
| Monorepo  | npm workspaces                                                              |
| IA        | Módulo `AIModule` desacoplado, con hooks `// MCP_HOOK` listos para integrar |

> **Regla de arquitectura clave:** el front nunca llama a la IA directamente.
> Toda inferencia pasa por el back a través del `AIModule`.

## Estructura del repositorio

```
red-joven-bolivar/
├── apps/
│   ├── front/        # React 18 + TS + Vite + Tailwind
│   └── back/         # NestJS + TS + TypeORM + PostgreSQL
├── docs/
│   ├── PLAN.md           # Plan de desarrollo completo
│   ├── ENTITIES.md       # Instituciones aliadas y sus roles
│   ├── API_CONTRACTS.md  # Endpoints + shapes en TypeScript
│   └── PITCH.md          # Pitch de 3 minutos
├── package.json      # Raíz del monorepo (npm workspaces)
└── README.md
```

## Cómo correr el proyecto

> Estado actual: estructura y planificación. Las apps aún no tienen
> dependencias instaladas ni código de aplicación.

Una vez inicializadas las apps, el flujo previsto será:

```bash
# 1. Instalar dependencias de todo el monorepo
npm install

# 2. Base de datos (PostgreSQL) — variables en apps/back/.env
#    DATABASE_URL=postgres://user:pass@localhost:5432/red_joven_bolivar

# 3. Levantar el back (NestJS) en modo desarrollo
npm run dev:back        # http://localhost:3000

# 4. Levantar el front (Vite) en modo desarrollo
npm run dev:front       # http://localhost:5173

# Build de producción
npm run build
```

Durante la demo del hackathon, el front funciona con datos simulados
(`apps/front/src/data/mockOpportunities.ts` y `mockDemand.ts`), por lo que las
tres pantallas MVP se pueden mostrar sin levantar el back.

## Documentación

- [`docs/PLAN.md`](docs/PLAN.md) — visión, pantallas MVP, módulos del back y modelo de datos.
- [`docs/ENTITIES.md`](docs/ENTITIES.md) — instituciones aliadas, qué consumen y qué aportan.
- [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md) — contratos de los endpoints principales.
- [`docs/PITCH.md`](docs/PITCH.md) — pitch de 3 minutos.

---

Desarrollado para el **Genius Fest 2026** · Fundación **Mi Sangre** · Cartagena, Bolívar.
