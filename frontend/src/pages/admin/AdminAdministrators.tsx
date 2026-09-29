import { useEffect, useState } from 'react';
import { Plus, ShieldCheck, Trash2, X, Pencil } from 'lucide-react';
import { useAdmin, type Administrator } from '../../context/AdminContext';

const emptyForm = { name: '', username: '', email: '', password: '', role: 'editor' as Administrator['role'], isActive: true };

export default function AdminAdministrators() {
  const { administrators, loadAdministrators, addAdministrator, updateAdministrator, deleteAdministrator } = useAdmin();
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Administrator | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdministrators().catch(() => setError('No se pudieron cargar los administradores'));
  }, []);

  const save = async () => {
    setError('');
    try {
      if (editing) {
        await updateAdministrator(editing.id, {
          name: form.name,
          email: form.email,
          password: form.password || undefined,
          role: form.role,
          isActive: form.isActive,
        });
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
    setForm({
      name: admin.name,
      username: admin.username,
      email: admin.email ?? '',
      password: '',
      role: admin.role,
      isActive: admin.isActive,
    });
    setOpen(true);
  };

  const remove = async (id: number) => {
    if (!window.confirm('¿Eliminar este administrador de la base de datos?')) return;
    try {
      await deleteAdministrator(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Administradores del Sistema</h2>
          <p className="text-slate-500 text-sm mt-0.5">Control de cuentas con acceso al panel administrativo y base de datos</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-blue-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Nuevo Administrador
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3.5 text-slate-500 text-xs font-bold uppercase tracking-wider">Nombre y Correo</th>
                <th className="text-left px-4 py-3.5 text-slate-500 text-xs font-bold uppercase tracking-wider">Usuario</th>
                <th className="text-left px-4 py-3.5 text-slate-500 text-xs font-bold uppercase tracking-wider">Rol</th>
                <th className="text-left px-4 py-3.5 text-slate-500 text-xs font-bold uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3.5 text-right text-slate-500 text-xs font-bold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {administrators.map(admin => (
                <tr key={admin.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-slate-900 text-xs font-bold">{admin.name}</p>
                    <span className="block text-[11px] text-slate-400">{admin.email || 'Sin correo registrado'}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                      {admin.username}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      admin.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {admin.role === 'admin' ? 'Administrador' : 'Editor'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      admin.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {admin.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => edit(admin)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar permisos"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(admin.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                {editing ? 'Editar Cuenta de Administrador' : 'Nuevo Administrador'}
              </h3>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Nombre Completo</label>
                <input
                  type="text"
                  value={form.name}
                  placeholder="Ej: Administrador Redes"
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Usuario de Acceso</label>
                <input
                  type="text"
                  value={form.username}
                  disabled={Boolean(editing)}
                  placeholder="Ej: admin_soporte"
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Correo Electrónico</label>
                <input
                  type="email"
                  value={form.email}
                  placeholder="admin@siscomred.pe"
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">
                  {editing ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña de Acceso'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  placeholder="••••••••"
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Nivel de Rol</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as Administrator['role'] }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="editor">Editor (catálogo y pedidos)</option>
                  <option value="admin">Administrador Total (control completo)</option>
                </select>
              </div>

              {editing && (
                <label className="flex items-center gap-2 text-sm text-slate-700 font-semibold pt-1">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  Cuenta activa para iniciar sesión
                </label>
              )}

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="flex-1 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                >
                  Guardar Administrador
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
