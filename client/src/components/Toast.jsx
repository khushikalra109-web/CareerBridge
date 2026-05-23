export function Toast({ show, type, message }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-xl shadow-slate-200/40">
      <div className="flex items-start gap-3">
        <div className={`mt-1 h-3 w-3 rounded-full ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} />
        <div>
          <p className="font-semibold text-slate-900">{type === 'error' ? 'Error' : 'Success'}</p>
          <p className="mt-1 text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  );
}
