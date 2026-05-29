// Contador de brecha demanda/oferta — la métrica estrella del diferenciador.
// "X jóvenes quieren estudiar sistemas — solo Y cupos disponibles en el SENA"

import type { DemandGap } from '../../types';

interface GapCounterProps {
  gaps: DemandGap[];
}

export function GapCounter({ gaps }: GapCounterProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {gaps.map((gap) => (
        <div
          key={`${gap.interest}-${gap.barrio}`}
          className="rounded-2xl p-5 border"
          style={{
            backgroundColor: 'var(--rjb-surface)',
            borderColor: 'var(--rjb-border)',
          }}
        >
          <p className="text-4xl font-extrabold" style={{ color: 'var(--rjb-warning)' }}>
            {gap.gap}
          </p>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--rjb-text-muted)' }}>
            jóvenes sin cupo
          </p>
          {gap.waitlistCount > 0 && (
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--rjb-accent)' }}>
              {gap.waitlistCount} en lista de espera
            </p>
          )}
          <p className="text-sm">{gap.headline}</p>
        </div>
      ))}
    </div>
  );
}
