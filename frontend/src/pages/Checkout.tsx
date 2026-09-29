import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CreditCard, Truck, ArrowLeft, AlertCircle, Package, Clock, MapPin, Tag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../hooks/useCurrency';
import { useAdmin } from '../context/AdminContext';

type Step = 'envio' | 'pago' | 'confirmacion';
interface FormErrors { [key: string]: string; }

function Field({ label, name, value, onChange, placeholder, type = 'text', inputMode, error, className = '' }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; type?: string; inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'; error?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm text-slate-600 mb-1.5 font-medium">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} inputMode={inputMode}
        className={`w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white text-sm transition-all ${
          error ? 'border-red-400 focus:border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-violet-500'
        }`} />
      {error && <p className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium"><AlertCircle className="w-3 h-3 shrink-0" /> {error}</p>}
    </div>
  );
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { addOrder, applyCoupon, incrementCouponUse, settings } = useAdmin();
  const { formatShort } = useCurrency();

  const whatsappUrl = `https://wa.me/${(settings.storePhone || '').replace(/\D/g, '')}`;

  const [step, setStep] = useState<Step>('envio');
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    items: typeof items;
    total: number;
    discount: number;
    couponCode: string;
  } | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const finalTotal = appliedCoupon ? Math.max(0, totalPrice - appliedCoupon.discount) : totalPrice;

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '',
    direccion: '', ciudad: '', pais: 'Lima', codigo: '',
    cardName: '', cardNumber: '', cardExpiry: '', cardCvv: '',
  });

  if (items.length === 0 && step !== 'confirmacion') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No hay productos en el carrito</h2>
        <p className="text-slate-600 mb-6">Agrega productos antes de continuar.</p>
        <Link to="/productos" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 transition-opacity shadow-md shadow-violet-500/20">Ver catálogo</Link>
      </div>
    );
  }

  const formatCard   = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') value = formatCard(value);
    if (name === 'cardExpiry') value = formatExpiry(value);
    if (name === 'cardCvv')    value = value.replace(/\D/g, '').slice(0, 4);
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput.trim(), totalPrice);
    setCouponMsg({ text: result.message, ok: result.valid });
    if (result.valid) setAppliedCoupon({ code: couponInput.trim().toUpperCase(), discount: result.discount });
    else setAppliedCoupon(null);
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponInput(''); setCouponMsg(null); };

  const validateShipping = (): boolean => {
    const e: FormErrors = {};
    if (!form.nombre.trim())    e.nombre    = 'El nombre es requerido';
    if (!form.apellido.trim())  e.apellido  = 'El apellido es requerido';
    if (!form.email.trim())     e.email     = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido';
    if (!form.telefono.trim())  e.telefono  = 'El teléfono es requerido';
    if (!form.direccion.trim()) e.direccion = 'La dirección es requerida';
    if (!form.ciudad.trim())    e.ciudad    = 'La ciudad es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = (): boolean => {
    const e: FormErrors = {};
    if (!form.cardName.trim())  e.cardName   = 'El nombre es requerido';
    if (form.cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Número de tarjeta inválido (16 dígitos)';
    if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) e.cardExpiry = 'Formato MM/AA requerido';
    if (form.cardCvv.length < 3) e.cardCvv   = 'CVV inválido (3-4 dígitos)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextShipping = () => { if (validateShipping()) setStep('pago'); };

  const handleOrder = () => {
    if (!validatePayment()) return;
    const orderId = `TR-${Date.now().toString().slice(-6)}`;
    const checkoutItems = items.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      qty: quantity,
      price: product.price,
    }));
    const discount = appliedCoupon?.discount ?? 0;
    const couponCode = appliedCoupon?.code ?? '';
    const whatsappLines = checkoutItems.map(item => `• ${item.name} x${item.qty} - ${formatShort(item.price * item.qty)}`).join('\n');
    const whatsappMessage = `Hola, quiero realizar el pedido ${orderId}.\n\nCliente: ${form.nombre} ${form.apellido}\nTeléfono: ${form.telefono}\nCorreo: ${form.email}\nDirección: ${form.direccion}, ${form.ciudad}, ${form.pais}\n\nProductos:\n${whatsappLines}\n\nTotal: ${formatShort(finalTotal)}${couponCode ? `\nCupón: ${couponCode}` : ''}`;

    // Register order in admin
    addOrder({
      id: orderId,
      customer: `${form.nombre} ${form.apellido}`,
      email: form.email,
      phone: form.telefono,
      date: new Date().toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }),
      total: finalTotal,
      discount,
      couponCode,
      status: 'Pendiente',
      city: form.ciudad,
      address: `${form.direccion}, ${form.ciudad}, ${form.pais}`,
      notes: '',
      items: checkoutItems,
    });
    setConfirmedOrder({
      id: orderId,
      items: items.map(item => ({ ...item })),
      total: finalTotal,
      discount,
      couponCode,
    });
    if (appliedCoupon) incrementCouponUse(appliedCoupon.code);
    clearCart();
    window.open(`${whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer');
    setStep('confirmacion');
  };

  const steps = [
    { id: 'envio',        label: 'Envío',        icon: Truck },
    { id: 'pago',         label: 'Pago',         icon: CreditCard },
    { id: 'confirmacion', label: 'Confirmación', icon: Check },
  ];

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + 2);
  const dateStr = estimatedDate.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <Link to="/carrito" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al carrito
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">Finalizar compra</h1>

      {/* Steps */}
      <div className="flex items-center mb-10">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isDone   = steps.findIndex(x => x.id === step) > i;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${isActive ? 'text-violet-600' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isActive ? 'border-violet-600 bg-violet-50 text-violet-700 shadow-xs' :
                  isDone   ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-400'
                }`}>
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-sm font-semibold hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation */}
      {step === 'confirmacion' ? (
        <div className="max-w-lg mx-auto text-center py-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center">
              <Check className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">¡Pedido confirmado!</h2>
          <p className="text-slate-600 mb-6">Gracias por tu compra en SiscomRed.</p>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left space-y-4 mb-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-slate-500 text-sm">Número de orden</span>
              <span className="text-slate-900 font-bold font-mono">{confirmedOrder?.id ?? '-'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-slate-900 text-sm font-semibold">Entrega estimada</p>
                <p className="text-slate-600 text-xs capitalize">{dateStr}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-slate-900 text-sm font-semibold">Dirección de entrega</p>
                <p className="text-slate-600 text-xs">{form.direccion}, {form.ciudad}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-3">Productos</p>
              {(confirmedOrder?.items ?? []).map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-50" />
                  <span className="text-slate-700 text-xs flex-1 truncate">{product.name} ×{quantity}</span>
                  <span className="text-slate-900 text-xs font-semibold shrink-0">{formatShort(product.price * quantity)}</span>
                </div>
              ))}
              {Boolean(confirmedOrder?.couponCode) && (
                <div className="flex justify-between text-sm text-emerald-700 font-medium">
                  <span>Cupón {confirmedOrder?.couponCode}</span>
                  <span>-{formatShort(confirmedOrder?.discount ?? 0)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-slate-200 font-bold">
                <span className="text-slate-900">Total pagado</span>
                <span className="gradient-text text-lg">{formatShort(confirmedOrder?.total ?? 0)}</span>
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Recibirás un correo en <span className="text-slate-900 font-semibold">{form.email}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-violet-500/20">Volver al inicio</Link>
            <Link to="/productos" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold hover:bg-slate-200 transition-colors">Seguir comprando</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            {/* Shipping */}
            {step === 'envio' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                <h2 className="text-slate-900 font-bold text-lg mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-violet-600" /> Información de envío
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field name="nombre"    label="Nombre *"             value={form.nombre}    onChange={handleChange} placeholder="Juan"              error={errors.nombre} />
                  <Field name="apellido"  label="Apellido *"           value={form.apellido}  onChange={handleChange} placeholder="Pérez"             error={errors.apellido} />
                  <Field name="email"     label="Correo electrónico *" value={form.email}     onChange={handleChange} placeholder="juan@email.com"    type="email" inputMode="email" error={errors.email} />
                  <Field name="telefono"  label="Teléfono *"           value={form.telefono}  onChange={handleChange} placeholder="+51 987 654 321"    type="tel" inputMode="tel" error={errors.telefono} />
                  <Field name="direccion" label="Dirección *"          value={form.direccion} onChange={handleChange} placeholder="Av. Principal 123" error={errors.direccion} className="sm:col-span-2" />
                  <Field name="ciudad"    label="Ciudad *"             value={form.ciudad}    onChange={handleChange} placeholder="Lima"              error={errors.ciudad} />
                  <Field name="codigo"    label="Código postal"        value={form.codigo}    onChange={handleChange} placeholder="15001" inputMode="numeric" />
                  <div>
                    <label className="block text-sm text-slate-600 mb-1.5 font-medium">Departamento</label>
                    <select name="pais" value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))}
                      className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-violet-500 text-sm">
                      {['Lima','Arequipa','Trujillo','Chiclayo','Piura','Cusco','Iquitos','Huancayo','Tacna','Puno'].map(p => (
                        <option key={p} value={p} className="bg-white text-slate-800">{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={handleNextShipping}
                  className="mt-6 w-full min-h-[46px] py-3 rounded-xl gradient-brand text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-violet-500/20 touch-manipulation">
                  Continuar al pago
                </button>
              </div>
            )}

            {/* Payment */}
            {step === 'pago' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                <h2 className="text-slate-900 font-bold text-lg mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-violet-600" /> Información de pago
                </h2>
                {/* Card preview */}
                <div className="relative h-40 rounded-2xl gradient-brand p-5 mb-6 overflow-hidden shadow-lg shadow-violet-500/20">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full" />
                  </div>
                  <div className="relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-7 bg-yellow-400/80 rounded-md" />
                      <span className="text-white/60 text-xs font-mono">VISA</span>
                    </div>
                    <p className="text-white font-mono text-lg tracking-widest mb-3">{form.cardNumber || '•••• •••• •••• ••••'}</p>
                    <div className="flex justify-between">
                      <span className="text-white/70 text-xs">{form.cardName || 'NOMBRE APELLIDO'}</span>
                      <span className="text-white/70 text-xs">{form.cardExpiry || 'MM/AA'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Field name="cardName"   label="Nombre en la tarjeta *" value={form.cardName}   onChange={handleChange} placeholder="JUAN PEREZ"          error={errors.cardName} />
                  <Field name="cardNumber" label="Número de tarjeta *"    value={form.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" inputMode="numeric" error={errors.cardNumber} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field name="cardExpiry" label="Vencimiento *" value={form.cardExpiry} onChange={handleChange} placeholder="MM/AA" inputMode="numeric" error={errors.cardExpiry} />
                    <Field name="cardCvv"    label="CVV *"         value={form.cardCvv}    onChange={handleChange} placeholder="123"   inputMode="numeric" error={errors.cardCvv} />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-emerald-700 text-xs font-medium">Pago 100% seguro. Tus datos están encriptados.</p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setErrors({}); setStep('envio'); }}
                    className="px-5 py-3 min-h-[46px] rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold hover:bg-slate-200 transition-colors touch-manipulation">
                    Atrás
                  </button>
                  <button onClick={handleOrder}
                    className="flex-1 min-h-[46px] py-3 rounded-xl gradient-brand text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-violet-500/20 touch-manipulation">
                    Confirmar pedido - {formatShort(finalTotal)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 h-fit lg:sticky lg:top-24 space-y-4 shadow-xs">
            <h3 className="text-slate-900 font-bold">Tu pedido</h3>
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3">
                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 truncate font-medium">{product.name}</p>
                    <p className="text-xs text-slate-500">×{quantity}</p>
                  </div>
                  <span className="text-sm text-slate-900 shrink-0 font-semibold">{formatShort(product.price * quantity)}</span>
                </div>
              ))}
            </div>

            {/* Coupon input */}
            <div className="border-t border-slate-200 pt-4">
              <label className="block text-xs text-slate-600 mb-2 font-medium flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-violet-600" /> Cupón de descuento
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div>
                    <p className="text-emerald-700 text-xs font-bold">{appliedCoupon.code}</p>
                    <p className="text-emerald-600 text-xs font-medium">-{formatShort(appliedCoupon.discount)}</p>
                  </div>
                  <button onClick={removeCoupon} className="p-1 rounded-lg hover:bg-emerald-100 text-slate-500 hover:text-slate-800 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg(null); }}
                    placeholder="CODIGO" onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-500 font-mono uppercase" />
                  <button onClick={handleApplyCoupon}
                    className="px-3 py-2 rounded-xl gradient-brand text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs">
                    Aplicar
                  </button>
                </div>
              )}
              {couponMsg && !appliedCoupon && (
                <p className={`text-xs mt-1.5 flex items-center gap-1 font-medium ${couponMsg.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                  <AlertCircle className="w-3 h-3 shrink-0" /> {couponMsg.text}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900 font-medium">{formatShort(totalPrice)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700 font-medium">Descuento</span>
                  <span className="text-emerald-700 font-semibold">-{formatShort(appliedCoupon.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Envío</span>
                <span className="text-emerald-700 font-semibold">Gratis</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-900">Total</span>
                <span className="gradient-text text-lg">{formatShort(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



