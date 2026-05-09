import { ShoppingCart, X, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[100] flex flex-col gap-2 sm:gap-3 pointer-events-none max-w-[calc(100vw-2rem)] sm:max-w-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-gray-900 border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl shadow-black/40 px-3 sm:px-4 py-2.5 sm:py-3 min-w-[260px] sm:min-w-[280px] max-w-[320px] sm:max-w-[340px] animate-slide-up"
        >
          {/* Product image */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden shrink-0 bg-gray-800">
            <img src={toast.image} alt={toast.name} className="w-full h-full object-cover" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
              </div>
              <span className="text-emerald-400 text-[10px] sm:text-xs font-semibold">Agregado al carrito</span>
            </div>
            <p className="text-white text-xs sm:text-sm font-medium truncate">{toast.name}</p>
          </div>

          {/* Cart icon + close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-brand flex items-center justify-center">
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
