import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, UserRound, Phone, UserPlus } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)
  ?? (import.meta.env.DEV ? '/api' : 'https://tecomred-production-910c.up.railway.app/api');

type Mode = 'login' | 'register';

export default function Account() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/customer-login' : '/auth/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login'
          ? { email: form.email, password: form.password }
          : form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'No se pudo completar la operación');
      localStorage.setItem('customer_token', data.token);
      localStorage.setItem('customer_user', JSON.stringify(data.user));
      setMessage(mode === 'login' ? 'Sesión iniciada correctamente.' : 'Cuenta creada correctamente.');
      setTimeout(() => navigate('/'), 700);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <section className="w-full max-w-md glass rounded-2xl p-6 sm:p-8">
        <div className="text-center mb-7">
          <div className="mx-auto mb-4 w-12 h-12 rounded-xl gradient-brand flex items-center justify-center"><UserPlus className="w-6 h-6 text-white" /></div>
          <h1 className="text-2xl font-extrabold text-white">Tu cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Compra más rápido y consulta tus pedidos.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 mb-6">
          {(['login', 'register'] as const).map(option => <button key={option} type="button" onClick={() => { setMode(option); setMessage(''); }} className={`py-2 rounded-lg text-sm font-semibold ${mode === option ? 'gradient-brand text-white' : 'text-gray-400'}`}>{option === 'login' ? 'Iniciar sesión' : 'Registrarme'}</button>)}
        </div>
        {message && <p className="mb-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-sm">{message}</p>}
        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && <><label className="relative block"><UserRound className="absolute left-3 top-3 w-4 h-4 text-gray-500" /><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre completo" className="w-full pl-9 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm" /></label><label className="relative block"><Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" /><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Teléfono (opcional)" className="w-full pl-9 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm" /></label></>}
          <label className="relative block"><Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" /><input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Correo electrónico" className="w-full pl-9 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm" /></label>
          <label className="relative block"><LockKeyhole className="absolute left-3 top-3 w-4 h-4 text-gray-500" /><input required minLength={8} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Contraseña (mínimo 8 caracteres)" className="w-full pl-9 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm" /></label>
          <button disabled={loading} className="w-full py-3 rounded-xl gradient-brand text-white font-bold disabled:opacity-50">{loading ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</button>
        </form>
        <p className="text-center text-gray-500 text-xs mt-5">Al continuar aceptas nuestros <Link to="/terminos" className="text-sky-400">términos y condiciones</Link>.</p>
      </section>
    </main>
  );
}
