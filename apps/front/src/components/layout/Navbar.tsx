export type View = 'onboarding' | 'feed' | 'route' | 'dashboard' | 'civiccoins';

interface NavItem {
  view: View;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'onboarding', label: 'Mi perfil' },
  { view: 'feed', label: 'Oportunidades' },
  { view: 'civiccoins', label: 'CivicCoins' },
  { view: 'dashboard', label: 'Demanda' },
];

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  return (
    <nav
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b"
      style={{
        backgroundColor: 'var(--rjb-surface)',
        borderColor: 'var(--rjb-border)',
      }}
    >
      <span
        className="text-lg sm:text-xl font-extrabold"
        style={{ color: 'var(--rjb-primary)', fontFamily: "'Syne', sans-serif" }}
      >
        Red Joven Bolívar
      </span>

      <div className="flex flex-wrap gap-2">
        {NAV_ITEMS.map((item) => {
          const active = item.view === currentView;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
              style={{
                backgroundColor: active ? 'var(--rjb-primary)' : 'var(--rjb-surface-2)',
                color: active ? 'var(--rjb-bg)' : 'var(--rjb-text-muted)',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
