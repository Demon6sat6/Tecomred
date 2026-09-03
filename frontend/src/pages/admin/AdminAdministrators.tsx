import { useEffect, useState } from 'react';
import { Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import { useAdmin, type Administrator } from '../../context/AdminContext';

const emptyForm = { name: '', username: '', email: '', password: '', role: 'editor' as Administrator['role'], isActive: true };

export default function AdminAdministrators() {
  const { administrators, loadAdministrators, addAdministrator, updateAdministrator, deleteAdministrator } = useAdmin();
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Administrator | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadAdministrators().catch(() => setError('No se pudieron cargar los administradores')); }, []);

  const save = async () => {
    setError('');
    try {
      if (editing) {
        await updateAdministrator(editing.id, { name: form.name, email: form.email, password: form.password || undefined, role: form.role, isActive: form.isActive });
      } else {
        await addAdministrator(form);
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
  };

  const edit = (admin: Administrator) => {
    setEditing(admin);
    setForm({ name: admin.name, username: admin.username, email: admin.email ?? '', password: '', role: admin.role, isActive: admin.isActive });
    setOpen(true);
  };

  const remove = async (id: number) => {
    if (!window.confirm('¿Eliminar este administrador?')) return;
    try { await deleteAdministrator(id); } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo eliminar'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-xl sm:text-2xl font-extrabold text-white">Administradores</h2><p className="text-gray-500 text-sm">Gestiona el acceso del equipo</p></div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold"><Plus className="w-4 h-4" /> Nuevo</button>
      </div>
      {error && <p className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</p>}
      <div className="glass rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b border-white/10"><tr><th className="text-left px-4 py-3 text-gray-500">Persona</th><th className="text-left px-4 py-3 text-gray-500">Usuario</th><th className="text-left px-4 py-3 text-gray-500">Rol</th><th className="text-left px-4 py-3 text-gray-500">Estado</th><th className="px-4 py-3" /></tr></thead><tbody>
        {administrators.map(admin => <tr key={admin.id} className="border-b border-white/5 last:border-0"><td className="px-4 py-3 text-white">{admin.name}<span className="block text-xs text-gray-500">{admin.email || 'Sin correo'}</span></td><td className="px-4 py-3 text-gray-300">{admin.username}</td><td className="px-4 py-3 text-sky-400">{admin.role}</td><td className={`px-4 py-3 ${admin.isActive ? 'text-emerald-400' : 'text-red-400'}`}>{admin.isActive ? 'Activo' : 'Inactivo'}</td><td className="px-4 py-3 text-right"><button onClick={() => edit(admin)} className="text-sky-400 mr-3">Editar</button><button onClick={() => remove(admin.id)} aria-label="Eliminar" className="text-red-400"><Trash2 className="w-4 h-4" /></button></td></tr>)}
      </tbody></table></div></div>
      {open && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"><div className="w-full max-w-md rounded-2xl bg-[#111827] border border-white/10 p-5"><div className="flex justify-between items-center mb-4"><h3 className="text-white font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-sky-400" /> {editing ? 'Editar administrador' : 'Nuevo administrador'}</h3><button onClick={() => setOpen(false)} aria-label="Cerrar"><X className="w-5 h-5 text-gray-400" /></button></div><div className="space-y-3">
        {([['name', 'Nombre'], ['username', 'Usuario'], ['email', 'Correo'], ['password', editing ? 'Nueva contraseña (opcional)' : 'Contraseña']] as const).map(([key, label]) => <input key={key} type={key === 'password' ? 'password' : 'text'} value={form[key]} disabled={Boolean(editing && key === 'username')} placeholder={label} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm" />)}
        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Administrator['role'] }))} className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-white/10 text-gray-200 text-sm"><option value="editor">Editor</option><option value="admin">Administrador</option></select>
        {editing && <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Cuenta activa</label>}
        <button onClick={save} className="w-full py-2.5 rounded-xl gradient-brand text-white font-bold">Guardar</button>
      </div></div></div>}
    </div>
  );
}
