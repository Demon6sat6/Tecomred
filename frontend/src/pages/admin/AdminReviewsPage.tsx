import { useState } from 'react';
import { BadgeCheck, Clock, MessageSquare, Star, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { adminAlert } from '../../utils/adminAlerts';
import { Badge, EmptyState, PageHeader, SearchInput, Segmented, StatCard } from '../../components/admin/AdminUI';
import { initials } from '../../utils/adminFormat';

type StatusFilter = 'all' | 'approved' | 'pending';
type RatingFilter = '0' | '5' | '4' | '3' | '2' | '1';

function Stars({ rating }: { rating: number }) {
  return <span className="flex gap-0.5" aria-label={`${rating} de 5 estrellas`}>{[1, 2, 3, 4, 5].map(index => <Star key={index} className={`h-3.5 w-3.5 ${index <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />)}</span>;
}

export default function AdminReviews() {
  const { reviews, deleteReview, approveReview, products } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState<RatingFilter>('0');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [busy, setBusy] = useState<number | null>(null);

  const productById = new Map(products.map(product => [product.id, product]));
  const isApproved = (approved?: boolean) => approved ?? true;
  const approvedCount = reviews.filter(review => isApproved(review.approved)).length;
  const pendingCount = reviews.length - approvedCount;
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const term = search.trim().toLocaleLowerCase('es');
  const filtered = reviews.filter(review => {
    const product = productById.get(review.productId);
    const matchSearch = !term || `${review.author} ${review.title} ${review.body} ${product?.name ?? ''}`.toLocaleLowerCase('es').includes(term);
    const matchRating = filterRating === '0' || review.rating === Number(filterRating);
    const approved = isApproved(review.approved);
    const matchStatus = filterStatus === 'all' || (filterStatus === 'approved' ? approved : !approved);
    return matchSearch && matchRating && matchStatus;
  });

  const toggleApproval = async (id: number, approved: boolean) => {
    setBusy(id);
    try {
      await approveReview(id);
      void adminAlert.toast(approved ? 'Reseña ocultada de la tienda' : 'Reseña aprobada y publicada');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo actualizar la reseña');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (id: number, author: string) => {
    if (!await adminAlert.confirmDelete('¿Eliminar reseña?', `La reseña de ${author} se eliminará y dejará de mostrarse en la tienda.`)) return;
    try {
      await deleteReview(id);
      void adminAlert.success('Reseña eliminada');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo eliminar la reseña');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Reseñas" description="Modera las opiniones de los compradores antes de mostrarlas en la tienda." />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Reseñas" value={reviews.length} icon={MessageSquare} tone="blue" />
        <StatCard label="Pendientes" value={pendingCount} icon={Clock} tone={pendingCount ? 'amber' : 'slate'} detail="Esperan moderación" />
        <StatCard label="Aprobadas" value={approvedCount} icon={ThumbsUp} tone="green" />
        <StatCard label="Calificación media" value={average ? average.toFixed(1) : '—'} icon={Star} tone="violet" detail={average ? <Stars rating={Math.round(average)} /> : 'Sin calificaciones'} />
      </section>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          <Segmented label="Filtrar por estado" value={filterStatus} onChange={setFilterStatus} options={[
            { value: 'all', label: 'Todas', count: reviews.length },
            { value: 'pending', label: 'Pendientes', count: pendingCount },
            { value: 'approved', label: 'Aprobadas', count: approvedCount },
          ]} />
          <Segmented label="Filtrar por estrellas" value={filterRating} onChange={setFilterRating} options={[
            { value: '0', label: 'Todas ★' }, ...(['5', '4', '3', '2', '1'] as const).map(value => ({ value, label: `${value} ★` })),
          ]} />
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por cliente, título o producto" className="xl:w-80" />
      </div>

      {filtered.length === 0 ? <div className="admin-card"><EmptyState icon={Star} title={reviews.length ? 'Sin resultados' : 'Aún no hay reseñas'} text={reviews.length ? 'No hay reseñas con los filtros seleccionados.' : 'Las opiniones de los clientes aparecerán aquí.'} /></div> : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map(review => {
            const product = productById.get(review.productId);
            const approved = isApproved(review.approved);
            return (
              <article key={review.id} className={`admin-card flex flex-col p-5 ${approved ? '' : '!border-amber-300 ring-1 ring-amber-100'}`}>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0052cc] to-[#3b82f6] text-xs font-bold text-white">{review.avatar || initials(review.author)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-bold text-slate-900">{review.author}</span>
                      {review.verified && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" /> Compra verificada</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-2"><Stars rating={review.rating} /><span className="text-[11px] text-slate-400">{review.date}</span></div>
                  </div>
                  <Badge tone={approved ? 'green' : 'amber'}>{approved ? 'Publicada' : 'Pendiente'}</Badge>
                </div>
                <h4 className="mt-3 text-sm font-bold text-slate-900">{review.title}</h4>
                <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-slate-600">{review.body}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  {product ? <span className="flex min-w-0 items-center gap-2"><img src={product.image} alt="" className="h-7 w-7 rounded border border-slate-200 bg-white object-contain p-0.5" /><span className="truncate text-xs font-medium text-slate-500">{product.name}</span></span> : <span className="text-xs text-slate-400">Producto no disponible</span>}
                  <div className="flex shrink-0 gap-1.5">
                    <button onClick={() => void toggleApproval(review.id, approved)} disabled={busy === review.id} className={`admin-btn admin-btn-sm ${approved ? 'admin-btn-secondary' : 'admin-btn-primary'}`}>
                      {approved ? <><ThumbsDown className="h-3.5 w-3.5" /> Ocultar</> : <><ThumbsUp className="h-3.5 w-3.5" /> Aprobar</>}
                    </button>
                    <button onClick={() => void handleDelete(review.id, review.author)} className="admin-action admin-action-danger" aria-label={`Eliminar reseña de ${review.author}`} title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
