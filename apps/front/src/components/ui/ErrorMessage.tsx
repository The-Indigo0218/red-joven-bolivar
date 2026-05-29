interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm border"
      style={{
        backgroundColor: 'var(--rjb-surface)',
        borderColor: 'var(--rjb-warning)',
        color: 'var(--rjb-text)',
      }}
      role="alert"
    >
      <p className="mb-2">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-semibold underline"
          style={{ color: 'var(--rjb-primary)' }}
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
