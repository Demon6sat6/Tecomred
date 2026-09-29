export default function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse shadow-xs">
      <div className="h-48 bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-slate-200 rounded-full w-1/3" />
        <div className="h-4 bg-slate-200 rounded-full w-full" />
        <div className="h-4 bg-slate-200 rounded-full w-3/4" />
        <div className="flex gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 bg-slate-200 rounded-full" />
          ))}
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-1/3 mt-2" />
        <div className="h-10 bg-slate-200 rounded-xl mt-3" />
      </div>
    </div>
  );
}
