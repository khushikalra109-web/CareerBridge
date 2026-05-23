function Loader() {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-3xl bg-white/80 p-10 shadow-soft">
      <div className="flex items-center gap-3 text-slate-600">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-sky-500" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

export default Loader;
