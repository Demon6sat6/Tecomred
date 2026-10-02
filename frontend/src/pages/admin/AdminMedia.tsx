import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, HardDrive, ImageIcon, Loader2, Pencil, Trash2, Upload, UploadCloud } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { adminAlert } from '../../utils/adminAlerts';
import { EmptyState, PageHeader, SearchInput, StatCard } from '../../components/admin/AdminUI';

interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  url: string;
  size_bytes: number;
  mime_type: string;
  alt_text: string;
  created_at: string;
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || '/api';
const MAX_MB = 10;
const MAX_FILES = 10;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminMedia() {
  const { apiKey } = useAdmin();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loadError, setLoadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/media`, { headers: { Authorization: `Bearer ${apiKey}` }, cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudo cargar la biblioteca de medios');
      const json = await res.json();
      setFiles(json.data ?? []);
      setLoadError('');
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'No se pudo cargar la biblioteca de medios');
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    // Sincroniza con el servidor (sistema externo); el estado se actualiza tras la respuesta.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchFiles();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void fetchFiles(); }, 10000);
    return () => window.clearInterval(timer);
  }, [fetchFiles]);

  const uploadFiles = async (selected: FileList | File[]) => {
    const fileArr = Array.from(selected);
    if (!fileArr.length) return;
    const problems = [
      ...(fileArr.length > MAX_FILES ? [`Puedes subir hasta ${MAX_FILES} archivos a la vez`] : []),
      ...fileArr.filter(file => !IMAGE_TYPES.includes(file.type)).map(file => `${file.name}: formato no permitido`),
      ...fileArr.filter(file => file.size > MAX_MB * 1024 * 1024).map(file => `${file.name}: supera ${MAX_MB} MB`),
    ];
    if (problems.length) { void adminAlert.validation(problems); return; }

    setUploading(true);
    const form = new FormData();
    fileArr.forEach(file => form.append('files', file));
    try {
      const res = await fetch(`${API_URL}/media/upload`, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al subir archivos');
      }
      await fetchFiles();
      void adminAlert.success(fileArr.length === 1 ? 'Imagen subida' : `${fileArr.length} imágenes subidas`);
    } catch (cause) {
      void adminAlert.failure(cause, 'Error al subir archivos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    void uploadFiles(event.dataTransfer.files);
  };

  const copyUrl = async (file: MediaFile) => {
    try {
      await navigator.clipboard.writeText(new URL(file.url, window.location.origin).href);
      setCopiedId(file.id);
      window.setTimeout(() => setCopiedId(null), 1800);
      void adminAlert.toast('URL copiada');
    } catch {
      void adminAlert.error('El navegador no permitió copiar al portapapeles.');
    }
  };

  const editAlt = async (file: MediaFile) => {
    const value = await adminAlert.prompt('Texto alternativo', {
      value: file.alt_text, label: 'Describe la imagen para accesibilidad y SEO', placeholder: 'Ej: Switch Cisco de 24 puertos', maxLength: 255,
      validator: text => text.trim().length > 255 ? 'Máximo 255 caracteres' : /[<>]/.test(text) ? 'No uses los caracteres < o >' : null,
    });
    if (value === null) return;
    try {
      const res = await fetch(`${API_URL}/media/${file.id}/alt`, { method: 'PATCH', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ alt_text: value }) });
      if (!res.ok) throw new Error('No se pudo actualizar el texto alternativo');
      setFiles(current => current.map(item => item.id === file.id ? { ...item, alt_text: value } : item));
      void adminAlert.toast('Texto alternativo guardado');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo actualizar el texto alternativo');
    }
  };

  const confirmDelete = async (file: MediaFile) => {
    if (!await adminAlert.confirmDelete('¿Eliminar imagen?', `${file.original_name || file.filename} se eliminará del almacenamiento. Los productos que la usen dejarán de mostrarla.`)) return;
    try {
      const response = await fetch(`${API_URL}/media/${file.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${apiKey}` } });
      if (!response.ok) throw new Error('No se pudo eliminar el archivo');
      setFiles(current => current.filter(item => item.id !== file.id));
      void adminAlert.success('Imagen eliminada');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo eliminar el archivo');
    }
  };

  const term = search.trim().toLocaleLowerCase('es');
  const filtered = files.filter(file => `${file.original_name || file.filename} ${file.alt_text || ''}`.toLocaleLowerCase('es').includes(term));
  const totalSize = files.reduce((sum, file) => sum + (file.size_bytes || 0), 0);
  const withoutAlt = files.filter(file => !file.alt_text).length;

  return (
    <div className="space-y-5">
      <PageHeader title="Biblioteca de medios" description="Imágenes del catálogo almacenadas en el servidor."
        actions={<button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="admin-btn admin-btn-primary">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{uploading ? 'Subiendo…' : 'Subir imágenes'}</button>} />
      <input ref={fileInputRef} type="file" multiple accept={IMAGE_TYPES.join(',')} className="sr-only" onChange={event => event.target.files && void uploadFiles(event.target.files)} />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <StatCard label="Imágenes" value={files.length} icon={ImageIcon} tone="blue" />
        <StatCard label="Espacio usado" value={formatBytes(totalSize)} icon={HardDrive} tone="violet" />
        <StatCard label="Sin texto alternativo" value={withoutAlt} icon={Pencil} tone={withoutAlt ? 'amber' : 'green'} detail="Mejora la accesibilidad y el SEO" />
      </section>

      <div
        onDragOver={event => { event.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fileInputRef.current?.click(); } }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${dragOver ? 'border-[#0052cc] bg-blue-50' : 'border-slate-300 bg-white hover:border-[#0052cc]/50 hover:bg-slate-50'}`}
        aria-label="Arrastra imágenes aquí o haz clic para seleccionarlas"
      >
        {uploading ? <Loader2 className="h-8 w-8 animate-spin text-[#0052cc]" /> : <UploadCloud className={`h-8 w-8 ${dragOver ? 'text-[#0052cc]' : 'text-slate-400'}`} />}
        <p className="mt-2 text-sm font-semibold text-slate-800">{uploading ? 'Subiendo imágenes…' : 'Arrastra imágenes aquí o haz clic para seleccionarlas'}</p>
        <p className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP, GIF, SVG o AVIF · máx. {MAX_MB} MB por archivo · hasta {MAX_FILES} a la vez</p>
      </div>

      {loadError && <p role="alert" className="admin-alert admin-alert-error">{loadError}</p>}

      <div className="admin-card overflow-hidden">
        <div className="admin-card-header">
          <div><h3 className="text-[15px]">Archivos</h3><p className="text-xs text-slate-500">{filtered.length} de {files.length} imágenes</p></div>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o texto alternativo" className="w-full sm:w-72" />
        </div>
        <div className="p-4 sm:p-5">
          {loading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">{Array.from({ length: 12 }, (_, index) => <div key={index} className="admin-skeleton aspect-[4/5]" />)}</div>
            : filtered.length === 0 ? <EmptyState icon={ImageIcon} title={files.length ? 'Sin resultados' : 'La biblioteca está vacía'} text={files.length ? 'Ninguna imagen coincide con la búsqueda.' : 'Sube imágenes para usarlas en tus productos.'} />
              : <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                {filtered.map(file => (
                  <figure key={file.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-md">
                    <div className="relative aspect-square bg-slate-50 p-3">
                      <img src={file.url} alt={file.alt_text || file.original_name} className="h-full w-full object-contain" loading="lazy" />
                      <div className="absolute inset-x-2 bottom-2 flex justify-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        <button onClick={() => void copyUrl(file)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-slate-700 shadow hover:text-[#0052cc]" title="Copiar URL" aria-label={`Copiar URL de ${file.original_name}`}>{copiedId === file.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}</button>
                        <button onClick={() => void editAlt(file)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-slate-700 shadow hover:text-[#0052cc]" title="Editar texto alternativo" aria-label={`Editar texto alternativo de ${file.original_name}`}><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => void confirmDelete(file)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-slate-700 shadow hover:text-rose-600" title="Eliminar" aria-label={`Eliminar ${file.original_name}`}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <figcaption className="border-t border-slate-100 px-3 py-2">
                      <p className="truncate text-xs font-semibold text-slate-800" title={file.original_name}>{file.original_name || file.filename}</p>
                      <p className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-slate-400"><span>{formatBytes(file.size_bytes)}</span>{!file.alt_text && <span className="font-semibold text-amber-600">Sin alt</span>}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>}
        </div>
      </div>
    </div>
  );
}
