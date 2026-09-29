import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, X, Check, AlertTriangle, Image, Star, Upload, Loader2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';
import type { Product } from '../../types';
import { categories } from '../../data/products';

interface MediaFile { id: number; url: string; original_name: string; alt_text: string }

function MediaPickerModal({ onSelect, onClose, apiKey }: { onSelect: (url: string) => void; onClose: () => void; apiKey: string }) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = () => {
    fetch('/api/media', { headers: { Authorization: `Bearer ${apiKey}` } })
      .then(r => r.json())
      .then(d => setFiles(d.data ?? []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFiles();
  }, [apiKey]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    setUploading(true);
    const form = new FormData();
    Array.from(selected).forEach(f => form.append('files', f));

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          onSelect(json.data[0].url);
          onClose();
          return;
        }
      }
      fetchFiles();
    } catch {
      // Ignorar
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h3 className="text-slate-900 font-bold text-base">Biblioteca de Medios</h3>
            <p className="text-slate-500 text-xs">Selecciona una imagen o sube una nueva sin hash</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{uploading ? 'Subiendo...' : 'Subir Imagen'}</span>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleUpload} />
            </label>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">No hay imágenes en la biblioteca. Puedes subir una directamente arriba.</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {files.map(f => (
                <button
                  key={f.id}
                  onClick={() => { onSelect(f.url); onClose(); }}
                  className="aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-[#0052cc] transition-all group bg-slate-50 p-1 flex flex-col items-center justify-center relative shadow-xs"
                >
                  <img src={f.url} alt={f.alt_text || f.original_name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" loading="lazy" />
                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[10px] py-0.5 px-1 truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {f.original_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const emptyProduct: Omit<Product, 'id'> = {
  name: '', category: 'Laptops', price: 0, image: '',
  description: '', specs: [], stock: 0, rating: 0, reviews: 0, isActive: false,
};

const inputCls = "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/10 transition-colors";

export default function AdminProducts() {
  const { products, productsError, addProduct, updateProduct, deleteProduct, apiKey } = useAdmin();
  const { formatShort } = useCurrency();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Todos');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [specsInput, setSpecsInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [uploadingDirect, setUploadingDirect] = useState(false);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'Todos' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setForm(emptyProduct);
    setFormError('');
    setSpecsInput('');
    setModal('add');
  };

  const openEdit = (p: Product) => {
    setSelected(p);
    setForm({
      name: p.name, category: p.category, price: p.price, originalPrice: p.originalPrice,
      image: p.image, description: p.description, specs: p.specs, stock: p.stock,
      rating: p.rating, reviews: p.reviews, badge: p.badge, isActive: p.isActive,
    });
    setFormError('');
    setSpecsInput(p.specs.join('\n'));
    setModal('edit');
  };

  const openDelete = (p: Product) => { setSelected(p); setModal('delete'); };

  const handleSave = async () => {
    const specs = specsInput.split('\n').map(s => s.trim()).filter(Boolean);
    const finalForm = { ...form, specs };
    if (form.isActive && form.price <= 0) {
      setFormError('Ingresa un precio mayor que cero antes de publicar.');
      return;
    }
    try {
      setFormError('');
      if (modal === 'add') await addProduct(finalForm);
      else if (modal === 'edit' && selected) await updateProduct({ ...finalForm, id: selected.id });
      setSaved(true);
      setTimeout(() => { setSaved(false); setModal(null); }, 800);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar en la base de datos');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setFormError('');
      await deleteProduct(selected.id);
      setModal(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo eliminar');
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDirect(true);
    const fd = new FormData();
    fd.append('files', file);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: fd,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setForm(f => ({ ...f, image: json.data[0].url }));
        }
      }
    } catch {
      // Ignorar
    } finally {
      setUploadingDirect(false);
    }
  };

  const badgeColor = (b?: string) => {
    switch (b) {
      case 'Nuevo':   return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Oferta':  return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Popular': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Agotado': return 'bg-slate-100 text-slate-600 border-slate-200';
      default:        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const badgeOptions: (Product['badge'] | '')[] = ['', 'Nuevo', 'Oferta', 'Popular', 'Agotado'];

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-500 text-sm mt-0.5">{products.length} productos en la base de datos · {products.filter(p => p.isActive).length} publicados · {products.filter(p => !p.isActive).length} borradores</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white text-sm font-semibold transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Agregar producto
        </button>
      </div>

      {productsError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">No se pudo consultar la base de datos: {productsError}</p>}
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0052cc] shadow-xs transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#0052cc] shadow-xs cursor-pointer"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-slate-500 text-xs font-semibold px-4 py-3">Producto</th>
                <th className="text-left text-slate-500 text-xs font-semibold px-4 py-3 hidden md:table-cell">Categoría</th>
                <th className="text-right text-slate-500 text-xs font-semibold px-4 py-3">Precio</th>
                <th className="text-right text-slate-500 text-xs font-semibold px-4 py-3">Stock</th>
                <th className="text-left text-slate-500 text-xs font-semibold px-4 py-3">Estado</th>
                <th className="text-center text-slate-500 text-xs font-semibold px-4 py-3 hidden sm:table-cell">Rating</th>
                <th className="text-left text-slate-500 text-xs font-semibold px-4 py-3 hidden sm:table-cell">Badge</th>
                <th className="text-right text-slate-500 text-xs font-semibold px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-contain bg-slate-50 shrink-0 border border-slate-200 p-0.5" />
                      <div className="min-w-0">
                        <p className="text-slate-900 text-xs font-semibold truncate max-w-[180px]">{p.name}</p>
                        <p className="text-slate-400 text-[10px]">ID: {p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-slate-600 text-xs font-medium">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <span className="text-slate-900 text-xs font-bold">{p.price > 0 ? formatShort(p.price) : 'Por definir'}</span>
                      {p.originalPrice && (
                        <span className="block text-slate-400 text-[10px] line-through">{formatShort(p.originalPrice)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-bold flex items-center justify-end gap-1 ${
                      p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-600' : 'text-emerald-700'
                    }`}>
                      {p.stock <= 5 && p.stock > 0 && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{p.isActive ? 'Publicado' : 'Borrador'}</span></td>
                  <td className="px-4 py-3 hidden sm:table-cell text-center">
                    <span className="inline-flex items-center justify-center gap-1 text-amber-600 text-xs font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {p.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {p.badge ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor(p.badge)}`}>
                        {p.badge}
                      </span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-[#0052cc] transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDelete(p)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
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
            <div className="text-center py-12 text-slate-500 text-sm">No se encontraron productos.</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h3 className="text-slate-900 font-bold text-base">{modal === 'add' ? 'Agregar nuevo producto' : `Editar — ${selected?.name ?? ''}`}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs text-slate-600 mb-1.5 font-medium">Nombre del producto *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Monitor gaming"
                  className={inputCls}
                />
              </div>

              {/* Category + Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5 font-medium">Categoría</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={inputCls}
                  >
                    {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5 font-medium">Insignia (Badge)</label>
                  <select
                    value={form.badge ?? ''}
                    onChange={e => setForm(f => ({ ...f, badge: (e.target.value as any) || undefined }))}
                    className={inputCls}
                  >
                    {badgeOptions.map(b => <option key={b} value={b}>{b || 'Sin badge'}</option>)}
                  </select>
                </div>
              </div>

              {/* Price + Original + Stock */}
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800">
                <input type="checkbox" checked={Boolean(form.isActive)} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 accent-[#0052cc]" />
                Publicar en la tienda <span className="ml-auto text-xs text-slate-500">Requiere precio real</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5 font-medium">Precio (S/) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: +e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5 font-medium">Precio anterior</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.originalPrice ?? ''}
                    onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value ? +e.target.value : undefined }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5 font-medium">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: +e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Rating + Reviews */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5 font-medium">Rating (0 - 5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={e => setForm(f => ({ ...f, rating: +e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5 font-medium">N.° reseñas</label>
                  <input
                    type="number"
                    min="0"
                    value={form.reviews}
                    onChange={e => setForm(f => ({ ...f, reviews: +e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Image URL + Media Picker + Direct Upload */}
              <div>
                <label className="block text-xs text-slate-600 mb-1.5 font-medium">Imagen del producto (sin hashes, sincronizada)</label>
                <div className="flex gap-2">
                  <input
                    value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="/uploads/tu-archivo.png o selecciona abajo"
                    className={`flex-1 ${inputCls}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Image className="w-3.5 h-3.5 text-[#0052cc]" /> Biblioteca
                  </button>
                  <label className="px-3 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors shadow-xs">
                    {uploadingDirect ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{uploadingDirect ? 'Subiendo...' : 'Subir'}</span>
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingDirect} onChange={handleDirectUpload} />
                  </label>
                </div>
                {form.image && (
                  <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    <img
                      src={form.image}
                      alt="Vista previa"
                      className="h-16 w-16 object-contain bg-white rounded-lg border border-slate-200 p-1"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">{form.image}</p>
                      <p className="text-[11px] text-emerald-600 font-medium">✓ Imagen vinculada correctamente</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-slate-600 mb-1.5 font-medium">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Descripción detallada del producto para la tienda..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Specs */}
              <div>
                <label className="block text-xs text-slate-600 mb-1.5 font-medium">
                  Especificaciones técnicas <span className="text-slate-400 font-normal">(una por línea)</span>
                </label>
                <textarea
                  value={specsInput}
                  onChange={e => setSpecsInput(e.target.value)}
                  rows={4}
                  placeholder={"24 puertos Gigabit Ethernet\nPoE+ 370W\nAdministrable Layer 2\nSoporte QoS"}
                  className={`${inputCls} resize-none font-mono text-xs`}
                />
              </div>
            </div>

            {formError && <p role="alert" className="px-5 text-sm text-red-600">{formError}</p>}
            <div className="flex gap-3 p-5 border-t border-slate-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name || !form.image || !form.description || (Boolean(form.isActive) && form.price <= 0)}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                  saved ? 'bg-emerald-600' : 'bg-[#0052cc] hover:bg-[#0041a8] shadow-sm'
                }`}
              >
                {saved ? <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Guardado en BD</span> : (modal === 'add' ? 'Crear Producto' : 'Guardar Cambios')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPickerModal
          apiKey={apiKey}
          onSelect={url => setForm(f => ({ ...f, image: url }))}
          onClose={() => setShowMediaPicker(false)}
        />
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg mb-2">¿Eliminar producto?</h3>
            <p className="text-slate-600 text-sm mb-6">
              Se eliminará <span className="text-slate-900 font-semibold">"{selected.name}"</span> permanentemente de la base de datos.
            </p>
            <div className="flex gap-3">
              {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 active:scale-95 transition-all shadow-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
