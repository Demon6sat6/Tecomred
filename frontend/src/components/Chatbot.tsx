import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, X, Send, Bot, User,
  ExternalLink, ShoppingCart, Star, RotateCcw,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../hooks/useCurrency';
import { useToast } from '../context/ToastContext';
import { useAdmin } from '../context/AdminContext';
import type { Product } from '../types';

interface CardData {
  title: string;
  items: { label: string; value: string }[];
  footer?: string;
}

interface ButtonsData {
  buttons: { text: string; action: string; variant?: 'primary' | 'secondary' | 'whatsapp' }[];
}

type MessageData = Product[] | CardData | ButtonsData;

interface Message {
  id: number;
  text?: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'products' | 'card' | 'buttons';
  data?: MessageData;
}

// Chips de acceso rápido permanentes
const quickChips = [
  { label: '🔥 Ofertas', query: 'ofertas' },
  { label: '📦 Stock disponible', query: 'stock' },
  { label: '🚚 Envíos y Lima/Provincias', query: 'envios' },
  { label: '💳 Pagos y Yape', query: 'pagos' },
  { label: '🛡️ Garantía y Facturas', query: 'garantia' },
  { label: '📍 Ubicación y Horario', query: 'ubicacion' },
  { label: '💬 WhatsApp Asesor', query: 'whatsapp' },
];

const isProductList = (data: MessageData | undefined): data is Product[] => Array.isArray(data);
const isCardData = (data: MessageData | undefined): data is CardData =>
  !!data && !Array.isArray(data) && 'items' in data;
const isButtonsData = (data: MessageData | undefined): data is ButtonsData =>
  !!data && !Array.isArray(data) && 'buttons' in data;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useStore();
  const { settings } = useAdmin();
  const { formatShort } = useCurrency();
  const { showToast } = useToast();

  const welcomeMessage: Message = {
    id: 1,
    text: `¡Hola! 👋 Soy el asistente virtual de ${settings.storeName || 'SiscomRed'}. ¿En qué te puedo colaborar hoy? Puedo ayudarte a cotizar equipos, ver stock en tiempo real, métodos de pago o comunicarte directamente con un asesor técnico.`,
    sender: 'bot',
    timestamp: new Date(),
    type: 'text',
  };

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addBotMessage = (message: Partial<Message>) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      ...message,
    }]);
  };

  const resetChat = () => {
    setMessages([{
      id: Date.now(),
      text: `¡Listo! Conversación reiniciada. ¿Qué equipo o consulta tienes en mente?`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
    }]);
  };

  const handleSend = (textToSend?: string) => {
    const raw = (textToSend || inputValue).trim();
    if (!raw) return;

    setMessages(prev => [...prev, {
      id: Date.now(),
      text: raw,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const q = raw.toLowerCase();

      // 1. WhatsApp / Asesor Humano / Contacto
      if (
        q.includes('whatsapp') || q.includes('asesor') || q.includes('humano') ||
        q.includes('persona') || q.includes('llamar') || q.includes('telefono') ||
        q.includes('celular') || q.includes('contacto') || q.includes('cotizar')
      ) {
        const phoneClean = (settings.storePhone || '+51 997 176 721').replace(/\D/g, '');
        const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(`Hola SiscomRed, vengo desde la tienda web y deseo asesoría técnica especializada.`)}`;
        addBotMessage({
          text: `¡Por supuesto! Puedes chatear directamente con nuestro equipo de ingenieros y asesores comerciales:\n\n📱 **Teléfono / WhatsApp:** ${settings.storePhone}\n✉️ **Correo:** ${settings.storeEmail}\n⏰ **Horario:** ${settings.supportHours}`,
          type: 'buttons',
          data: {
            buttons: [
              { text: '💬 Abrir WhatsApp con un Asesor', action: `open:${waUrl}`, variant: 'whatsapp' },
              { text: 'Ir a página de contacto', action: 'page:/contacto', variant: 'secondary' },
            ],
          },
        });
        return;
      }

      // 2. Envíos y cobertura
      if (
        q.includes('envio') || q.includes('envíos') || q.includes('delivery') ||
        q.includes('flete') || q.includes('provincia') || q.includes('lima') ||
        q.includes('courier') || q.includes('olva') || q.includes('shalom') ||
        q.includes('cuanto demora') || q.includes('tiempo')
      ) {
        addBotMessage({
          type: 'card',
          data: {
            title: '🚚 Políticas y Tiempos de Entrega',
            items: [
              { label: 'Envío Gratis', value: `En compras desde ${formatShort(Number(settings.freeShippingMin) || 300)}` },
              { label: 'Lima Metropolitana', value: '24 a 48 horas con courier express' },
              { label: 'Provincias (Todo el Perú)', value: '2 a 4 días vía Shalom u Olva Courier' },
              { label: 'Seguimiento', value: 'Código de tracking en tiempo real' },
            ],
            footer: 'Garantizamos embalaje de alta seguridad para equipos delicados.',
          },
        });
        return;
      }

      // 3. Pagos / Facturación / Yape / Plin
      if (
        q.includes('pago') || q.includes('pagar') || q.includes('tarjeta') ||
        q.includes('yape') || q.includes('plin') || q.includes('transferencia') ||
        q.includes('bcp') || q.includes('bbva') || q.includes('factura') ||
        q.includes('boleta') || q.includes('ruc') || q.includes('cuotas')
      ) {
        addBotMessage({
          type: 'card',
          data: {
            title: '💳 Métodos de Pago y Facturación',
            items: [
              { label: 'Billeteras digitales', value: 'Yape y Plin sin comisiones' },
              { label: 'Transferencias', value: 'BCP, BBVA, Interbank (cuenta corriente)' },
              { label: 'Tarjetas', value: 'Visa, MasterCard, Diners, AMEX' },
              { label: 'Comprobante', value: 'Boleta o Factura con RUC (18% IGV incluido)' },
            ],
            footer: 'Emitimos facturación electrónica al instante para tu empresa.',
          },
        });
        return;
      }

      // 4. Ubicación / Tienda física / Dirección / Horario
      if (
        q.includes('donde') || q.includes('ubicacion') || q.includes('ubicación') ||
        q.includes('direccion') || q.includes('dirección') || q.includes('tienda') ||
        q.includes('local') || q.includes('horario') || q.includes('abierto')
      ) {
        addBotMessage({
          type: 'card',
          data: {
            title: '📍 Ubicación y Horarios de Atención',
            items: [
              { label: 'Dirección central', value: settings.storeAddress || 'Av. Javier Prado Este 4200, San Isidro, Lima' },
              { label: 'Horario comercial', value: settings.supportHours || 'Lun-Vie 9:00 AM - 7:00 PM | Sáb 9:00 AM - 2:00 PM' },
              { label: 'Despacho', value: 'Almacén central y envíos a todo el Perú' },
            ],
            footer: 'Contamos con estacionamiento para clientes previa coordinación.',
          },
        });
        return;
      }

      // 5. Garantía / Seguridad / Calidad
      if (
        q.includes('garantia') || q.includes('garantía') || q.includes('original') ||
        q.includes('seguro') || q.includes('confianza') || q.includes('cambio') ||
        q.includes('devolucion') || q.includes('devolución')
      ) {
        addBotMessage({
          text: `🛡️ **Garantía 100% Oficial:**\n\nTodos nuestros equipos son 100% nuevos, sellados de fábrica y cuentan con garantía oficial de marca (desde 12 hasta 36 meses según fabricante).\n\nAdemás, tienes 7 días de soporte de cambio directo ante cualquier falla técnica.`,
          type: 'buttons',
          data: {
            buttons: [
              { text: 'Ver Catálogo con Garantía', action: 'catalogo', variant: 'primary' },
              { text: 'Hablar con Soporte Técnico', action: 'whatsapp', variant: 'secondary' },
            ],
          },
        });
        return;
      }

      // 6. Ofertas / Descuentos
      if (q.includes('oferta') || q.includes('descuento') || q.includes('rebaja') || q.includes('promo')) {
        const deals = products.filter(p => p.badge === 'Oferta' || p.originalPrice).slice(0, 3);
        addBotMessage({
          text: `🔥 ¡Aquí tienes nuestras promociones destacadas con precios rebajados! Tienen stock disponible para entrega inmediata:`,
        });
        setTimeout(() => {
          addBotMessage({
            type: 'products',
            data: deals.length > 0 ? deals : products.slice(0, 3),
          });
        }, 350);
        return;
      }

      // 7. Nuevos productos
      if (q.includes('nuevo') || q.includes('novedad') || q.includes('reciente')) {
        const news = products.filter(p => p.badge === 'Nuevo').slice(0, 3);
        addBotMessage({ text: `✨ Recién llegados a nuestro almacén con lo último en tecnología de red:` });
        setTimeout(() => {
          addBotMessage({
            type: 'products',
            data: news.length > 0 ? news : products.slice(0, 3),
          });
        }, 350);
        return;
      }

      // 8. Búsqueda por Categoría
      const catMap: [string[], string][] = [
        [['switch', 'switches', 'conmutador', 'cisco 2960', 'poe', 'gigabit switch'], 'Switches'],
        [['router', 'routers', 'mikrotik', 'edgerouter', 'enrutador', 'wifi'], 'Routers'],
        [['procesador', 'procesadores', 'cpu', 'intel', 'core', 'ryzen'], 'Procesadores'],
        [['memoria', 'memorias', 'ram', 'ddr4', 'ddr5', 'kingston fury'], 'Memorias RAM'],
        [['almacenamiento', 'ssd', 'disco', 'm.2', 'nvme', 'samsung evo', 'solido'], 'Almacenamiento'],
        [['cable', 'cables', 'cat6', 'utp', 'patch', 'bobina', 'rj45'], 'Cables'],
        [['access point', 'ap', 'unifi', 'antena', 'repetidor'], 'Access Points'],
        [['herramienta', 'herramientas', 'crimpadora', 'ponchadora', 'tester'], 'Herramientas'],
        [['red', 'tarjeta de red', 'tarjetas', 'nic', 'ethernet'], 'Tarjetas de Red'],
      ];

      const foundCat = catMap.find(([keys]) => keys.some(k => q.includes(k)));
      if (foundCat) {
        const catProducts = products.filter(p => p.category.toLowerCase() === foundCat[1].toLowerCase()).slice(0, 3);
        addBotMessage({
          text: `🎯 Excelente elección. Aquí tienes modelos disponibles de **${foundCat[1]}** con garantía y entrega inmediata:`,
        });
        setTimeout(() => {
          addBotMessage({
            type: 'products',
            data: catProducts.length > 0 ? catProducts : products.slice(0, 3),
          });
        }, 350);
        return;
      }

      // 9. Búsqueda por marca (Cisco, MikroTik, Ubiquiti, Intel, Samsung, Kingston, TP-Link, Seagate)
      const brandMatch = ['cisco', 'mikrotik', 'ubiquiti', 'intel', 'samsung', 'kingston', 'tp-link', 'tplink', 'seagate'].find(b => q.includes(b));
      if (brandMatch) {
        const brandProducts = products.filter(p => p.name.toLowerCase().includes(brandMatch) || p.description.toLowerCase().includes(brandMatch)).slice(0, 3);
        if (brandProducts.length > 0) {
          addBotMessage({ text: `Equipos oficiales **${brandMatch.toUpperCase()}** disponibles en stock:` });
          setTimeout(() => addBotMessage({ type: 'products', data: brandProducts }), 350);
          return;
        }
      }

      // 10. Saludos cordiales naturales
      if (
        q.includes('hola') || q.includes('buenos dias') || q.includes('buenos días') ||
        q.includes('buenas tardes') || q.includes('buenas noches') || q.includes('que tal') ||
        q.includes('ola') || q.includes('buenas')
      ) {
        addBotMessage({
          text: `¡Hola! Qué gusto saludarte 🙌 ¿Cómo podemos apoyarte hoy con tus proyectos de redes o infraestructura tecnológica?`,
          type: 'buttons',
          data: {
            buttons: [
              { text: '🔍 Ver Catálogo Completo', action: 'catalogo', variant: 'primary' },
              { text: '🔥 Ver Ofertas del Día', action: 'ofertas', variant: 'secondary' },
              { text: '💬 Hablar con Asesor Humano', action: 'whatsapp', variant: 'whatsapp' },
            ],
          },
        });
        return;
      }

      // 11. Agradecimiento
      if (q.includes('gracias') || q.includes('agradezco') || q.includes('excelente') || q.includes('genial')) {
        addBotMessage({
          text: `¡Un placer atenderte! 😊 Estamos a tu servicio para lo que requieras en hardware y redes. ¡Que tengas un excelente día!`,
        });
        return;
      }

      // 12. Stock general
      if (q.includes('stock') || q.includes('disponible') || q.includes('tienen')) {
        addBotMessage({
          text: `✅ Contamos con stock disponible para entrega inmediata y facturación electrónica. Te comparto algunos de los más solicitados:`,
        });
        setTimeout(() => {
          addBotMessage({
            type: 'products',
            data: products.slice(0, 3),
          });
        }, 350);
        return;
      }

      // 13. Fallback inteligente y conversacional
      addBotMessage({
        text: `Comprendo tu consulta. Con gusto puedo orientarte con cualquiera de estas opciones:`,
        type: 'buttons',
        data: {
          buttons: [
            { text: 'Switches y Routers', action: 'switches', variant: 'primary' },
            { text: 'Almacenamiento y RAM', action: 'almacenamiento', variant: 'secondary' },
            { text: 'Información de Envíos', action: 'envios', variant: 'secondary' },
            { text: 'Chatear por WhatsApp', action: 'whatsapp', variant: 'whatsapp' },
          ],
        },
      });
    }, 700);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    showToast(product.name, product.image);
    setTimeout(() => {
      addBotMessage({
        text: `✅ Agregué **${product.name}** a tu carrito de compras.\n¿Deseas completar tu pedido o necesitas algún accesorio compatible (como cables o patch cords)?`,
        type: 'buttons',
        data: {
          buttons: [
            { text: '🛒 Ir al Carrito a Pagar', action: 'page:/carrito', variant: 'primary' },
            { text: 'Ver Cables Cat6', action: 'cables', variant: 'secondary' },
          ],
        },
      });
    }, 300);
  };

  const handleButtonClick = (action: string) => {
    if (action.startsWith('open:')) {
      window.open(action.slice(5), '_blank');
      return;
    }
    if (action.startsWith('page:')) {
      setIsOpen(false);
      navigate(action.slice(5));
      return;
    }
    if (action === 'catalogo') {
      handleSend('catalogo');
      return;
    }
    handleSend(action);
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 sm:bottom-6 sm:right-6 z-[90] w-14 h-14 sm:w-16 sm:h-16 rounded-full gradient-brand shadow-xl shadow-violet-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group touch-manipulation"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            ¿Necesitas ayuda?
          </div>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:bottom-6 sm:right-6 z-[90] w-auto sm:w-[420px] h-[min(720px,calc(100dvh-0.5rem))] sm:h-[600px] max-h-[calc(100dvh-0.5rem)] bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden animate-slide-up">

          {/* Header */}
          <div className="gradient-brand px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                <img src="/faviivon-nuevo.png" alt="SiscomRed" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base leading-tight">Asistente {settings.storeName || 'SiscomRed'}</h3>
                <p className="text-white/80 text-xs flex items-center gap-1.5 mt-0.5 font-medium">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Especialista en hardware & redes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="w-9 h-9 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-colors"
                title="Reiniciar conversación"
                aria-label="Reiniciar conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors touch-manipulation"
                aria-label="Cerrar chat"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50" aria-live="polite">
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.type === 'text' && (
                  <div className={`flex gap-2 sm:gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === 'bot' ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {msg.sender === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[82%] sm:max-w-[78%] flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm whitespace-pre-line break-words leading-relaxed shadow-xs ${
                        msg.sender === 'bot'
                          ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-200'
                          : 'gradient-brand text-white rounded-tr-xs font-medium'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 px-1 font-medium">
                        {msg.timestamp.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}

                {msg.type === 'products' && isProductList(msg.data) && (
                  <div className="space-y-2.5 ml-9 sm:ml-10">
                    {msg.data.map(product => (
                      <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-3 flex gap-3 shadow-xs hover:border-violet-300 transition-colors">
                        <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover bg-slate-50 shrink-0 border border-slate-100" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-violet-600 font-bold uppercase tracking-wider mb-0.5">{product.category}</p>
                          <h4 className="text-slate-900 text-xs font-semibold line-clamp-2 mb-1 leading-snug">{product.name}</h4>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-slate-600 font-medium">{product.rating}</span>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold ml-1">En Stock</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm sm:text-base font-extrabold text-slate-900">{formatShort(product.price)}</span>
                            <div className="flex gap-1.5">
                              <Link to={`/producto/${product.id}`} onClick={() => setIsOpen(false)}
                                className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 text-xs font-semibold" title="Ver detalles">
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Ver</span>
                              </Link>
                              <button onClick={() => handleAddToCart(product)}
                                className="px-2.5 py-1.5 rounded-lg gradient-brand text-white hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 text-xs font-bold shadow-xs" title="Agregar al carrito">
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Agregar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link to="/productos" onClick={() => setIsOpen(false)}
                      className="block text-center py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-violet-600 hover:text-violet-700 shadow-xs hover:bg-slate-50 transition-colors">
                      Ver todo el catálogo completo →
                    </Link>
                  </div>
                )}

                {msg.type === 'card' && isCardData(msg.data) && (
                  <div className="ml-9 sm:ml-10 bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                    <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      {msg.data.title}
                    </h4>
                    <div className="space-y-2 divide-y divide-slate-100">
                      {msg.data.items.map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:justify-between text-xs pt-2 first:pt-0 gap-0.5 sm:gap-2">
                          <span className="text-slate-500 font-medium">{item.label}:</span>
                          <span className="text-slate-800 font-semibold sm:text-right">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    {msg.data.footer && (
                      <p className="text-xs text-violet-700 pt-2.5 border-t border-slate-200 font-medium">
                        ✓ {msg.data.footer}
                      </p>
                    )}
                  </div>
                )}

                {msg.type === 'buttons' && isButtonsData(msg.data) && (
                  <div className="flex flex-wrap gap-2 pl-9 sm:pl-10 mt-1">
                    {msg.data.buttons.map((btn, i) => {
                      const isWa = btn.variant === 'whatsapp';
                      const isSec = btn.variant === 'secondary';
                      return (
                        <button
                          key={i}
                          onClick={() => handleButtonClick(btn.action)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-xs ${
                            isWa
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : isSec
                                ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                : 'gradient-brand text-white hover:opacity-90'
                          }`}
                        >
                          {btn.text}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chips rápidos PERMANENTES */}
          <div className="px-3 py-2 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 select-none touch-pan-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.query)}
                  disabled={isTyping}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-violet-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 active:scale-95 disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={e => { e.preventDefault(); handleSend(); }}
            className="p-3 sm:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-4 border-t border-slate-200 bg-slate-50 shrink-0">
            <div className="flex gap-2">
              <input
                type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                placeholder="Escribe tu consulta (ej: switches Cisco, envíos, boleta...)"
                maxLength={500}
                enterKeyHint="send"
                className="flex-1 min-w-0 min-h-[44px] px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button type="submit" disabled={!inputValue.trim()}
                className="w-11 h-11 sm:w-11 sm:h-11 shrink-0 rounded-xl gradient-brand flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-35 disabled:cursor-not-allowed touch-manipulation shadow-md shadow-violet-500/20"
                aria-label="Enviar">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
