import { useState } from 'react';
import { X, Truck, Tag } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useCurrency } from '../hooks/useCurrency';

export default function TopBanner() {
  const [visible, setVisible] = useState(true);
  const { settings } = useAdmin();
  const { formatShort } = useCurrency();

  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 text-white text-sm py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2 font-medium">
          <Truck className="w-4 h-4 shrink-0" />
          <span>Envío gratis en pedidos mayores a <strong>{formatShort(Number(settings.freeShippingMin))}</strong></span>
        </div>
        <span className="hidden sm:block text-white/40">|</span>
        <div className="flex items-center gap-2 font-medium">
          <Tag className="w-4 h-4 shrink-0" />
          <span>Usa el código <strong>BIENVENIDO10</strong> y obtén 10% de descuento</span>
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Cerrar banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
