import { useEffect, useState } from 'react';
import { api } from '../../api';
import { ApiRequestError } from '../../api/errors';
import { useApp } from '../../hooks/useApp';
import type { GrowthRouteResponse } from '../../types';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface RutaPersonalProps {
  opportunityId: string;
  onBack: () => void;
  onRouteStarted?: () => void;
}

export function RutaPersonal({ opportunityId, onBack, onRouteStarted }: RutaPersonalProps) {
  const { profile, opportunities } = useApp();
  const [route, setRoute] = useState<GrowthRouteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const targetOpp = opportunities.find((o) => o.id === opportunityId);

  useEffect(() => {
    if (!profile) return;

    let cancelled = false;

    async function loadRoute() {
      try {
        const data = await api.opportunities.getRoute(opportunityId, profile.id);
        if (!cancelled) {
          setRoute(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof ApiRequestError
              ? err.message
              : 'No pudimos generar tu ruta de crecimiento.';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRoute();

    return () => {
      cancelled = true;
    };
  }, [opportunityId, profile]);

  function handleStartRoute() {
    setStarted(true);
    onRouteStarted?.();
  }

  if (!profile) {
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <BackButton onClick={onBack} />
        <EmptyNotice
          title="Necesitas un perfil"
          description="Completa tu perfil para ver tu ruta personalizada hacia esta oportunidad."
        />
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <BackButton onClick={onBack} />

      <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Tu ruta de crecimiento</h1>
      {targetOpp && (
        <p className="mb-6 text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
          Hacia <strong style={{ color: 'var(--rjb-accent)' }}>{targetOpp.title}</strong> ·{' '}
          {targetOpp.organization}
        </p>
      )}

      {loading && <LoadingSpinner label="Analizando brechas y armando tu ruta..." />}

      {!loading && error && (
        <ErrorMessage
          message={error}
          onRetry={() => {
            setError(null);
            setLoading(true);
            void api.opportunities
              .getRoute(opportunityId, profile.id)
              .then(setRoute)
              .catch((err: unknown) => {
                setError(err instanceof ApiRequestError ? err.message : 'Error al cargar la ruta.');
              })
              .finally(() => setLoading(false));
          }}
        />
      )}

      {!loading && !error && route && (
        <div className="flex flex-col gap-6">
          <div
            className="rounded-2xl p-5 border text-center"
            style={{
              backgroundColor: 'var(--rjb-surface)',
              borderColor: 'var(--rjb-border)',
            }}
          >
            <p className="text-sm mb-1" style={{ color: 'var(--rjb-text-muted)' }}>
              Afinidad con esta oportunidad
            </p>
            <p
              className="text-5xl font-extrabold mb-2"
              style={{
                color:
                  route.affinityScore >= 70
                    ? 'var(--rjb-success)'
                    : route.affinityScore >= 40
                      ? 'var(--rjb-warning)'
                      : 'var(--rjb-primary)',
              }}
            >
              {route.affinityScore}%
            </p>
            <p className="text-sm font-medium">{route.headline}</p>
          </div>

          <SkillSection
            title="Lo que ya tienes"
            skills={route.matchingSkills}
            emptyText="Aun no registramos habilidades que coincidan — sube tu CV o completa cursos de cierre."
            variant="match"
          />

          <SkillSection
            title="Lo que te falta"
            skills={route.missingSkills}
            emptyText="¡Excelente! Tienes todas las habilidades requeridas."
            variant="gap"
          />

          {route.closingOpportunities.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">Oportunidades de cierre</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--rjb-text-muted)' }}>
                Cursos y talleres en Cartagena para cerrar tu brecha, gratis o con cupo disponible.
              </p>
              <div className="grid gap-3">
                {route.closingOpportunities.map((item) => (
                  <article
                    key={`${item.skill.id}-${item.opportunity.id}`}
                    className="rounded-xl p-4 border"
                    style={{
                      backgroundColor: 'var(--rjb-surface)',
                      borderColor: 'var(--rjb-border)',
                    }}
                  >
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--rjb-warning)' }}>
                      Falta: {item.skill.label}
                    </p>
                    <h3 className="font-bold">{item.opportunity.title}</h3>
                    <p className="text-sm" style={{ color: 'var(--rjb-accent)' }}>
                      {item.opportunity.organization} · {item.opportunity.barrio}
                    </p>
                    <p className="text-sm mt-2" style={{ color: 'var(--rjb-success)' }}>
                      {item.slotsAvailable} cupos disponibles
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartRoute}
            disabled={started}
            className="w-full py-3 rounded-xl text-base font-bold disabled:opacity-60"
            style={{
              backgroundColor: started ? 'var(--rjb-success)' : 'var(--rjb-primary)',
              color: 'var(--rjb-bg)',
            }}
          >
            {started ? 'Ruta iniciada — ¡a darle!' : 'Iniciar mi ruta'}
          </button>

          {started && (
            <p
              className="text-sm text-center rounded-lg px-4 py-3"
              style={{ backgroundColor: 'var(--rjb-surface-2)', color: 'var(--rjb-accent)' }}
            >
              Tu ruta quedo guardada. Completa las oportunidades de cierre y gana CivicCoins en
              actividades sociales.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function SkillSection({
  title,
  skills,
  emptyText,
  variant,
}: {
  title: string;
  skills: { id: string; label: string; category: string }[];
  emptyText: string;
  variant: 'match' | 'gap';
}) {
  const accent = variant === 'match' ? 'var(--rjb-success)' : 'var(--rjb-warning)';

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      {skills.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
          {emptyText}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="px-3 py-1.5 rounded-full text-sm font-medium border"
              style={{
                borderColor: accent,
                color: accent,
                backgroundColor: 'var(--rjb-surface)',
              }}
            >
              {skill.label}
              <span className="ml-1 opacity-60 text-xs">({skill.category})</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-4 text-sm font-semibold flex items-center gap-1"
      style={{ color: 'var(--rjb-primary)' }}
    >
      ← Volver a oportunidades
    </button>
  );
}

function EmptyNotice({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="rounded-2xl p-8 text-center border mt-4"
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
