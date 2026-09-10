import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Package, Truck, CreditCard, Headphones, ExternalLink, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  buttons: { text: string; action: string }[];
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

const quickReplies = [
  { icon: Package,    text: '¿Tienen stock?',    action: 'stock'   },
  { icon: Truck,      text: 'Tiempos de envío',  action: 'envio'   },
  { icon: CreditCard, text: 'Métodos de pago',   action: 'pago'    },
  { icon: Headphones, text: 'Soporte técnico',   action: 'soporte' },
];

const isProductList = (data: MessageData | undefined): data is Product[] => Array.isArray(data);
const isCardData = (data: MessageData | undefined): data is CardData =>
  !!data && !Array.isArray(data) && 'items' in data;
const isButtonsData = (data: MessageData | undefined): data is ButtonsData =>
  !!data && !Array.isArray(data) && 'buttons' in data;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '¡Hola! 👋 Soy el asistente virtual de TecomRed. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { products } = useStore();
  const { settings } = useAdmin();
  const { formatShort } = useCurrency();
  const { showToast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addBotMessage = (message: Partial<Message>) => {
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'bot', timestamp: new Date(), type: 'text', ...message,
    }]);
  };

  const handleQuickReply = (reply: typeof quickReplies[0]) => {
    setMessages(prev => [...prev, {
      id: Date.now(), text: reply.text, sender: 'user', timestamp: new Date(), type: 'text',
    }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      switch (reply.action) {
        case 'stock':
          addBotMessage({ text: 'Todos nuestros productos tienen stock disponible. Te muestro algunos populares:' });
          setTimeout(() => {
            addBotMessage({ type: 'products', data: products.filter(p => p.badge === 'Popular' || p.badge === 'Oferta').slice(0, 3) });
          }, 500);
          break;
        case 'envio':
          addBotMessage({ type: 'card', data: {
            title: '🚚 Información de Envío',
            items: [
              { label: 'Envío estándar', value: '24-48 horas' },
              { label: 'Envío express', value: '12-24 horas' },
              { label: 'Envío gratis', value: 'Compras +S/ 300' },
              { label: 'Cobertura', value: 'Todo el país' },
            ],
            footer: 'Rastreo en tiempo real incluido',
          }});
          break;
        case 'pago':
          addBotMessage({ type: 'card', data: {
            title: '💳 Métodos de Pago',
            items: [
              { label: 'Tarjetas', value: 'Visa, Mastercard, Amex' },
              { label: 'Transferencia', value: 'Bancaria directa' },
              { label: 'PayPal', value: 'Pago seguro' },
              { label: 'Contra entrega', value: 'Zonas seleccionadas' },
            ],
            footer: 'Todos los pagos son 100% seguros',
          }});
          break;
        case 'soporte':
          addBotMessage({ type: 'card', data: {
            title: '🎧 Soporte Técnico',
            items: [
              { label: 'Teléfono', value: settings.storePhone },
              { label: 'Email', value: settings.storeEmail },
              { label: 'Horario', value: settings.supportHours },
              { label: 'Emergencias', value: '24/7 disponible' },
            ],
            footer: 'Asesoría técnica especializada incluida',
          }});
          break;
      }
    }, 800);
  };

  const handleSend = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;
    setMessages(prev => [...prev, {
      id: Date.now(), text: messageText, sender: 'user', timestamp: new Date(), type: 'text',
    }]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const q = messageText.toLowerCase();
      const catMap: [string[], string][] = [
        [['switch','switches'], 'Switches'],
        [['router','routers'], 'Routers'],
        [['procesador','cpu'], 'Procesadores'],
        [['memoria','ram'], 'Memorias RAM'],
        [['almacenamiento','ssd','disco'], 'Almacenamiento'],
      ];
      const match = catMap.find(([keys]) => keys.some(k => q.includes(k)));
      if (match) {
        addBotMessage({ text: `Encontré estos ${match[1]} para ti:` });
        setTimeout(() => addBotMessage({ type: 'products', data: products.filter(p => p.category === match[1]).slice(0, 3) }), 500);
      } else if (q.includes('oferta') || q.includes('descuento')) {
        addBotMessage({ text: '🔥 ¡Nuestras mejores ofertas!' });
        setTimeout(() => addBotMessage({ type: 'products', data: products.filter(p => p.badge === 'Oferta').slice(0, 3) }), 500);
      } else if (q.includes('nuevo') || q.includes('novedad')) {
        addBotMessage({ text: '✨ Nuestros productos más recientes:' });
        setTimeout(() => addBotMessage({ type: 'products', data: products.filter(p => p.badge === 'Nuevo').slice(0, 3) }), 500);
      } else if (q.includes('hola') || q.includes('buenos') || q.includes('buenas')) {
        addBotMessage({ text: '¡Hola! ¿En qué puedo ayudarte? Puedo mostrarte productos, info de envío, métodos de pago o soporte.' });
      } else if (q.includes('precio') || q.includes('costo') || q.includes('cuanto')) {
        addBotMessage({ text: 'Nuestros precios son muy competitivos. ¿Qué producto te interesa?', type: 'buttons', data: {
          buttons: [
            { text: 'Ver Switches', action: 'switches' },
            { text: 'Ver Routers', action: 'routers' },
            { text: 'Ver todo', action: 'catalogo' },
          ],
        }});
      } else if (q.includes('gracias')) {
        addBotMessage({ text: '¡De nada! Estoy aquí para ayudarte. ¿Necesitas algo más?' });
      } else {
        addBotMessage({ text: 'Puedo ayudarte con:\n\n- Ver productos por categoría\n- Info de stock y envío\n- Métodos de pago\n- Soporte técnico\n\n¿Qué te gustaría saber?' });
      }
    }, 1000);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    showToast(product.name, product.image);
    setTimeout(() => addBotMessage({ text: `✅ ${product.name} agregado al carrito. ¿Quieres ver más productos similares?` }), 300);
  };

  const handleButtonClick = (action: string) => {
    handleSend(action === 'catalogo' ? 'productos' : action);
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 sm:bottom-6 sm:right-6 z-[90] w-14 h-14 sm:w-16 sm:h-16 rounded-full gradient-brand shadow-2xl shadow-violet-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group touch-manipulation"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-950 animate-pulse" />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            ¿Necesitas ayuda?
          </div>
        </button>
      )}

      {/* Chat window — superficie opaca para conservar el contraste en cualquier fondo */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:bottom-6 sm:right-6 z-[90] w-auto sm:w-[420px] h-[min(720px,calc(100dvh-0.5rem))] sm:h-[600px] max-h-[calc(100dvh-0.5rem)] bg-[#08111f] border border-sky-200/15 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/70 flex flex-col overflow-hidden animate-slide-up">

          {/* Header */}
          <div className="gradient-brand px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base">Asistente {settings.storeName}</h3>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  En línea
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors touch-manipulation"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3 sm:space-y-4 bg-[#050b16]" aria-live="polite">
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.type === 'text' && (
                  <div className={`flex gap-2 sm:gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === 'bot' ? 'bg-violet-500/20' : 'bg-violet-600/30'
                    }`}>
                      {msg.sender === 'bot'
                        ? <Bot className="w-4 h-4 text-violet-400" />
                        : <User className="w-4 h-4 text-violet-300" />
                      }
                    </div>
                    <div className={`max-w-[75%] flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm whitespace-pre-line break-words ${
                        msg.sender === 'bot'
                          ? 'bg-gray-800 text-gray-200 rounded-tl-sm border border-white/5'
                          : 'gradient-brand text-white rounded-tr-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-600 px-1">
                        {msg.timestamp.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}

                {msg.type === 'products' && isProductList(msg.data) && (
                  <div className="space-y-2 ml-10">
                    {msg.data.map(product => (
                      <div key={product.id} className="bg-gray-800 border border-white/8 rounded-xl p-3 flex gap-3">
                        <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-violet-400 font-semibold mb-0.5">{product.category}</p>
                          <h4 className="text-white text-xs font-semibold line-clamp-2 mb-1">{product.name}</h4>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-gray-400">{product.rating}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-white">{formatShort(product.price)}</span>
                            <div className="flex gap-1">
                              <Link to={`/producto/${product.id}`} onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg bg-white/8 hover:bg-white/15 transition-colors" title="Ver detalles">
                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                              </Link>
                              <button onClick={() => handleAddToCart(product)}
                                className="p-1.5 rounded-lg gradient-brand hover:opacity-90 transition-opacity" title="Agregar al carrito">
                                <ShoppingCart className="w-3.5 h-3.5 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link to="/productos" onClick={() => setIsOpen(false)}
                      className="block text-center py-2 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                      Ver todos los productos →
                    </Link>
                  </div>
                )}

                {msg.type === 'card' && isCardData(msg.data) && (
                  <div className="ml-10 bg-gray-800 border border-white/8 rounded-xl p-4 space-y-3">
                    <h4 className="text-white font-bold text-sm">{msg.data.title}</h4>
                    <div className="space-y-2">
                      {msg.data.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-400">{item.label}:</span>
                          <span className="text-gray-200 font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    {msg.data.footer && (
                      <p className="text-xs text-violet-400 pt-2 border-t border-white/10">{msg.data.footer}</p>
                    )}
                  </div>
                )}

                {msg.type === 'buttons' && isButtonsData(msg.data) && (
                  <div className="flex flex-wrap gap-2 pl-10">
                    {msg.data.buttons.map((btn, i) => (
                      <button key={i} onClick={() => handleButtonClick(btn.action)}
                        className="px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 text-xs font-medium transition-colors border border-violet-500/30">
                        {btn.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-violet-400" />
                </div>
                <div className="px-4 py-3 bg-gray-800 border border-white/5 rounded-2xl rounded-tl-sm flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="px-3 sm:px-4 py-2.5 border-t border-white/8 bg-gray-900">
              <p className="text-xs text-gray-500 mb-2">Respuestas rápidas:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickReplies.map((reply, i) => {
                  const Icon = reply.icon;
                  return (
                    <button key={i} onClick={() => handleQuickReply(reply)} disabled={isTyping}
                      className="flex items-center gap-2 min-h-[42px] px-2.5 sm:px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors border border-white/8">
                      <Icon className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                      <span className="truncate">{reply.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={e => { e.preventDefault(); handleSend(); }}
            className="p-3 sm:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-4 border-t border-sky-200/10 bg-[#08111f] shrink-0">
            <div className="flex gap-2">
              <input
                type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                maxLength={500}
                enterKeyHint="send"
                className="flex-1 min-w-0 min-h-[44px] px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border border-white/10 rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
              <button type="submit" disabled={!inputValue.trim()}
                className="w-11 h-11 sm:w-10 sm:h-10 shrink-0 rounded-xl gradient-brand flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
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
