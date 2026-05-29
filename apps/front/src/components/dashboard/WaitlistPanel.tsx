import { useEffect, useState } from 'react';
import { api } from '../../api';
import { ApiRequestError } from '../../api';
import type { Opportunity, WaitlistResponse } from '../../types';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error) return error.message;
  return 'No pudimos cargar la lista de espera.';
}

export function WaitlistPanel() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [waitlist, setWaitlist] = useState<WaitlistResponse | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingWaitlist, setLoadingWaitlist] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOpportunities() {
      try {
        const response = await api.opportunities.list({});
        if (!cancelled) {
          setOpportunities(response.items);
          if (response.items.length > 0) {
            setSelectedId(response.items[0].id);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoadingList(false);
        }
      }
    }

    void loadOpportunities();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;
    setLoadingWaitlist(true);

    async function loadWaitlist() {
      try {
        const data = await api.opportunities.getWaitlist(selectedId);
        if (!cancelled) {
          setWaitlist(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setWaitlist(null);
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoadingWaitlist(false);
        }
      }
    }

    void loadWaitlist();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selectedOpp = opportunities.find((o) => o.id === selectedId);

  return (
    <section
      className="rounded-2xl p-5 sm:p-6 border"
      style={{
        backgroundColor: 'var(--rjb-surface)',
        borderColor: 'var(--rjb-border)',
      }}
    >
      <header className="mb-4">
        <h2 className="text-lg font-bold mb-1">Lista de espera por oportunidad</h2>
        <p className="text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
          Demanda insatisfecha real: jóvenes que quieren una oferta pero no hay cupos.
        </p>
      </header>

      {loadingList && <LoadingSpinner label="Cargando oportunidades..." />}

      {!loadingList && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm border"
            style={{
              backgroundColor: 'var(--rjb-surface-2)',
              borderColor: 'var(--rjb-border)',
              color: 'inherit',
            }}
          >
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.title} — {opp.organization}
              </option>
            ))}
          </select>
          {selectedOpp && (
            <span
              className="text-sm font-semibold self-center px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--rjb-surface-2)',
                color: selectedOpp.slotsAvailable <= 0 ? 'var(--rjb-warning)' : 'var(--rjb-success)',
              }}
            >
              {selectedOpp.slotsAvailable <= 0
                ? 'Sin cupos'
                : `${selectedOpp.slotsAvailable} cupos libres`}
            </span>
          )}
        </div>
      )}

      {loadingWaitlist && <LoadingSpinner label="Cargando lista de espera..." />}

      {!loadingWaitlist && error && (
        <ErrorMessage
          message={error}
          onRetry={() => {
            if (!selectedId) return;
            setError(null);
            setLoadingWaitlist(true);
            void api.opportunities
              .getWaitlist(selectedId)
              .then(setWaitlist)
              .catch((err) => setError(getErrorMessage(err)))
              .finally(() => setLoadingWaitlist(false));
          }}
        />
      )}

      {!loadingWaitlist && !error && waitlist && waitlist.total === 0 && (
        <p className="text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
          Nadie en lista de espera para esta oportunidad todavía.
        </p>
      )}

      {!loadingWaitlist && !error && waitlist && waitlist.total > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--rjb-text-muted)' }}>
                <th className="text-left py-2 pr-4">#</th>
                <th className="text-left py-2 pr-4">Joven</th>
                <th className="text-left py-2">Desde</th>
              </tr>
            </thead>
            <tbody>
              {waitlist.items.map((item) => (
                <tr key={item.id} className="border-t" style={{ borderColor: 'var(--rjb-border)' }}>
                  <td className="py-2 pr-4 font-bold">{item.position}</td>
                  <td className="py-2 pr-4">{item.youngName}</td>
                  <td className="py-2">
                    {new Date(item.createdAt).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs mt-3" style={{ color: 'var(--rjb-text-muted)' }}>
            Total: {waitlist.total} jóvenes en espera
          </p>
        </div>
      )}
    </section>
  );
}
