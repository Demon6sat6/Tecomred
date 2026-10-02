import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Boxes, Check, Loader2, Minus, Package, PackageX, Plus, Wallet } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';
import type { Product } from '../../types';
import { adminAlert } from '../../utils/adminAlerts';
import { Badge, EmptyState, PageHeader, SearchInput, Segmented, StatCard } from '../../components/admin/AdminUI';

type Filter = 'all' | 'empty' | 'low' | 'ok';
const LOW_STOCK = 5;
const MAX_STOCK = 100_000;

function StockEditor({ product, onSave }: { product: Product; onSave: (product: Product, stock: number) => Promise<void> }) {
  const [value, setValue] = useState(String(product.stock));
  const [saving, setSaving] = useState(false);
  const [lastSynced, setLastSynced] = useState(product.stock);
  // Si el stock cambia en el servidor y no hay edición pendiente, refleja el valor nuevo.
  if (product.stock !== lastSynced) {
    setLastSynced(product.stock);
    if (Number(value) === lastSynced) setValue(String(product.stock));
  }
  const parsed = Number(value);
  const valid = value.trim() !== '' && Number.isInteger(parsed) && parsed >= 0 && parsed <= MAX_STOCK;
  const changed = valid && parsed !== product.stock;

  const commit = async () => {
    if (!valid) { void adminAlert.validation([`El stock debe ser un número entero entre 0 y ${MAX_STOCK.toLocaleString('es-PE')}`]); return; }
    if (!changed) return;
    setSaving(true);
    try { await onSave(product, parsed); } finally { setSaving(false); }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <div className={`flex items-center rounded-lg border ${valid ? 'border-slate-200' : 'border-rose-400'} bg-white`}>
        <button type="button" onClick={() => setValue(current => String(Math.max(0, (Number(current) || 0) - 1)))} className="grid h-8 w-8 place-items-center text-slate-500 hover:bg-slate-50" aria-label={`Restar uno a ${product.name}`}><Minus className="h-3.5 w-3.5" /></button>
        <input value={value} inputMode="numeric" maxLength={6} onChange={event => setValue(event.target.value.replace(/[^\d]/g, ''))} onKeyDown={event => { if (event.key === 'Enter') void commit(); if (event.key === 'Escape') setValue(String(product.stock)); }}
          aria-label={`Stock de ${product.name}`} aria-invalid={!valid} className="tabular h-8 w-14 border-x border-slate-200 text-center text-sm font-bold text-slate-900 outline-none focus:bg-blue-50" />
        <button type="button" onClick={() => setValue(current => String(Math.min(MAX_STOCK, (Number(current) || 0) + 1)))} className="grid h-8 w-8 place-items-center text-slate-500 hover:bg-slate-50" aria-label={`Sumar uno a ${product.name}`}><Plus className="h-3.5 w-3.5" /></button>
      </div>
      <button type="button" onClick={() => void commit()} disabled={!changed || saving} className={`grid h-8 w-8 place-items-center rounded-lg transition ${changed ? 'bg-[#0052cc] text-white hover:bg-[#0043a8]' : 'text-slate-300'}`} aria-label={`Guardar stock de ${product.name}`} title="Guardar">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function AdminInventory() {
  const { products, updateProduct } = useAdmin();
  const { formatShort } = useCurrency();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const empty = products.filter(product => product.stock === 0);
  const low = products.filter(product => product.stock > 0 && product.stock <= LOW_STOCK);
  const units = products.reduce((sum, product) => sum + product.stock, 0);
  const value = products.reduce((sum, product) => sum + product.stock * product.price, 0);
  const term = query.trim().toLocaleLowerCase('es');
  const filtered = products
    .filter(product => (!term || `${product.name} ${product.category} ${product.id}`.toLocaleLowerCase('es').includes(term)) &&
      (filter === 'empty' ? product.stock === 0 : filter === 'low' ? product.stock > 0 && product.stock <= LOW_STOCK : filter === 'ok' ? product.stock > LOW_STOCK : true))
    .sort((a, b) => a.stock - b.stock);

  const saveStock = async (product: Product, stock: number) => {
    try {
      await updateProduct({ ...product, stock });
      void adminAlert.toast(`Stock actualizado: ${product.name} → ${stock}`);
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo actualizar el stock');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Inventario" description="Controla existencias y ajusta el stock directamente desde la tabla." />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Unidades en stock" value={units.toLocaleString('es-PE')} icon={Boxes} tone="blue" detail={`${products.length} productos`} />
        <StatCard label="Agotados" value={empty.length} icon={PackageX} tone={empty.length ? 'rose' : 'slate'} />
        <StatCard label={`Stock bajo (≤ ${LOW_STOCK})`} value={low.length} icon={AlertTriangle} tone={low.length ? 'amber' : 'slate'} />
        <StatCard label="Valor del inventario" value={formatShort(value)} icon={Wallet} tone="violet" />
      </section>

      <div className="admin-card overflow-hidden">
        <div className="admin-card-header">
          <Segmented label="Filtrar inventario" value={filter} onChange={setFilter} options={[
            { value: 'all', label: 'Todos', count: products.length },
            { value: 'empty', label: 'Agotados', count: empty.length },
            { value: 'low', label: 'Stock bajo', count: low.length },
            { value: 'ok', label: 'Disponibles', count: products.length - empty.length - low.length },
          ]} />
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar producto o categoría" className="w-full sm:w-72" />
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead><tr><th>Producto</th><th className="hidden md:table-cell">Categoría</th><th>Estado</th><th className="hidden !text-right sm:table-cell">Valor</th><th className="!text-right">Stock</th></tr></thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={product.image} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1" loading="lazy" />
                      <div className="min-w-0"><Link to={`/admin/productos?search=${encodeURIComponent(product.name)}`} className="block max-w-[260px] truncate font-semibold text-slate-900 hover:text-[#0052cc]">{product.name}</Link><p className="text-[11px] text-slate-400">ID {product.id}</p></div>
                    </div>
                  </td>
                  <td className="hidden text-slate-600 md:table-cell">{product.category}</td>
                  <td>{product.stock === 0 ? <Badge tone="rose">Agotado</Badge> : product.stock <= LOW_STOCK ? <Badge tone="amber">Stock bajo</Badge> : <Badge tone="green">Disponible</Badge>}</td>
                  <td className="tabular hidden text-right text-slate-700 sm:table-cell">{formatShort(product.stock * product.price)}</td>
                  <td><StockEditor product={product} onSave={saveStock} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <EmptyState icon={Package} title="Sin productos" text="No hay productos para este filtro." />}
        </div>
        <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Escribe la cantidad y pulsa Enter o el botón ✓ para guardar. Esc deshace el cambio.</p>
      </div>
    </div>
  );
}
