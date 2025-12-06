export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-qc-parchment">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-qc-border-subtle border-t-qc-primary"></div>
        <p className="mt-4 font-body text-qc-text-muted">Loading...</p>
      </div>
    </div>
  );
}

