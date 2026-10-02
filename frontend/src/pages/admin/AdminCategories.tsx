import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Loader2, Package, Plus, Tag, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { adminAlert } from '../../utils/adminAlerts';
import { labelSchema, validate } from '../../utils/adminValidation';
import { EmptyState, Field, PageHeader, SearchInput, StatCard } from '../../components/admin/AdminUI';

const COLOR_OPTIONS = [
  { label: 'Azul', value: 'text-blue-600', preview: 'bg-blue-600' },
  { label: 'Celeste', value: 'text-sky-600', preview: 'bg-sky-600' },
  { label: 'Índigo', value: 'text-indigo-600', preview: 'bg-indigo-600' },
  { label: 'Rojo', value: 'text-rose-600', preview: 'bg-rose-600' },
  { label: 'Naranja', value: 'text-orange-600', preview: 'bg-orange-600' },
  { label: 'Verde', value: 'text-emerald-600', preview: 'bg-emerald-600' },
  { label: 'Morado', value: 'text-purple-600', preview: 'bg-purple-600' },
  { label: 'Gris oscuro', value: 'text-slate-800', preview: 'bg-slate-800' },
];

export default function AdminCategories() {
  const { categoryList, addCategory, deleteCategory, products, settings, saveSettings, isSavingSettings } = useAdmin();
  const brands = settings.brands ?? [];
  const [newCat, setNewCat] = useState('');
  const [catError, setCatError] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].value);
  const [brandError, setBrandError] = useState('');

  const handleAddCat = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validate(labelSchema('La categoría', categoryList), newCat);
    if (!result.ok || !result.data) { setCatError(result.messages[0]); return; }
    if (!await addCategory(result.data)) { void adminAlert.error('No se pudo guardar la categoría en el servidor.'); return; }
    setNewCat('');
    setCatError('');
    void adminAlert.success('Categoría creada', `"${result.data}" ya está disponible en el catálogo.`);
  };

  const handleAddBrand = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validate(labelSchema('La marca', brands.map(brand => brand.name)), newBrand);
    if (!result.ok || !result.data) { setBrandError(result.messages[0]); return; }
    if (!await saveSettings({ brands: [...brands, { name: result.data, colorClass: newColor }] })) { void adminAlert.error('No se pudo guardar la marca en el servidor.'); return; }
    setNewBrand('');
    setNewColor(COLOR_OPTIONS[0].value);
    setBrandError('');
    void adminAlert.success('Marca agregada');
  };

  const handleDeleteBrand = async (index: number) => {
    if (!await adminAlert.confirmDelete('¿Eliminar marca?', `${brands[index].name} dejará de mostrarse en la tienda.`)) return;
    if (await saveSettings({ brands: brands.filter((_, i) => i !== index) })) void adminAlert.success('Marca eliminada');
    else void adminAlert.error('No se pudo eliminar la marca en el servidor.');
  };

  const handleDeleteCategory = async (name: string, count: number) => {
    if (count > 0) {
      void adminAlert.info('Categoría en uso', `"${name}" tiene ${count} producto${count === 1 ? '' : 's'}. Muévelos a otra categoría o elimínalos antes de borrarla.`);
      return;
    }
    if (!await adminAlert.confirmDelete('¿Eliminar categoría?', `"${name}" dejará de estar disponible en la tienda.`)) return;
    if (await deleteCategory(name)) void adminAlert.success('Categoría eliminada');
    else void adminAlert.error('No se pudo eliminar la categoría en el servidor.');
  };

  const term = categorySearch.trim().toLocaleLowerCase('es');
  const filteredCategories = categoryList.filter(category => category.toLocaleLowerCase('es').includes(term));
  const assignedProducts = products.filter(product => categoryList.includes(product.category)).length;
  const countByCategory = new Map<string, number>();
  products.forEach(product => countByCategory.set(product.category, (countByCategory.get(product.category) ?? 0) + 1));
  const maxCount = Math.max(1, ...countByCategory.values());

  return (
    <div className="space-y-5">
      <PageHeader title="Categorías y marcas" description="Organiza el catálogo y las marcas que aparecen en la tienda." />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Categorías" value={categoryList.length} icon={FolderOpen} tone="blue" />
        <StatCard label="Productos clasificados" value={assignedProducts} icon={Package} tone="green" detail={`${products.length - assignedProducts} sin categoría válida`} />
        <StatCard label="Marcas visibles" value={brands.length} icon={Tag} tone="violet" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,.9fr)]">
        <section className="admin-card min-w-0 overflow-hidden">
          <div className="admin-card-header">
            <div><h3 className="text-[15px]">Categorías de la tienda</h3><p className="text-xs text-slate-500">{categoryList.length} categorías activas</p></div>
            <SearchInput value={categorySearch} onChange={setCategorySearch} placeholder="Buscar categoría" className="w-full sm:w-60" />
          </div>
          {filteredCategories.length ? <ul className="divide-y divide-slate-100">
            {filteredCategories.map(category => {
              const count = countByCategory.get(category) ?? 0;
              return (
                <li key={category} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-slate-50/70">
                  <span className="admin-kpi-icon admin-tone-blue !h-9 !w-9"><FolderOpen className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <Link to={`/admin/productos?search=${encodeURIComponent(category)}`} className="truncate text-sm font-semibold text-slate-900 hover:text-[#0052cc]">{category}</Link>
                      <span className="tabular shrink-0 text-xs font-semibold text-slate-500">{count} producto{count === 1 ? '' : 's'}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0052cc]/70" style={{ width: `${(count / maxCount) * 100}%` }} /></div>
                  </div>
                  <button onClick={() => void handleDeleteCategory(category, count)} className="admin-action admin-action-danger" title={count ? 'Categoría en uso' : 'Eliminar categoría'} aria-label={`Eliminar categoría ${category}`}><Trash2 className="h-4 w-4" /></button>
                </li>
              );
            })}
          </ul> : <EmptyState icon={FolderOpen} title="Sin categorías" text={term ? 'No hay categorías que coincidan con la búsqueda.' : 'Crea la primera categoría del catálogo.'} />}
        </section>

        <section className="admin-card self-start p-5">
          <h3 className="flex items-center gap-2 text-[15px]"><Plus className="h-4 w-4 text-[#0052cc]" /> Nueva categoría</h3>
          <p className="mb-4 mt-1 text-xs text-slate-500">Entre 2 y 40 caracteres. No se permiten duplicados.</p>
          <form onSubmit={event => void handleAddCat(event)} noValidate className="space-y-3">
            <Field label="Nombre de la categoría" required error={catError}>
              {props => <input {...props} value={newCat} maxLength={40} onChange={event => { setNewCat(event.target.value); setCatError(''); }} placeholder="Ej: Fibra óptica" className="admin-input" />}
            </Field>
            <button type="submit" disabled={isSavingSettings} className="admin-btn admin-btn-primary w-full">{isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Agregar categoría</button>
          </form>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,.9fr)]">
        <section className="admin-card min-w-0 overflow-hidden">
          <div className="admin-card-header"><div><h3 className="text-[15px]">Marcas y proveedores</h3><p className="text-xs text-slate-500">{brands.length} marcas mostradas en la tienda</p></div></div>
          {brands.length ? <ul className="grid gap-px bg-slate-100 sm:grid-cols-2">
            {brands.map((brand, index) => (
              <li key={`${brand.name}-${index}`} className="flex items-center justify-between gap-3 bg-white px-5 py-3.5">
                <span className="flex min-w-0 items-center gap-3"><span className="admin-kpi-icon admin-tone-slate !h-9 !w-9"><Tag className="h-4 w-4" /></span><span className={`truncate text-sm font-extrabold ${brand.colorClass}`}>{brand.name}</span></span>
                <button onClick={() => void handleDeleteBrand(index)} className="admin-action admin-action-danger" aria-label={`Eliminar marca ${brand.name}`} title="Eliminar marca"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul> : <EmptyState icon={Tag} title="No hay marcas configuradas" text="Agrega las marcas que distribuyes para mostrarlas en la tienda." />}
        </section>

        <section className="admin-card self-start p-5">
          <h3 className="flex items-center gap-2 text-[15px]"><Plus className="h-4 w-4 text-[#0052cc]" /> Nueva marca</h3>
          <form onSubmit={event => void handleAddBrand(event)} noValidate className="mt-4 space-y-4">
            <Field label="Nombre de la marca" required error={brandError}>
              {props => <input {...props} value={newBrand} maxLength={40} onChange={event => { setNewBrand(event.target.value); setBrandError(''); }} placeholder="Ej: Ubiquiti" className="admin-input" />}
            </Field>
            <div>
              <p className="admin-label">Color distintivo</p>
              <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Color de la marca">
                {COLOR_OPTIONS.map(option => <button key={option.value} type="button" role="radio" aria-checked={newColor === option.value} aria-label={option.label} title={option.label} onClick={() => setNewColor(option.value)}
                  className={`h-7 w-7 rounded-full ${option.preview} transition ${newColor === option.value ? 'scale-110 ring-2 ring-[#0052cc] ring-offset-2' : 'opacity-70 hover:opacity-100'}`} />)}
              </div>
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">Vista previa: <span className={`text-sm font-extrabold ${newColor}`}>{newBrand.trim() || 'Marca'}</span></p>
            </div>
            <button type="submit" disabled={isSavingSettings} className="admin-btn admin-btn-primary w-full">{isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Agregar marca</button>
          </form>
        </section>
      </div>
    </div>
  );
}
