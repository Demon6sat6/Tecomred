import { useState } from 'react';
import { Plus, Trash2, FolderOpen, Check, AlertCircle, Tag } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const COLOR_OPTIONS = [
  { label: 'Azul',      value: 'text-blue-600',    preview: 'bg-blue-600' },
  { label: 'Celeste',   value: 'text-sky-600',     preview: 'bg-sky-600' },
  { label: 'Índigo',    value: 'text-indigo-600',  preview: 'bg-indigo-600' },
  { label: 'Rojo',      value: 'text-rose-600',    preview: 'bg-rose-600' },
  { label: 'Naranja',   value: 'text-orange-600',  preview: 'bg-orange-600' },
  { label: 'Verde',     value: 'text-emerald-600', preview: 'bg-emerald-600' },
  { label: 'Morado',    value: 'text-purple-600',  preview: 'bg-purple-600' },
  { label: 'Gris Oscuro', value: 'text-slate-800', preview: 'bg-slate-800' },
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
    if (!name) { setCatError('Escribe un nombre de categoría'); return; }
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
    <div className="space-y-8 max-w-3xl">

      {/* ── CATEGORÍAS ── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Categorías de la Tienda</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          {categoryList.length} categorías activas · estructuran el menú, catálogo y filtros de búsqueda
        </p>
      </div>

      {/* Formulario Agregar Categoría */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" /> Nueva categoría
        </h3>
        <form onSubmit={handleAddCat} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              value={newCat}
              onChange={e => { setNewCat(e.target.value); setCatError(''); }}
              placeholder="Ej: Fibra Óptica, Servidores, etc."
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                catError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
            {catError && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-rose-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> {catError}
              </p>
            )}
          </div>
          <button
            type="submit"
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 ${
              catSaved ? 'bg-emerald-600' : 'gradient-brand hover:opacity-95 shadow-md shadow-blue-600/20'
            }`}
          >
            {catSaved ? <Check className="w-4 h-4" /> : null}
            {catSaved ? '¡Guardada!' : 'Agregar Categoría'}
          </button>
        </form>
      </div>

      {/* Lista de Categorías */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Nombre de Categoría</span>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Productos Asignados</span>
        </div>
        <div className="divide-y divide-slate-100">
          {categoryList.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            return (
              <div key={cat} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <span className="text-slate-900 text-sm font-semibold">{cat}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 text-xs font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                    {count} producto{count !== 1 ? 's' : ''}
                  </span>
                  {confirmDelete === cat ? (
                    <div className="flex items-center gap-2 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                      <span className="text-xs text-rose-700 font-semibold">¿Eliminar?</span>
                      <button
                        onClick={() => { deleteCategory(cat); setConfirmDelete(null); }}
                        className="text-xs bg-rose-600 text-white px-2 py-0.5 rounded font-bold hover:bg-rose-700"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MARCAS ── */}
      <div className="pt-4 border-t border-slate-200">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Marcas y Proveedores</h2>
        <p className="text-slate-500 text-sm mt-0.5">{brands.length} marcas mostradas en la tienda virtual</p>
      </div>

      {/* Formulario Agregar Marca */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" /> Nueva marca
        </h3>
        <form onSubmit={handleAddBrand} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                value={newBrand}
                onChange={e => { setNewBrand(e.target.value); setBrandError(''); }}
                placeholder="Ej: Ubiquiti, Mikrotik, Cisco, TP-Link..."
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                  brandError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {brandError && (
                <p className="flex items-center gap-1 mt-1.5 text-xs text-rose-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {brandError}
                </p>
              )}
            </div>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 ${
                brandSaved ? 'bg-emerald-600' : 'gradient-brand hover:opacity-95 shadow-md shadow-blue-600/20'
              }`}
            >
              {brandSaved ? <Check className="w-4 h-4" /> : null}
              {brandSaved ? '¡Guardada!' : 'Agregar Marca'}
            </button>
          </div>

          {/* Selector de color */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <p className="text-xs text-slate-600 mb-2 font-semibold">Color distintivo de la marca:</p>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNewColor(opt.value)}
                  title={opt.label}
                  className={`w-6 h-6 rounded-full ${opt.preview} transition-all ${
                    newColor === opt.value ? 'ring-2 ring-blue-600 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Vista previa: <span className={`font-bold text-sm ${newColor}`}>{newBrand || 'MarcaEjemplo'}</span>
            </p>
          </div>
        </form>
      </div>

      {/* Lista de Marcas */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Marca</span>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Acción</span>
        </div>
        {brands.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">No hay marcas configuradas</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {brands.map((brand, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-extrabold ${brand.colorClass}`}>{brand.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  {confirmBrandDelete === i ? (
                    <div className="flex items-center gap-2 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                      <span className="text-xs text-rose-700 font-semibold">¿Eliminar?</span>
                      <button
                        onClick={() => handleDeleteBrand(i)}
                        className="text-xs bg-rose-600 text-white px-2 py-0.5 rounded font-bold hover:bg-rose-700"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmBrandDelete(null)}
                        className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmBrandDelete(i)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Eliminar marca"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
