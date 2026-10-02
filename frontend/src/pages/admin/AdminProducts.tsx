import { useEffect, useState } from 'react';

import { AlertTriangle, Eye, EyeOff, ImageIcon, Loader2, Package, Pencil, Plus, Star, Trash2, Upload, Wallet } from 'lucide-react';
import { useUrlParam } from '../../hooks/useUrlParam';
import { useAdmin } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';
import type { Product } from '../../types';
import { adminAlert } from '../../utils/adminAlerts';
import { productSchema, validate, type FieldErrors } from '../../utils/adminValidation';
import { Badge, EmptyState, Field, Modal, PageHeader, SearchInput, Segmented, StatCard, Switch, type Tone } from '../../components/admin/AdminUI';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || '/api';
const MAX_UPLOAD_MB = 10;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];

interface MediaFile { id: number; url: string; original_name: string; alt_text: string }
type ProductForm = Omit<Product, 'id'>;
type StatusFilter = 'all' | 'published' | 'draft' | 'low';

const badgeOptions = ['Nuevo', 'Oferta', 'Popular', 'Agotado'] as const;
const badgeTone: Record<string, Tone> = { Nuevo: 'green', Oferta: 'rose', Popular: 'blue', Agotado: 'slate' };

/** Comprueba tipo y tamaño antes de subir; devuelve un mensaje si no es válido. */
function checkImageFile(file: File) {
  if (!IMAGE_TYPES.includes(file.type)) return `${file.name}: formato no permitido (usa JPG, PNG, WEBP, GIF, SVG o AVIF)`;
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `${file.name}: supera ${MAX_UPLOAD_MB} MB`;
  return '';
}

async function uploadImage(file: File, apiKey: string): Promise<string> {
  const form = new FormData();
  form.append('files', file);
  const response = await fetch(`${API_URL}/media/upload`, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: form });
  const json = await response.json().catch(() => ({})) as { data?: { url: string }[]; error?: string };
  if (!response.ok || !json.data?.length) throw new Error(json.error || 'No se pudo subir la imagen');
  return json.data[0].url;
}

function MediaPickerModal({ onSelect, onClose, apiKey }: { onSelect: (url: string) => void; onClose: () => void; apiKey: string }) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/media`, { headers: { Authorization: `Bearer ${apiKey}` } })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('No se pudo cargar la biblioteca')))
      .then(data => { if (active) setFiles(data.data ?? []); })
      .catch(cause => { if (active) void adminAlert.failure(cause, 'No se pudo cargar la biblioteca'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [apiKey]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = checkImageFile(file);
    if (problem) { void adminAlert.validation([problem]); return; }
    setUploading(true);
    try {
      onSelect(await uploadImage(file, apiKey));
      void adminAlert.toast('Imagen subida');
      onClose();
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const visible = files.filter(file => `${file.original_name} ${file.alt_text}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es')));
  return (
    <Modal title="Biblioteca de medios" subtitle="Selecciona una imagen o sube una nueva" icon={ImageIcon} onClose={onClose} size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary">Cancelar</button>
        <label className={`admin-btn admin-btn-primary cursor-pointer ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{uploading ? 'Subiendo…' : 'Subir imagen'}
          <input type="file" accept={IMAGE_TYPES.join(',')} className="sr-only" disabled={uploading} onChange={event => void handleUpload(event)} />
        </label>
      </>}>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar imagen por nombre" className="mb-4" />
      {loading ? <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">{Array.from({ length: 10 }, (_, index) => <div key={index} className="admin-skeleton aspect-square" />)}</div>
        : visible.length === 0 ? <EmptyState icon={ImageIcon} title="No hay imágenes" text="Sube una imagen para usarla en tus productos." />
          : <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {visible.map(file => (
              <button key={file.id} type="button" onClick={() => { onSelect(file.url); onClose(); }} title={file.original_name}
                className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1.5 transition hover:border-[#0052cc] hover:ring-2 hover:ring-blue-100">
                <img src={file.url} alt={file.alt_text || file.original_name} className="h-full w-full object-contain transition-transform group-hover:scale-105" loading="lazy" />
                <span className="absolute inset-x-0 bottom-0 truncate bg-slate-900/75 px-1 py-0.5 text-center text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">{file.original_name}</span>
              </button>
            ))}
          </div>}
    </Modal>
  );
}

const emptyProduct = (category: string): ProductForm => ({
  name: '', category, price: 0, image: '', description: '', specs: [], stock: 0, rating: 0, reviews: 0, isActive: false,
});

const numberValue = (value: string) => value === '' ? Number.NaN : Number(value);
const numberInput = (value: number) => Number.isNaN(value) ? '' : value;

export default function AdminProducts() {
  const { products, categoryList, addProduct, updateProduct, deleteProduct, apiKey } = useAdmin();
  const { formatShort } = useCurrency();
  const [search, setSearch] = useUrlParam('search');
  const [filterCat, setFilterCat] = useState('Todos');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(() => emptyProduct(categoryList[0] ?? ''));
  const [specsInput, setSpecsInput] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [uploadingDirect, setUploadingDirect] = useState(false);


  const term = search.trim().toLocaleLowerCase('es');
  const filtered = products.filter(product => {
    const matchSearch = !term || `${product.name} ${product.id} ${product.category}`.toLocaleLowerCase('es').includes(term);
    const matchCat = filterCat === 'Todos' || product.category === filterCat;
    const matchStatus = status === 'all' || (status === 'published' ? product.isActive : status === 'draft' ? !product.isActive : product.stock <= 5);
    return matchSearch && matchCat && matchStatus;
  });
  const published = products.filter(product => product.isActive).length;
  const lowStock = products.filter(product => product.stock <= 5).length;
  const stockValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);

  const clearError = (key: string) => setErrors(current => { if (!current[key]) return current; const next = { ...current }; delete next[key]; return next; });
  const update = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm(current => ({ ...current, [key]: value }));
    clearError(key);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProduct(categoryList[0] ?? ''));
    setSpecsInput('');
    setErrors({});
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    const { id: _id, ...rest } = product;
    void _id;
    setEditing(product);
    setForm(rest);
    setSpecsInput(product.specs.join('\n'));
    setErrors({});
    setOpen(true);
  };

  const close = () => { if (!saving) setOpen(false); };

  const handleSave = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const specs = specsInput.split('\n').map(spec => spec.trim()).filter(Boolean);
    // Al editar se permite conservar una categoría que ya no exista en la lista.
    const allowed = editing ? [...categoryList, editing.category] : categoryList;
    const result = validate(productSchema(allowed), { ...form, specs });
    if (!result.ok) {
      setErrors(result.errors);
      void adminAlert.validation(result.messages);
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, ...result.data, specs } as ProductForm;
      if (editing) await updateProduct({ ...data, id: editing.id });
      else await addProduct(data);
      setOpen(false);
      void adminAlert.success(editing ? 'Producto actualizado' : 'Producto creado', data.isActive ? 'Ya está visible en la tienda.' : 'Guardado como borrador.');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo guardar en la base de datos');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!await adminAlert.confirmDelete('¿Eliminar producto?', `"${product.name}" se eliminará permanentemente del catálogo.`)) return;
    try {
      await deleteProduct(product.id);
      void adminAlert.success('Producto eliminado');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo eliminar el producto');
    }
  };

  const togglePublished = async (product: Product) => {
    if (!product.isActive && product.price <= 0) {
      void adminAlert.validation(['Para publicar el producto el precio debe ser mayor que cero']);
      return;
    }
    try {
      await updateProduct({ ...product, isActive: !product.isActive });
      void adminAlert.toast(product.isActive ? 'Producto ocultado' : 'Producto publicado');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo cambiar la visibilidad');
    }
  };

  const handleDirectUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = checkImageFile(file);
    if (problem) { void adminAlert.validation([problem]); return; }
    setUploadingDirect(true);
    try {
      update('image', await uploadImage(file, apiKey));
      void adminAlert.toast('Imagen subida');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo subir la imagen');
    } finally {
      setUploadingDirect(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Productos" description="Administra el catálogo, precios, stock y visibilidad en la tienda."
        actions={<button onClick={openAdd} className="admin-btn admin-btn-primary"><Plus className="h-4 w-4" /> Agregar producto</button>} />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Resumen del catálogo">
        <StatCard label="Productos" value={products.length.toLocaleString('es-PE')} icon={Package} tone="blue" detail={`${categoryList.length} categorías`} />
        <StatCard label="Publicados" value={published.toLocaleString('es-PE')} icon={Eye} tone="green" detail={`${products.length - published} en borrador`} />
        <StatCard label="Stock bajo o agotado" value={lowStock.toLocaleString('es-PE')} icon={AlertTriangle} tone={lowStock ? 'amber' : 'slate'} detail="5 unidades o menos" />
        <StatCard label="Valor del inventario" value={formatShort(stockValue)} icon={Wallet} tone="violet" detail="Precio × stock disponible" />
      </section>

      <div className="admin-card overflow-hidden">
        <div className="admin-card-header">
          <Segmented label="Filtrar por estado" value={status} onChange={setStatus} options={[
            { value: 'all', label: 'Todos', count: products.length },
            { value: 'published', label: 'Publicados', count: published },
            { value: 'draft', label: 'Borradores', count: products.length - published },
            { value: 'low', label: 'Stock bajo', count: lowStock },
          ]} />
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o ID" className="sm:w-64" />
            <select value={filterCat} onChange={event => setFilterCat(event.target.value)} aria-label="Filtrar por categoría" className="admin-input sm:w-48">
              <option value="Todos">Todas las categorías</option>
              {categoryList.map(category => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="hidden md:table-cell">Categoría</th>
                <th className="!text-right">Precio</th>
                <th className="!text-right">Stock</th>
                <th className="hidden lg:table-cell">Rating</th>
                <th>Estado</th>
                <th className="!text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={product.image} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1" loading="lazy" />
                      <div className="min-w-0">
                        <p className="max-w-[260px] truncate font-semibold text-slate-900">{product.name}</p>
                        <p className="text-[11px] text-slate-400">ID {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden text-slate-600 md:table-cell">{product.category}</td>
                  <td className="tabular text-right">
                    <span className="font-bold text-slate-900">{product.price > 0 ? formatShort(product.price) : <span className="font-medium text-slate-400">Por definir</span>}</span>
                    {product.originalPrice ? <span className="block text-[11px] text-slate-400 line-through">{formatShort(product.originalPrice)}</span> : null}
                  </td>
                  <td className="tabular text-right">
                    <span className={`inline-flex items-center gap-1 font-bold ${product.stock === 0 ? 'text-rose-600' : product.stock <= 5 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {product.stock <= 5 && <AlertTriangle className="h-3.5 w-3.5" />}{product.stock}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell">
                    {product.rating > 0 ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{product.rating.toFixed(1)} <span className="font-normal text-slate-400">({product.reviews})</span></span> : <span className="text-slate-300">—</span>}
                  </td>
                  <td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={product.isActive ? 'green' : 'amber'}>{product.isActive ? 'Publicado' : 'Borrador'}</Badge>
                      {product.badge && <Badge tone={badgeTone[product.badge]} dot={false}>{product.badge}</Badge>}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-0.5">
                      <button onClick={() => void togglePublished(product)} className="admin-action" title={product.isActive ? 'Ocultar de la tienda' : 'Publicar en la tienda'} aria-label={`${product.isActive ? 'Ocultar' : 'Publicar'} ${product.name}`}>{product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                      <button onClick={() => openEdit(product)} className="admin-action" title="Editar" aria-label={`Editar ${product.name}`}><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => void handleDelete(product)} className="admin-action admin-action-danger" title="Eliminar" aria-label={`Eliminar ${product.name}`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState icon={Package} title={products.length ? 'Sin resultados' : 'Aún no hay productos'} text={products.length ? 'Prueba con otro término o cambia los filtros.' : 'Crea tu primer producto para empezar a vender.'}
            action={!products.length && <button onClick={openAdd} className="admin-btn admin-btn-primary"><Plus className="h-4 w-4" /> Agregar producto</button>} />}
        </div>
        {filtered.length > 0 && <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Mostrando {filtered.length} de {products.length} productos</p>}
      </div>

      {open && (
        <Modal title={editing ? 'Editar producto' : 'Nuevo producto'} subtitle={editing ? editing.name : 'Completa los datos del producto'} icon={Package} onClose={close} size="lg"
          footer={<>
            <button type="button" onClick={close} className="admin-btn admin-btn-secondary">Cancelar</button>
            <button type="submit" form="product-form" disabled={saving} className="admin-btn admin-btn-primary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editing ? 'Guardar cambios' : 'Crear producto'}</button>
          </>}>
          <form id="product-form" onSubmit={event => void handleSave(event)} noValidate className="grid gap-4 sm:grid-cols-6">
            <Field label="Nombre del producto" required error={errors.name} className="sm:col-span-6">
              {props => <input {...props} value={form.name} maxLength={120} onChange={event => update('name', event.target.value)} placeholder="Ej: Switch PoE 24 puertos" className="admin-input" />}
            </Field>
            <Field label="Categoría" required error={errors.category} className="sm:col-span-3">
              {props => <select {...props} value={form.category} onChange={event => update('category', event.target.value)} className="admin-input">
                {!categoryList.includes(form.category) && <option value={form.category}>{form.category || 'Selecciona una categoría'}</option>}
                {categoryList.map(category => <option key={category} value={category}>{category}</option>)}
              </select>}
            </Field>
            <Field label="Insignia" error={errors.badge} className="sm:col-span-3">
              {props => <select {...props} value={form.badge ?? ''} onChange={event => update('badge', (event.target.value || undefined) as Product['badge'])} className="admin-input">
                <option value="">Sin insignia</option>
                {badgeOptions.map(badge => <option key={badge} value={badge}>{badge}</option>)}
              </select>}
            </Field>
            <Field label="Precio (S/)" required={Boolean(form.isActive)} error={errors.price} className="sm:col-span-2">
              {props => <input {...props} type="number" inputMode="decimal" min="0" step="0.01" value={numberInput(form.price)} onChange={event => update('price', numberValue(event.target.value))} className="admin-input tabular" />}
            </Field>
            <Field label="Precio anterior" hint="Opcional, muestra el descuento" error={errors.originalPrice} className="sm:col-span-2">
              {props => <input {...props} type="number" inputMode="decimal" min="0" step="0.01" value={form.originalPrice ?? ''} onChange={event => update('originalPrice', event.target.value ? Number(event.target.value) : undefined)} className="admin-input tabular" />}
            </Field>
            <Field label="Stock" required error={errors.stock} className="sm:col-span-2">
              {props => <input {...props} type="number" inputMode="numeric" min="0" step="1" value={numberInput(form.stock)} onChange={event => update('stock', numberValue(event.target.value))} className="admin-input tabular" />}
            </Field>
            <Field label="Rating (0 – 5)" error={errors.rating} className="sm:col-span-3">
              {props => <input {...props} type="number" inputMode="decimal" min="0" max="5" step="0.1" value={numberInput(form.rating)} onChange={event => update('rating', numberValue(event.target.value))} className="admin-input tabular" />}
            </Field>
            <Field label="N.° de reseñas" error={errors.reviews} className="sm:col-span-3">
              {props => <input {...props} type="number" inputMode="numeric" min="0" step="1" value={numberInput(form.reviews)} onChange={event => update('reviews', numberValue(event.target.value))} className="admin-input tabular" />}
            </Field>

            <Field label="Imagen del producto" required error={errors.image} hint={`JPG, PNG, WEBP o SVG · máx. ${MAX_UPLOAD_MB} MB`} className="sm:col-span-6">
              {props => <div className="flex flex-col gap-2 sm:flex-row">
                <input {...props} value={form.image} onChange={event => update('image', event.target.value)} placeholder="/uploads/archivo.png o https://…" className="admin-input flex-1" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowMediaPicker(true)} className="admin-btn admin-btn-secondary flex-1"><ImageIcon className="h-4 w-4" /> Biblioteca</button>
                  <label className={`admin-btn admin-btn-secondary flex-1 cursor-pointer ${uploadingDirect ? 'pointer-events-none opacity-60' : ''}`}>
                    {uploadingDirect ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{uploadingDirect ? 'Subiendo…' : 'Subir'}
                    <input type="file" accept={IMAGE_TYPES.join(',')} className="sr-only" disabled={uploadingDirect} onChange={event => void handleDirectUpload(event)} />
                  </label>
                </div>
              </div>}
            </Field>
            {form.image && <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 sm:col-span-6">
              <img src={form.image} alt="Vista previa" className="h-16 w-16 rounded-lg border border-slate-200 bg-white object-contain p-1" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} onLoad={event => { event.currentTarget.style.visibility = 'visible'; }} />
              <p className="min-w-0 truncate text-xs text-slate-600">{form.image}</p>
            </div>}

            <Field label="Descripción" required error={errors.description} hint={`${form.description.trim().length}/2000 caracteres · mínimo 10`} className="sm:col-span-6">
              {props => <textarea {...props} value={form.description} maxLength={2000} rows={3} onChange={event => update('description', event.target.value)} placeholder="Describe el producto para la tienda…" className="admin-input" />}
            </Field>
            <Field label="Especificaciones técnicas" error={errors.specs} hint="Una por línea · máximo 30" className="sm:col-span-6">
              {props => <textarea {...props} value={specsInput} rows={4} onChange={event => { setSpecsInput(event.target.value); clearError('specs'); }} placeholder={'24 puertos Gigabit\nPoE+ 370 W\nAdministrable L2'} className="admin-input font-mono text-xs" />}
            </Field>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-6">
              <div>
                <p className="text-sm font-semibold text-slate-900">Publicar en la tienda</p>
                <p className="text-xs text-slate-500">Los productos publicados requieren un precio mayor que cero.</p>
              </div>
              <Switch checked={Boolean(form.isActive)} onChange={value => update('isActive', value)} label="Publicar en la tienda" />
            </div>
          </form>
        </Modal>
      )}

      {showMediaPicker && <MediaPickerModal apiKey={apiKey} onSelect={url => update('image', url)} onClose={() => setShowMediaPicker(false)} />}
    </div>
  );
}
