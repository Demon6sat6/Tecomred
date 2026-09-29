import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Search, Menu, X, UserRound,
  Headphones, Heart, ArrowLeftRight, Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { useStore } from '../context/StoreContext';
import { useCurrency } from '../hooks/useCurrency';
import CartDrawer from './CartDrawer';
import { useProductLists } from '../context/useProductLists';

const navLinks = [
  { to: '/',          label: 'Inicio' },
  { to: '/productos', label: 'Catálogo' },
  { to: '/nosotros',  label: 'Nosotros' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/ubicacion', label: 'Ubicación' },
  { to: '/contacto',  label: 'Contacto' },
];

export default function Navbar() {
  const { totalItems, totalPrice } = useCart();
  const { settings } = useAdmin();
  const { products } = useStore();
  const { favoriteIds, compareIds } = useProductLists();
  const { formatShort } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const categories = [...new Set(products.map(product => product.category))].sort((a, b) => a.localeCompare(b, 'es'));
  const storePhone = settings.storePhone || '+51 997 176 721';
  const storeEmail = settings.storeEmail || 'siscomred2017@gmail.com';
  const freeShippingMin = Number(settings.freeShippingMin) || 300;
  const closeCart = useCallback(() => setCartOpen(false), []);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Barra de progreso de lectura (solo desktop)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerrar al pulsar Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchFocused(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedCat) {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedCat) params.set('categoria', selectedCat);
      navigate(`/productos?${params.toString()}`);
      setSearchQuery('');
      setSearchFocused(false);
      setMenuOpen(false);
    }
  };

  // Sugerencias en tiempo real
  const suggestions = searchQuery.trim().length >= 2
    ? products.filter(p => {
        const matchesCat = !selectedCat || p.category.toLowerCase() === selectedCat.toLowerCase();
        const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
      }).slice(0, 5)
    : [];

  const showSuggestions = suggestions.length > 0 && searchQuery.trim().length >= 2;

  return (
    <>
    <header className="sticky top-0 z-50 bg-white shadow-sm" ref={mobileMenuRef}>
      {/* ─────────────────────────────────────────────────────────────
          TIER 1: TOP UTILITY STRIP (Phone, Free Shipping, Language, Account)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 py-1.5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Phone & Free Shipping */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-[#0052cc]" />
              <span className="hidden sm:inline">Llámanos gratis:</span>
              <a
                href={`tel:${storePhone.replace(/\D/g, '')}`}
                className="font-bold text-[#0052cc] hover:text-[#003fa8] transition-colors"
              >
                {storePhone}
              </a>
            </div>

            <span className="hidden md:inline text-slate-300">|</span>

            <div className="hidden md:flex items-center gap-1.5 text-slate-500 font-medium">
              <Truck className="w-3.5 h-3.5 text-[#48bb07]" />
              <span>Envío gratis en compras desde <strong>{formatShort(freeShippingMin)}</strong></span>
            </div>
          </div>

          {/* Right: Currency, Language & Account */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <span className="hidden sm:inline text-slate-500">
              Moneda: <strong className="text-slate-800 font-semibold">PEN (S/.)</strong>
            </span>
            <span className="hidden sm:inline text-slate-500">
              Idioma: <strong className="text-slate-800 font-semibold">Español</strong>
            </span>
            <Link
              to="/cuenta"
              className="flex items-center gap-1 text-slate-700 hover:text-[#0052cc] font-medium transition-colors"
            >
              <UserRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Mi cuenta</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TIER 2: MAIN MIDDLE BAR (Logo, Search Pill, Support Block)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white py-2 px-3 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">

          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center group py-0.5" aria-label="SiscomRed">
              <img
                src="/logo.png"
                alt="SiscomRed"
                className="h-16 sm:h-20 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>
          </div>

          {/* Central Pill-shaped Search Bar (Desktop & Tablet) */}
          <div className="hidden md:block flex-1 max-w-2xl" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="relative" role="search">
              <div className="flex items-center bg-slate-50 border border-slate-200 hover:border-slate-300 focus-within:border-[#0052cc] focus-within:ring-2 focus-within:ring-[#0052cc]/15 focus-within:bg-white rounded-full p-1 pl-4 transition-all shadow-xs">

                {/* Category selector inside search bar */}
                <select
                  value={selectedCat}
                  onChange={e => setSelectedCat(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-2 max-w-[130px] truncate"
                  aria-label="Filtrar por categoría"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Vertical separator */}
                <div className="w-px h-5 bg-slate-300 mx-2 shrink-0" />

                {/* Search input */}
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Buscar laptops, monitores, componentes, redes..."
                  aria-label="Buscar productos"
                  autoComplete="off"
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none px-2"
                />

                {/* Circular search button with logo blue */}
                <button
                  type="submit"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0052cc] hover:bg-[#0041a8] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-md shadow-[#0052cc]/25 transition-all"
                  aria-label="Ejecutar búsqueda"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Live search auto-complete suggestions dropdown */}
              {showSuggestions && searchFocused && (
                <ul className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 py-1 z-50 overflow-hidden">
                  {suggestions.map(p => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          navigate(`/producto/${p.id}`);
                          setSearchQuery('');
                          setSearchFocused(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                      >
                        <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-slate-800 truncate">{p.name}</span>
                          <span className="block text-[11px] text-[#0052cc] font-medium">{p.category}</span>
                        </span>
                        <span className="text-xs font-bold text-slate-900 shrink-0">{formatShort(p.price)}</span>
                      </button>
                    </li>
                  ))}
                  <li className="border-t border-slate-100 mt-1">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 text-left text-xs text-[#0052cc] hover:bg-blue-50 font-bold"
                    >
                      Ver todos los resultados para "{searchQuery}" →
                    </button>
                  </li>
                </ul>
              )}
            </form>
          </div>

          {/* Right: Headphone Customer Service Block (Desktop) + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Customer Service Block */}
            <div className="hidden lg:flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0052cc] shrink-0">
                <Headphones className="w-5 h-5 text-[#0052cc]" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[11px] text-slate-500 font-medium">
                  Llámanos:{' '}
                  <a href={`tel:${storePhone.replace(/\D/g, '')}`} className="font-bold text-[#0052cc] hover:underline">
                    {storePhone}
                  </a>
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Email:{' '}
                  <a href={`mailto:${storeEmail}`} className="text-slate-700 hover:text-[#48bb07] font-semibold transition-colors">
                    {storeEmail}
                  </a>
                </p>
              </div>
            </div>

            {/* Mobile Cart Button */}
            <button
              type="button"
              onClick={() => { setMenuOpen(false); setCartOpen(true); }}
              className="md:hidden relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label={`Abrir carrito (${totalItems})`}
              aria-haspopup="dialog"
              aria-expanded={cartOpen}
            >
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-[#48bb07] rounded-full text-[10px] font-black flex items-center justify-center text-white px-1 shadow-sm">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Pill (visible on small screens below md) */}
        <div className="mt-2.5 md:hidden">
          <form onSubmit={handleSearch} className="relative" role="search">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full p-1 pl-3.5 focus-within:border-[#0052cc] focus-within:bg-white transition-all shadow-xs">
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar en SiscomRed..."
                aria-label="Buscar productos"
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none pr-2"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-[#0052cc] text-white flex items-center justify-center shrink-0 shadow-sm"
                aria-label="Buscar"
              >
                <Search className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TIER 3: BOTTOM NAVIGATION BAR (Nav Links + Action Badges)
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block bg-slate-100/90 border-t border-b border-slate-200 backdrop-blur-sm py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Left Nav Links */}
          <nav className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {navLinks.map((link, idx) => (
              <div key={link.to} className="flex items-center">
                {idx > 0 && <span className="text-slate-300 mx-1 sm:mx-1.5 text-xs font-light">|</span>}
                <Link
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    isActive(link.to)
                      ? 'text-[#0052cc] bg-white shadow-2xs font-bold'
                      : 'text-slate-700 hover:text-[#0052cc] hover:bg-white/80'
                  }`}
                >
                  {link.label}
                </Link>
              </div>
            ))}

          </nav>

          {/* Compare, wishlist and cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/comparar"
              className={`relative w-9 h-9 transition-colors flex items-center justify-center rounded-full hover:bg-white ${location.pathname === '/comparar' ? 'bg-white text-[#0052cc]' : 'text-slate-600 hover:text-[#0052cc]'}`}
              title="Comparar productos"
              aria-label={`Comparar productos: ${compareIds.length} seleccionados`}
            >
              <ArrowLeftRight className="w-5 h-5" />
              {compareIds.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0052cc] px-0.5 text-[10px] font-bold text-white">{compareIds.length}</span>}
            </Link>

            <Link
              to="/favoritos"
              className={`relative w-9 h-9 transition-colors flex items-center justify-center rounded-full hover:bg-white ${location.pathname === '/favoritos' ? 'bg-white text-[#0052cc]' : 'text-slate-600 hover:text-[#0052cc]'}`}
              title="Lista de deseos"
              aria-label={`Favoritos: ${favoriteIds.length} productos`}
            >
              <Heart className="w-5 h-5" />
              {favoriteIds.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#48bb07] px-0.5 text-[10px] font-bold text-white">{favoriteIds.length}</span>}
            </Link>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="h-9 flex items-center gap-2 px-3 rounded-full bg-white border border-slate-200 hover:border-[#0052cc] shadow-2xs hover:shadow-xs transition-all group"
              aria-label={`Abrir carrito: ${totalItems} productos por ${formatShort(totalPrice)}`}
              aria-haspopup="dialog"
              aria-expanded={cartOpen}
            >
              <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-[#0052cc] transition-colors" />
              <span className="text-xs font-bold text-slate-900 group-hover:text-[#0052cc] transition-colors">
                {formatShort(totalPrice)}
              </span>
              {totalItems > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-[#48bb07] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Barra de progreso de scroll fina */}
      <div
        className="h-0.5 bg-gradient-to-r from-[#0052cc] via-[#48bb07] to-[#0052cc] transition-[width] duration-150 ease-out hidden sm:block"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* ─────────────────────────────────────────────────────────────
          MOBILE SLIDE-OUT DRAWER MENU
          ───────────────────────────────────────────────────────────── */}
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden py-4 px-4 border-t border-slate-200 bg-white space-y-3 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain animate-slide-up shadow-xl">
          {/* Store Info in Mobile Drawer */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-[#0052cc]" />
              Soporte: <a href={`tel:${storePhone.replace(/\D/g, '')}`} className="text-[#0052cc] font-bold">{storePhone}</a>
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#48bb07]" />
              Envío gratis desde {formatShort(freeShippingMin)}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-2">Navegación</p>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.to)
                    ? 'text-[#0052cc] bg-blue-50/70 font-bold'
                    : 'text-slate-700 hover:text-[#0052cc] hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Categories Grid in Mobile Drawer */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-2 mb-2">Categorías de Hardware</p>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map(cat => (
                <Link
                  key={cat}
                  to={`/productos?categoria=${encodeURIComponent(cat)}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#0052cc] text-xs font-medium transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#48bb07]" />
                  <span className="truncate">{cat}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Account & Cart Buttons */}
          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
            <Link to="/comparar" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-2 py-2.5 text-xs font-bold text-[#0052cc]"><ArrowLeftRight className="h-4 w-4" /> Comparar ({compareIds.length})</Link>
            <Link to="/favoritos" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-lime-50 px-2 py-2.5 text-xs font-bold text-[#348f00]"><Heart className="h-4 w-4" /> Favoritos ({favoriteIds.length})</Link>
          </div>
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <Link
              to="/cuenta"
              onClick={() => setMenuOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold text-center hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <UserRound className="w-4 h-4 text-slate-600" /> Mi cuenta
            </Link>
            <Link
              to="/carrito"
              onClick={() => setMenuOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-[#0052cc] text-white text-xs font-bold text-center hover:bg-[#0041a8] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 text-white" /> Carrito ({totalItems})
            </Link>
          </div>
        </div>
      )}
    </header>
    {cartOpen && <CartDrawer onClose={closeCart} />}
    </>
  );
}
