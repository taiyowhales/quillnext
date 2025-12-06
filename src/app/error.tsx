"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-qc-parchment">
      <div className="mx-auto max-w-md rounded-qc-lg bg-white p-8 shadow-[0_10px_30px_rgba(10,8,6,0.12)]">
        <h2 className="font-display text-2xl font-bold text-qc-error">
          Something went wrong!
        </h2>
        <p className="mt-4 font-body text-qc-text-muted">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-qc-md bg-qc-primary px-4 py-2 font-body text-white transition-colors hover:bg-opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

