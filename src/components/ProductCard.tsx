import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Eye, Check } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../hooks/useCurrency';

interface Props {
  product: Product;
}

const badgeColors: Record<string, string> = {
  Nuevo:   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Oferta:  'bg-red-500/20 text-red-400 border-red-500/30',
  Popular: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  Agotado: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
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
    <div className="glass rounded-2xl overflow-hidden card-hover group flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden h-48 bg-gray-900 shrink-0">
        {/* Skeleton */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse">
            <div className="absolute bottom-3 left-3 right-3 h-3 bg-gray-700 rounded-full" />
          </div>
        )}
        <img
          src={product.image}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick view */}
        <Link
          to={`/producto/${product.id}`}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 bg-white/95 text-gray-900 text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap hover:bg-white shadow-lg"
        >
          <Eye className="w-3.5 h-3.5" /> Vista rápida
        </Link>

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${badgeColors[product.badge]}`}>
            {product.badge}
          </span>
        )}
        {/* Más vendido badge for high-review products */}
        {!product.badge && product.reviews >= 300 && (
          <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm bg-amber-500/20 text-amber-400 border-amber-500/30">
            🏆 Más vendido
          </span>
        )}
        {discount && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-extrabold px-2 py-1 rounded-full shadow-lg">
            -{discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-sky-400 font-bold mb-1 uppercase tracking-wider">{product.category}</p>

        <Link to={`/producto/${product.id}`}>
          <h3 className="text-white font-semibold text-sm leading-snug mb-2 hover:text-sky-400 transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">{product.rating} <span className="text-gray-700">({product.reviews})</span></span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-3 mt-auto">
          <span className="text-2xl font-extrabold text-white">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-600 line-through mb-0.5">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Stock dot */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className={`w-2 h-2 rounded-full ${product.stock > 5 ? 'bg-emerald-400' : product.stock > 0 ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`} />
          <span className={`text-xs font-medium ${product.stock > 5 ? 'text-emerald-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            {product.stock > 5 ? 'En stock' : product.stock > 0 ? `¡Solo ${product.stock} disponibles!` : 'Agotado'}
          </span>
        </div>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 ${
            justAdded
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'gradient-brand text-white hover:opacity-90 shadow-lg shadow-sky-500/10 hover:shadow-sky-500/25'
          }`}
        >
          {justAdded ? (
            <><Check className="w-4 h-4" /> ¡Agregado!</>
          ) : (
            <><ShoppingCart className="w-4 h-4" /> {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}</>
          )}
        </button>
      </div>
    </div>
  );
}
