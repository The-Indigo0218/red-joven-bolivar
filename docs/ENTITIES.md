# ENTITIES.md — Instituciones aliadas y sus roles

Este documento mapea a los **actores institucionales** de Red Joven Bolívar:
qué hace cada uno en la plataforma, qué datos **consume** y qué datos **aporta**.
La reciprocidad de datos es el motor del sistema: las instituciones aportan
oferta y consumen señales de demanda; los jóvenes aportan demanda y consumen
oferta.

---

## Tabla resumen

| Entidad              | Rol principal                         | Consume                                   | Aporta                                |
|----------------------|---------------------------------------|-------------------------------------------|---------------------------------------|
| Fundación Mi Sangre  | Voluntariados + formación de grupos   | Demanda por barrio, habilidades juveniles | Voluntariados, grupos sociales        |
| SENA Cartagena       | Oferta de cursos                      | Demanda formativa por interés/zona        | Cursos, cupos disponibles             |
| Alcaldía de Cartagena| Política pública / observador         | Dashboard de demanda completo             | Validación territorial, catálogo barrios |
| Empresas locales     | Oferta de empleo                      | Perfiles e intereses laborales            | Empleos, requisitos, vacantes         |
| Universidades        | Oferta académica                      | Señales de demanda estudiantil            | Programas, cupos, becas               |

---

## Fundación Mi Sangre

- **Nombre oficial:** Fundación Mi Sangre.
- **Rol en la plataforma:** dueña del propósito social. **Crea voluntariados** y
  **forma grupos sociales** juveniles por barrio según habilidades detectadas.
  Es la entidad que cierra el ciclo, llevando la conexión digital al territorio.
- **Qué datos consume:**
  - Concentración de jóvenes por barrio (`demand_snapshots`).
  - Habilidades e intereses agregados por zona.
  - Sugerencias de formación de grupos (`suggestGroupFormation()` del AIModule).
- **Qué datos aporta:**
  - Oportunidades de tipo `voluntariado`.
  - Grupos sociales (`groups`) y su membresía (`group_members`).

## SENA Cartagena

- **Nombre oficial:** Servicio Nacional de Aprendizaje — Regional Bolívar
  (sede Cartagena).
- **Rol en la plataforma:** principal oferente de **formación técnica y
  tecnológica**. Publica cursos y **recibe la evidencia de demanda** para
  decidir qué programas abrir y dónde.
- **Qué datos consume:**
  - Demanda formativa por interés (`/demand/by-interest`).
  - Brecha demanda/cupos (el contador estrella del dashboard).
  - Distribución geográfica de la demanda (`/demand/by-zone`).
- **Qué datos aporta:**
  - Oportunidades de tipo `estudio` (cursos), con cupos y requisitos.

## Alcaldía de Cartagena

- **Nombre oficial:** Alcaldía Mayor de Cartagena de Indias.
- **Rol en la plataforma:** **observador de política pública**. Accede al
  dashboard de demanda para orientar inversión social, infraestructura y
  programas de juventud en los barrios que más lo necesitan.
- **Qué datos consume:**
  - Dashboard de demanda completo (`/demand/dashboard`).
  - Brechas demanda/oferta por barrio.
- **Qué datos aporta:**
  - Validación territorial y catálogo oficial de barrios/localidades.
  - Eventualmente, programas y oportunidades de origen distrital.

## Empresas locales

- **Nombre oficial:** sector privado de Cartagena y Bolívar (turismo, logística
  portuaria, comercio, industria, tecnología).
- **Rol en la plataforma:** **publican empleos** y vacantes de primer empleo
  juvenil.
- **Qué datos consume:**
  - Perfiles e intereses laborales de jóvenes (de forma agregada/anonimizada).
  - Disponibilidad horaria y nivel educativo por zona.
- **Qué datos aporta:**
  - Oportunidades de tipo `empleo`, con requisitos y número de vacantes.

## Universidades

- **Nombre oficial:** instituciones de educación superior de Bolívar
  (p. ej. Universidad de Cartagena, Tecnológico Comfenalco, entre otras).
- **Rol en la plataforma:** reciben **señales de demanda estudiantil** y
  publican su oferta académica.
- **Qué datos consume:**
  - Demanda por interés y nivel educativo (`/demand/by-interest`).
  - Distribución geográfica de aspirantes potenciales.
- **Qué datos aporta:**
  - Oportunidades de tipo `estudio` (programas, becas), con cupos y requisitos.

---

## Entidades de negocio (modelo de dominio)

Estas son las entidades internas que respaldan a los actores anteriores. Se
mapean a tablas de PostgreSQL vía TypeORM.

### YoungProfile (`young_profiles`)
El joven. Genera la señal de demanda.

| Campo            | Tipo              | Notas |
|------------------|-------------------|-------|
| `id`             | `uuid`            | PK |
| `name`           | `string`          | |
| `age`            | `number`          | |
| `barrio`         | `string`          | Barrio de Cartagena (FK lógica a catálogo) |
| `educationLevel` | `EducationLevel`  | enum |
| `seeking`        | `SeekingType`     | `empleo` \| `voluntariado` \| `estudio` \| `todos` |
| `availability`   | `Availability[]`  | enum múltiple |
| `interests`      | `Interest[]`      | N:M con `interests` vía `young_interests` |
| `createdAt`      | `timestamptz`     | |

### Interest (`interests`)
Catálogo de intereses. Valores: `tecnología`, `arte`, `deporte`,
`emprendimiento`, `medio ambiente`, `liderazgo`.

| Campo   | Tipo     | Notas |
|---------|----------|-------|
| `id`    | `uuid`   | PK |
| `slug`  | `string` | identificador estable |
| `label` | `string` | nombre visible |

### OpportunityType (`opportunity_types`)
Catálogo: `empleo`, `voluntariado`, `estudio`.

| Campo   | Tipo     | Notas |
|---------|----------|-------|
| `id`    | `uuid`   | PK |
| `slug`  | `string` | `empleo` \| `voluntariado` \| `estudio` |
| `label` | `string` | |

### Opportunity (`opportunities`)
La oferta que publican las instituciones.

| Campo           | Tipo            | Notas |
|-----------------|-----------------|-------|
| `id`            | `uuid`          | PK |
| `title`         | `string`        | |
| `organization`  | `string`        | entidad oferente |
| `typeId`        | `uuid`          | FK → `opportunity_types` |
| `requirements`  | `string[]`      | |
| `slotsTotal`    | `number`        | cupos totales |
| `slotsAvailable`| `number`        | cupos disponibles |
| `barrio`        | `string`        | zona donde aplica |
| `interestSlugs` | `string[]`      | intereses asociados (para el matching) |
| `createdAt`     | `timestamptz`   | |

### Match (`matches`)
La señal "Me interesa": vínculo joven ↔ oportunidad.

| Campo           | Tipo          | Notas |
|-----------------|---------------|-------|
| `id`            | `uuid`        | PK |
| `youngId`       | `uuid`        | FK → `young_profiles` |
| `opportunityId` | `uuid`        | FK → `opportunities` |
| `status`        | `MatchStatus` | `interesado` \| `contactado` \| `vinculado` |
| `score`         | `number`      | afinidad (reglas hoy, IA mañana) |
| `createdAt`     | `timestamptz` | |

### Group (`groups`) y GroupMember (`group_members`)
Grupos sociales de Mi Sangre, por barrio y habilidad.

`groups`: `id`, `name`, `barrio`, `interestSlug`, `createdAt`.
`group_members`: `id`, `groupId` (FK), `youngId` (FK), `joinedAt`.

### DemandSnapshot (`demand_snapshots`)
**Núcleo de valor.** Agregación pre-calculada de demanda.

| Campo          | Tipo          | Notas |
|----------------|---------------|-------|
| `id`           | `uuid`        | PK |
| `barrio`       | `string`      | zona |
| `interestSlug` | `string`      | categoría |
| `youngCount`   | `number`      | jóvenes que declararon ese interés en esa zona |
| `slotsOffered` | `number`      | cupos ofertados para esa categoría/zona |
| `gap`          | `number`      | `youngCount - slotsOffered` (brecha) |
| `snapshotDate` | `date`        | fecha del corte |

> El campo `gap` es lo que alimenta el contador
> *"X jóvenes quieren estudiar sistemas — solo Y cupos disponibles"*.
