import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Check, Zap } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../hooks/useCurrency';

interface Props { product: Product }

const badgeColors: Record<string, string> = {
  Nuevo:   'bg-emerald-500 text-white',
  Oferta:  'bg-red-500 text-white',
  Popular: 'bg-violet-500 text-white',
  Agotado: 'bg-gray-600 text-gray-300',
};

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { formatShort } = useCurrency();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAdd = () => {
    addToCart(product);
    showToast(product.name, product.image);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="group relative bg-gray-900 border border-white/8 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10">

      {/* Glow efecto al hover — estilo Memory Kings */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(134,59,255,0.08) 0%, transparent 70%)' }} />

      {/* Image */}
      <div className="relative overflow-hidden h-40 sm:h-48 bg-gray-800 shrink-0">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}
        <img
          src={product.image}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
        />

        {/* Gradiente inferior */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

        {/* Quick view — estilo píldora */}
        <Link
          to={`/producto/${product.id}`}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-white text-gray-900 text-xs font-black rounded-full opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap shadow-xl"
        >
          <Eye className="w-3.5 h-3.5" /> Vista rápida
        </Link>

        {/* Badge esquina */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${badgeColors[product.badge]}`}>
            {product.badge}
          </span>
        )}
        {!product.badge && product.reviews >= 300 && (
          <span className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-500 text-black">
            🏆 Top ventas
          </span>
        )}
        {discount && discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-lg shadow-lg">
            -{discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 relative">
        {/* Categoría */}
        <p className="text-[10px] text-violet-400 font-black mb-1.5 uppercase tracking-widest">{product.category}</p>

        {/* Nombre */}
        <Link to={`/producto/${product.id}`}>
          <h3 className="text-white font-bold text-sm leading-snug mb-2.5 hover:text-violet-400 transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-500">{product.rating} <span className="text-gray-700">({product.reviews})</span></span>
        </div>

        {/* Precio */}
        <div className="flex items-end gap-2 mb-2.5 mt-auto">
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">{formatShort(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-600 line-through mb-0.5">{formatShort(product.originalPrice)}</span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-1.5 mb-3.5">
          <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 5 ? 'bg-emerald-400' : product.stock > 0 ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`} />
          <span className={`text-xs font-semibold ${product.stock > 5 ? 'text-emerald-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            {product.stock > 5 ? 'En stock' : product.stock > 0 ? `¡Solo ${product.stock} unidades!` : 'Agotado'}
          </span>
        </div>

        {/* Botón */}
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className={`w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-black transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 touch-manipulation ${
            justAdded
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : product.stock === 0
                ? 'bg-gray-700 text-gray-500'
                : 'gradient-brand text-white hover:opacity-90 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35'
          }`}
        >
          {justAdded ? (
            <><Check className="w-4 h-4" /> ¡Agregado!</>
          ) : product.stock === 0 ? (
            'Agotado'
          ) : (
            <><Zap className="w-4 h-4" /> Agregar al carrito</>
          )}
        </button>
      </div>
    </div>
  );
}
