import { useState } from 'react';
import type { OpportunityKind } from '../../types';
import { useApp } from '../../context/AppContext';
import { filterOpportunities } from '../../utils/filterOpportunities';
import { OpportunityCard } from './OpportunityCard';

interface Tab {
  kind: OpportunityKind;
  label: string;
}

const TABS: Tab[] = [
  { kind: 'empleo', label: 'Empleos' },
  { kind: 'voluntariado', label: 'Voluntariados' },
  { kind: 'estudio', label: 'Estudios' },
];

interface OpportunitiesFeedProps {
  onGoToProfile?: () => void;
}

export function OpportunitiesFeed({ onGoToProfile }: OpportunitiesFeedProps) {
  const { profile, opportunities, expressInterest, isInterestedIn } = useApp();
  const [activeTab, setActiveTab] = useState<OpportunityKind>('empleo');
  const [feedback, setFeedback] = useState<string | null>(null);

  const items = filterOpportunities(opportunities, activeTab, profile);

  function handleInterest(id: string) {
    if (!profile) {
      setFeedback('Completá tu perfil primero para expresar interés.');
      return;
    }

    const match = expressInterest(id);
    if (match) {
      setFeedback('¡Interés registrado! Tu señal de demanda quedó guardada.');
    } else if (isInterestedIn(id)) {
      setFeedback('Ya registraste interés en esta oportunidad.');
    } else {
      setFeedback('No hay cupos disponibles en esta oportunidad.');
    }

    window.setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Oportunidades para vos</h1>

      {profile ? (
        <p className="mb-6 text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
          Filtradas para <strong>{profile.name}</strong> en{' '}
          <strong>{profile.barrio}</strong> según tus intereses.
        </p>
      ) : (
        <div
          className="mb-6 rounded-xl px-4 py-3 text-sm border"
          style={{
            backgroundColor: 'var(--rjb-surface)',
            borderColor: 'var(--rjb-warning)',
          }}
        >
          <p className="mb-2">
            Todavía no tenés perfil. Completalo para ver oportunidades personalizadas.
          </p>
          {onGoToProfile && (
            <button
              type="button"
              onClick={onGoToProfile}
              className="text-sm font-semibold underline"
              style={{ color: 'var(--rjb-primary)' }}
            >
              Ir a Mi perfil
            </button>
          )}
        </div>
      )}

      {feedback && (
        <div
          className="mb-4 rounded-lg px-4 py-2 text-sm"
          style={{ backgroundColor: 'var(--rjb-surface-2)', color: 'var(--rjb-accent)' }}
        >
          {feedback}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => {
          const active = tab.kind === activeTab;
          return (
            <button
              key={tab.kind}
              type="button"
              onClick={() => setActiveTab(tab.kind)}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: active ? 'var(--rjb-accent)' : 'var(--rjb-surface-2)',
                color: active ? 'var(--rjb-bg)' : 'var(--rjb-text-muted)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {!profile ? (
        <EmptyState
          title="Sin perfil todavía"
          description="Creá tu perfil para filtrar oportunidades por barrio e intereses."
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay oportunidades que coincidan"
          description={`No encontramos ${TABS.find((t) => t.kind === activeTab)?.label.toLowerCase()} en ${profile.barrio} que coincidan con tus intereses. Probá otra pestaña o actualizá tu perfil.`}
        />
      ) : (
        <div className="grid gap-4">
          {items.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              interested={isInterestedIn(opp.id)}
              disabled={!profile || opp.slotsAvailable <= 0}
              onInterest={handleInterest}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="rounded-2xl p-8 text-center border"
      style={{
        backgroundColor: 'var(--rjb-surface)',
        borderColor: 'var(--rjb-border)',
      }}
    >
      <p className="text-lg font-bold mb-2">{title}</p>
      <p className="text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
        {description}
      </p>
    </div>
  );
}
