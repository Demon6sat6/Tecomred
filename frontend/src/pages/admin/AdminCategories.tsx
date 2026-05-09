import { useState } from 'react';
import { Plus, Trash2, FolderOpen, Check, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminCategories() {
  const { categoryList, addCategory, deleteCategory, products } = useAdmin();
  const [newCat, setNewCat] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCat.trim();
    if (!name) { setError('Escribe un nombre'); return; }
    if (categoryList.includes(name)) { setError('Ya existe esa categoría'); return; }
    addCategory(name);
    setNewCat('');
    setError('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleDelete = (cat: string) => {
    deleteCategory(cat);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">Categorías</h2>
        <p className="text-gray-500 text-sm">{categoryList.length} categorías activas</p>
      </div>

      {/* Add form */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-sky-400" /> Nueva categoría
        </h3>
        <form onSubmit={handleAdd} className="flex gap-3">
          <div className="flex-1">
            <input
              value={newCat}
              onChange={e => { setNewCat(e.target.value); setError(''); }}
              placeholder="Ej: Fibra Óptica"
              className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none transition-all ${
                error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-sky-500/60'
              }`}
            />
            {error && (
              <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" /> {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 shrink-0 ${
              saved ? 'bg-emerald-500' : 'gradient-brand hover:opacity-90'
            }`}
          >
            {saved ? <Check className="w-4 h-4" /> : 'Agregar'}
          </button>
        </form>
      </div>

      {/* Category list */}
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
                      <button onClick={() => handleDelete(cat)} className="text-xs text-red-400 hover:text-red-300 font-semibold">Sí</button>
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
    </div>
  );
}
