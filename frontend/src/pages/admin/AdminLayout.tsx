import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag,
  LogOut, Menu, X, ChevronRight, Bell, Settings,
  Users, Tag, Star, FolderOpen, BarChart2, ImageIcon,
  UserCog,
  Sun, Moon, Store,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const navItems = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Panel' },
  { to: '/admin/analytics',  icon: BarChart2,        label: 'Analíticas' },
  { to: '/admin/productos',  icon: Package,          label: 'Productos' },
  { to: '/admin/medios',     icon: ImageIcon,        label: 'Medios' },
  { to: '/admin/categorias', icon: FolderOpen,       label: 'Categorías' },
  { to: '/admin/pedidos',    icon: ShoppingBag,      label: 'Pedidos' },
  { to: '/admin/clientes',   icon: Users,            label: 'Clientes' },
  { to: '/admin/administradores', icon: UserCog,     label: 'Administradores' },
  { to: '/admin/resenas',    icon: Star,             label: 'Reseñas' },
  { to: '/admin/cupones',    icon: Tag,              label: 'Cupones' },
  { to: '/admin/ajustes',    icon: Settings,         label: 'Ajustes' },
];

function Sidebar({ light, onLogout, pendingOrders }: {
  light: boolean;
  mobile?: boolean;
  onLogout: () => void;
  pendingOrders: number;
}) {
  const location = useLocation();
  const bg = light ? 'bg-white border-slate-200' : 'bg-gray-900/60 border-white/8';
  const textMuted = light ? 'text-slate-500' : 'text-gray-500';

  return (
    <div className={`flex flex-col h-full border-r ${bg}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b ${light ? 'border-slate-100' : 'border-white/8'}`}>
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-violet-500/25">
          <img src="/favicon.svg" alt="TecomRed" className="w-5 h-5" />
        </div>
        <div>
          <p className={`font-extrabold text-base leading-none ${light ? 'text-slate-900' : 'text-white'}`}>TecomRed</p>
          <p className={`text-xs ${textMuted}`}>Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'gradient-brand text-white shadow-lg shadow-violet-500/20'
                  : light
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {label === 'Pedidos' && pendingOrders > 0 && (
                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                  {pendingOrders}
                </span>
              )}
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`px-3 py-4 border-t ${light ? 'border-slate-100' : 'border-white/8'}`}>
        <Link
          to="/"
          target="_blank"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all mb-1 ${
            light ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Store className="w-4 h-4" />
          Ver tienda
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { logout, orders } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lightMode, setLightMode] = useState(() =>
    localStorage.getItem('admin_theme') === 'light'
  );

  const toggleTheme = () => {
    const next = !lightMode;
    setLightMode(next);
    localStorage.setItem('admin_theme', next ? 'light' : 'dark');
  };

  const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;
  const handleLogout = () => { logout(); navigate('/admin'); };

  const mainBg   = lightMode ? 'bg-slate-100' : 'bg-gray-950';
  const headerBg = lightMode ? 'bg-white/90 border-slate-200' : 'bg-gray-950/80 border-white/8';
  const titleCol = lightMode ? 'text-slate-800' : 'text-white';

  return (
    <div className={`min-h-screen ${mainBg} flex`} data-theme={lightMode ? 'light' : 'dark'}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 fixed h-full z-30">
        <Sidebar light={lightMode} onLogout={handleLogout} pendingOrders={pendingOrders} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className={`absolute top-4 right-4 p-1.5 rounded-lg ${lightMode ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-gray-400'}`}
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar light={lightMode} mobile onLogout={handleLogout} pendingOrders={pendingOrders} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className={`sticky top-0 z-20 backdrop-blur-xl border-b px-4 sm:px-6 h-14 flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-lg ${lightMode ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/8 text-gray-400'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className={`font-semibold text-sm sm:text-base ${titleCol}`}>
              {navItems.find(n => n.to === location.pathname)?.label ?? 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {pendingOrders > 0 && (
              <Link to="/admin/pedidos" className={`relative p-2 rounded-lg transition-colors ${lightMode ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/8 text-gray-400 hover:text-white'}`}>
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {pendingOrders}
                </span>
              </Link>
            )}
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${lightMode ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/8 text-gray-400 hover:text-white'}`}
              title={lightMode ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-md shadow-violet-500/20">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
