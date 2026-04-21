import { useParams, Link } from 'react-router-dom';
import {
  ShoppingCart, Star, ArrowLeft, Check, Shield, Truck,
  Package, AlertTriangle, ThumbsUp, BadgeCheck, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { reviews } from '../data/reviews';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../hooks/useCurrency';
import ProductCard from '../components/ProductCard';
import { useState } from 'react';

type Tab = 'specs' | 'reviews' | 'bundle';

// Complementary product suggestions per category
const bundleSuggestions: Record<string, number[]> = {
  'Switches':       [3, 10, 7],
  'Routers':        [3, 8, 10],
  'Procesadores':   [5, 6, 7],
  'Memorias RAM':   [4, 6, 7],
  'Almacenamiento': [4, 5, 7],
  'Tarjetas de Red':[3, 6, 9],
  'Access Points':  [3, 9, 10],
  'Cables':         [9, 10, 8],
  'Herramientas':   [3, 9, 1],
};

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${cls} ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`}
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useStore();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { formatShort } = useCurrency();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('specs');
  const [activeImg, setActiveImg] = useState(0);

  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-white mb-2">Producto no encontrado</h2>
        <Link to="/productos" className="text-sky-400 hover:text-sky-300">← Volver al catálogo</Link>
      </div>
    );
  }

  // Multiple images (use same image with different crops to simulate gallery)
  const images = [
    product.image,
    product.image.replace('w=400&h=300', 'w=400&h=300&crop=entropy'),
    product.image.replace('w=400&h=300', 'w=400&h=300&crop=faces'),
    product.image.replace('w=400&h=300', 'w=400&h=300&crop=center'),
  ];

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
  const bundleIds = bundleSuggestions[product.category] || [];
  const bundleProducts = bundleIds
    .map(bid => products.find(p => p.id === bid))
    .filter(Boolean)
    .filter(p => p!.id !== product.id)
    .slice(0, 3) as typeof products;

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    showToast(product.name, product.image);
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
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-sky-400 transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/productos" className="hover:text-sky-400 transition-colors">Productos</Link>
        <span>/</span>
        <Link to={`/productos?categoria=${encodeURIComponent(product.category)}`} className="hover:text-sky-400 transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <Link to="/productos" className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
      </Link>

      {/* ── MAIN PRODUCT SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">

        {/* ── IMAGE GALLERY ── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative glass rounded-2xl overflow-hidden aspect-square bg-gray-900 group">
            <img
              src={images[activeImg]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {/* Badges */}
            {product.badge && (
              <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full border backdrop-blur-sm ${
                product.badge === 'Oferta'  ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                product.badge === 'Nuevo'   ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                product.badge === 'Popular' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
                'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}>
                {product.badge}
              </span>
            )}
            {discount && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-extrabold px-3 py-1.5 rounded-full shadow-lg">
                -{discount}%
              </span>
            )}
            {/* Prev/Next arrows */}
            <button
              onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setActiveImg(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  activeImg === i ? 'border-sky-500 scale-95' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── PRODUCT INFO ── */}
        <div className="flex flex-col">
          <p className="text-sky-400 text-xs font-bold uppercase tracking-widest mb-2">{product.category}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight">{product.name}</h1>

          {/* Rating summary */}
          <div className="flex items-center gap-3 mb-5">
            <StarRating rating={avgRating} size="md" />
            <span className="text-white font-bold">{avgRating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">
              ({productReviews.length > 0 ? productReviews.length : product.reviews} reseñas)
            </span>
            {productReviews.filter(r => r.verified).length > 0 && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verificadas
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-5 pb-5 border-b border-white/10">
            <span className="text-4xl sm:text-5xl font-extrabold text-white">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <div className="flex flex-col mb-1">
                <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                <span className="text-xs text-red-400 font-bold">Ahorras ${(product.originalPrice - product.price).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed mb-5">{product.description}</p>

          {/* Stock indicator */}
          <div className="mb-5">
            {product.stock === 0 ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                <Package className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-semibold">Producto agotado</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 text-sm font-semibold">
                  ¡Solo quedan {product.stock} unidades! — Compra pronto
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 text-sm font-semibold">{product.stock} unidades en stock</span>
              </div>
            )}
          </div>

          {/* Quantity + Add to cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center glass rounded-xl overflow-hidden shrink-0">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xl font-bold"
                >
                  −
                </button>
                <span className="w-10 text-center text-white font-bold text-lg">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xl font-bold"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg ${
                  added
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'gradient-brand text-white hover:opacity-90 shadow-sky-500/20'
                }`}
              >
                {added
                  ? <><Check className="w-5 h-5" /> ¡Agregado al carrito!</>
                  : <><ShoppingCart className="w-5 h-5" /> Agregar al carrito</>
                }
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            {[
              { icon: Shield, text: 'Garantía oficial del fabricante' },
              { icon: Truck,  text: 'Envío gratis en pedidos +$100' },
              { icon: BadgeCheck, text: 'Producto 100% original' },
              { icon: Package,    text: 'Devolución en 30 días' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-3 py-2 glass rounded-xl">
                <Icon className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-gray-400 text-xs">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="mb-12">
        {/* Tab headers */}
        <div className="flex gap-1 border-b border-white/10 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-sky-500/20 text-sky-400' : 'bg-white/10 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── SPECS TAB ── */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.specs.map((spec, i) => {
              const [label, ...rest] = spec.split(' ');
              return (
                <div key={i} className="glass rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{label}</p>
                    {rest.length > 0 && <p className="text-gray-400 text-xs mt-0.5">{rest.join(' ')}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── REVIEWS TAB ── */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {productReviews.length > 0 ? (
              <>
                {/* Rating overview */}
                <div className="glass rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Average */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-6xl font-extrabold gradient-text">{avgRating.toFixed(1)}</span>
                    <StarRating rating={avgRating} size="lg" />
                    <p className="text-gray-400 text-sm mt-2">
                      Basado en {productReviews.length} reseña{productReviews.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {/* Distribution */}
                  <div className="space-y-2">
                    {ratingDist.map(({ star, count, pct }) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-4 shrink-0">{star}</span>
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-6 text-right shrink-0">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review cards */}
                <div className="space-y-4">
                  {productReviews.map(review => (
                    <div key={review.id} className="glass rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {review.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold text-sm">{review.author}</span>
                              {review.verified && (
                                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                  <BadgeCheck className="w-3 h-3" /> Compra verificada
                                </span>
                              )}
                            </div>
                            <span className="text-gray-500 text-xs">{review.date}</span>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <h4 className="text-white font-semibold text-sm mb-1">{review.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{review.body}</p>
                      <button className="flex items-center gap-1.5 mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" /> Útil
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 glass rounded-2xl">
                <Star className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Aún no hay reseñas para este producto.</p>
                <p className="text-gray-600 text-sm mt-1">¡Sé el primero en opinar!</p>
              </div>
            )}
          </div>
        )}

        {/* ── BUNDLE TAB ── */}
        {activeTab === 'bundle' && (
          <div>
            <p className="text-gray-400 text-sm mb-5">
              Los clientes que compraron <span className="text-white font-semibold">{product.name}</span> también compraron:
            </p>
            {bundleProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {bundleProducts.map(bp => (
                    <div key={bp.id} className="glass rounded-2xl p-4 flex gap-3 card-hover">
                      <img src={bp.image} alt={bp.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-sky-400 font-semibold mb-0.5">{bp.category}</p>
                        <Link
                          to={`/producto/${bp.id}`}
                          className="text-white text-xs font-semibold line-clamp-2 hover:text-sky-400 transition-colors"
                        >
                          {bp.name}
                        </Link>
                        <p className="text-white font-bold text-sm mt-1">${bp.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Bundle total */}
                <div className="glass rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total del bundle ({bundleProducts.length + 1} productos):</p>
                    <p className="text-2xl font-extrabold gradient-text">
                      ${(product.price + bundleProducts.reduce((s, p) => s + p.price, 0)).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      [product, ...bundleProducts].forEach(p => addToCart(p));
                      showToast('Bundle completo', product.image);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-sky-500/20 whitespace-nowrap"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Agregar bundle al carrito
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">No hay sugerencias disponibles para esta categoría.</p>
            )}
          </div>
        )}
      </div>

      {/* ── RELATED PRODUCTS ── */}
      {related.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Productos relacionados</h2>
            <Link to={`/productos?categoria=${encodeURIComponent(product.category)}`} className="text-sky-400 hover:text-sky-300 text-sm transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
