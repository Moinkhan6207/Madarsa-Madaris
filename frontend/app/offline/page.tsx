export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Offline Mode</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">You are currently offline</h1>
        <p className="mt-4 text-sm text-slate-600">
          Cached pages and saved form submissions are still available. Your pending form data will sync automatically when your connection returns.
        </p>
      </div>
    </main>
  );
}
