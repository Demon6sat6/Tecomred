import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../hooks/useCurrency';
import { useAdmin } from '../context/AdminContext';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { formatShort } = useCurrency();
  const { settings } = useAdmin();

  const FREE_SHIPPING_THRESHOLD = Number(settings.freeShippingMin) || 300;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progress  = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full gradient-brand flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Tu carrito estÃ¡ vacÃ­o</h2>
        <p className="text-gray-400 mb-8">Agrega productos para comenzar tu compra.</p>
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Ver catÃ¡logo <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Carrito <span className="text-gray-400 text-lg sm:text-xl font-normal">({totalItems} items)</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-400 hover:text-red-300 transition-colors self-start sm:self-auto"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

        {/* â”€â”€ LEFT: Items + progress bar â”€â”€ */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">

          {/* Free shipping progress bar */}
          <div className={`rounded-xl sm:rounded-2xl p-4 border ${
            remaining === 0
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'glass border-white/10'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Truck className={`w-4 h-4 shrink-0 ${remaining === 0 ? 'text-emerald-400' : 'text-gray-400'}`} />
              {remaining === 0 ? (
                <p className="text-emerald-400 text-sm font-semibold">ðŸŽ‰ Â¡Tienes envÃ­o gratis!</p>
              ) : (
                <p className="text-gray-300 text-sm">
                  Agrega <span className="text-white font-bold">{formatShort(remaining)}</span> mÃ¡s para{' '}
                  <span className="text-sky-400 font-semibold">envÃ­o gratis</span>
                </p>
              )}
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${remaining === 0 ? 'bg-emerald-400' : 'gradient-brand'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {remaining > 0 && (
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-600">$0</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Gratis a partir de {formatShort(FREE_SHIPPING_THRESHOLD)}
                </span>
              </div>
            )}
          </div>

          {/* Cart items */}
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-sky-400 mb-0.5 uppercase tracking-wide font-semibold">{product.category}</p>
                <Link
                  to={`/producto/${product.id}`}
                  className="text-white font-semibold text-xs sm:text-sm hover:text-sky-400 transition-colors line-clamp-2"
                >
                  {product.name}
                </Link>
                <p className="text-base sm:text-lg font-bold text-white mt-1">{formatShort(product.price)}</p>
              </div>
              <div className="flex flex-col items-end justify-between shrink-0">
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="p-1 sm:p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <div className="flex items-center glass rounded-lg sm:rounded-xl overflow-hidden">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <span className="px-2 sm:px-3 py-1.5 sm:py-2 text-white font-semibold text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* â”€â”€ RIGHT: Order summary â”€â”€ */}
        <div className="lg:col-span-1">
          <div className="glass rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">Resumen del pedido</h2>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 max-h-48 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-xs sm:text-sm gap-2">
                  <span className="text-gray-400 truncate">{product.name} Ã—{quantity}</span>
                  <span className="text-gray-300 shrink-0 font-medium">${(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-3 sm:pt-4 mb-4 sm:mb-6 space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-300">{formatShort(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-400">EnvÃ­o</span>
                <span className="text-emerald-400 font-medium">
                  {remaining === 0 ? 'Gratis ðŸŽ‰' : `$${(5).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-white/10">
                <span className="text-white">Total</span>
                <span className="gradient-text">{formatShort(totalPrice)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl gradient-brand text-white text-sm sm:text-base font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-sky-500/20"
            >
              Proceder al pago <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            <Link
              to="/productos"
              className="w-full flex items-center justify-center mt-3 py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Seguir comprando
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

