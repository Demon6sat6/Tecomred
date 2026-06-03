import { useState } from 'react';
import { Plus, Trash2, FolderOpen, Check, AlertCircle, Tag } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const COLOR_OPTIONS = [
  { label: 'Azul',      value: 'text-blue-400',    preview: 'bg-blue-400' },
  { label: 'Celeste',   value: 'text-sky-400',     preview: 'bg-sky-400' },
  { label: 'Índigo',    value: 'text-indigo-400',  preview: 'bg-indigo-400' },
  { label: 'Rojo',      value: 'text-red-400',     preview: 'bg-red-400' },
  { label: 'Naranja',   value: 'text-orange-400',  preview: 'bg-orange-400' },
  { label: 'Verde',     value: 'text-green-400',   preview: 'bg-green-400' },
  { label: 'Esmeralda', value: 'text-emerald-400', preview: 'bg-emerald-400' },
  { label: 'Morado',    value: 'text-purple-400',  preview: 'bg-purple-400' },
  { label: 'Rosa',      value: 'text-pink-400',    preview: 'bg-pink-400' },
  { label: 'Blanco',    value: 'text-white',       preview: 'bg-white' },
];

export default function AdminCategories() {
  const { categoryList, addCategory, deleteCategory, products, settings, saveSettings } = useAdmin();

  // Categorías
  const [newCat, setNewCat]         = useState('');
  const [catError, setCatError]     = useState('');
  const [catSaved, setCatSaved]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Marcas
  const brands = settings.brands ?? [];
  const [newBrand, setNewBrand]     = useState('');
  const [newColor, setNewColor]     = useState(COLOR_OPTIONS[0].value);
  const [brandError, setBrandError] = useState('');
  const [brandSaved, setBrandSaved] = useState(false);
  const [confirmBrandDelete, setConfirmBrandDelete] = useState<number | null>(null);

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCat.trim();
    if (!name) { setCatError('Escribe un nombre'); return; }
    if (categoryList.includes(name)) { setCatError('Ya existe esa categoría'); return; }
    addCategory(name);
    setNewCat('');
    setCatError('');
    setCatSaved(true);
    setTimeout(() => setCatSaved(false), 1500);
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newBrand.trim();
    if (!name) { setBrandError('Escribe el nombre de la marca'); return; }
    if (brands.some(b => b.name.toLowerCase() === name.toLowerCase())) {
      setBrandError('Esa marca ya existe');
      return;
    }
    saveSettings({ ...settings, brands: [...brands, { name, colorClass: newColor }] });
    setNewBrand('');
    setNewColor(COLOR_OPTIONS[0].value);
    setBrandError('');
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 1500);
  };

  const handleDeleteBrand = (index: number) => {
    saveSettings({ ...settings, brands: brands.filter((_, i) => i !== index) });
    setConfirmBrandDelete(null);
  };

  return (
    <div className="space-y-8 max-w-2xl">

      {/* ── CATEGORÍAS ── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">Categorías</h2>
        <p className="text-gray-500 text-sm">{categoryList.length} categorías activas · se muestran en el inicio (máx. 6)</p>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-sky-400" /> Nueva categoría
        </h3>
        <form onSubmit={handleAddCat} className="flex gap-3">
          <div className="flex-1">
            <input
              value={newCat}
              onChange={e => { setNewCat(e.target.value); setCatError(''); }}
              placeholder="Ej: Fibra Óptica"
              className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none transition-all ${
                catError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-sky-500/60'
              }`}
            />
            {catError && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" /> {catError}
              </p>
            )}
          </div>
          <button
            type="submit"
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 shrink-0 ${
              catSaved ? 'bg-emerald-500' : 'gradient-brand hover:opacity-90'
            }`}
          >
            {catSaved ? <Check className="w-4 h-4" /> : 'Agregar'}
          </button>
        </form>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between">
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Categoría</span>
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Productos</span>
        </div>
        <div className="divide-y divide-white/5">
          {categoryList.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            return (
              <div key={cat} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/3 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-white text-sm font-medium">{cat}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm">{count} producto{count !== 1 ? 's' : ''}</span>
                  {confirmDelete === cat ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">¿Eliminar?</span>
                      <button onClick={() => { deleteCategory(cat); setConfirmDelete(null); }} className="text-xs text-red-400 hover:text-red-300 font-semibold">Sí</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-500 hover:text-gray-300">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(cat)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/15 text-gray-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MARCAS ── */}
      <div className="pt-2 border-t border-white/8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-6">Marcas</h2>
        <p className="text-gray-500 text-sm">{brands.length} marcas en el carrusel del inicio</p>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-sky-400" /> Nueva marca
        </h3>
        <form onSubmit={handleAddBrand} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                value={newBrand}
                onChange={e => { setNewBrand(e.target.value); setBrandError(''); }}
                placeholder="Ej: Huawei"
                className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none transition-all ${
                  brandError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-sky-500/60'
                }`}
              />
              {brandError && (
                <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3" /> {brandError}
                </p>
              )}
            </div>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 shrink-0 ${
                brandSaved ? 'bg-emerald-500' : 'gradient-brand hover:opacity-90'
              }`}
            >
              {brandSaved ? <Check className="w-4 h-4" /> : 'Agregar'}
            </button>
          </div>

          {/* Color picker */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Color del texto</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNewColor(opt.value)}
                  title={opt.label}
                  className={`w-6 h-6 rounded-full ${opt.preview} transition-all ${
                    newColor === opt.value ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              Vista previa: <span className={`font-bold ${newColor}`}>{newBrand || 'MarcaEjemplo'}</span>
            </p>
          </div>
        </form>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between">
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Marca</span>
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Color</span>
        </div>
        {brands.length === 0 && (
          <div className="px-5 py-6 text-center text-gray-500 text-sm">No hay marcas configuradas</div>
        )}
        <div className="divide-y divide-white/5">
          {brands.map((brand, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/3 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-orange-400" />
                </div>
                <span className={`text-sm font-bold ${brand.colorClass}`}>{brand.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-500 text-xs">{COLOR_OPTIONS.find(c => c.value === brand.colorClass)?.label ?? brand.colorClass}</span>
                {confirmBrandDelete === i ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">¿Eliminar?</span>
                    <button onClick={() => handleDeleteBrand(i)} className="text-xs text-red-400 hover:text-red-300 font-semibold">Sí</button>
                    <button onClick={() => setConfirmBrandDelete(null)} className="text-xs text-gray-500 hover:text-gray-300">No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmBrandDelete(i)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/15 text-gray-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
