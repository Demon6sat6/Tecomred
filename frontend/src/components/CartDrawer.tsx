import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, Minus, Plus, ShoppingBag, ShoppingCart, Trash2, Truck, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../hooks/useCurrency';
import { useAdmin } from '../context/AdminContext';
import CartProductImage from './CartProductImage';
import { buildWhatsAppOrder, cartPriceIsEstimated, isReferenceProduct } from '../utils/cartOrder';

type Props = { onClose: () => void };

export default function CartDrawer({ onClose }: Props) {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity } = useCart();
  const { formatShort } = useCurrency();
  const { settings } = useAdmin();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const threshold = Number(settings.freeShippingMin) || 300;
  const remaining = Math.max(0, threshold - totalPrice);
  const whatsappUrl = buildWhatsAppOrder(items, settings.storePhone);
  const estimated = cartPriceIsEstimated(items);
  const shipping = estimated || remaining === 0 ? 0 : 15;

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 w-full bg-slate-900/40 cursor-default"
        onClick={onClose}
        aria-label="Cerrar carrito"
        tabIndex={-1}
      />
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l border-blue-100 bg-white shadow-2xl cart-drawer-enter"
      >
        <div className="h-1 w-full shrink-0 bg-gradient-to-r from-[#0052cc] via-[#1478dc] to-[#48bb07]" aria-hidden="true" />
        <div className="flex items-center justify-between gap-4 border-b border-blue-100 bg-white px-5 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0052cc] text-white shadow-sm shadow-blue-200">
              <ShoppingCart className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 id="cart-drawer-title" className="text-xl font-extrabold tracking-tight text-slate-900">Tu carrito</h2>
              <p className="text-sm text-slate-500">{totalItems} {totalItems === 1 ? 'producto seleccionado' : 'productos seleccionados'}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:border-[#0052cc] hover:bg-blue-50 hover:text-[#0052cc] transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col overflow-y-auto bg-gradient-to-b from-white via-white to-[#f5faff]">
            <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
              <div className="relative mb-8">
                <span className="absolute -inset-4 rounded-[2rem] border border-blue-100 bg-blue-50/70 rotate-6" aria-hidden="true" />
                <span className="relative flex h-24 w-24 items-center justify-center rounded-[1.7rem] bg-white text-[#0052cc] shadow-lg shadow-blue-100 ring-1 ring-blue-100">
                  <ShoppingBag className="h-11 w-11" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="absolute -bottom-2 -right-3 h-5 w-5 rounded-full border-4 border-white bg-[#48bb07]" aria-hidden="true" />
              </div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#348f00]">Lista para empezar</p>
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-3">Tu carrito está vacío</h3>
              <p className="max-w-xs text-sm leading-6 text-slate-600 mb-8">Cuando encuentres algo que te guste, lo verás aquí para revisar tu pedido.</p>
              <Link to="/productos" onClick={onClose} className="inline-flex min-h-12 w-full max-w-[270px] items-center justify-center gap-2 rounded-xl bg-[#0052cc] px-5 py-3 font-bold text-white shadow-lg shadow-blue-200 hover:bg-[#003fa8] transition-colors">
                Explorar catálogo <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="border-t border-blue-100 px-6 py-5">
              <Link to="/contacto" onClick={onClose} className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white px-4 py-3 text-left hover:border-[#0052cc]/30 hover:shadow-sm transition-all">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime-50 text-[#348f00]"><Headphones className="h-5 w-5" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-900">¿Necesitas ayuda para elegir?</span><span className="block text-xs text-slate-500">Nuestro equipo puede asesorarte</span></span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#0052cc]" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
              {!estimated && <div className={`rounded-2xl border px-4 py-3 text-sm ${remaining === 0 ? 'border-lime-200 bg-lime-50 text-[#348f00]' : 'border-blue-100 bg-blue-50 text-[#0052cc]'}`}>
                <div className="flex items-center gap-2 font-semibold"><Truck className="h-4 w-4 shrink-0" aria-hidden="true" />{remaining === 0 ? '¡Tu pedido tiene envío gratis!' : `Te faltan ${formatShort(remaining)} para envío gratis`}</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-gradient-to-r from-[#0052cc] to-[#48bb07] transition-all" style={{ width: `${Math.min(100, (totalPrice / threshold) * 100)}%` }} /></div>
              </div>}
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md">
                  <CartProductImage src={product.image} alt={product.name} className="h-20 w-20 shrink-0 rounded-xl border border-slate-100 bg-slate-50 object-contain" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#0052cc]">{product.category}</p>
                    <Link to={`/producto/${product.id}`} onClick={onClose} className="block text-sm font-semibold text-slate-900 line-clamp-2 hover:text-[#0052cc] transition-colors">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-base font-extrabold text-[#0052cc]">{formatShort(product.price * quantity)}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                        <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} className="flex h-8 w-8 items-center justify-center text-slate-600 hover:text-[#0052cc]" aria-label={`Disminuir cantidad de ${product.name}`}><Minus className="h-3.5 w-3.5" /></button>
                        <span className="min-w-7 text-center text-sm font-semibold text-slate-900">{quantity}</span>
                        <button type="button" onClick={() => updateQuantity(product.id, quantity + 1)} disabled={quantity >= (isReferenceProduct(product) ? 99 : product.stock)} className="flex h-8 w-8 items-center justify-center text-slate-600 hover:text-[#0052cc] disabled:cursor-not-allowed disabled:opacity-35" aria-label={`Aumentar cantidad de ${product.name}`}><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <button type="button" onClick={() => removeFromCart(product.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Eliminar ${product.name}`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-blue-100 bg-[#f7faff] px-5 sm:px-6 py-5 shadow-[0_-8px_24px_rgba(15,23,42,0.04)]">
              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-semibold text-slate-900">{formatShort(totalPrice)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Envío</span><span className={shipping === 0 ? 'font-semibold text-[#348f00]' : 'font-semibold text-slate-900'}>{estimated ? 'Por confirmar' : shipping === 0 ? 'Gratis' : formatShort(shipping)}</span></div>
                <div className="flex justify-between border-t border-blue-100 pt-3 text-base font-bold text-slate-900"><span>{estimated ? 'Total referencial' : 'Total estimado'}</span><span className="text-lg font-extrabold text-[#0052cc]">{formatShort(totalPrice + shipping)}</span></div>
              </div>
              {estimated && <p className="mb-3 text-xs text-slate-600">Confirmaremos modelos, disponibilidad y precio final por WhatsApp.</p>}
              <div className="grid grid-cols-2 gap-3">
                <Link to="/carrito" onClick={onClose} className="flex min-h-12 items-center justify-center rounded-xl border border-[#0052cc] bg-white px-3 text-sm font-bold text-[#0052cc] hover:bg-blue-50 transition-colors">Ver carrito</Link>
                {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-1 rounded-xl bg-[#0052cc] px-3 text-sm font-bold text-white hover:bg-[#003fa8] transition-colors">Pedir por WhatsApp <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>,
    document.body,
  );
}
