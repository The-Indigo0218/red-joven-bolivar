import { useEffect, useState } from 'react';
import { api } from '../../api';
import { ApiRequestError } from '../../api/errors';
import { useApp } from '../../hooks/useApp';
import type {
  CivicCoinsBalanceResponse,
  RedemptionCatalogItem,
  SuggestedActivity,
} from '../../types';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface CivicCoinsScreenProps {
  onGoToProfile?: () => void;
}

export function CivicCoinsScreen({ onGoToProfile }: CivicCoinsScreenProps) {
  const { profile } = useApp();
  const [balance, setBalance] = useState<CivicCoinsBalanceResponse | null>(null);
  const [activities, setActivities] = useState<SuggestedActivity[]>([]);
  const [catalog, setCatalog] = useState<RedemptionCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [voucher, setVoucher] = useState<string | null>(null);

  const loadData = async () => {
    if (!profile) return;

    setLoading(true);
    setError(null);

    try {
      const [balanceData, activitiesData, catalogData] = await Promise.all([
        api.civiccoins.getBalance(profile.id),
        api.civiccoins.suggestActivities(profile.id),
        api.redemptions.getCatalog(),
      ]);
      setBalance(balanceData);
      setActivities(activitiesData.items);
      setCatalog(catalogData.items);
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : 'No pudimos cargar tu billetera CivicCoins.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) {
      return;
    }

    let cancelled = false;

    async function loadWallet() {
      try {
        const [balanceData, activitiesData, catalogData] = await Promise.all([
          api.civiccoins.getBalance(profile.id),
          api.civiccoins.suggestActivities(profile.id),
          api.redemptions.getCatalog(),
        ]);
        if (!cancelled) {
          setBalance(balanceData);
          setActivities(activitiesData.items);
          setCatalog(catalogData.items);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof ApiRequestError
              ? err.message
              : 'No pudimos cargar tu billetera CivicCoins.';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadWallet();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 5000);
  }

  async function handleEarn(activity: SuggestedActivity) {
    if (!profile) return;
    setActionLoading(activity.id);
    try {
      const result = await api.civiccoins.earn({
        youngId: profile.id,
        activityId: activity.id,
        validatorId: profile.id,
      });
      setBalance((prev) =>
        prev
          ? {
              ...prev,
              balance: result.newBalance,
              history: [
                {
                  id: result.transactionId,
                  type: 'earned',
                  amount: result.pointsEarned,
                  description: `Actividad social: ${result.activity}`,
                  createdAt: new Date().toISOString(),
                },
                ...prev.history,
              ],
            }
          : null,
      );
      showFeedback(`+${result.pointsEarned} CivicCoins por "${result.activity}"`);
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'No se pudo registrar la actividad.';
      showFeedback(msg);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRedeem(item: RedemptionCatalogItem) {
    if (!profile || !balance) return;
    if (balance.balance < item.pointsCost) {
      showFeedback(`Necesitas ${item.pointsCost} puntos — tienes ${balance.balance}.`);
      return;
    }

    setActionLoading(item.id);
    try {
      const result = await api.redemptions.redeem({
        youngId: profile.id,
        catalogItemId: item.id,
      });
      setBalance((prev) =>
        prev
          ? {
              ...prev,
              balance: result.newBalance,
              history: [
                {
                  id: result.redemptionId,
                  type: 'redeemed',
                  amount: result.pointsSpent,
                  description: `Canje: ${result.partner}`,
                  createdAt: new Date().toISOString(),
                },
                ...prev.history,
              ],
            }
          : null,
      );
      setVoucher(result.voucherCode);
      showFeedback(`Canje exitoso en ${result.partner}`);
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'No se pudo completar el canje.';
      showFeedback(msg);
    } finally {
      setActionLoading(null);
    }
  }

  if (!profile) {
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">CivicCoins</h1>
        <div
          className="rounded-xl px-4 py-3 text-sm border"
          style={{
            backgroundColor: 'var(--rjb-surface)',
            borderColor: 'var(--rjb-warning)',
          }}
        >
          <p className="mb-2">Completa tu perfil para ver tu saldo y canjear recompensas.</p>
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
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">CivicCoins</h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
        Gana puntos en actividades sociales y canjealos con aliados de Cartagena.
      </p>

      {feedback && (
        <div
          className="mb-4 rounded-lg px-4 py-2 text-sm"
          style={{ backgroundColor: 'var(--rjb-surface-2)', color: 'var(--rjb-accent)' }}
        >
          {feedback}
        </div>
      )}

      {voucher && (
        <div
          className="mb-4 rounded-xl px-4 py-3 border text-center"
          style={{
            backgroundColor: 'var(--rjb-surface)',
            borderColor: 'var(--rjb-success)',
          }}
        >
          <p className="text-sm mb-1" style={{ color: 'var(--rjb-text-muted)' }}>
            Tu codigo de canje
          </p>
          <p className="text-2xl font-extrabold tracking-widest" style={{ color: 'var(--rjb-success)' }}>
            {voucher}
          </p>
        </div>
      )}

      {loading && <LoadingSpinner label="Cargando billetera..." />}

      {!loading && error && <ErrorMessage message={error} onRetry={() => void loadData()} />}

      {!loading && !error && balance && (
        <div className="flex flex-col gap-8">
          <div
            className="rounded-2xl p-6 border text-center"
            style={{
              backgroundColor: 'var(--rjb-surface)',
              borderColor: 'var(--rjb-border)',
            }}
          >
            <p className="text-sm mb-1" style={{ color: 'var(--rjb-text-muted)' }}>
              Saldo de {profile.name}
            </p>
            <p className="text-5xl font-extrabold" style={{ color: 'var(--rjb-accent)' }}>
              {balance.balance}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--rjb-text-muted)' }}>
              CivicCoins
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">Actividades sugeridas</h2>
            {activities.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
                No hay actividades disponibles por ahora.
              </p>
            ) : (
              <div className="grid gap-3">
                {activities.map((activity) => (
                  <article
                    key={activity.id}
                    className="rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    style={{
                      backgroundColor: 'var(--rjb-surface)',
                      borderColor: 'var(--rjb-border)',
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{activity.title}</h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: 'var(--rjb-surface-2)',
                            color: 'var(--rjb-accent)',
                          }}
                        >
                          {activity.affinityScore}% afinidad
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
                        {activity.description}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--rjb-text-muted)' }}>
                        {activity.barrio} · +{activity.pointsReward} pts
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleEarn(activity)}
                      disabled={actionLoading === activity.id}
                      className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--rjb-primary)',
                        color: 'var(--rjb-bg)',
                      }}
                    >
                      {actionLoading === activity.id ? 'Registrando...' : 'Completar'}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">Catalogo de canje</h2>
            {catalog.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
                El catalogo esta vacio.
              </p>
            ) : (
              <div className="grid gap-3">
                {catalog.map((item) => {
                  const canAfford = balance.balance >= item.pointsCost;
                  return (
                    <article
                      key={item.id}
                      className="rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      style={{
                        backgroundColor: 'var(--rjb-surface)',
                        borderColor: canAfford ? 'var(--rjb-border)' : 'var(--rjb-surface-2)',
                        opacity: canAfford ? 1 : 0.7,
                      }}
                    >
                      <div>
                        <h3 className="font-bold">{item.partner}</h3>
                        <p className="text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
                          {item.description}
                        </p>
                        <p className="text-sm mt-1 font-semibold" style={{ color: 'var(--rjb-accent)' }}>
                          {item.pointsCost} CivicCoins
                          {item.discount != null && (
                            <span className="ml-2 font-normal" style={{ color: 'var(--rjb-success)' }}>
                              ({item.discount}% dto.)
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleRedeem(item)}
                        disabled={!canAfford || actionLoading === item.id}
                        className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: canAfford ? 'var(--rjb-accent)' : 'var(--rjb-surface-2)',
                          color: canAfford ? 'var(--rjb-bg)' : 'var(--rjb-text-muted)',
                        }}
                      >
                        {actionLoading === item.id ? 'Canjeando...' : 'Canjear'}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {balance.history.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">Historial</h2>
              <ul className="grid gap-2">
                {balance.history.map((tx) => (
                  <li
                    key={tx.id}
                    className="rounded-lg px-4 py-3 flex justify-between items-center text-sm border"
                    style={{
                      backgroundColor: 'var(--rjb-surface)',
                      borderColor: 'var(--rjb-border)',
                    }}
                  >
                    <span style={{ color: 'var(--rjb-text-muted)' }}>{tx.description}</span>
                    <span
                      className="font-bold shrink-0 ml-3"
                      style={{
                        color: tx.type === 'earned' ? 'var(--rjb-success)' : 'var(--rjb-warning)',
                      }}
                    >
                      {tx.type === 'earned' ? '+' : '-'}
                      {tx.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
