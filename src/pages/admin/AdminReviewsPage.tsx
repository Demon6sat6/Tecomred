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
    const approved = (r as any).approved ?? true;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'approved' ? approved : !approved);
    return matchSearch && matchRating && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">Resenas</h2>
        <p className="text-gray-500 text-sm">
          {reviews.length} resenas total - {reviews.filter(r => (r as any).approved !== false).length} aprobadas
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar resena..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500/60" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-500" /></button>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'approved', 'pending'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${filterStatus === s ? 'gradient-brand text-white border-transparent' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
              {s === 'all' ? 'Todas' : s === 'approved' ? 'Aprobadas' : 'Pendientes'}
            </button>
          ))}
          {[5, 4, 3, 2, 1].map(r => (
            <button key={r} onClick={() => setFilterRating(filterRating === r ? 0 : r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${filterRating === r ? 'gradient-brand text-white border-transparent' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
              {r}*
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map(review => {
          const product = products.find(p => p.id === review.productId);
          const approved = (review as any).approved ?? true;
          return (
            <div key={review.id} className={`glass rounded-2xl p-4 sm:p-5 border ${approved ? 'border-white/8' : 'border-yellow-500/20'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {review.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-white font-semibold text-sm">{review.author}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-3 h-3" /> Verificada
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${approved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {approved ? 'Aprobada' : 'Pendiente'}
                      </span>
                      <span className="text-gray-500 text-xs">{review.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
                      ))}
                    </div>
                    <p className="text-white text-sm font-semibold mb-1">{review.title}</p>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{review.body}</p>
                    {product && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/8">
                        <img src={product.image} alt={product.name} className="w-6 h-6 rounded object-cover" />
                        <span className="text-gray-500 text-xs truncate">{product.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => approveReview(review.id)}
                    className={`p-1.5 rounded-lg transition-colors ${approved ? 'text-emerald-400 hover:text-yellow-400 hover:bg-yellow-500/15' : 'text-yellow-400 hover:text-emerald-400 hover:bg-emerald-500/15'}`}
                    title={approved ? 'Rechazar' : 'Aprobar'}>
                    {approved ? <ThumbsDown className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
                  </button>
                  {confirmDelete === review.id ? (
                    <div className="flex flex-col items-end gap-1">
                      <button onClick={() => { deleteReview(review.id); setConfirmDelete(null); }} className="text-xs text-red-400 hover:text-red-300 font-semibold">Si</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-500 hover:text-gray-300">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(review.id)} className="p-1.5 rounded-lg hover:bg-red-500/15 text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 glass rounded-2xl">
            <Star className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No se encontraron resenas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
