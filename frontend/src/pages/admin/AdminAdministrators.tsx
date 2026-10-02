import { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, Pencil, Plus, ShieldCheck, Trash2, UserCog, Users } from 'lucide-react';
import { useAdmin, type Administrator } from '../../context/AdminContext';
import { adminAlert } from '../../utils/adminAlerts';
import { administratorSchema, validate, type FieldErrors } from '../../utils/adminValidation';
import { Badge, EmptyState, Field, Modal, PageHeader, StatCard, Switch, TableSkeleton } from '../../components/admin/AdminUI';
import { initials } from '../../utils/adminFormat';

const emptyForm = { name: '', username: '', email: '', password: '', role: 'editor' as Administrator['role'], isActive: true };
type AdminForm = typeof emptyForm;

const passwordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(4, score);
};
const strengthLabel = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'];
const strengthColor = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'];

export default function AdminAdministrators() {
  const { administrators, loadAdministrators, addAdministrator, updateAdministrator, deleteAdministrator } = useAdmin();
  const [form, setForm] = useState<AdminForm>(emptyForm);
  const [editing, setEditing] = useState<Administrator | null>(null);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const refresh = () => loadAdministrators()
      .then(() => setLoadError(''))
      .catch((cause: unknown) => setLoadError(cause instanceof Error ? cause.message : 'No se pudieron cargar los administradores'))
      .finally(() => setLoading(false));
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 10000);
    return () => window.clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = <K extends keyof AdminForm>(key: K, value: AdminForm[K]) => {
    setForm(current => ({ ...current, [key]: value }));
    setErrors(current => { if (!current[key]) return current; const next = { ...current }; delete next[key]; return next; });
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setShowPassword(false); setOpen(true); };
  const openEdit = (admin: Administrator) => {
    setEditing(admin);
    setForm({ name: admin.name, username: admin.username, email: admin.email ?? '', password: '', role: admin.role, isActive: admin.isActive });
    setErrors({});
    setShowPassword(false);
    setOpen(true);
  };
  const close = () => { if (!saving) setOpen(false); };

  const activeAdmins = administrators.filter(admin => admin.role === 'admin' && admin.isActive);
  const isLastAdmin = (admin: Administrator) => admin.role === 'admin' && admin.isActive && activeAdmins.length <= 1;

  const save = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otherUsernames = administrators.filter(admin => admin.id !== editing?.id).map(admin => admin.username.toLowerCase());
    const result = validate(administratorSchema(!editing, otherUsernames), form);
    if (!result.ok || !result.data) {
      setErrors(result.errors);
      void adminAlert.validation(result.messages);
      return;
    }
    const data = result.data;
    if (editing && isLastAdmin(editing) && (data.role !== 'admin' || !data.isActive)) {
      void adminAlert.error('Debe quedar al menos un administrador total activo. Crea otro antes de cambiar este rol o desactivarlo.', 'Acción no permitida');
      return;
    }
    setSaving(true);
    try {
      if (editing) await updateAdministrator(editing.id, { name: data.name, email: data.email, password: data.password || undefined, role: data.role, isActive: data.isActive });
      else await addAdministrator({ name: data.name, username: data.username, email: data.email, password: data.password, role: data.role });
      setOpen(false);
      void adminAlert.success(editing ? 'Administrador actualizado' : 'Administrador creado', data.name);
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo guardar el administrador');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (admin: Administrator) => {
    if (isLastAdmin(admin)) {
      void adminAlert.error('No puedes eliminar el único administrador total activo.', 'Acción no permitida');
      return;
    }
    if (!await adminAlert.confirmDelete('¿Eliminar administrador?', `${admin.name} (@${admin.username}) perderá el acceso al panel.`)) return;
    try {
      await deleteAdministrator(admin.id);
      void adminAlert.success('Administrador eliminado');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo eliminar el administrador');
    }
  };

  const strength = passwordStrength(form.password);

  return (
    <div className="space-y-5">
      <PageHeader title="Administradores" description="Cuentas con acceso al panel y su nivel de permisos."
        actions={<button onClick={openAdd} className="admin-btn admin-btn-primary"><Plus className="h-4 w-4" /> Nuevo administrador</button>} />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <StatCard label="Cuentas" value={administrators.length} icon={Users} tone="blue" />
        <StatCard label="Administradores totales" value={administrators.filter(admin => admin.role === 'admin').length} icon={ShieldCheck} tone="violet" />
        <StatCard label="Editores" value={administrators.filter(admin => admin.role === 'editor').length} icon={UserCog} tone="green" />
      </section>

      {loadError && <p role="alert" className="admin-alert admin-alert-error">{loadError}</p>}

      <div className="admin-card overflow-hidden">
        <div className="admin-card-header"><div><h3 className="text-[15px]">Cuentas de acceso</h3><p className="text-xs text-slate-500">Los editores gestionan catálogo y pedidos; los administradores tienen control total.</p></div></div>
        {loading && !administrators.length ? <TableSkeleton rows={3} /> : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Estado</th><th className="hidden md:table-cell">Creado</th><th className="!text-right">Acciones</th></tr></thead>
              <tbody>
                {administrators.map(admin => (
                  <tr key={admin.id}>
                    <td>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{initials(admin.name)}</span>
                        <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{admin.name}</p><p className="truncate text-[11.5px] text-slate-500">{admin.email || 'Sin correo registrado'}</p></div>
                      </div>
                    </td>
                    <td><span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">@{admin.username}</span></td>
                    <td><Badge tone={admin.role === 'admin' ? 'violet' : 'blue'} dot={false}>{admin.role === 'admin' ? 'Administrador' : 'Editor'}</Badge></td>
                    <td><Badge tone={admin.isActive ? 'green' : 'rose'}>{admin.isActive ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td className="hidden text-xs text-slate-500 md:table-cell">{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td>
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => openEdit(admin)} className="admin-action" title="Editar" aria-label={`Editar ${admin.name}`}><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => void remove(admin)} className="admin-action admin-action-danger" title="Eliminar" aria-label={`Eliminar ${admin.name}`}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!administrators.length && <EmptyState icon={ShieldCheck} title="Sin administradores" text="Crea una cuenta para dar acceso al panel." />}
          </div>
        )}
      </div>

      {open && (
        <Modal title={editing ? 'Editar administrador' : 'Nuevo administrador'} subtitle={editing ? `@${editing.username}` : 'Crea una cuenta con acceso al panel'} icon={ShieldCheck} onClose={close}
          footer={<>
            <button type="button" onClick={close} className="admin-btn admin-btn-secondary">Cancelar</button>
            <button type="submit" form="admin-form" disabled={saving} className="admin-btn admin-btn-primary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Guardar</button>
          </>}>
          <form id="admin-form" onSubmit={event => void save(event)} noValidate className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo" required error={errors.name} className="sm:col-span-2">
              {props => <input {...props} value={form.name} maxLength={80} autoComplete="name" onChange={event => update('name', event.target.value)} placeholder="Ej: María Torres" className="admin-input" />}
            </Field>
            <Field label="Usuario de acceso" required={!editing} error={errors.username} hint={editing ? 'El usuario no se puede cambiar' : 'Minúsculas, números, punto o guion'}>
              {props => <input {...props} value={form.username} maxLength={30} disabled={Boolean(editing)} autoComplete="off" onChange={event => update('username', event.target.value.toLowerCase().replace(/\s/g, ''))} placeholder="maria.torres" className="admin-input font-mono" />}
            </Field>
            <Field label="Correo electrónico" error={errors.email} hint="Opcional">
              {props => <input {...props} type="email" value={form.email} maxLength={254} autoComplete="off" onChange={event => update('email', event.target.value)} placeholder="admin@siscomred.pe" className="admin-input" />}
            </Field>
            <Field label={editing ? 'Nueva contraseña' : 'Contraseña'} required={!editing} error={errors.password} hint={editing ? 'Déjala vacía para mantener la actual' : 'Mínimo 8 caracteres con letras y números'} className="sm:col-span-2">
              {props => <div>
                <div className="relative">
                  <input {...props} type={showPassword ? 'text' : 'password'} value={form.password} maxLength={72} autoComplete="new-password" onChange={event => update('password', event.target.value)} placeholder="••••••••" className="admin-input pr-11" />
                  <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
                {form.password && <div className="mt-2 flex items-center gap-2"><div className="flex flex-1 gap-1">{[0, 1, 2, 3].map(index => <span key={index} className={`h-1.5 flex-1 rounded-full ${index < strength ? strengthColor[strength] : 'bg-slate-200'}`} />)}</div><span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500"><KeyRound className="h-3 w-3" />{strengthLabel[strength]}</span></div>}
              </div>}
            </Field>
            <Field label="Rol" error={errors.role} className="sm:col-span-2">
              {props => <select {...props} value={form.role} onChange={event => update('role', event.target.value as Administrator['role'])} className="admin-input">
                <option value="editor">Editor · catálogo y pedidos</option>
                <option value="admin">Administrador · control total</option>
              </select>}
            </Field>
            {editing && <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2">
              <div><p className="text-sm font-semibold text-slate-900">Cuenta activa</p><p className="text-xs text-slate-500">Si la desactivas, no podrá iniciar sesión.</p></div>
              <Switch checked={form.isActive} onChange={value => update('isActive', value)} label="Cuenta activa" />
            </div>}
          </form>
        </Modal>
      )}
    </div>
  );
}
