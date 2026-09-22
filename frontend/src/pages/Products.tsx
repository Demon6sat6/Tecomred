import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { categories } from '../data/products';
import { useStore } from '../context/StoreContext';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Catálogo de Productos</h1>
        <p className="text-gray-400">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          {selectedCategory !== 'Todos' && ` en ${selectedCategory}`}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Mobile Filters Drawer Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setShowFilters(false)}
            />
            {/* Drawer */}
            <aside className="relative w-full max-w-xs bg-gray-900 border-r border-white/10 h-full overflow-y-auto p-5 z-10 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-violet-400" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full gradient-brand text-[10px] font-bold flex items-center justify-center text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                {/* Search */}
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-semibold uppercase tracking-wider">Buscar</label>
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text" value={localSearch} onChange={e => setLocalSearch(e.target.value)}
                      placeholder="Nombre, categoría..."
                      className="w-full pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                    {localSearch && (
                      <button type="button" onClick={() => setLocalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                  </form>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-semibold uppercase tracking-wider">Categoría</label>
                  <div className="space-y-1">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => handleCategoryChange(cat)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          selectedCategory === cat
                            ? 'bg-violet-500/20 text-violet-400 font-semibold border border-violet-500/30'
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                        }`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Presets */}
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-semibold uppercase tracking-wider">Rango de precio</label>
                  <div className="space-y-1">
                    {pricePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => activePreset === idx ? clearPreset() : applyPreset(idx)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                          activePreset === idx
                            ? 'bg-violet-500/20 text-violet-400 font-semibold'
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom buttons in drawer */}
              <div className="pt-4 border-t border-white/10 mt-6 flex gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex-1 py-3 px-3 rounded-xl border border-white/15 text-xs text-gray-300 font-bold hover:bg-white/5 transition-colors"
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
          <div className="glass rounded-2xl p-5 sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold flex items-center gap-2">
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full gradient-brand text-[10px] font-bold flex items-center justify-center text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </h2>
              {activeFiltersCount > 0 && (
                <button onClick={clearAll} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Limpiar todo
                </button>
              )}
            </div>

            {/* Search */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-semibold uppercase tracking-wider">Buscar</label>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" value={localSearch} onChange={e => setLocalSearch(e.target.value)}
                  placeholder="Nombre, categoría..."
                  className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                {localSearch && (
                  <button type="button" onClick={() => setLocalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </form>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-semibold uppercase tracking-wider">Categoría</label>
              <div className="space-y-0.5">
                {categories.map(cat => (
                  <button key={cat} onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat
                        ? 'bg-violet-500/20 text-violet-400 font-medium'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
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
                className="w-full flex items-center justify-between text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider hover:text-gray-300 transition-colors"
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
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activePreset === idx
                            ? 'bg-violet-500/20 text-violet-400 font-medium'
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom range */}
                  <div className="pt-2 border-t border-white/8">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Rango personalizado</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <label className="text-[10px] text-gray-600 mb-1 block">Mín ({symbol})</label>
                        <input
                          type="number" min={0} max={maxPrice} step={50} value={minPrice}
                          onChange={e => { setMinPrice(+e.target.value); setActivePreset(null); }}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-violet-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-600 mb-1 block">Máx ({symbol})</label>
                        <input
                          type="number" min={minPrice} max={PRICE_MAX} step={50} value={maxPrice}
                          onChange={e => { setMaxPrice(+e.target.value); setActivePreset(null); }}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-violet-500/50"
                        />
                      </div>
                    </div>
                    <input
                      type="range" min={0} max={PRICE_MAX} step={50} value={maxPrice}
                      onChange={e => { setMaxPrice(+e.target.value); setActivePreset(null); }}
                      className="w-full accent-violet-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
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
              className="lg:hidden flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full gradient-brand text-[9px] font-bold flex items-center justify-center text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-gray-400 hidden sm:block">Ordenar:</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 transition-colors">
                <option value="relevancia" className="bg-gray-900">Relevancia</option>
                <option value="precio-asc" className="bg-gray-900">Precio: menor a mayor</option>
                <option value="precio-desc" className="bg-gray-900">Precio: mayor a menor</option>
                <option value="rating" className="bg-gray-900">Mejor valorados</option>
                <option value="nombre" className="bg-gray-900">Nombre A-Z</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {selectedCategory !== 'Todos' && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm border border-violet-500/20">
                  {selectedCategory}
                  <button onClick={() => handleCategoryChange('Todos')}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              {localSearch && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm border border-violet-500/20">
                  "{localSearch}"
                  <button onClick={() => setLocalSearch('')}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              {activePreset !== null && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm border border-violet-500/20">
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
            <div className="text-center py-20">
              <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-5 opacity-50">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sin resultados</h3>
              <p className="text-gray-400 mb-5">Intenta con otros filtros o términos de búsqueda.</p>
              <button onClick={clearAll} className="px-5 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
