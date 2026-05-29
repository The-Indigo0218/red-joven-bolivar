import type { Opportunity } from '../../types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  interested?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onInterest?: (id: string) => void;
  onViewRoute?: (id: string) => void;
  showRoute?: boolean;
}

export function OpportunityCard({
  opportunity,
  interested = false,
  disabled = false,
  loading = false,
  onInterest,
  onViewRoute,
  showRoute = false,
}: OpportunityCardProps) {
  const { id, title, organization, requirements, slotsAvailable, slotsTotal, barrio } =
    opportunity;

  const noSlots = slotsAvailable <= 0;
  const isDisabled = disabled || interested || noSlots || loading;

  return (
    <article
      className="rounded-2xl p-4 sm:p-5 border flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--rjb-surface)',
        borderColor: interested ? 'var(--rjb-success)' : 'var(--rjb-border)',
      }}
    >
      <header>
        <h3 className="text-base sm:text-lg font-bold">{title}</h3>
        <p className="text-sm" style={{ color: 'var(--rjb-accent)' }}>
          {organization}
        </p>
        <p className="text-xs" style={{ color: 'var(--rjb-text-muted)' }}>
          {barrio}
        </p>
      </header>

      <ul
        className="text-sm list-disc list-inside"
        style={{ color: 'var(--rjb-text-muted)' }}
      >
        {requirements.map((req) => (
          <li key={req}>{req}</li>
        ))}
      </ul>

      <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
        <span
          className="text-sm font-semibold"
          style={{ color: noSlots ? 'var(--rjb-warning)' : 'var(--rjb-success)' }}
        >
          {slotsAvailable} / {slotsTotal} cupos
        </span>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {showRoute && onViewRoute && (
            <button
              type="button"
              onClick={() => onViewRoute(id)}
              className="px-4 py-2 rounded-lg text-sm font-semibold border"
              style={{
                borderColor: 'var(--rjb-accent)',
                color: 'var(--rjb-accent)',
                backgroundColor: 'transparent',
              }}
            >
              Ver mi ruta
            </button>
          )}
          <button
            type="button"
            onClick={() => onInterest?.(id)}
            disabled={isDisabled}
            className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: interested ? 'var(--rjb-success)' : 'var(--rjb-primary)',
              color: 'var(--rjb-bg)',
            }}
          >
            {loading
              ? 'Enviando...'
              : interested
                ? 'Interes registrado'
                : noSlots
                  ? 'Sin cupos'
                  : 'Me interesa'}
          </button>
        </div>
      </footer>
    </article>
  );
}
