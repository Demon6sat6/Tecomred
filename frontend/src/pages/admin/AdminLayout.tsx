import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Wifi, LayoutDashboard, Package, ShoppingBag,
  LogOut, Menu, X, ChevronRight, Bell, Settings,
  Users, Tag, Star, FolderOpen, BarChart2,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const navItems = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/analytics',  icon: BarChart2,        label: 'Analytics' },
  { to: '/admin/productos',  icon: Package,          label: 'Productos' },
  { to: '/admin/categorias', icon: FolderOpen,       label: 'Categorías' },
  { to: '/admin/pedidos',    icon: ShoppingBag,      label: 'Pedidos' },
  { to: '/admin/clientes',   icon: Users,            label: 'Clientes' },
  { to: '/admin/resenas',    icon: Star,             label: 'Reseñas' },
  { to: '/admin/cupones',    icon: Tag,              label: 'Cupones' },
  { to: '/admin/ajustes',    icon: Settings,         label: 'Ajustes' },
];

function Sidebar({ mobile = false, onLogout, pendingOrders }: {
  mobile?: boolean;
  onLogout: () => void;
  pendingOrders: number;
}) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Wifi className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-extrabold text-base leading-none">TecomRed</p>
          <p className="text-gray-500 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'gradient-brand text-white shadow-lg shadow-sky-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
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
      <div className="px-3 py-4 border-t border-white/8">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-1"
        >
          <Wifi className="w-4 h-4" />
          Ver tienda
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
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

  const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;

  const handleLogout = () => { logout(); navigate('/admin'); };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-gray-900/60 border-r border-white/8 fixed h-full z-30">
        <Sidebar onLogout={handleLogout} pendingOrders={pendingOrders} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-gray-900 border-r border-white/8 flex flex-col z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar mobile onLogout={handleLogout} pendingOrders={pendingOrders} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur-xl border-b border-white/8 px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/8 text-gray-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-white font-semibold text-sm sm:text-base">
              {navItems.find(n => n.to === location.pathname)?.label ?? 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {pendingOrders > 0 && (
              <Link to="/admin/pedidos" className="relative p-2 rounded-lg hover:bg-white/8 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {pendingOrders}
                </span>
              </Link>
            )}
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
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