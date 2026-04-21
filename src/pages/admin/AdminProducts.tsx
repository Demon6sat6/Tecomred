import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Check, AlertTriangle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';
import type { Product } from '../../types';
import { categories } from '../../data/products';

const emptyProduct: Omit<Product, 'id'> = {
  name: '', category: 'Switches', price: 0, image: '',
  description: '', specs: [], stock: 0, rating: 4.5, reviews: 0,
};

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();
  const { formatShort } = useCurrency();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Todos');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [specsInput, setSpecsInput] = useState('');
  const [saved, setSaved] = useState(false);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'Todos' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setForm(emptyProduct);
    setSpecsInput('');
    setModal('add');
  };

  const openEdit = (p: Product) => {
    setSelected(p);
    setForm({ name: p.name, category: p.category, price: p.price, originalPrice: p.originalPrice,
      image: p.image, description: p.description, specs: p.specs, stock: p.stock,
      rating: p.rating, reviews: p.reviews, badge: p.badge });
    setSpecsInput(p.specs.join('\n'));
    setModal('edit');
  };

  const openDelete = (p: Product) => { setSelected(p); setModal('delete'); };

  const handleSave = () => {
    const specs = specsInput.split('\n').map(s => s.trim()).filter(Boolean);
    const finalForm = { ...form, specs };
    if (modal === 'add') addProduct(finalForm);
    else if (modal === 'edit' && selected) updateProduct({ ...finalForm, id: selected.id });
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(null); }, 1000);
  };

  const handleDelete = () => {
    if (selected) deleteProduct(selected.id);
    setModal(null);
  };

  const badgeOptions = ['', 'Nuevo', 'Oferta', 'Popular', 'Agotado'] as const;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Productos</h2>
          <p className="text-gray-500 text-sm">{products.length} productos en total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-sky-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Agregar producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500/60"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
        <select
          value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-sky-500/60"
        >
          {categories.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/8">
              <tr>
                <th className="text-left text-gray-500 text-xs font-semibold px-4 py-3">Producto</th>
                <th className="text-left text-gray-500 text-xs font-semibold px-4 py-3 hidden md:table-cell">Categoría</th>
                <th className="text-right text-gray-500 text-xs font-semibold px-4 py-3">Precio</th>
                <th className="text-right text-gray-500 text-xs font-semibold px-4 py-3">Stock</th>
                <th className="text-left text-gray-500 text-xs font-semibold px-4 py-3 hidden sm:table-cell">Badge</th>
                <th className="text-right text-gray-500 text-xs font-semibold px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold truncate max-w-[160px]">{p.name}</p>
                        <p className="text-gray-500 text-[10px]">ID: {p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-gray-400 text-xs">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white text-xs font-bold">${p.price.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-bold flex items-center justify-end gap-1 ${
                      p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      {p.stock <= 5 && p.stock > 0 && <AlertTriangle className="w-3 h-3" />}
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {p.badge ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/20">
                        {p.badge}
                      </span>
                    ) : <span className="text-gray-700 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg hover:bg-sky-500/15 text-gray-400 hover:text-sky-400 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDelete(p)}
                        className="p-1.5 rounded-lg hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">No se encontraron productos.</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-white font-bold">{modal === 'add' ? 'Agregar producto' : 'Editar producto'}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Nombre *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60" />
              </div>
              {/* Category + Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Categoría</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60">
                    {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Badge</label>
                  <select value={form.badge ?? ''} onChange={e => setForm(f => ({ ...f, badge: e.target.value as any || undefined }))}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60">
                    {badgeOptions.map(b => <option key={b} value={b} className="bg-gray-900">{b || 'Sin badge'}</option>)}
                  </select>
                </div>
              </div>
              {/* Price + Original + Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Precio *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Precio original</label>
                  <input type="number" value={form.originalPrice ?? ''} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value ? +e.target.value : undefined }))}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Stock *</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: +e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60" />
                </div>
              </div>
              {/* Image URL */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">URL de imagen</label>
                <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60" />
              </div>
              {/* Description */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60 resize-none" />
              </div>
              {/* Specs */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Especificaciones (una por línea)</label>
                <textarea value={specsInput} onChange={e => setSpecsInput(e.target.value)}
                  rows={4} placeholder="24 puertos GbE&#10;PoE+ 370W&#10;..."
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60 resize-none font-mono" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-white/10">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 ${saved ? 'bg-emerald-500' : 'gradient-brand hover:opacity-90'}`}>
                {saved ? <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Guardado</span> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/10 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">¿Eliminar producto?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Se eliminará <span className="text-white font-semibold">"{selected.name}"</span> permanentemente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-95 transition-all">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
