interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = 'Cargando...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
      <div
        className="h-10 w-10 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--rjb-accent)', borderTopColor: 'transparent' }}
        aria-hidden
      />
      <p className="text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
        {label}
      </p>
    </div>
  );
}
