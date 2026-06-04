import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';

const navLinks = [
  { to: '/',          label: 'Inicio' },
  { to: '/productos', label: 'Catálogo' },
  { to: '/nosotros',  label: 'Nosotros' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/ubicacion', label: 'Ubicación' },
  { to: '/contacto',  label: 'Contacto' },
];

const productCategories = [
  'Switches', 'Routers', 'Cables', 'Procesadores',
  'Memorias RAM', 'Almacenamiento', 'Access Points', 'Herramientas',
];

export default function Navbar() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', onClick), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', onClick);
    };
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10" ref={mobileMenuRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
              <img src="/favicon.svg" alt="TecomRed" className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold gradient-text tracking-tight">TecomRed</span>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(link => (
              link.to === '/productos' ? (
                <div key={link.to} className="relative group">
                  <Link
                    to="/productos"
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/productos')
                        ? 'text-violet-400 bg-violet-500/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
                  </Link>
                  <div className="absolute top-full left-0 mt-1 w-52 glass-strong rounded-2xl shadow-2xl shadow-black/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 border border-white/10">
                    <div className="px-3 py-1.5 mb-1">
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Categorías</span>
                    </div>
                    {productCategories.map(cat => (
                      <Link
                        key={cat}
                        to={`/productos?categoria=${encodeURIComponent(cat)}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-violet-400 hover:bg-white/5 transition-colors mx-1 rounded-lg"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                        {cat}
                      </Link>
                    ))}
                    <div className="border-t border-white/10 mt-1 pt-1 mx-1">
                      <Link
                        to="/productos"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-violet-400 hover:bg-white/5 transition-colors rounded-lg font-medium"
                      >
                        Ver todo el catálogo →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'text-violet-400 bg-violet-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Search + Cart + Mobile toggle */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center" role="search">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  aria-label="Buscar productos"
                  className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all w-40 focus:w-52"
                />
              </div>
            </form>

            <Link
              to="/carrito"
              className="relative p-2.5 rounded-xl hover:bg-white/8 transition-colors group"
              aria-label={`Carrito${totalItems > 0 ? `, ${totalItems} producto${totalItems !== 1 ? 's' : ''}` : ''}`}
            >
              <ShoppingCart className={`w-5 h-5 transition-colors ${totalItems > 0 ? 'text-violet-400' : 'text-gray-400 group-hover:text-gray-200'}`} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] gradient-brand rounded-full text-[10px] font-bold flex items-center justify-center text-white px-1 shadow-lg shadow-violet-500/30 animate-slide-up"
                  aria-hidden="true"
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-white/8 transition-colors"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen
                ? <X className="w-5 h-5 text-gray-300" />
                : <Menu className="w-5 h-5 text-gray-300" />
              }
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div id="mobile-menu" className="lg:hidden py-4 border-t border-white/10 space-y-1">
            <form onSubmit={handleSearch} className="mb-3" role="search">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  aria-label="Buscar productos"
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </form>

            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-violet-400 bg-violet-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-gray-600 px-3 py-1 uppercase tracking-wider font-semibold">Categorías</p>
              {productCategories.slice(0, 4).map(cat => (
                <Link
                  key={cat}
                  to={`/productos?categoria=${encodeURIComponent(cat)}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-violet-400 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                  {cat}
                </Link>
              ))}
              <Link
                to="/productos"
                className="flex items-center gap-2 px-3 py-2 text-sm text-violet-400 hover:bg-white/5 rounded-xl transition-colors font-medium mt-1"
              >
                Ver todas las categorías →
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
