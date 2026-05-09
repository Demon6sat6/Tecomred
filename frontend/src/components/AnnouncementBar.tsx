import { useState } from 'react';
import { X, Truck, Tag, Phone } from 'lucide-react';

const messages = [
  { icon: Truck, text: '🚚 Envío gratis en pedidos mayores a S/ 300' },
  { icon: Tag,   text: '🔥 Hasta 25% de descuento en productos seleccionados' },
  { icon: Phone, text: '📞 Soporte técnico especializado: +51 1 234-5678' },
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [current, setCurrent] = useState(0);

  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 text-white py-2 sm:py-2.5 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 sm:gap-6">
        {/* Prev */}
        <button
          onClick={() => setCurrent(c => (c - 1 + messages.length) % messages.length)}
          className="hidden sm:block text-white/60 hover:text-white transition-colors text-lg leading-none shrink-0"
          aria-label="Anterior"
        >
          ‹
        </button>

        <p className="font-medium text-center text-xs sm:text-sm leading-tight sm:leading-normal px-6 sm:px-0">
          {messages[current].text}
        </p>

        {/* Next */}
        <button
          onClick={() => setCurrent(c => (c + 1) % messages.length)}
          className="hidden sm:block text-white/60 hover:text-white transition-colors text-lg leading-none shrink-0"
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-1.5 sm:mt-1">
        {messages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-3' : 'bg-white/40'}`}
            aria-label={`Mensaje ${i + 1}`}
          />
        ))}
      </div>

      <button
        onClick={() => setVisible(false)}
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Cerrar"
      >
        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  );
}
