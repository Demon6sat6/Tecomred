import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Star, ArrowLeft, Check, Shield, Truck,
  Package, AlertTriangle, ThumbsUp, BadgeCheck, ChevronLeft, ChevronRight, Heart, ArrowLeftRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { reviews } from '../data/reviews';
import { useCart } from '../context/CartContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../context/ToastContext';
import { useAdmin } from '../context/AdminContext';
import { useCurrency } from '../hooks/useCurrency';
import { useProductLists } from '../context/useProductLists';
import ProductCard from '../components/ProductCard';
import { useState } from 'react';

type Tab = 'specs' | 'reviews' | 'bundle';

interface LocalReview {
  id: number; author: string; rating: number; title: string; body: string; date: string;
}

function ReviewForm({ onSubmit }: { productId: number; onSubmit: (r: LocalReview) => void }) {
  const [form, setForm] = useState({ author: '', rating: 5, title: '', body: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim() || !form.title.trim() || form.body.trim().length < 10) return;
    onSubmit({
      id: Date.now(), author: form.author.trim(), rating: form.rating,
      title: form.title.trim(), body: form.body.trim(),
      date: new Date().toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
    setSent(true);
    setForm({ author: '', rating: 5, title: '', body: '' });
    setTimeout(() => setSent(false), 3000);
  };

  const inputCls = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-500 transition-colors";

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      <h4 className="text-slate-900 font-bold text-base mb-4">Escribe tu reseña</h4>
      {sent && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
          <Check className="w-4 h-4 text-emerald-600" />
          <p className="text-emerald-700 text-sm font-medium">¡Gracias por tu reseña! Será visible próximamente.</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-600 font-medium mb-1.5">Tu nombre</label>
            <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              placeholder="Juan Pérez" className={inputCls} required />
          </div>
          <div>
            <label className="block text-xs text-slate-600 font-medium mb-1.5">Puntuación</label>
            <div className="flex gap-1 pt-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: s }))}>
                  <Star className={`w-6 h-6 transition-colors ${s <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-600 font-medium mb-1.5">Título de tu reseña</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Resumen en una frase" className={inputCls} required />
        </div>
        <div>
          <label className="block text-xs text-slate-600 font-medium mb-1.5">Tu opinión</label>
          <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            rows={3} placeholder="Describe tu experiencia con el producto (mínimo 10 caracteres)..."
            className={`${inputCls} resize-none`} required minLength={10} />
        </div>
        <button type="submit"
          className="px-6 py-2.5 gradient-brand text-white text-sm font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md shadow-violet-500/20">
          Publicar reseña
        </button>
      </form>
    </div>
  );
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${cls} ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products } = useStore();
  const { settings } = useAdmin();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { formatShort } = useCurrency();
  const { isFavorite, isCompared, toggleFavorite, toggleCompare } = useProductLists();
  const [compareMessage, setCompareMessage] = useState('');
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('specs');
  const [activeImg, setActiveImg] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [localReviews, setLocalReviews] = useState<LocalReview[]>([]);

  const product = products.find(p => p.id === Number(id));

  usePageTitle(
    product ? product.name : 'Producto no encontrado',
    product ? `${product.name} — ${product.description} Compra en SiscomRed con envío a todo el Perú.` : undefined
  );

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4 text-slate-300">:(</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Producto no encontrado</h2>
        <Link to="/productos" className="text-violet-600 hover:text-violet-700 font-semibold">&lt;- Volver al catálogo</Link>
      </div>
    );
  }

  const images = [product.image];

  const productReviews = reviews.filter(r => r.productId === product.id);
  const avgRating = productReviews.length
    ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
    : product.rating;

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: productReviews.filter(r => r.rating === star).length,
    pct: productReviews.length
      ? Math.round((productReviews.filter(r => r.rating === star).length / productReviews.length) * 100)
      : 0,
  }));

  // Bundle products
  const bundleProducts = products
    .filter(p => p.id !== product.id && p.category !== product.category && p.stock > 0)
    .slice(0, 3);

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const referencePrice = product.image.startsWith('/productos_tienda_tecnologia_20/') && product.stock === 0;
  const needsQuote = product.price <= 0 && !referencePrice;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    showToast(product.name, product.image);
    navigate('/carrito');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'specs',   label: 'Especificaciones' },
    { id: 'reviews', label: 'Reseñas', count: productReviews.length },
    { id: 'bundle',  label: 'Comprado junto con' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-violet-600 transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/productos" className="hover:text-violet-600 transition-colors">Productos</Link>
        <span>/</span>
        <Link to={`/productos?categoria=${encodeURIComponent(product.category)}`} className="hover:text-violet-600 transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <Link to="/productos" className="inline-flex items-center gap-1.5 text-violet-600 hover:text-violet-700 font-medium text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
      </Link>

      {/* MAIN PRODUCT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">

        {/* IMAGE GALLERY */}
        <div className="space-y-3">
          {/* Main image con soporte de swipe táctil en celular */}
          <div
            onTouchStart={e => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={e => {
              if (touchStartX === null || images.length <= 1) return;
              const touchEndX = e.changedTouches[0].clientX;
              const diff = touchStartX - touchEndX;
              if (diff > 45) {
                // Deslizó hacia la izquierda -> siguiente
                setActiveImg(i => (i + 1) % images.length);
              } else if (diff < -45) {
                // Deslizó hacia la derecha -> anterior
                setActiveImg(i => (i - 1 + images.length) % images.length);
              }
              setTouchStartX(null);
            }}
            className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden aspect-square group select-none touch-pan-y shadow-xs"
          >
            <img
              src={images[activeImg]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {/* Badges */}
            {product.badge && (
              <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full border backdrop-blur-xs ${
                product.badge === 'Oferta'  ? 'bg-red-50 text-red-700 border-red-200' :
                product.badge === 'Nuevo'   ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                product.badge === 'Popular' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {product.badge}
              </span>
            )}
            {discount && (
              <span className="absolute top-4 right-4 bg-red-600 text-white text-sm font-extrabold px-3 py-1.5 rounded-full shadow-md">
                -{discount}%
              </span>
            )}
            {/* Prev/Next arrows — visibles siempre en móvil para facilitar el uso */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white border border-slate-200 shadow-md flex items-center justify-center opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity active:scale-95 z-10"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-800" />
                </button>
                <button
                  onClick={() => setActiveImg(i => (i + 1) % images.length)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white border border-slate-200 shadow-md flex items-center justify-center opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity active:scale-95 z-10"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-5 h-5 text-slate-800" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`aspect-square rounded-xl overflow-hidden border-2 bg-white transition-all ${
                  activeImg === i ? 'border-violet-600 scale-95 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="flex flex-col">
          <p className="text-violet-600 text-xs font-bold uppercase tracking-widest mb-2">{product.category}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 leading-tight">{product.name}</h1>
          <div className="mb-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => toggleFavorite(product.id)} aria-pressed={isFavorite(product.id)} className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold ${isFavorite(product.id) ? 'border-lime-200 bg-lime-50 text-[#348f00]' : 'border-slate-200 text-slate-700 hover:border-blue-200 hover:text-[#0052cc]'}`}><Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />{isFavorite(product.id) ? 'En favoritos' : 'Guardar en favoritos'}</button>
            <button type="button" onClick={() => { const result = toggleCompare(product.id); setCompareMessage(result === 'limit' ? 'Puedes comparar hasta 3 productos.' : ''); }} aria-pressed={isCompared(product.id)} className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold ${isCompared(product.id) ? 'border-blue-200 bg-blue-50 text-[#0052cc]' : 'border-slate-200 text-slate-700 hover:border-blue-200 hover:text-[#0052cc]'}`}><ArrowLeftRight className="h-4 w-4" />{isCompared(product.id) ? 'En comparación' : 'Comparar'}</button>
          </div>
          {compareMessage && <p role="status" className="mb-3 text-sm font-medium text-amber-700">{compareMessage}</p>}

          {/* Rating summary */}
          {!needsQuote && <div className="flex items-center gap-3 mb-5">
            <StarRating rating={avgRating} size="md" />
            <span className="text-slate-900 font-bold">{avgRating.toFixed(1)}</span>
            <span className="text-slate-500 text-sm">
              ({productReviews.length > 0 ? productReviews.length : product.reviews} reseñas)
            </span>
            {productReviews.filter(r => r.verified).length > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verificadas
              </span>
            )}
          </div>}

          {/* Price */}
          <div className="flex items-end gap-3 mb-5 pb-5 border-b border-slate-200">
            <div>{referencePrice && <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#0052cc]">Precio referencial desde</span>}<span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{product.price > 0 ? formatShort(product.price) : 'Precio por consultar'}</span></div>
            {product.originalPrice && (
              <div className="flex flex-col mb-1">
                <span className="text-sm text-slate-400 line-through">{formatShort(product.originalPrice!)}</span>
                <span className="text-xs text-red-600 font-bold">Ahorras {formatShort(product.originalPrice! - product.price)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-slate-600 text-sm leading-relaxed mb-5">{product.description}</p>

          {/* Stock indicator */}
          <div className="mb-5">
            {needsQuote ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl"><Package className="w-4 h-4 text-blue-600" /><span className="text-blue-700 text-sm font-semibold">Confirma el modelo, precio final y disponibilidad con nuestro equipo</span></div>
            ) : product.stock === 0 && !referencePrice ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                <Package className="w-4 h-4 text-red-600" />
                <span className="text-red-700 text-sm font-semibold">Producto agotado</span>
              </div>
            ) : referencePrice ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl"><Package className="w-4 h-4 text-blue-600" /><span className="text-blue-700 text-sm font-semibold">Confirma el modelo, precio final y disponibilidad por WhatsApp</span></div>
            ) : isLowStock ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
                <span className="text-amber-800 text-sm font-semibold">
                  ¡Solo quedan {product.stock} unidades! - Compra pronto
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 text-sm font-semibold">{product.stock} unidades en stock</span>
              </div>
            )}
          </div>

          {/* Quantity + Add to cart (Desktop / normal view) */}
          {needsQuote && <Link to={`/contacto?producto=${encodeURIComponent(product.name)}`} className="mb-5 flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700">Solicitar cotización</Link>}
          {!needsQuote && (product.stock > 0 || referencePrice) && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors text-xl font-bold touch-manipulation"
                  aria-label="Reducir cantidad"
                >
                  -
                </button>
                <span className="w-10 text-center text-slate-900 font-bold text-lg">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(referencePrice ? 99 : product.stock, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors text-xl font-bold touch-manipulation"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md touch-manipulation ${
                  added
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'gradient-brand text-white hover:opacity-90 shadow-violet-500/20'
                }`}
              >
                {added
                  ? <><Check className="w-5 h-5" /> ¡Agregado al carrito!</>
                  : <><ShoppingCart className="w-5 h-5" /> Comprar</>
                }
              </button>
            </div>
          )}

          {/* Trust badges */}
          {!needsQuote && <div className="grid grid-cols-2 gap-2 mt-auto">
            {[
              { icon: Shield, text: 'Garantía oficial del fabricante' },
              { icon: Truck,  text: `Envío gratis desde ${formatShort(Number(settings.freeShippingMin) || 300)}` },
              { icon: BadgeCheck, text: 'Producto 100% original' },
              { icon: Package,    text: 'Devolución en 30 días' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-xs">
                <Icon className="w-4 h-4 text-violet-600 shrink-0" />
                <span className="text-slate-600 text-xs font-medium">{text}</span>
              </div>
            ))}
          </div>}
        </div>
      </div>

      {/* TABS */}
      <div className="mb-12">
        {/* Tab headers */}
        <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* SPECS TAB */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.specs.map((spec, i) => {
              const [label, ...rest] = spec.split(' ');
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-semibold">{label}</p>
                    {rest.length > 0 && <p className="text-slate-600 text-xs mt-0.5">{rest.join(' ')}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {productReviews.length > 0 ? (
              <>
                {/* Rating overview */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-xs">
                  {/* Average */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-6xl font-extrabold gradient-text">{avgRating.toFixed(1)}</span>
                    <StarRating rating={avgRating} size="lg" />
                    <p className="text-slate-500 text-sm mt-2 font-medium">
                      Basado en {productReviews.length} reseña{productReviews.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {/* Distribution */}
                  <div className="space-y-2">
                    {ratingDist.map(({ star, count, pct }) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-4 shrink-0 font-medium">{star}</span>
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-6 text-right shrink-0">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review cards */}
                <div className="space-y-4">
                  {productReviews.map(review => (
                    <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {review.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-900 font-semibold text-sm">{review.author}</span>
                              {review.verified && (
                                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <BadgeCheck className="w-3 h-3 text-emerald-600" /> Compra verificada
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400 text-xs">{review.date}</span>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <h4 className="text-slate-900 font-semibold text-sm mb-1">{review.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{review.body}</p>
                      <button className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 hover:text-slate-800 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" /> Útil
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl mb-4 shadow-xs">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 font-medium">Aún no hay reseñas para este producto.</p>
                <p className="text-slate-500 text-sm mt-1">¡Sé el primero en opinar!</p>
              </div>
            )}
            {/* Local reviews (submitted this session) */}
            {localReviews.filter(r => r.id > 0).map(r => (
              <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {r.author.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-semibold text-sm">{r.author}</span>
                        <span className="text-[10px] text-violet-700 bg-violet-50 border border-violet-200 font-medium px-2 py-0.5 rounded-full">Nueva</span>
                      </div>
                      <span className="text-slate-400 text-xs">{r.date}</span>
                    </div>
                  </div>
                  <StarRating rating={r.rating} size="sm" />
                </div>
                <h4 className="text-slate-900 font-semibold text-sm mb-1">{r.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{r.body}</p>
              </div>
            ))}
            <ReviewForm productId={product.id} onSubmit={r => setLocalReviews(prev => [r, ...prev])} />
          </div>
        )}

        {/* BUNDLE TAB */}
        {activeTab === 'bundle' && (
          <div>
            <p className="text-slate-600 text-sm mb-5">
              Los clientes que compraron <span className="text-slate-900 font-semibold">{product.name}</span> también compraron:
            </p>
            {bundleProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {bundleProducts.map(bp => (
                    <div key={bp.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 shadow-xs hover:border-slate-300 card-hover">
                      <img src={bp.image} alt={bp.name} className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-50" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-violet-600 font-semibold mb-0.5">{bp.category}</p>
                        <Link
                          to={`/producto/${bp.id}`}
                          className="text-slate-900 text-xs font-semibold line-clamp-2 hover:text-violet-600 transition-colors"
                        >
                          {bp.name}
                        </Link>
                        <p className="text-slate-900 font-bold text-sm mt-1">{formatShort(bp.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Bundle total */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <p className="text-slate-600 text-sm">Total del bundle ({bundleProducts.length + 1} productos):</p>
                    <p className="text-2xl font-extrabold gradient-text">
                      {formatShort(product.price + bundleProducts.reduce((s, p) => s + p.price, 0))}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      [product, ...bundleProducts].forEach(p => addToCart(p));
                      showToast('Bundle completo', product.image);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-violet-500/20 whitespace-nowrap"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Agregar bundle al carrito
                  </button>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm">No hay sugerencias disponibles para esta categoría.</p>
            )}
          </div>
        )}
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Productos relacionados</h2>
            <Link to={`/productos?categoria=${encodeURIComponent(product.category)}`} className="text-violet-600 hover:text-violet-700 font-semibold text-sm transition-colors">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Floating Bottom Bar for Mobile Devices */}
      {!needsQuote && (product.stock > 0 || referencePrice) && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 border-t border-slate-200 p-3 backdrop-blur-xl flex items-center gap-3 shadow-2xl">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">{referencePrice ? 'Desde · referencial' : 'Total'}</span>
            <span className="text-lg font-black text-slate-900">{formatShort(product.price * qty)}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md touch-manipulation ${
              added
                ? 'bg-emerald-600 text-white'
                : 'gradient-brand text-white hover:opacity-90 shadow-violet-500/20'
            }`}
          >
            {added ? (
              <><Check className="w-4 h-4" /> ¡Agregado!</>
            ) : (
              <><ShoppingCart className="w-4 h-4" /> Comprar ahora</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

