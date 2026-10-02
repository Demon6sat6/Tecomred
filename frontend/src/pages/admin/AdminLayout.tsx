import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, BarChart3, ChevronDown, ChevronsLeft, FolderOpen, Home, ImageIcon,
  LogOut, Megaphone, Menu, Package, RefreshCw, Settings, ShieldCheck, ShoppingCart,
  Star, Store, Tag, Users, Warehouse, X, type LucideIcon,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { adminAlert } from '../../utils/adminAlerts';
import { LiveStatus } from '../../components/admin/AdminUI';

type NavItem = { to: string; label: string; icon: LucideIcon };

const navGroups: { title: string; items: NavItem[] }[] = [
  { title: 'General', items: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { to: '/admin/pedidos', label: 'Órdenes', icon: ShoppingCart },
    { to: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  ] },
  { title: 'Catálogo', items: [
    { to: '/admin/productos', label: 'Productos', icon: Package },
    { to: '/admin/categorias', label: 'Categorías y marcas', icon: FolderOpen },
    { to: '/admin/inventario', label: 'Inventario', icon: Warehouse },
    { to: '/admin/medios', label: 'Biblioteca de medios', icon: ImageIcon },
  ] },
  { title: 'Clientes y ventas', items: [
    { to: '/admin/clientes', label: 'Clientes', icon: Users },
    { to: '/admin/promociones', label: 'Promociones', icon: Tag },
    { to: '/admin/resenas', label: 'Reseñas', icon: Star },
    { to: '/admin/marketing', label: 'Marketing', icon: Megaphone },
  ] },
  { title: 'Sistema', items: [
    { to: '/admin/administradores', label: 'Administradores', icon: ShieldCheck },
    { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
  ] },
];

const allNavItems = navGroups.flatMap(group => group.items);

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return collapsed ? <span className="text-xl font-black tracking-tight text-[#0052cc]">S<span className="text-[#35a324]">R</span></span> : (
    <span className="leading-none">
      <span className="block text-[23px] font-black tracking-[-.06em] text-[#0052cc]">SISCOM<span className="text-[#35a324]">RED</span></span>
      <span className="mt-1 block text-[9.5px] font-bold tracking-[.2em] text-slate-400">PANEL DE ADMINISTRACIÓN</span>
    </span>
  );
}

const isActivePath = (pathname: string, to: string) =>
  pathname === to || pathname.startsWith(`${to}/`) ||
  (to === '/admin/configuracion' && pathname === '/admin/ajustes') ||
  (to === '/admin/promociones' && pathname === '/admin/cupones');

export default function AdminLayout() {
  const { logout, orders, products, customers, reviews, isSettingsLoading, isSavingSettings, settingsError, productsError, ordersError, adminRecordsError, refreshAll, isDataLoading } = useAdmin();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem('admin_sidebar_collapsed') === '1'; } catch { return false; } });
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pendingOrders = orders.filter(order => order.status === 'Pendiente').length;
  const pendingReviews = reviews.filter(review => review.approved === false).length;
  const lowStock = products.filter(product => product.stock <= 5).length;
  const badges: Record<string, number> = { '/admin/pedidos': pendingOrders, '/admin/resenas': pendingReviews, '/admin/inventario': lowStock };
  const query = search.trim().toLocaleLowerCase('es');
  const current = allNavItems.find(item => isActivePath(pathname, item.to));

  useEffect(() => { try { localStorage.setItem('admin_sidebar_collapsed', collapsed ? '1' : '0'); } catch { /* preferencia opcional */ } }, [collapsed]);
  // Cierra menús al cambiar de página (ajuste durante el render, sin efecto).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) { setLastPath(pathname); setMobileOpen(false); setProfileOpen(false); }
  useEffect(() => { document.title = `${current?.label ?? 'Panel'} · SISCOMRED Admin`; }, [current]);

  // Avisa de pedidos que llegan desde la tienda mientras el panel está abierto.
  const knownOrderIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (isDataLoading) return;
    const ids = new Set(orders.map(order => order.id));
    if (knownOrderIds.current) {
      const fresh = orders.filter(order => !knownOrderIds.current?.has(order.id));
      if (fresh.length === 1) void adminAlert.toast(`Nuevo pedido ${fresh[0].id} de ${fresh[0].customer}`, 'info');
      else if (fresh.length > 1) void adminAlert.toast(`${fresh.length} pedidos nuevos`, 'info');
    }
    knownOrderIds.current = ids;
  }, [orders, isDataLoading]);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    return [
      ...orders.filter(order => `${order.id} ${order.customer} ${order.email}`.toLocaleLowerCase('es').includes(query)).slice(0, 3).map(order => ({ label: order.id, detail: order.customer, to: `/admin/pedidos?search=${encodeURIComponent(order.id)}`, type: 'Orden' })),
      ...products.filter(product => product.name.toLocaleLowerCase('es').includes(query)).slice(0, 4).map(product => ({ label: product.name, detail: product.category, to: `/admin/productos?search=${encodeURIComponent(product.name)}`, type: 'Producto' })),
      ...customers.filter(customer => `${customer.name} ${customer.email}`.toLocaleLowerCase('es').includes(query)).slice(0, 3).map(customer => ({ label: customer.name, detail: customer.email, to: `/admin/clientes?search=${encodeURIComponent(customer.email)}`, type: 'Cliente' })),
    ];
  }, [query, orders, products, customers]);

  const sidebarWidth = collapsed ? 'lg:w-[76px]' : 'lg:w-[264px]';
  const mainOffset = collapsed ? 'lg:ml-[76px]' : 'lg:ml-[264px]';
  const showLabels = !collapsed || mobileOpen;

  const goToResult = (to: string) => { navigate(to); setSearch(''); setSearchOpen(false); };
  const submitSearch = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (results[0]) goToResult(results[0].to);
    else if (query) goToResult(`/admin/productos?search=${encodeURIComponent(search.trim())}`);
  };
  const handleLogout = async () => {
    setProfileOpen(false);
    if (!await adminAlert.confirm('¿Cerrar sesión?', 'Saldrás del panel de administración en este navegador.', 'Cerrar sesión')) return;
    logout();
    navigate('/cuenta');
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAll();
      void adminAlert.toast('Datos actualizados');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="admin-shell min-h-dvh" data-theme="light" data-admin>
      {mobileOpen && <button className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" />}
      <aside className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col transition-[transform,width] duration-200 lg:translate-x-0 ${sidebarWidth} ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="admin-brand relative flex h-16 shrink-0 items-center px-5">
          <Link to="/admin/dashboard" className={`min-w-0 overflow-hidden ${showLabels ? '' : 'mx-auto'}`} aria-label="Ir al dashboard"><Brand collapsed={!showLabels} /></Link>
          <button className="admin-icon-button absolute right-3 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú"><X className="h-5 w-5" /></button>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4" aria-label="Navegación del panel">
          {navGroups.map(group => (
            <div key={group.title}>
              {showLabels ? <p className="admin-nav-section">{group.title}</p> : <div className="mx-3 my-3 border-t border-slate-100" />}
              <div className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon }) => {
                  const active = isActivePath(pathname, to);
                  const badge = badges[to] ?? 0;
                  return (
                    <Link key={to} to={to} aria-current={active ? 'page' : undefined} title={showLabels ? undefined : label}
                      className={`admin-nav-link flex items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium ${showLabels ? '' : 'justify-center'} ${active ? 'admin-nav-link-active' : ''}`}>
                      <span className="relative">
                        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.3 : 1.9} />
                        {!showLabels && badge > 0 && <span className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />}
                      </span>
                      {showLabels && <span className="truncate">{label}</span>}
                      {showLabels && badge > 0 && <span className={`tabular ml-auto rounded-full px-1.5 py-px text-[10.5px] font-bold ${to === '/admin/inventario' ? 'bg-amber-100 text-amber-800' : 'bg-rose-500 text-white'}`}>{badge}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="space-y-1 border-t border-slate-100 px-2.5 py-2.5">
          <a href="/" target="_blank" rel="noopener noreferrer" title={showLabels ? undefined : 'Ver tienda'} className={`admin-nav-link flex items-center gap-3 rounded-lg px-3 text-[13.5px] ${showLabels ? '' : 'justify-center'}`}><Store className="h-[18px] w-[18px] shrink-0" />{showLabels && 'Ver tienda'}</a>
          <button onClick={() => setCollapsed(value => !value)} className={`admin-nav-link hidden w-full items-center gap-3 rounded-lg px-3 text-[13.5px] lg:flex ${showLabels ? '' : 'justify-center'}`} aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}>
            <ChevronsLeft className={`h-[18px] w-[18px] shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`} />{showLabels && 'Contraer menú'}
          </button>
        </div>
      </aside>

      <div className={`min-w-0 transition-[margin] duration-200 ${mainOffset}`}>
        <header className="admin-topbar sticky top-0 z-30 flex h-16 items-center gap-3 px-4 lg:px-6">
          <button className="admin-icon-button lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menú" aria-expanded={mobileOpen}><Menu className="h-5 w-5" /></button>
          <div className="hidden min-w-0 lg:block">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">Panel</p>
            <p className="truncate text-sm font-bold text-slate-900">{current?.label ?? 'Administración'}</p>
          </div>
          <span className="lg:hidden"><Brand /></span>
          <form onSubmit={submitSearch} className="relative mx-auto hidden w-full max-w-[520px] min-w-0 flex-1 md:block" role="search">
            <label className="admin-search block">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input value={search} maxLength={80} onChange={event => { setSearch(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)} onKeyDown={event => { if (event.key === 'Escape') { setSearch(''); setSearchOpen(false); } }} placeholder="Buscar órdenes, productos, clientes…" aria-label="Buscar en el panel" className="admin-input !min-h-[38px] !bg-slate-50" />
            </label>
            {searchOpen && query.length >= 2 && <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              {results.length ? results.map(result => <button type="button" key={`${result.type}-${result.to}`} onMouseDown={event => event.preventDefault()} onClick={() => goToResult(result.to)} className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-2.5 text-left last:border-0 hover:bg-blue-50"><span className="w-16 text-[10px] font-bold uppercase tracking-wide text-blue-600">{result.type}</span><span className="min-w-0 truncate text-sm font-semibold text-slate-800">{result.label}</span><span className="ml-auto max-w-32 truncate text-xs text-slate-500">{result.detail}</span></button>) : <p className="px-4 py-3 text-sm text-slate-500">Sin coincidencias. Pulsa Enter para buscar en productos.</p>}
            </div>}
          </form>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <span className="hidden xl:inline-flex"><LiveStatus /></span>
            <button onClick={() => void handleRefresh()} disabled={refreshing} className="admin-icon-button" aria-label="Actualizar datos" title="Actualizar datos"><RefreshCw className={`h-[18px] w-[18px] ${refreshing ? 'animate-spin' : ''}`} /></button>
            <Link to="/admin/pedidos?status=Pendiente" className="admin-icon-button relative" aria-label={`${pendingOrders} órdenes pendientes`} title="Órdenes pendientes"><Bell className="h-[18px] w-[18px]" />{pendingOrders > 0 && <span className="tabular absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">{pendingOrders}</span>}</Link>
            <span className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />
            <div className="relative">
              <button onClick={() => setProfileOpen(value => !value)} aria-expanded={profileOpen} aria-haspopup="menu" className="flex items-center gap-2 rounded-xl p-1 pr-2 text-left hover:bg-slate-50">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#0052cc] to-[#2f9e1f] text-sm font-black text-white">A</span>
                <span className="hidden leading-tight md:block"><span className="block text-xs font-bold text-slate-900">Administrador</span><span className="block text-[11px] text-slate-500">SISCOMRED</span></span>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>
              {profileOpen && <>
                <button className="fixed inset-0 z-40 cursor-default" aria-hidden="true" tabIndex={-1} onClick={() => setProfileOpen(false)} />
                <div role="menu" className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
                  <Link role="menuitem" to="/admin/administradores" className="admin-menu-item"><ShieldCheck className="h-4 w-4" />Administradores</Link>
                  <Link role="menuitem" to="/admin/configuracion" className="admin-menu-item"><Settings className="h-4 w-4" />Configuración</Link>
                  <a role="menuitem" href="/" target="_blank" rel="noopener noreferrer" className="admin-menu-item"><Store className="h-4 w-4" />Ver tienda</a>
                  <div className="my-1 border-t border-slate-100" />
                  <button role="menuitem" onClick={() => void handleLogout()} className="admin-menu-item w-full text-rose-600"><LogOut className="h-4 w-4" />Cerrar sesión</button>
                </div>
              </>}
            </div>
          </div>
        </header>
        <main className="admin-page mx-auto w-full max-w-[1560px] px-4 py-6 sm:px-5 lg:px-8">
          {settingsError && <p role="alert" className="admin-alert admin-alert-error mb-4">{settingsError}</p>}
          {[productsError, ordersError, adminRecordsError].filter(Boolean).map(error => <p key={error} role="alert" className="admin-alert mb-4">{error}. Revisa la conexión con el servidor; se reintentará automáticamente.</p>)}
          {isSettingsLoading
            ? <div className="space-y-4" role="status" aria-label="Cargando panel"><div className="admin-skeleton h-8 w-56" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(index => <div key={index} className="admin-skeleton h-28" />)}</div><div className="admin-skeleton h-72" /></div>
            : <fieldset disabled={isSavingSettings} className="min-w-0"><Outlet /></fieldset>}
        </main>
      </div>
    </div>
  );
}
