import type { Opportunity } from '../../types';

import { modalityLabel } from '../../utils/modalityLabels';



interface OpportunityCardProps {

  opportunity: Opportunity;

  interested?: boolean;

  waitlisted?: boolean;

  waitlistPosition?: number | null;

  disabled?: boolean;

  loading?: boolean;

  onInterest?: (id: string) => void;

  onViewRoute?: (id: string) => void;

  showRoute?: boolean;

}



export function OpportunityCard({

  opportunity,

  interested = false,

  waitlisted = false,

  waitlistPosition = null,

  disabled = false,

  loading = false,

  onInterest,

  onViewRoute,

  showRoute = false,

}: OpportunityCardProps) {

  const {

    id,

    title,

    organization,

    requirements,

    slotsAvailable,

    slotsTotal,

    barrio,

    modalidad,

  } = opportunity;



  const noSlots = slotsAvailable <= 0;

  const hasAction = interested || waitlisted;

  const isDisabled = disabled || hasAction || loading;



  return (

    <article

      className="rounded-2xl p-4 sm:p-5 border flex flex-col gap-3"

      style={{

        backgroundColor: 'var(--rjb-surface)',

        borderColor: hasAction ? 'var(--rjb-success)' : 'var(--rjb-border)',

      }}

    >

      <header>

        <div className="flex flex-wrap items-center gap-2 mb-1">

          <span

            className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full"

            style={{

              backgroundColor: 'var(--rjb-surface-2)',

              color: 'var(--rjb-accent)',

            }}

          >

            {modalityLabel(modalidad)}

          </span>

        </div>

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

          {noSlots ? 'Sin cupos' : `${slotsAvailable} / ${slotsTotal} cupos`}

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

              backgroundColor: hasAction ? 'var(--rjb-success)' : 'var(--rjb-primary)',

              color: 'var(--rjb-bg)',

            }}

          >

            {loading

              ? 'Enviando...'

              : interested

                ? 'Interés registrado'

                : waitlisted

                  ? `En lista de espera${waitlistPosition ? ` — #${waitlistPosition}` : ''}`

                  : noSlots

                    ? 'Unirme a la lista de espera'

                    : 'Me interesa'}

          </button>

        </div>

      </footer>

    </article>

  );

}

