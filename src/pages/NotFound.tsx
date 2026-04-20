import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Wifi } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-lg mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center shadow-2xl shadow-sky-500/20">
            <Wifi className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* 404 */}
        <div className="mb-6">
          <h1 className="text-[8rem] sm:text-[10rem] font-extrabold leading-none gradient-text select-none">
            404
          </h1>
          <div className="w-24 h-1 gradient-brand rounded-full mx-auto -mt-4" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Página no encontrada
        </h2>
        <p className="text-gray-400 mb-10 leading-relaxed">
          La página que buscas no existe o fue movida.<br />
          Pero tenemos cientos de productos esperándote.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-sky-500/20"
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </Link>
          <Link
            to="/productos"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
          >
            <Search className="w-5 h-5" />
            Ver catálogo
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-500 text-sm mb-4">Quizás buscabas:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Switches', 'Routers', 'Procesadores', 'Memorias RAM', 'Almacenamiento'].map(cat => (
              <Link
                key={cat}
                to={`/productos?categoria=${encodeURIComponent(cat)}`}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-sky-500/10 border border-white/10 hover:border-sky-500/30 text-gray-400 hover:text-sky-400 text-xs font-medium transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
