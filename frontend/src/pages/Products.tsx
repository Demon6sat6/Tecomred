import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAdmin } from '../context/AdminContext';
import { useCurrency } from '../hooks/useCurrency';
import ProductCard from '../components/ProductCard';
import { usePageTitle } from '../hooks/usePageTitle';

const PRICE_MAX = 5000;

const pricePresets = [
  { label: 'Menos de S/300',      min: 0,    max: 300  },
  { label: 'S/300 — S/800',       min: 300,  max: 800  },
  { label: 'S/800 — S/1,500',     min: 800,  max: 1500 },
  { label: 'S/1,500 — S/3,000',   min: 1500, max: 3000 },
  { label: 'Más de S/3,000',      min: 3000, max: PRICE_MAX },
];

export default function Products() {
  const { products } = useStore();
  const { productsError } = useAdmin();
  const categories = ['Todos', ...new Set(products.map(product => product.category))].sort((a, b) => a === 'Todos' ? -1 : b === 'Todos' ? 1 : a.localeCompare(b, 'es'));
  const { symbol } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(true);

  const selectedCategory = searchParams.get('categoria') || 'Todos';
  const searchQuery = searchParams.get('q') || '';
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [sortBy, setSortBy] = useState('relevancia');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [activePreset, setActivePreset] = useState<number | null>(null);

  usePageTitle(
    selectedCategory !== 'Todos' ? `Catálogo: ${selectedCategory}` : 'Catálogo de Productos',
    'Explora switches, routers, cables y componentes de cómputo con filtros por categoría y precio. Envíos a todo el Perú.'
  );

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== 'Todos') result = result.filter(p => p.category === selectedCategory);
    if (localSearch) {
      const q = localSearch.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);
    switch (sortBy) {
      case 'precio-asc':  result.sort((a, b) => a.price - b.price); break;
      case 'precio-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating':      result.sort((a, b) => b.rating - a.rating); break;
      case 'nombre':      result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return result;
  }, [selectedCategory, localSearch, sortBy, minPrice, maxPrice, products]);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'Todos') params.delete('categoria');
    else params.set('categoria', cat);
    setSearchParams(params);
  };

  const applyPreset = (idx: number) => {
    const p = pricePresets[idx];
    setMinPrice(p.min);
    setMaxPrice(p.max);
    setActivePreset(idx);
  };

  const clearPreset = () => {
    setMinPrice(0);
    setMaxPrice(PRICE_MAX);
    setActivePreset(null);
  };

  const clearAll = () => {
    handleCategoryChange('Todos');
    setLocalSearch('');
    clearPreset();
    setSortBy('relevancia');
  };

  const activeFiltersCount = [
    selectedCategory !== 'Todos',
    !!localSearch,
    activePreset !== null,
  ].filter(Boolean).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearch) params.set('q', localSearch);
    else params.delete('q');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Catálogo de Productos</h1>
        <p className="text-slate-600">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          {selectedCategory !== 'Todos' && ` en ${selectedCategory}`}
        </p>
        <p className="mt-2 text-xs text-slate-500">Los precios marcados como referenciales son puntos de partida. Confirma modelo, precio final y disponibilidad antes de comprar.</p>
      </div>

      <div className="flex gap-8">
        {/* Mobile Filters Drawer Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setShowFilters(false)}
            />
            {/* Drawer */}
            <aside className="relative w-full max-w-xs bg-white border-r border-slate-200 h-full overflow-y-auto p-5 z-10 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <h2 className="text-slate-900 font-bold text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-violet-600" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full gradient-brand text-[10px] font-bold flex items-center justify-center text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                {/* Search */}
                <div>
                  <label className="text-xs text-slate-500 mb-2 block font-semibold uppercase tracking-wider">Buscar</label>
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text" value={localSearch} onChange={e => setLocalSearch(e.target.value)}
                      placeholder="Nombre, categoría..."
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-500 transition-colors"
                    />
                    {localSearch && (
                      <button type="button" onClick={() => setLocalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    )}
                  </form>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-xs text-slate-500 mb-2 block font-semibold uppercase tracking-wider">Categoría</label>
                  <div className="space-y-1">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => handleCategoryChange(cat)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          selectedCategory === cat
                            ? 'bg-violet-50 text-violet-700 font-semibold border border-violet-200 shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Presets */}
                <div>
                  <label className="text-xs text-slate-500 mb-2 block font-semibold uppercase tracking-wider">Rango de precio</label>
                  <div className="space-y-1">
                    {pricePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => activePreset === idx ? clearPreset() : applyPreset(idx)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                          activePreset === idx
                            ? 'bg-violet-50 text-violet-700 font-semibold border border-violet-200'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom buttons in drawer */}
              <div className="pt-4 border-t border-slate-200 mt-6 flex gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex-1 py-3 px-3 rounded-xl border border-slate-300 text-xs text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 px-3 rounded-xl gradient-brand text-xs text-white font-bold hover:opacity-90 transition-opacity text-center shadow-lg shadow-violet-500/20"
                >
                  Ver {filtered.length} productos
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-24 space-y-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold flex items-center gap-2">
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full gradient-brand text-[10px] font-bold flex items-center justify-center text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </h2>
              {activeFiltersCount > 0 && (
                <button onClick={clearAll} className="text-xs text-violet-600 hover:text-violet-800 font-semibold transition-colors">
                  Limpiar todo
                </button>
              )}
            </div>

            {/* Search */}
            <div>
              <label className="text-xs text-slate-500 mb-2 block font-semibold uppercase tracking-wider">Buscar</label>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" value={localSearch} onChange={e => setLocalSearch(e.target.value)}
                  placeholder="Nombre, categoría..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-500 transition-colors"
                />
                {localSearch && (
                  <button type="button" onClick={() => setLocalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </form>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs text-slate-500 mb-2 block font-semibold uppercase tracking-wider">Categoría</label>
              <div className="space-y-0.5">
                {categories.map(cat => (
                  <button key={cat} onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                      selectedCategory === cat
                        ? 'bg-violet-50 text-violet-700 font-semibold border border-violet-200 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <button
                onClick={() => setShowPriceFilter(v => !v)}
                className="w-full flex items-center justify-between text-xs text-slate-600 mb-3 font-semibold uppercase tracking-wider hover:text-slate-900 transition-colors"
              >
                <span>Precio</span>
                {showPriceFilter ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showPriceFilter && (
                <div className="space-y-3">
                  {/* Presets */}
                  <div className="space-y-1">
                    {pricePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => activePreset === idx ? clearPreset() : applyPreset(idx)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                          activePreset === idx
                            ? 'bg-violet-50 text-violet-700 font-semibold border border-violet-200'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom range */}
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2 font-medium">Rango personalizado</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block font-medium">Mín ({symbol})</label>
                        <input
                          type="number" min={0} max={maxPrice} step={50} value={minPrice}
                          onChange={e => { setMinPrice(+e.target.value); setActivePreset(null); }}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block font-medium">Máx ({symbol})</label>
                        <input
                          type="number" min={minPrice} max={PRICE_MAX} step={50} value={maxPrice}
                          onChange={e => { setMaxPrice(+e.target.value); setActivePreset(null); }}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-violet-500"
                        />
                      </div>
                    </div>
                    <input
                      type="range" min={0} max={PRICE_MAX} step={50} value={maxPrice}
                      onChange={e => { setMaxPrice(+e.target.value); setActivePreset(null); }}
                      className="w-full accent-violet-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                      <span>{symbol}0</span>
                      <span>{symbol}{PRICE_MAX.toLocaleString('es-PE')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 gap-4">
            <button onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 shadow-xs transition-colors">
              <SlidersHorizontal className="w-4 h-4 text-violet-600" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full gradient-brand text-[9px] font-bold flex items-center justify-center text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="flex min-w-0 items-center gap-2 ml-auto">
              <label className="text-sm text-slate-600 font-medium hidden sm:block">Ordenar:</label>
              <select aria-label="Ordenar productos" value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="min-w-0 max-w-[min(54vw,14rem)] bg-white border border-slate-200 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-800 shadow-xs focus:outline-none focus:border-violet-500 transition-colors">
                <option value="relevancia" className="bg-white text-slate-800">Relevancia</option>
                <option value="precio-asc" className="bg-white text-slate-800">Precio: menor a mayor</option>
                <option value="precio-desc" className="bg-white text-slate-800">Precio: mayor a menor</option>
                <option value="rating" className="bg-white text-slate-800">Mejor valorados</option>
                <option value="nombre" className="bg-white text-slate-800">Nombre A-Z</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {selectedCategory !== 'Todos' && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-sm border border-violet-200 font-medium">
                  {selectedCategory}
                  <button onClick={() => handleCategoryChange('Todos')}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              {localSearch && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-sm border border-violet-200 font-medium">
                  "{localSearch}"
                  <button onClick={() => setLocalSearch('')}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              {activePreset !== null && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-sm border border-violet-200 font-medium">
                  {pricePresets[activePreset].label}
                  <button onClick={clearPreset}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-violet-600">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{productsError ? 'Catálogo no disponible' : products.length === 0 ? 'Estamos preparando el catálogo' : 'Sin resultados'}</h3>
              <p className="text-slate-600 mb-5">{productsError ? 'No se pudo consultar el catálogo. Vuelve a intentarlo en un momento.' : products.length === 0 ? 'Pronto encontrarás aquí los productos disponibles.' : 'Intenta con otros filtros o términos de búsqueda.'}</p>
              {products.length > 0 && <button onClick={clearAll} className="px-5 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-violet-500/20">
                Limpiar filtros
              </button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
