import { useState } from 'react';
import type { OpportunityKind } from '../../types';
import { useApp } from '../../hooks/useApp';
import { filterOpportunities } from '../../utils/filterOpportunities';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';
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
  onViewRoute?: (opportunityId: string) => void;
}

export function OpportunitiesFeed({ onGoToProfile, onViewRoute }: OpportunitiesFeedProps) {
  const {
    profile,
    opportunities,
    expressInterest,
    isInterestedIn,
    isLoadingOpportunities,
    opportunitiesError,
    interestLoadingId,
    refreshOpportunities,
  } = useApp();
  const [activeTab, setActiveTab] = useState<OpportunityKind>('empleo');
  const [feedback, setFeedback] = useState<string | null>(null);

  const items = filterOpportunities(opportunities, activeTab, profile);

  async function handleInterest(id: string) {
    if (!profile) {
      setFeedback('Completa tu perfil primero para expresar interes.');
      return;
    }

    const match = await expressInterest(id);
    if (match) {
      setFeedback('Interes registrado! Tu senal de demanda quedo guardada.');
    } else if (isInterestedIn(id)) {
      setFeedback('Ya registraste interes en esta oportunidad.');
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
          <strong>{profile.barrio}</strong> segun tus intereses.
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
            Todavia no tenes perfil. Completalo para ver oportunidades personalizadas.
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

      {isLoadingOpportunities && <LoadingSpinner label="Cargando oportunidades..." />}

      {!isLoadingOpportunities && opportunitiesError && (
        <ErrorMessage message={opportunitiesError} onRetry={() => void refreshOpportunities()} />
      )}

      {!isLoadingOpportunities && !opportunitiesError && !profile && (
        <EmptyState
          title="Sin perfil todavia"
          description="Crea tu perfil para filtrar oportunidades por barrio e intereses."
        />
      )}

      {!isLoadingOpportunities && !opportunitiesError && profile && items.length === 0 && (
        <EmptyState
          title="No hay oportunidades que coincidan"
          description={`No encontramos ${TABS.find((t) => t.kind === activeTab)?.label.toLowerCase()} en ${profile.barrio} que coincidan con tus intereses. Proba otra pestana o actualiza tu perfil.`}
        />
      )}

      {!isLoadingOpportunities && !opportunitiesError && profile && items.length > 0 && (
        <div className="grid gap-4">
          {items.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              interested={isInterestedIn(opp.id)}
              disabled={!profile || opp.slotsAvailable <= 0}
              loading={interestLoadingId === opp.id}
              onInterest={(id) => void handleInterest(id)}
              onViewRoute={onViewRoute}
              showRoute={Boolean(profile)}
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
