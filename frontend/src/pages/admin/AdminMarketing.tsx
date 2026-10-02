import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, MessageCircle, Settings, Star, Tag, TicketPercent, Users } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';
import { PageHeader, StatCard } from '../../components/admin/AdminUI';

export default function AdminMarketing() {
  const { coupons, reviews, orders, customers, settings } = useAdmin();
  const { formatShort } = useCurrency();
  const now = new Date();
  const activeCoupons = coupons.filter(coupon => coupon.active && coupon.uses < coupon.maxUses && (!coupon.expiry || new Date(`${coupon.expiry}T23:59:59`) >= now));
  const pendingReviews = reviews.filter(review => review.approved === false).length;
  const ordersWithCoupon = orders.filter(order => order.couponCode && order.status !== 'Cancelado');
  const discountGiven = ordersWithCoupon.reduce((sum, order) => sum + (order.discount || 0), 0);
  const couponRevenue = ordersWithCoupon.reduce((sum, order) => sum + order.total, 0);
  const topCoupons = [...coupons].sort((a, b) => b.uses - a.uses).slice(0, 5);
  const maxUses = Math.max(1, ...topCoupons.map(coupon => coupon.uses));
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const modules = [
    { to: '/admin/promociones', icon: Tag, tone: 'blue', title: 'Promociones', text: `${activeCoupons.length} cupones vigentes. Crea descuentos y controla su vigencia.`, cta: 'Gestionar promociones' },
    { to: '/admin/resenas', icon: Star, tone: 'amber', title: 'Reseñas', text: `${pendingReviews} pendientes de moderación · calificación media ${average ? average.toFixed(1) : '—'}.`, cta: 'Revisar reseñas' },
    { to: '/admin/clientes', icon: Users, tone: 'green', title: 'Clientes', text: `${customers.length} clientes en el directorio para campañas y seguimiento.`, cta: 'Ver clientes' },
  ] as const;

  return (
    <div className="space-y-5">
      <PageHeader title="Marketing" description="Rendimiento de tus promociones y reputación de la tienda." />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Cupones vigentes" value={activeCoupons.length} icon={TicketPercent} tone="blue" detail={`${coupons.length} en total`} />
        <StatCard label="Pedidos con cupón" value={ordersWithCoupon.length} icon={BadgePercent} tone="green" detail={`${orders.length ? Math.round((ordersWithCoupon.length / orders.length) * 100) : 0}% de los pedidos`} />
        <StatCard label="Descuento otorgado" value={formatShort(discountGiven)} icon={Tag} tone="amber" />
        <StatCard label="Ventas con cupón" value={formatShort(couponRevenue)} icon={Star} tone="violet" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="admin-card overflow-hidden">
          <div className="admin-card-header"><div><h3 className="text-[15px]">Cupones más usados</h3><p className="text-xs text-slate-500">Canjes acumulados por código</p></div><Link to="/admin/promociones" className="text-xs font-semibold text-[#0052cc] hover:underline">Ver todos</Link></div>
          {topCoupons.length ? <ul className="space-y-4 p-5">
            {topCoupons.map(coupon => (
              <li key={coupon.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="font-mono font-bold text-slate-800">{coupon.code}</span><span className="tabular text-xs font-semibold text-slate-500">{coupon.uses} / {coupon.maxUses} usos</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0052cc]" style={{ width: `${(coupon.uses / maxUses) * 100}%` }} /></div>
              </li>
            ))}
          </ul> : <p className="px-5 py-12 text-center text-sm text-slate-500">Aún no hay cupones. <Link to="/admin/promociones" className="font-semibold text-[#0052cc]">Crea el primero</Link>.</p>}
        </section>

        <section className="admin-card flex flex-col p-5">
          <span className="admin-kpi-icon admin-tone-green"><MessageCircle className="h-5 w-5" /></span>
          <h3 className="mt-3 text-[15px]">Pedidos por WhatsApp</h3>
          <p className="mt-1 text-sm text-slate-600">Los clientes envían su carrito al número <span className="font-semibold text-slate-900">{settings.storePhone || 'sin configurar'}</span>. Mantén ese número actualizado para no perder ventas.</p>
          <Link to="/admin/configuracion" className="admin-btn admin-btn-secondary mt-5 self-start"><Settings className="h-4 w-4" /> Ir a configuración</Link>
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {modules.map(({ to, icon: Icon, tone, title, text, cta }) => (
          <Link key={to} to={to} className="admin-card group flex flex-col p-5 transition hover:border-blue-200">
            <span className={`admin-kpi-icon admin-tone-${tone}`}><Icon className="h-5 w-5" /></span>
            <h3 className="mt-4 text-[15px]">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
            <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#0052cc]">{cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </section>
    </div>
  );
}
