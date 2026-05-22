import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Trash2, Copy, Check, Search, X, Image, Loader2 } from 'lucide-react';
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

    const MAX_MB = 5;
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
    f.original_name.toLowerCase().includes(search.toLowerCase()) ||
    f.alt_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Biblioteca de Medios</h2>
          <p className="text-gray-500 text-sm">{files.length} archivo{files.length !== 1 ? 's' : ''} almacenado{files.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-60 self-start sm:self-auto"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Subiendo...' : 'Subir imágenes'}
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

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver ? 'border-sky-500 bg-sky-500/10' : 'border-white/10 hover:border-sky-500/40 hover:bg-white/3'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-gray-400 text-sm">Subiendo archivos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-500" />
            <p className="text-gray-300 text-sm font-medium">Arrastra imágenes aquí o haz clic para seleccionar</p>
            <p className="text-gray-600 text-xs">JPG, PNG, WebP, GIF, SVG — Máx. 5 MB por archivo — hasta 10 a la vez</p>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <X className="w-4 h-4 shrink-0" />
          {uploadError}
          <button onClick={() => setUploadError('')} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o texto alternativo..."
          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500/60"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{files.length === 0 ? 'Aún no hay imágenes. Sube la primera.' : 'No se encontraron coincidencias.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(file => (
            <div key={file.id} className="glass rounded-2xl overflow-hidden group relative">
              <div className="aspect-square bg-gray-900 relative">
                <img
                  src={file.url}
                  alt={file.alt_text || file.original_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(file)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-sky-500/30 text-white transition-colors"
                    title="Copiar URL"
                  >
                    {copiedId === file.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteId(file.id)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-red-500/30 text-white transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-white text-xs font-medium truncate" title={file.original_name}>{file.original_name}</p>
                <p className="text-gray-500 text-[10px]">{formatBytes(file.size_bytes)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/10 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">¿Eliminar imagen?</h3>
            <p className="text-gray-400 text-sm mb-6">El archivo se eliminará permanentemente del servidor. Los productos que usen esta imagen quedarán sin foto.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-95 transition-all">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
