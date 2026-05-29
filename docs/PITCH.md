# PITCH.md — Red Joven Bolívar (3 minutos)

> **Estructura:** Problema → Demo (qué resolvemos y cómo) → Lo que nos diferencia → Cierre.
> ~440 palabras habladas (~3 min). La columna `[ ]` es la coreografía de demo:
> qué mostrar mientras hablás.

| Bloque | Tiempo |
|--------|--------|
| 1. El problema | 0:00 – 0:30 |
| 2. La demo: cómo lo resolvemos | 0:30 – 2:05 |
| 3. Lo que nos diferencia | 2:05 – 2:45 |
| 4. Cierre | 2:45 – 3:00 |

---

## 1. EL PROBLEMA — *0:30*

> "En Cartagena, miles de jóvenes de barrios como El Pozón u Olaya Herrera quieren
> estudiar, trabajar o formarse. Pero pasan dos cosas a la vez:
>
> El joven no sabe **qué oportunidad le sirve** ni **qué le falta** para alcanzarla.
>
> Y las instituciones —el SENA, la Alcaldía, las universidades— abren cupos **a
> ciegas**: a veces sobran, casi siempre faltan donde más se necesitan.
>
> Talento que busca y no encuentra, frente a oferta que no acierta. **Dos lados
> desconectados.**"

---

## 2. LA DEMO: CÓMO LO RESOLVEMOS — *1:35* (en vivo)

> "Así lo resolvemos. Esta es María, 19 años, de El Pozón."

**[Perfil + CV]**
> "María sube su CV. La IA lo lee —PDF o texto— y **extrae sus habilidades sola**:
> tiene lógica de programación y Excel."

**[Feed de oportunidades]**
> "Ve oportunidades ordenadas **por afinidad** con su perfil y su barrio, y filtra
> por modalidad: presencial o virtual."

**[Ruta de Crecimiento — el momento WOW]**
> "Quiere ser practicante de soporte técnico, pero todavía no clasifica. Otras
> plataformas le dirían 'no aplicás'. Nosotros le decimos **qué hacer**:
>
> *'Te falta Redes. El SENA dicta un curso que la enseña, gratis, en tu zona.
> ¿Te conectamos?'*
>
> Le decimos qué le falta **y dónde conseguirlo gratis.**"

**[Lista de espera]**
> "¿Y si ese curso está lleno? Antes ese 'no hay cupos' se perdía. Ahora María
> entra a una **lista de espera** — su intención no se pierde, se convierte en dato."

**[CivicCoins]**
> "Y mientras se forma, María **aporta**. Enseña lógica de programación a otros
> chicos del barrio y **gana CivicCoins** —puntos que un coordinador valida.
> Los **canjea** por útiles escolares, un cupo del SENA o descuentos en
> universidades aliadas. El que sabe enseña; el que enseña gana; con lo que gana,
> se sigue formando. Una **economía circular del conocimiento.**"

**[Dashboard institucional]**
> "Y acá está lo grande: el SENA ve este tablero. *'47 jóvenes en El Pozón esperan
> un cupo de tecnología.'* Esa lista es la señal para abrir el próximo curso donde
> de verdad hace falta."

---

## 3. LO QUE NOS DIFERENCIA — *0:40*

> "Tres cosas nos hacen distintos:
>
> **Uno — Rutas, no filtros.** La IA no solo recomienda: lee el CV, detecta la
> brecha de habilidades y la conecta con el curso gratis que la cierra.
>
> **Dos — CivicCoins.** Convertimos el conocimiento de cada joven en una moneda
> que paga su propia formación. Nadie se queda atrás por no tener plata.
>
> **Tres — Demanda accionable.** Cada interés y cada lista de espera es un **voto**.
> Mil jóvenes pidiendo 'sistemas en El Pozón' no es ruido: es una **orden de compra**
> para el SENA.
>
> Todo corre sobre IA con **Google Gemini**, con una red de seguridad por reglas:
> **si la IA falla, la plataforma sigue funcionando.**"

---

## 4. CIERRE — *0:15*

> "Hoy el talento joven de Cartagena se desperdicia por falta de información.
> Red Joven Bolívar lo conecta con oportunidades, lo premia por enseñar, y
> convierte cada 'no hay cupo' en la próxima decisión del Estado.
>
> **El talento ya está. Nosotros lo conectamos.**"

---

## Notas para clavarlo

- **Frases ancla** (repetir): *"qué te falta y dónde conseguirlo gratis"*,
  *"economía circular del conocimiento"*, *"cada 'no hay cupo' es una orden de
  compra para el SENA"*, *"el talento ya está, nosotros lo conectamos"*.
- **Tres WOW en orden de impacto:** Ruta de Crecimiento → CivicCoins →
  Lista de espera/Dashboard. Dales los segundos buenos; saltá rápido login y
  formularios.
- **Demo lista antes:** María creada con CV cargado, una actividad social para
  mostrar el canje, y una oportunidad **sin cupos** con gente ya en lista de
  espera (`npm run seed` + ver `docs/TESTING.md`). DB en Docker, puerto 5433.
- **Si Gemini está lento o sin red:** mostralo igual; el fallback heurístico da la
  misma experiencia — y es un punto a favor que conviene mencionar.
- **Plan B sin backend:** `VITE_USE_MOCK=true` levanta el front con datos mock;
  la demo no depende del back.

### Versión 90 s (si recortan tiempo)

Problema (15s) → Ruta de Crecimiento (35s) → Lista de espera + Dashboard (25s) →
Cierre (15s). CivicCoins se nombra en una frase y se omite su demo.
