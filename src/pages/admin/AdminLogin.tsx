import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, Eye, EyeOff, AlertCircle, Lock, User } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLogin() {
  const { login } = useAdmin();
  const navigate = useNavigate();
  const [form, setForm] = useState({ user: '', pass: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(form.user, form.pass);
      if (ok) navigate('/admin/dashboard');
      else setError('Usuario o contraseña incorrectos');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-sky-500/20">
            <Wifi className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">TecomRed</h1>
          <p className="text-gray-500 text-sm mt-1">Panel de Administración</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h2 className="text-white font-bold text-xl mb-6">Iniciar sesión</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={form.user}
                  onChange={e => setForm(f => ({ ...f, user: e.target.value }))}
                  placeholder="admin"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500/60 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.pass}
                  onChange={e => setForm(f => ({ ...f, pass: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500/60 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-brand text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : 'Entrar al panel'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-gray-600 text-center">
              Credenciales: <span className="text-gray-500">admin / tecomred2026</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
