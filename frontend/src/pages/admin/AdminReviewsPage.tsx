import { useState } from 'react';
import { Trash2, Search, X, Star, BadgeCheck, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminReviews() {
  const { reviews, deleteReview, approveReview, products } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const filtered = reviews.filter(r => {
    const product = products.find(p => p.id === r.productId);
    const matchSearch =
      r.author.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (product?.name.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchRating = filterRating === 0 || r.rating === filterRating;
    const approved = r.approved ?? true;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'approved' ? approved : !approved);
    return matchSearch && matchRating && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Reseñas y Valoraciones</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          {reviews.length} opiniones registradas · {reviews.filter(r => r.approved !== false).length} aprobadas para mostrar en la tienda
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, título o producto..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {(['all', 'approved', 'pending'] as const).map(s => {
            const isActive = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isActive
                    ? 'gradient-brand text-white border-transparent shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s === 'all' ? 'Todas' : s === 'approved' ? 'Aprobadas' : 'Pendientes'}
              </button>
            );
          })}
          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />
          {[5, 4, 3, 2, 1].map(r => (
            <button
              key={r}
              onClick={() => setFilterRating(filterRating === r ? 0 : r)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                filterRating === r
                  ? 'bg-amber-500 text-white border-transparent'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              ★ {r}
            </button>
          ))}
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-3">
        {filtered.map(review => {
          const product = products.find(p => p.id === review.productId);
          const approved = review.approved ?? true;
          return (
            <div
              key={review.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-xs transition-all ${
                approved ? 'border-slate-200' : 'border-amber-300 bg-amber-50/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                    {review.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-slate-900 font-bold text-sm">{review.author}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-3.5 h-3.5" /> Compra Verificada
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        approved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {approved ? 'Aprobada' : 'Pendiente de moderación'}
                      </span>
                      <span className="text-slate-400 text-xs">{review.date}</span>
                    </div>

                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                        />
                      ))}
                    </div>

                    <p className="text-slate-900 text-sm font-bold mb-1">{review.title}</p>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{review.body}</p>

                    {product && (
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                        <img src={product.image} alt={product.name} className="w-6 h-6 rounded object-contain bg-slate-50 border border-slate-100 p-0.5" />
                        <span className="text-slate-500 text-xs font-semibold truncate">{product.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => approveReview(review.id)}
                    className={`p-2 rounded-xl border transition-colors ${
                      approved
                        ? 'border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    title={approved ? 'Ocultar / Desaprobar' : 'Aprobar reseña'}
                  >
                    {approved ? <ThumbsDown className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
                  </button>
                  {confirmDelete === review.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-1">
                      <button
                        onClick={() => { deleteReview(review.id); setConfirmDelete(null); }}
                        className="text-xs bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold hover:bg-rose-700"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-slate-500 hover:text-slate-700 px-1"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(review.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Eliminar reseña"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No se encontraron reseñas con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
