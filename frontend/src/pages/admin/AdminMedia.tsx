import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Trash2, Copy, Check, Search, X, ImageIcon, Loader2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

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

const API_URL = '/api';

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
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const headers = { Authorization: `Bearer ${apiKey}` };

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/media`, { headers });
      if (!res.ok) throw new Error('Error al cargar archivos');
      const json = await res.json();
      setFiles(json.data ?? []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const uploadFiles = async (selected: FileList | File[]) => {
    const fileArr = Array.from(selected);
    if (fileArr.length === 0) return;

    const MAX_MB = 10;
    const oversized = fileArr.filter(f => f.size > MAX_MB * 1024 * 1024);
    if (oversized.length > 0) {
      setUploadError(`Archivos muy grandes (máx ${MAX_MB} MB): ${oversized.map(f => f.name).join(', ')}`);
      return;
    }

    setUploadError('');
    setUploading(true);
    const form = new FormData();
    fileArr.forEach(f => form.append('files', f));

    try {
      const res = await fetch(`${API_URL}/media/upload`, { method: 'POST', headers, body: form });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al subir archivos');
      }
      await fetchFiles();
    } catch (err: any) {
      setUploadError(err.message || 'Error al subir archivos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const copyUrl = (file: MediaFile) => {
    navigator.clipboard.writeText(file.url).then(() => {
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await fetch(`${API_URL}/media/${deleteId}`, { method: 'DELETE', headers });
      setFiles(prev => prev.filter(f => f.id !== deleteId));
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = files.filter(f =>
    (f.original_name || f.filename).toLowerCase().includes(search.toLowerCase()) ||
    (f.alt_text || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Biblioteca de Medios</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Imágenes limpias, sin hashes y sincronizadas en tiempo real con la base de datos MySQL
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-blue-600/20 disabled:opacity-60 self-start sm:self-auto"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Subiendo imágenes...' : 'Subir imágenes'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 bg-white ${
          dragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
            <p className="text-slate-800 text-sm font-bold">Procesando y guardando archivos en MySQL...</p>
            <p className="text-slate-400 text-xs">Asignando nombres limpios y legibles para SEO</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-slate-800 text-sm font-bold">Arrastra imágenes aquí o haz clic para subir</p>
            <p className="text-slate-400 text-xs">JPG, PNG, WebP, GIF, SVG — Nombres limpios automáticos para e-commerce</p>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
          <X className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{uploadError}</span>
          <button onClick={() => setUploadError('')} className="ml-auto text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar imagen por nombre legible o descripción..."
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid of Images */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square bg-slate-200/70 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl p-8">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-700 font-bold text-sm">
            {files.length === 0 ? 'No hay imágenes almacenadas aún' : 'No se encontraron coincidencias'}
          </p>
          <p className="text-slate-400 text-xs mt-1">Sube tus fotos de productos con nombres limpios y legibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(file => (
            <div key={file.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden group shadow-xs hover:shadow-md hover:border-slate-300 transition-all relative flex flex-col">
              <div className="aspect-square bg-slate-50 relative flex items-center justify-center p-2 overflow-hidden border-b border-slate-100">
                <img
                  src={file.url}
                  alt={file.alt_text || file.original_name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
                {/* Hover overlay with action buttons */}
                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <button
                    onClick={() => copyUrl(file)}
                    className="p-2.5 rounded-xl bg-white text-slate-800 hover:bg-blue-600 hover:text-white shadow-md transition-colors"
                    title="Copiar ruta unhashed"
                  >
                    {copiedId === file.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteId(file.id)}
                    className="p-2.5 rounded-xl bg-white text-rose-600 hover:bg-rose-600 hover:text-white shadow-md transition-colors"
                    title="Eliminar de servidor y BD"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 bg-white flex-1 flex flex-col justify-between">
                <p className="text-slate-800 text-xs font-bold truncate" title={file.filename}>
                  {file.filename}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>{formatBytes(file.size_bytes)}</span>
                  <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">BD #{file.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>
            <h3 className="text-slate-900 font-extrabold text-lg mb-2">¿Eliminar imagen?</h3>
            <p className="text-slate-500 text-sm mb-6">
              El archivo se eliminará de forma permanente del almacenamiento físico y del registro de la base de datos MySQL.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
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
