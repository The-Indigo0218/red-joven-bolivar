// Pantalla 3 — DemandDashboard (el diferenciador).
// Vista para instituciones: mapa de concentración, top intereses y brechas demanda/oferta.
// Estructura lista para construir — datos de mockDemand (luego GET /demand/dashboard).

import { mockDemand } from '../../data/mockDemand';
import { DemandMap } from './DemandMap';
import { DemandChart } from './DemandChart';
import { GapCounter } from './GapCounter';

export function DemandDashboard() {
  const { byZone, topInterests, gaps } = mockDemand;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Demanda juvenil en Cartagena</h1>
        <p style={{ color: 'var(--rjb-text-muted)' }}>
          Lo que la juventud quiere, barrio por barrio. Evidencia para que las
          instituciones abran los cupos correctos.
        </p>
      </header>

      <GapCounter gaps={gaps} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DemandMap zones={byZone} />
        <DemandChart interests={topInterests} />
      </div>
    </section>
  );
}
