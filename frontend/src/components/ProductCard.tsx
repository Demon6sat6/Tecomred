import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Eye, Check, Zap, Heart, ArrowLeftRight } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../hooks/useCurrency';
import CartProductImage from './CartProductImage';
import { useProductLists } from '../context/useProductLists';
import { isReferenceProduct } from '../utils/cartOrder';

interface Props { product: Product }

const badgeColors: Record<string, string> = {
  Nuevo:   'bg-emerald-500 text-white',
  Oferta:  'bg-red-500 text-white',
  Popular: 'bg-violet-500 text-white',
  Agotado: 'bg-gray-600 text-gray-300',
};

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { formatShort } = useCurrency();
  const { isFavorite, isCompared, toggleFavorite, toggleCompare } = useProductLists();
  const [justAdded, setJustAdded] = useState(false);
  const [compareMessage, setCompareMessage] = useState('');
  const referencePrice = isReferenceProduct(product);
  const needsQuote = product.price <= 0 && !referencePrice;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAdd = () => {
    addToCart(product);
    showToast(product.name, product.image);
    navigate('/carrito');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/10">

      {/* Glow efecto sutil al hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />

      {/* Image */}
      <div className="relative overflow-hidden h-44 sm:h-48 bg-slate-50 shrink-0 border-b border-slate-100">
        <CartProductImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradiente inferior muy suave */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />

        {product.price > 0 && <div className="absolute bottom-3 left-3 rounded-xl border border-white/80 bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm"><span className="block text-[9px] font-bold uppercase tracking-wide text-slate-500">{referencePrice ? 'Desde · referencial' : 'Precio'}</span><span className="text-lg font-black leading-tight text-[#0052cc]">{formatShort(product.price)}</span></div>}

        {/* Vista rápida */}
        <Link
          to={`/producto/${product.id}`}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 text-slate-800 text-xs font-bold rounded-full opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg border border-slate-200"
        >
          <Eye className="w-3.5 h-3.5 text-[#0052cc]" /> Ver
        </Link>

        {/* Badge esquina */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs ${badgeColors[product.badge]}`}>
            {product.badge}
          </span>
        )}
        {!product.badge && product.reviews >= 300 && (
          <span className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-500 text-slate-900 shadow-xs">
            🏆 Top ventas
          </span>
        )}
        {discount && discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2 py-1 rounded-lg shadow-sm">
            -{discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 relative bg-white">
        {/* Categoría */}
        <p className="text-[10px] text-violet-700 font-black mb-1.5 uppercase tracking-widest">{product.category}</p>

        {/* Nombre */}
        <Link to={`/producto/${product.id}`}>
          <h3 className="text-slate-900 font-bold text-sm leading-snug mb-2.5 hover:text-violet-700 transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {!needsQuote && <div className="flex items-center gap-1.5 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium">{product.rating} <span className="text-slate-400">({product.reviews})</span></span>
        </div>}

        {/* Precio */}
        {!referencePrice && <div className="mb-3 mt-auto rounded-xl bg-blue-50/70 px-3 py-3">
          <div className="flex items-end gap-2">
          <span className="text-2xl sm:text-[1.7rem] font-black text-[#11264b] tracking-tight">{product.price > 0 ? formatShort(product.price) : 'Consultar precio'}</span>
          {product.originalPrice && (
            <span className="text-sm text-slate-400 line-through mb-0.5">{formatShort(product.originalPrice)}</span>
          )}
          </div>
        </div>}

        <div className="mb-3 mt-auto flex gap-2">
          <button type="button" onClick={() => toggleFavorite(product.id)} aria-pressed={isFavorite(product.id)} aria-label={`${isFavorite(product.id) ? 'Quitar de' : 'Agregar a'} favoritos: ${product.name}`} className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-colors ${isFavorite(product.id) ? 'border-lime-200 bg-lime-50 text-[#348f00]' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-[#0052cc]'}`}><Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />{isFavorite(product.id) ? 'Guardado' : 'Guardar'}</button>
          <button type="button" onClick={() => { const result = toggleCompare(product.id); setCompareMessage(result === 'limit' ? 'Puedes comparar hasta 3 productos.' : ''); }} aria-pressed={isCompared(product.id)} aria-label={`${isCompared(product.id) ? 'Quitar de' : 'Agregar a'} comparar: ${product.name}`} className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-colors ${isCompared(product.id) ? 'border-blue-200 bg-blue-50 text-[#0052cc]' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-[#0052cc]'}`}><ArrowLeftRight className="h-4 w-4" />{isCompared(product.id) ? 'Comparando' : 'Comparar'}</button>
        </div>
        {compareMessage && <p role="status" className="mb-2 text-xs font-medium text-amber-700">{compareMessage}</p>}

        {/* Stock */}
        {!needsQuote && !referencePrice && <div className="flex items-center gap-1.5 mb-3.5">
          <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 5 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
          <span className={`text-xs font-semibold ${product.stock > 5 ? 'text-emerald-700' : product.stock > 0 ? 'text-amber-700' : 'text-red-600'}`}>
            {product.stock > 5 ? 'En stock' : product.stock > 0 ? `¡Solo ${product.stock} unidades!` : 'Agotado'}
          </span>
        </div>}

        {/* Botón */}
        {needsQuote ? <Link to={`/contacto?producto=${encodeURIComponent(product.name)}`} className="w-full min-h-[44px] flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Consultar disponibilidad</Link> : <button
          onClick={handleAdd}
          disabled={product.stock === 0 && !referencePrice}
          className={`w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-black transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 touch-manipulation ${
            justAdded
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : product.stock === 0 && !referencePrice
                ? 'bg-slate-100 text-slate-400 border border-slate-200'
                : 'gradient-brand text-white hover:opacity-95 shadow-md shadow-violet-500/20 hover:shadow-violet-500/35'
          }`}
        >
          {justAdded ? (
            <><Check className="w-4 h-4" /> ¡Agregado!</>
          ) : product.stock === 0 && !referencePrice ? (
            'Agotado'
          ) : (
            <><Zap className="w-4 h-4" /> Comprar</>
          )}
        </button>}
      </div>
    </div>
  );
}
