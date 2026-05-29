// Navegación entre las 3 pantallas MVP. Sin react-router: estado local en App.

export type View = 'onboarding' | 'feed' | 'dashboard';

interface NavItem {
  view: View;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'onboarding', label: 'Mi perfil' },
  { view: 'feed', label: 'Oportunidades' },
  { view: 'dashboard', label: 'Demanda' },
];

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  return (
    <nav
      className="flex items-center justify-between px-6 py-4 border-b"
      style={{
        backgroundColor: 'var(--rjb-surface)',
        borderColor: 'var(--rjb-border)',
      }}
    >
      <span
        className="text-xl font-extrabold"
        style={{ color: 'var(--rjb-primary)', fontFamily: "'Syne', sans-serif" }}
      >
        Red Joven Bolívar
      </span>

      <div className="flex gap-2">
        {NAV_ITEMS.map((item) => {
          const active = item.view === currentView;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
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
