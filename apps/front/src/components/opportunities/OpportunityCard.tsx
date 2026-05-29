// Card de una oportunidad en el feed.
// Estructura lista para construir — el botón "Me interesa" aún no dispara lógica.

import type { Opportunity } from '../../types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onInterest?: (id: string) => void;
}

export function OpportunityCard({ opportunity, onInterest }: OpportunityCardProps) {
  const { id, title, organization, requirements, slotsAvailable, slotsTotal, barrio } =
    opportunity;

  return (
    <article
      className="rounded-2xl p-5 border flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--rjb-surface)',
        borderColor: 'var(--rjb-border)',
      }}
    >
      <header>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm" style={{ color: 'var(--rjb-accent)' }}>
          {organization}
        </p>
        <p className="text-xs" style={{ color: 'var(--rjb-text-muted)' }}>
          {barrio}
        </p>
      </header>

      <ul className="text-sm list-disc list-inside" style={{ color: 'var(--rjb-text-muted)' }}>
        {requirements.map((req) => (
          <li key={req}>{req}</li>
        ))}
      </ul>

      <footer className="flex items-center justify-between mt-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--rjb-success)' }}>
          {slotsAvailable} / {slotsTotal} cupos
        </span>
        <button
          type="button"
          onClick={() => onInterest?.(id)}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: 'var(--rjb-primary)', color: 'var(--rjb-bg)' }}
        >
          Me interesa
        </button>
      </footer>
    </article>
  );
}
