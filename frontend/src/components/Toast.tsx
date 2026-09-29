import { useEffect, useState } from 'react';
import { CheckCircle, X, ShoppingCart } from 'lucide-react';

export interface ToastMessage {
  id: number;
  message: string;
  productName: string;
  image?: string;
}

interface Props {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: number) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast.id, onRemove]);

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 px-4 py-3 min-w-[300px] max-w-sm transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {toast.image ? (
        <img src={toast.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-50 border border-slate-100" />
      ) : (
        <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center shrink-0">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-emerald-700 text-xs font-semibold">Agregado al carrito</span>
        </div>
        <p className="text-slate-900 text-sm font-semibold truncate">{toast.productName}</p>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
