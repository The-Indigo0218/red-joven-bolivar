// Pantalla 2 — OpportunitiesFeed.
// Feed filtrado según el perfil del joven, con 3 tabs.
// Estructura lista para construir: el filtrado real y POST /opportunities/:id/interest van después.

import { useState } from 'react';
import type { OpportunityKind } from '../../types';
import { mockOpportunities } from '../../data/mockOpportunities';
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

export function OpportunitiesFeed() {
  const [activeTab, setActiveTab] = useState<OpportunityKind>('empleo');

  const items = mockOpportunities.filter((opp) => opp.kind === activeTab);

  return (
    <section className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-6">Oportunidades para vos</h1>

      <div className="flex gap-2 mb-6">
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

      <div className="grid gap-4">
        {items.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} />
        ))}
      </div>
    </section>
  );
}
