/**
 * ErrorMessage — shown when an API call fails.
 * Accepts `message` and an optional `onRetry` callback.
 */
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-900/40 border border-rose-800">
        <svg
          className="w-5 h-5 text-rose-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>
      <p className="text-sm text-rose-400 max-w-xs">
        {message ?? 'Something went wrong. Please try again.'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost text-xs mt-1">
          ↺ Retry
        </button>
      )}
    </div>
  );
}
