import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound, Phone } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)
  ?? (import.meta.env.DEV ? '/api' : 'https://tecomred-production-910c.up.railway.app/api');

type Mode = 'login' | 'register';

export default function Account() {
  const navigate = useNavigate();
  const { login } = useAdmin();
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login'
          ? { email: form.email, password: form.password }
          : form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'No se pudo completar la operación');
      if (!data.token || !data.user) throw new Error('Respuesta de acceso inválida');
      if (data.user.role === 'admin' || data.user.role === 'editor') {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        localStorage.setItem('admin_token', data.token);
        login();
        navigate('/admin/dashboard', { replace: true });
      } else {
        localStorage.setItem('customer_token', data.token);
        localStorage.setItem('customer_user', JSON.stringify(data.user));
        navigate('/', { replace: true });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#0052cc] focus:ring-4 focus:ring-blue-100';

  return (
    <main className="account-page bg-[#f8fafc] text-slate-900">
      <div className="account-layout flex h-full w-full flex-col lg:flex-row">
        <aside className="account-hero relative hidden w-1/2 flex-col overflow-hidden bg-[#edf5ff] px-12 py-10 lg:flex xl:px-[clamp(4rem,8vw,10rem)]">
          <div className="absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full bg-blue-200/40 blur-3xl" aria-hidden="true" />
          <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-lime-200/40 blur-3xl" aria-hidden="true" />
          <Link to="/" className="relative z-10 w-fit"><img src="/logo.png" alt="Siscomred" className="h-auto w-44 object-contain" /></Link>
          <div className="account-hero-copy relative z-10 my-auto pt-12">
            <div className="account-hero-eyebrow mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0052cc]"><span className="h-2 w-2 rounded-full bg-[#48bb07]" /> Tecnología para tus proyectos</div>
            <h2 className="max-w-lg text-4xl font-extrabold leading-[1.15] tracking-tight text-[#11264b] xl:text-5xl">Todo lo que necesitas, <span className="text-[#0052cc]">en un solo lugar.</span></h2>
            <p className="account-hero-description mt-5 max-w-md text-base leading-7 text-slate-600">Explora nuestro catálogo, guarda tus favoritos y encuentra el equipo ideal para cada proyecto.</p>
            <div className="account-hero-pills mt-9 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-sm"><Check size={16} className="text-[#48bb07]" /> Catálogo especializado</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-sm"><Check size={16} className="text-[#48bb07]" /> Asesoría personalizada</span>
            </div>
            <div className="account-hero-note mt-10 max-w-lg rounded-2xl border border-white/80 bg-white/70 px-6 py-5 shadow-sm backdrop-blur-sm">
              <span className="mb-3 block h-1 w-12 rounded-full bg-[#48bb07]" aria-hidden="true" />
              <p className="text-lg font-bold leading-snug text-[#11264b]">Tecnología para lo que viene.</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">Encuentra tus favoritos y recibe ayuda para elegir lo mejor para tu proyecto.</p>
            </div>
          </div>
          <p className="relative z-10 mt-6 text-xs text-slate-500">© {new Date().getFullYear()} Siscomred. Tecnología que conecta.</p>
        </aside>

        <div className="account-panel flex min-h-0 flex-1 flex-col bg-white px-5 sm:px-10 lg:px-12 xl:px-[clamp(4rem,8vw,10rem)]">
          <header className="account-header flex items-center justify-between py-6 lg:justify-end lg:py-10">
            <Link to="/" className="lg:hidden"><img src="/logo.png" alt="Siscomred" className="w-32" /></Link>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0052cc]"><ArrowLeft size={17} /> Volver a la tienda</Link>
          </header>

          <div className="account-content mx-auto flex w-full max-w-[440px] min-h-0 flex-1 flex-col justify-center py-8 lg:py-12">
            <div className="account-intro mb-8">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#348f00]">Tu espacio en Siscomred</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#11264b] sm:text-4xl">{mode === 'login' ? 'Qué bueno verte de nuevo' : 'Comencemos juntos'}</h1>
              <p className="account-subtitle mt-3 text-sm leading-6 text-slate-500">{mode === 'login' ? 'Ingresa a tu cuenta para continuar donde lo dejaste.' : 'Crea tu cuenta y descubre una forma más simple de comprar tecnología.'}</p>
            </div>

            <div className="account-tabs mb-8 grid grid-cols-2 border-b border-slate-200" role="tablist" aria-label="Acceso a cuenta">
              {(['login', 'register'] as const).map(option => <button key={option} type="button" role="tab" aria-selected={mode === option} onClick={() => { setMode(option); setMessage(''); }} className={`relative min-h-12 text-sm font-bold transition ${mode === option ? 'text-[#0052cc] after:absolute after:bottom-[-1px] after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-[#0052cc]' : 'text-slate-500 hover:text-slate-800'}`}>{option === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</button>)}
            </div>

            {message && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{message}</p>}
            <form onSubmit={submit} className="account-form">
              {mode === 'register' && <>
                <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Nombre completo</span><span className="relative block"><UserRound size={18} className="absolute left-3.5 top-3.5 text-slate-400" /><input required autoComplete="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="¿Cómo te llamas?" className={inputClass} /></span></label>
                <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Teléfono <span className="font-normal text-slate-400">(opcional)</span></span><span className="relative block"><Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" /><input type="tel" autoComplete="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Tu número de contacto" className={inputClass} /></span></label>
              </>}
              <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{mode === 'login' ? 'Correo electrónico o usuario' : 'Correo electrónico'}</span><span className="relative block"><Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" /><input required type={mode === 'login' ? 'text' : 'email'} autoComplete={mode === 'login' ? 'username' : 'email'} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder={mode === 'login' ? 'tu@correo.com o usuario' : 'tu@correo.com'} className={inputClass} /></span></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Contraseña</span><span className="relative block"><LockKeyhole size={18} className="absolute left-3.5 top-3.5 text-slate-400" /><input required minLength={mode === 'register' ? 8 : undefined} type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={mode === 'login' ? 'Ingresa tu contraseña' : 'Mínimo 8 caracteres'} className={`${inputClass} pr-12`} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center text-slate-400 hover:text-[#0052cc]">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>
              <button disabled={loading} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0052cc] px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition hover:bg-[#003fa8] disabled:cursor-wait disabled:opacity-60">{loading ? 'Procesando...' : mode === 'login' ? 'Entrar a mi cuenta' : 'Crear mi cuenta'} {!loading && <ArrowRight size={18} className="transition group-hover:translate-x-1" />}</button>
            </form>
            <p className="account-terms mt-6 text-center text-xs leading-5 text-slate-500">Al continuar aceptas nuestros <Link to="/terminos" className="font-semibold text-[#0052cc] hover:underline">términos y condiciones</Link>.</p>
          </div>
          <div className="account-mobile-copyright pb-6 text-center text-xs text-slate-400 lg:hidden">© {new Date().getFullYear()} Siscomred</div>
        </div>
      </div>
    </main>
  );
}
