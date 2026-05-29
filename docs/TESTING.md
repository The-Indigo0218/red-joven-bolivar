# TESTING.md — Prueba de humo del flujo completo

Guía para verificar, de punta a punta, que las funcionalidades clave funcionan:
**CV en texto → habilidades → ruta de crecimiento → "Me interesa" → lista de
espera → dashboard institucional con demanda real.**

Pensada para correr antes del pitch. Hay dos partes:

- **Parte A — Backend (automática):** comandos `curl` copy-paste.
- **Parte B — Frontend (manual):** checklist de clics en la UI.

---

## 0. Requisitos previos

```bash
# 1. Base de datos (Postgres en Docker, puerto 5433)
docker compose up -d
docker compose ps           # debe figurar rjb-db como "healthy"

# 2. Poblar datos (solo si la base está vacía)
npm run seed --workspace=apps/back

# 3. Levantar el backend (terminal aparte) → http://localhost:3000
npm run back

# 4. Levantar el frontend (otra terminal) → http://localhost:5173
npm run front
```

Para que el front consuma el back real (no los mocks), en `apps/front` asegurate
de tener:

```
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3000
```

> Las pruebas de la Parte A necesitan `jq` (`sudo dnf install jq`). El backend
> debe estar corriendo.

---

## Parte A — Backend (smoke test por `curl`)

Pegá esto en una terminal. Cada paso imprime el resultado y arriba dice qué
esperar. El bloque es autosuficiente: crea sus propios jóvenes y su propia
oportunidad, no depende de ids fijos.

```bash
BASE=http://localhost:3000
```

### A1. El feed trae `modalidad`

```bash
curl -s $BASE/opportunities | jq '.items[0] | {title, modalidad, slotsAvailable}'
```

**Esperado:** un objeto con `modalidad` en `"presencial" | "virtual" | "hibrido"`.

### A2. Crear dos jóvenes de prueba

```bash
YA=$(curl -s -X POST $BASE/young/profile -H 'Content-Type: application/json' \
  -d '{"name":"Test A","age":20,"barrio":"El Pozón","educationLevel":"bachiller","seeking":"todos","availability":["manana"],"interests":["tecnologia"]}' | jq -r .id)
YB=$(curl -s -X POST $BASE/young/profile -H 'Content-Type: application/json' \
  -d '{"name":"Test B","age":21,"barrio":"El Pozón","educationLevel":"bachiller","seeking":"todos","availability":["tarde"],"interests":["tecnologia"]}' | jq -r .id)
echo "YA=$YA  YB=$YB"
```

**Esperado:** dos UUID no vacíos.

### A3. Crear una oportunidad con UN solo cupo

```bash
OPP=$(curl -s -X POST $BASE/opportunities -H 'Content-Type: application/json' \
  -d '{"title":"Cupo único de prueba","organization":"Test Org","kind":"empleo","requirements":["Bachiller"],"slotsTotal":1,"barrio":"El Pozón","modalidad":"virtual","interests":["tecnologia"]}' | jq -r .id)
echo "OPP=$OPP"
```

**Esperado:** un UUID. (La oportunidad nace con `slotsAvailable: 1`.)

### A4. Joven A toma el único cupo → **interesado**

```bash
curl -s -X POST $BASE/opportunities/$OPP/interest -H 'Content-Type: application/json' \
  -d "{\"youngId\":\"$YA\"}" | jq '{status, waitlisted, slotsAvailable, matchId}'
```

**Esperado:**
```json
{ "status": "interesado", "waitlisted": false, "slotsAvailable": 0, "matchId": "<uuid>" }
```

### A5. Joven B se queda sin cupo → **lista de espera** (la pieza nueva)

```bash
curl -s -X POST $BASE/opportunities/$OPP/interest -H 'Content-Type: application/json' \
  -d "{\"youngId\":\"$YB\"}" | jq '{status, waitlisted, waitlistPosition, waitlistId}'
```

**Esperado:**
```json
{ "status": "en-espera", "waitlisted": true, "waitlistPosition": 1, "waitlistId": "<uuid>" }
```

> Antes esto devolvía `409 No quedan cupos`. Ahora la intención se registra.

### A6. Ver la cola de espera (lo que ve el SENA)

```bash
curl -s $BASE/opportunities/$OPP/waitlist | jq '{total, items}'
```

**Esperado:** `total: 1` y `items[0]` con `youngName: "Test B"`, `position: 1`.

### A7. El dashboard refleja la demanda insatisfecha

```bash
curl -s $BASE/demand/dashboard | jq '.gaps[] | select(.waitlistCount > 0)'
```

**Esperado:** al menos un gap (barrio `El Pozón`, interés `tecnologia`) con
`waitlistCount >= 1` y el `headline` mencionando la lista de espera.

### A8. CV en texto plano → habilidades extraídas

```bash
curl -s -X POST $BASE/young/cv -H 'Content-Type: application/json' \
  -d "{\"cvText\":\"Tengo experiencia en lógica de programación y Excel avanzado, además de atención al cliente.\",\"youngId\":\"$YA\"}" \
  | jq '{confidence, skills: [.skills[].label]}'
```

**Esperado:** `skills` incluye `"Lógica de programación"`, `"Excel avanzado"` y
`"Atención al cliente"`, con `confidence` entre 0 y 1.

> Funciona con o sin Gemini: si la IA no está disponible, cae a la heurística por
> reglas y devuelve igual las habilidades. **No se rompe.**

### A9. Ruta de crecimiento: brecha + curso de cierre (con `isFull`)

```bash
SOPORTE=$(curl -s $BASE/opportunities | jq -r '.items[] | select(.title|contains("soporte técnico")) | .id')
curl -s "$BASE/opportunities/$SOPORTE/route?youngId=$YA" \
  | jq '{affinityScore, headline, missing:[.missingSkills[].label], closing:[.closingOpportunities[]|{curso:.opportunity.title, isFull, slotsAvailable}]}'
```

**Esperado:** `missingSkills` incluye `"Redes y conectividad"`, y
`closingOpportunities` lista un curso que la desarrolla (el Tecnólogo del SENA)
con el campo `isFull` presente (`false` mientras tenga cupos). El `headline`
dice qué falta y dónde conseguirlo.

> **Opcional — ver `isFull: true`:** agotá los cupos del Tecnólogo (tiene 4) con
> 4 jóvenes distintos haciendo "Me interesa"; al quinto, ese curso aparece con
> `isFull: true` y el titular invita a la lista de espera.

---

## Parte B — Frontend (checklist manual)

Abrí `http://localhost:5173` con el back y la DB arriba.

### B1. Onboarding + CV

- [ ] Completo el perfil (nombre, edad, barrio, intereses, etc.) y lo guardo.
- [ ] Abro **"Subir CV"** y cargo un PDF (o pego/subo texto, según la UI).
- [ ] Veo las **habilidades extraídas** tras procesar.

### B2. Feed de oportunidades

- [ ] Veo las oportunidades ordenadas y con **badge de modalidad**
      (presencial/virtual/híbrido).
- [ ] Puedo filtrar/cambiar de tab (empleo/voluntariado/estudio).

### B3. Ruta de crecimiento (el momento WOW)

- [ ] Entro a "Ver mi ruta" en una oportunidad.
- [ ] Veo **score de afinidad**, habilidades que tengo ✓ y las que faltan ✗.
- [ ] Para una habilidad faltante, aparece el **curso de cierre** sugerido.
- [ ] Si el curso está lleno, la UI invita a la **lista de espera** (no "0 cupos").

### B4. "Me interesa" → lista de espera

- [ ] En una oportunidad **con cupos**, "Me interesa" confirma el interés.
- [ ] En una oportunidad **sin cupos**, el botón ofrece **"Unirme a la lista de
      espera"** y al pulsarlo muestra que quedé en espera (posición N).

### B5. Dashboard institucional

- [ ] Navego a la vista **"Demanda juvenil en Cartagena"**.
- [ ] Veo el **contador de brecha** (GapCounter) y, si hay datos, el
      **panel de lista de espera** (WaitlistPanel).
- [ ] Veo el **mapa por barrio** (Leaflet) y el **gráfico de intereses** (Recharts).

---

## Parte C — Pruebas unitarias del back

```bash
cd apps/back && npm test
```

**Esperado:** todas las suites en verde (incluye los tests de `affinityScore` y
de los titulares de ruta con cursos con/sin cupo).

---

## Limpieza (opcional)

Los jóvenes y la oportunidad de prueba quedan en la base. Para volver a un estado
limpio de demo:

```bash
docker compose down -v        # borra el volumen (datos)
docker compose up -d
npm run seed --workspace=apps/back
```

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| El back no arranca (`ECONNREFUSED`/timeout a 5432/5433) | Postgres abajo o puerto equivocado | `docker compose up -d`; verificá `DATABASE_PORT=5433` en `apps/back/.env` |
| `curl` devuelve `Cannot GET /...` | El back no está corriendo | `npm run back` |
| El feed/dashboard del front sale vacío | Front en modo mock o sin seed | `VITE_USE_MOCK=false` + `npm run seed` |
| El CV no extrae nada con Gemini | Key inválida/sin red | No importa: cae a la heurística. Para Gemini real, regenerá `GEMINI_API_KEY` |
| `jq: command not found` | falta `jq` | `sudo dnf install jq` |
