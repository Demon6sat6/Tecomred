import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Wifi } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative">
      {/* Background soft glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-lg mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/20">
            <Wifi className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* 404 */}
        <div className="mb-6">
          <h1 className="text-[7rem] sm:text-[9rem] font-black leading-none bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent select-none">
            404
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full mx-auto -mt-2" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
          Página no encontrada
        </h2>
        <p className="text-slate-600 mb-10 leading-relaxed text-sm sm:text-base">
          La página que buscas no existe o fue movida.<br />
          Pero tenemos cientos de productos esperándote en nuestro catálogo.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-700 hover:to-indigo-700 active:scale-95 transition-all shadow-md shadow-violet-500/20"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <Link
            to="/productos"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
          >
            <Search className="w-4 h-4" />
            Ver catálogo
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-4">Quizás buscabas</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Switches', 'Routers', 'Procesadores', 'Memorias RAM', 'Almacenamiento'].map(cat => (
              <Link
                key={cat}
                to={`/productos?categoria=${encodeURIComponent(cat)}`}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-300 text-slate-600 hover:text-violet-700 text-xs font-medium transition-all shadow-2xs"
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
