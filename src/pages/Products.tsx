import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { categories } from '../data/products';
import { useStore } from '../context/StoreContext';
import { useCurrency } from '../hooks/useCurrency';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const { products } = useStore();
  const { symbol } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const selectedCategory = searchParams.get('categoria') || 'Todos';
  const searchQuery = searchParams.get('q') || '';
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [sortBy, setSortBy] = useState('relevancia');
  const [maxPrice, setMaxPrice] = useState(2000);

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
    result = result.filter(p => p.price <= maxPrice);
    switch (sortBy) {
      case 'precio-asc':  result.sort((a, b) => a.price - b.price); break;
      case 'precio-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating':      result.sort((a, b) => b.rating - a.rating); break;
      case 'nombre':      result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return result;
  }, [selectedCategory, localSearch, sortBy, maxPrice, products]);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'Todos') params.delete('categoria');
    else params.set('categoria', cat);
    setSearchParams(params);
  };

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
        {/* Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 shrink-0`}>
          <div className="glass rounded-2xl p-5 sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Filtros</h2>
              <button
                onClick={() => { handleCategoryChange('Todos'); setLocalSearch(''); setMaxPrice(2000); }}
                className="text-xs text-sky-400 hover:text-sky-300"
              >
                Limpiar
              </button>
            </div>

            {/* Search */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Buscar</label>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" value={localSearch} onChange={e => setLocalSearch(e.target.value)}
                  placeholder="Nombre, categoría..."
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500"
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
              <label className="text-sm text-gray-400 mb-2 block">Categoría</label>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button key={cat} onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Precio máx: {symbol}{maxPrice.toLocaleString('es-PE')}
              </label>
              <input
                type="range" min={0} max={2000} step={50} value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{symbol}0</span>
                <span>{symbol}2,000</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 gap-4">
            <button onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-gray-300 hover:text-white">
              <SlidersHorizontal className="w-4 h-4" /> Filtros
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-gray-400">Ordenar:</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-sky-500">
                <option value="relevancia">Relevancia</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="rating">Mejor valorados</option>
                <option value="nombre">Nombre A-Z</option>
              </select>
            </div>
          </div>

          {(selectedCategory !== 'Todos' || localSearch) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategory !== 'Todos' && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full text-sm">
                  {selectedCategory}
                  <button onClick={() => handleCategoryChange('Todos')}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              {localSearch && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full text-sm">
                  "{localSearch}"
                  <button onClick={() => setLocalSearch('')}><X className="w-3.5 h-3.5" /></button>
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
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">Sin resultados</h3>
              <p className="text-gray-400">Intenta con otros filtros o términos de búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
