import { useState } from 'react';
import type { OpportunityKind, OpportunityModality } from '../../types';
import { useApp } from '../../hooks/useApp';
import { filterOpportunities } from '../../utils/filterOpportunities';
import { modalityLabel } from '../../utils/modalityLabels';
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

const MODALITY_FILTERS: Array<{ value: OpportunityModality | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todas' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'hibrido', label: 'Híbrido' },
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
    isWaitlisted,
    getWaitlistPosition,
    isLoadingOpportunities,
    opportunitiesError,
    interestLoadingId,
    refreshOpportunities,
  } = useApp();
  const [activeTab, setActiveTab] = useState<OpportunityKind>('empleo');
  const [modalidadFilter, setModalidadFilter] = useState<OpportunityModality | 'todos'>('todos');
  const [allCartagena, setAllCartagena] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const items = filterOpportunities(
    opportunities,
    activeTab,
    profile,
    modalidadFilter === 'todos' ? undefined : modalidadFilter,
    allCartagena,
  );

  async function handleInterest(id: string) {
    if (!profile) {
      setFeedback('Completa tu perfil primero para expresar interés.');
      return;
    }

    try {
      const result = await expressInterest(id);
      if (result?.status === 'interesado') {
        setFeedback('Interés registrado. Tu señal de demanda quedó guardada.');
      } else if (result?.status === 'en-espera') {
        setFeedback(
          `Te anotamos en la lista de espera${result.waitlistPosition ? ` — posición #${result.waitlistPosition}` : ''}.`,
        );
      } else if (isInterestedIn(id)) {
        setFeedback('Ya registraste interés en esta oportunidad.');
      } else if (isWaitlisted(id)) {
        setFeedback('Ya estás en la lista de espera de esta oportunidad.');
      }
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'No pudimos registrar tu interés. Intenta de nuevo.',
      );
    }

    window.setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Oportunidades para vos</h1>

      {profile ? (
        <>
          <p className="mb-3 text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
            {allCartagena ? (
              <>
                Mostrando oportunidades en <strong>toda Cartagena</strong> según tus
                intereses. Las de <strong>{profile.barrio}</strong> aparecen primero.
              </>
            ) : (
              <>
                Filtradas para <strong>{profile.name}</strong> en{' '}
                <strong>{profile.barrio}</strong> según tus intereses.
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => setAllCartagena((v) => !v)}
            aria-pressed={allCartagena}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors"
            style={{
              borderColor: allCartagena ? 'var(--rjb-primary)' : 'var(--rjb-border)',
              backgroundColor: allCartagena ? 'var(--rjb-primary)' : 'transparent',
              color: allCartagena ? 'var(--rjb-bg)' : 'var(--rjb-primary)',
            }}
          >
            {allCartagena ? '📍 Volver a mi barrio' : '🌎 Buscar en toda Cartagena'}
          </button>
        </>
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

      <div className="flex flex-wrap gap-2 mb-4">
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

      <div className="flex flex-wrap gap-2 mb-6">
        {MODALITY_FILTERS.map((filter) => {
          const active = filter.value === modalidadFilter;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setModalidadFilter(filter.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{
                borderColor: active ? 'var(--rjb-primary)' : 'var(--rjb-border)',
                backgroundColor: active ? 'var(--rjb-primary)' : 'transparent',
                color: active ? 'var(--rjb-bg)' : 'var(--rjb-text-muted)',
              }}
            >
              {filter.label === 'Todas' ? filter.label : modalityLabel(filter.value as OpportunityModality)}
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
          title="Sin perfil todavía"
          description="Crea tu perfil para filtrar oportunidades por barrio e intereses."
        />
      )}

      {!isLoadingOpportunities && !opportunitiesError && profile && items.length === 0 && (
        <EmptyState
          title="No hay oportunidades que coincidan"
          description={`No encontramos ${TABS.find((t) => t.kind === activeTab)?.label.toLowerCase()} en ${allCartagena ? 'toda Cartagena' : profile.barrio} que coincidan con tus intereses${modalidadFilter !== 'todos' ? ` y modalidad ${modalityLabel(modalidadFilter)}` : ''}.${allCartagena ? ' Probá otra pestaña o actualizá tu perfil.' : ' Probá «Buscar en toda Cartagena» o cambiá de pestaña.'}`}
        />
      )}

      {!isLoadingOpportunities && !opportunitiesError && profile && items.length > 0 && (
        <div className="grid gap-4">
          {items.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              interested={isInterestedIn(opp.id)}
              waitlisted={isWaitlisted(opp.id)}
              waitlistPosition={getWaitlistPosition(opp.id)}
              disabled={!profile}
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
