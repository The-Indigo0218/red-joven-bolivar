import { useEffect, useState } from 'react';
import { api } from '../../api';
import { ApiRequestError } from '../../api';
import type { DemandDashboardResponse } from '../../types';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { DemandChart } from './DemandChart';
import { DemandMap } from './DemandMap';
import { GapCounter } from './GapCounter';

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error) return error.message;
  return 'No pudimos cargar el tablero de demanda.';
}

export function DemandDashboard() {
  const [data, setData] = useState<DemandDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const dashboard = await api.demand.getDashboard();
        if (!cancelled) {
          setData(dashboard);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const retry = () => {
    setIsLoading(true);
    setError(null);
    void api.demand
      .getDashboard()
      .then((dashboard) => {
        setData(dashboard);
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Demanda juvenil en Cartagena</h1>
        <p style={{ color: 'var(--rjb-text-muted)' }}>
          Lo que la juventud quiere, barrio por barrio. Evidencia para que las
          instituciones abran los cupos correctos.
        </p>
      </header>

      {isLoading && <LoadingSpinner label="Cargando tablero de demanda..." />}

      {!isLoading && error && (
        <ErrorMessage message={error} onRetry={retry} />
      )}

      {!isLoading && !error && data && (
        <>
          <GapCounter gaps={data.gaps} />
          <div className="grid gap-6 lg:grid-cols-2">
            <DemandMap zones={data.byZone} />
            <DemandChart interests={data.topInterests} />
          </div>
        </>
      )}
    </section>
  );
}
