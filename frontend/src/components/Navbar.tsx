import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, ChevronDown, UserRound } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { useStore } from '../context/StoreContext';

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
  const { settings } = useAdmin();
  const { products } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Barra de progreso de lectura bajo la navbar (solo desktop)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      setSearchFocused(false);
      setMenuOpen(false);
    }
  };

  // Sugerencias en vivo mientras el usuario escribe (máximo 5)
  const suggestions = searchQuery.trim().length >= 2
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];
  const showSuggestions = suggestions.length > 0 && searchQuery.trim().length >= 2;

  return (
    <nav className="sticky top-0 z-50 bg-[#090e1a] border-b border-slate-800 shadow-lg shadow-black/40 relative" ref={mobileMenuRef}>
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 h-16 gap-1">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0 min-w-0">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform shrink-0">
              <img src="/favicon.svg" alt="TecomRed" className="w-5 h-5" />
            </div>
            <span className="text-lg sm:text-xl font-extrabold gradient-text tracking-tight truncate max-w-[105px] sm:max-w-none">{settings.storeName}</span>
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
                  <div className="absolute top-full left-0 mt-1 w-52 rounded-2xl bg-[#111827] shadow-2xl shadow-black/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 border border-sky-200/15">
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center" role="search">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                  placeholder="Buscar productos..."
                  aria-label="Buscar productos"
                  autoComplete="off"
                  className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all w-40 focus:w-56"
                />
                {showSuggestions && searchFocused && (
                  <ul className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-[#111827] border border-white/10 shadow-2xl shadow-black/60 py-1 z-50 overflow-hidden">
                    {suggestions.map(p => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onMouseDown={() => {
                            navigate(`/producto/${p.id}`);
                            setSearchQuery('');
                            setSearchFocused(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 transition-colors"
                        >
                          <img src={p.image} alt="" className="w-8 h-8 rounded-md object-cover shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-sm text-gray-200 truncate">{p.name}</span>
                            <span className="block text-xs text-gray-500">{p.category}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                    <li className="border-t border-white/10 mt-1">
                      <button
                        type="submit"
                        className="w-full px-3 py-2 text-left text-xs text-violet-400 hover:bg-white/5 font-medium"
                      >
                        Ver todos los resultados para "{searchQuery}" →
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </form>

            <Link
              to="/carrito"
              className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-white/8 active:bg-white/12 transition-colors group"
              aria-label={`Carrito${totalItems > 0 ? `, ${totalItems} producto${totalItems !== 1 ? 's' : ''}` : ''}`}
            >
              <ShoppingCart className={`w-5 h-5 transition-colors ${totalItems > 0 ? 'text-violet-400' : 'text-gray-400 group-hover:text-gray-200'}`} />
              {totalItems > 0 && (
                <span
                  className="absolute top-1 right-1 min-w-[18px] h-[18px] gradient-brand rounded-full text-[10px] font-bold flex items-center justify-center text-white px-1 shadow-lg shadow-violet-500/30 animate-slide-up"
                  aria-hidden="true"
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            <Link
              to="/cuenta"
              className="hidden sm:flex p-2.5 min-w-[44px] min-h-[44px] items-center justify-center rounded-xl hover:bg-white/8 active:bg-white/12 transition-colors"
              aria-label="Mi cuenta"
            >
              <UserRound className="w-5 h-5 text-gray-400 hover:text-white" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-white/8 active:bg-white/12 transition-colors"
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

        {/* Barra de progreso de scroll */}
        <div
          className="absolute bottom-0 left-0 h-0.5 gradient-brand transition-[width] duration-150 ease-out hidden sm:block"
          style={{ width: `${scrollProgress}%` }}
          aria-hidden="true"
        />

        {/* Mobile menu */}
        {menuOpen && (
          <div id="mobile-menu" className="lg:hidden py-3 sm:py-4 border-t border-white/10 space-y-1 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain">
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
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                  isActive(link.to)
                    ? 'text-sky-400 bg-sky-500/10'
                    : 'text-gray-200 hover:text-white hover:bg-white/5 active:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs text-gray-500 px-3 py-1.5 uppercase tracking-wider font-bold">Categorías</p>
              {productCategories.slice(0, 4).map(cat => (
                <Link
                  key={cat}
                  to={`/productos?categoria=${encodeURIComponent(cat)}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-gray-300 hover:text-sky-400 hover:bg-white/5 rounded-xl transition-colors min-h-[40px]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400/70" />
                  {cat}
                </Link>
              ))}
              <Link
                to="/productos"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-sky-400 hover:bg-white/5 rounded-xl transition-colors font-semibold mt-1 min-h-[44px]"
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
