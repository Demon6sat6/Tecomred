import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Package, Truck, CreditCard, Headphones, ExternalLink, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../hooks/useCurrency';
import { useToast } from '../context/ToastContext';

interface Message {
  id: number;
  text?: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'products' | 'card' | 'buttons';
  data?: any;
}

const quickReplies = [
  { 
    icon: Package, 
    text: '¿Tienen stock?', 
    action: 'stock'
  },
  { 
    icon: Truck, 
    text: 'Tiempos de envío', 
    action: 'envio'
  },
  { 
    icon: CreditCard, 
    text: 'Métodos de pago', 
    action: 'pago'
  },
  { 
    icon: Headphones, 
    text: 'Soporte técnico', 
    action: 'soporte'
  },
];

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
  const { formatShort } = useCurrency();
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addBotMessage = (message: Partial<Message>) => {
    const botMessage: Message = {
      id: Date.now(),
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      ...message,
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const handleQuickReply = (reply: typeof quickReplies[0]) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: reply.text,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, userMessage]);

    // Show typing
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      switch (reply.action) {
        case 'stock':
          addBotMessage({
            text: 'Todos nuestros productos tienen stock disponible. Te muestro algunos de nuestros productos más populares:',
          });
          setTimeout(() => {
            const popularProducts = products.filter(p => p.badge === 'Popular' || p.badge === 'Oferta').slice(0, 3);
            addBotMessage({
              type: 'products',
              data: popularProducts,
            });
          }, 500);
          break;

        case 'envio':
          addBotMessage({
            type: 'card',
            data: {
              title: '🚚 Información de Envío',
              items: [
                { label: 'Envío estándar', value: '24-48 horas' },
                { label: 'Envío express', value: '12-24 horas' },
                { label: 'Envío gratis', value: 'Compras +S/ 300' },
                { label: 'Cobertura', value: 'Todo el país' },
              ],
              footer: 'Rastreo en tiempo real incluido',
            },
          });
          break;

        case 'pago':
          addBotMessage({
            type: 'card',
            data: {
              title: 'Metodos de pago',
              items: [
                { label: 'Tarjetas', value: 'Visa, Mastercard, Amex' },
                { label: 'Transferencia', value: 'Bancaria directa' },
                { label: 'PayPal', value: 'Pago seguro' },
                { label: 'Contra entrega', value: 'Zonas seleccionadas' },
              ],
              footer: 'Todos los pagos son 100% seguros',
            },
          });
          break;

        case 'soporte':
          addBotMessage({
            type: 'card',
            data: {
              title: 'Soporte tecnico',
              items: [
                { label: 'Teléfono', value: '+51 1 234-5678' },
                { label: 'Email', value: 'soporte@tecomred.pe' },
                { label: 'Horario', value: 'Lun-Vie 8am-6pm' },
                { label: 'Emergencias', value: '24/7 disponible' },
              ],
              footer: 'Asesoría técnica especializada incluida',
            },
          });
          break;
      }
    }, 800);
  };

  const handleSend = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Show typing
    setIsTyping(true);

    // Process message
    setTimeout(() => {
      setIsTyping(false);
      const lowerMessage = messageText.toLowerCase();

      // Búsqueda de productos
      if (lowerMessage.includes('switch') || lowerMessage.includes('switches')) {
        addBotMessage({
          text: 'Encontré estos switches para ti:',
        });
        setTimeout(() => {
          const switchProducts = products.filter(p => p.category === 'Switches');
          addBotMessage({
            type: 'products',
            data: switchProducts.slice(0, 3),
          });
        }, 500);
      } else if (lowerMessage.includes('router') || lowerMessage.includes('routers')) {
        addBotMessage({
          text: 'Estos son nuestros routers disponibles:',
        });
        setTimeout(() => {
          const routerProducts = products.filter(p => p.category === 'Routers');
          addBotMessage({
            type: 'products',
            data: routerProducts.slice(0, 3),
          });
        }, 500);
      } else if (lowerMessage.includes('procesador') || lowerMessage.includes('cpu')) {
        addBotMessage({
          text: 'Tenemos estos procesadores en stock:',
        });
        setTimeout(() => {
          const cpuProducts = products.filter(p => p.category === 'Procesadores');
          addBotMessage({
            type: 'products',
            data: cpuProducts.slice(0, 3),
          });
        }, 500);
      } else if (lowerMessage.includes('memoria') || lowerMessage.includes('ram')) {
        addBotMessage({
          text: 'Estas son nuestras memorias RAM disponibles:',
        });
        setTimeout(() => {
          const ramProducts = products.filter(p => p.category === 'Memorias RAM');
          addBotMessage({
            type: 'products',
            data: ramProducts.slice(0, 3),
          });
        }, 500);
      } else if (lowerMessage.includes('almacenamiento') || lowerMessage.includes('ssd') || lowerMessage.includes('disco')) {
        addBotMessage({
          text: 'Mira nuestras opciones de almacenamiento:',
        });
        setTimeout(() => {
          const storageProducts = products.filter(p => p.category === 'Almacenamiento');
          addBotMessage({
            type: 'products',
            data: storageProducts.slice(0, 3),
          });
        }, 500);
      } else if (lowerMessage.includes('producto') || lowerMessage.includes('catalogo') || lowerMessage.includes('ver')) {
        addBotMessage({
          text: 'Te muestro algunos de nuestros productos más populares:',
        });
        setTimeout(() => {
          const popularProducts = products.filter(p => p.badge === 'Popular').slice(0, 3);
          addBotMessage({
            type: 'products',
            data: popularProducts,
          });
        }, 500);
      } else if (lowerMessage.includes('oferta') || lowerMessage.includes('descuento') || lowerMessage.includes('promocion')) {
        addBotMessage({
          text: '🔥 ¡Tenemos estas ofertas especiales para ti!',
        });
        setTimeout(() => {
          const offerProducts = products.filter(p => p.badge === 'Oferta');
          addBotMessage({
            type: 'products',
            data: offerProducts.slice(0, 3),
          });
        }, 500);
      } else if (lowerMessage.includes('nuevo') || lowerMessage.includes('novedad')) {
        addBotMessage({
          text: '✨ Estos son nuestros productos más recientes:',
        });
        setTimeout(() => {
          const newProducts = products.filter(p => p.badge === 'Nuevo');
          addBotMessage({
            type: 'products',
            data: newProducts,
          });
        }, 500);
      } else if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
        addBotMessage({
          text: '¡Hola! ¿En que puedo ayudarte? Puedo mostrarte productos, informacion de envio, metodos de pago o soporte tecnico.',
        });
      } else if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuanto')) {
        addBotMessage({
          text: 'Nuestros precios son muy competitivos. ¿Qué producto te interesa? Puedo mostrarte opciones por categoría.',
          type: 'buttons',
          data: {
            buttons: [
              { text: 'Ver Switches', action: 'switches' },
              { text: 'Ver Routers', action: 'routers' },
              { text: 'Ver todo', action: 'catalogo' },
            ],
          },
        });
      } else if (lowerMessage.includes('gracias')) {
        addBotMessage({
          text: '¡De nada! Estoy aqui para ayudarte. ¿Necesitas algo mas?',
        });
      } else {
        addBotMessage({
          text: 'Puedo ayudarte con:\n\n- Ver productos por categoria\n- Informacion de stock\n- Tiempos de envio\n- Metodos de pago\n- Soporte tecnico\n\n¿Que te gustaria saber?',
        });
      }
    }, 800 + Math.random() * 400);
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    showToast(product.name, product.image);
    
    setTimeout(() => {
      addBotMessage({
        text: `✅ ${product.name} agregado al carrito. ¿Quieres ver más productos similares?`,
      });
    }, 300);
  };

  const handleButtonClick = (action: string) => {
    if (action === 'switches') {
      handleSend('switches');
    } else if (action === 'routers') {
      handleSend('routers');
    } else if (action === 'catalogo') {
      handleSend('productos');
    }
  };

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[90] w-14 h-14 sm:w-16 sm:h-16 rounded-full gradient-brand shadow-2xl shadow-sky-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-950 animate-pulse" />
          
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            ¿Necesitas ayuda?
          </div>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[90] w-[calc(100vw-3rem)] sm:w-[420px] h-[85vh] sm:h-[600px] glass-strong rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden animate-slide-up border border-white/10">
          {/* Header */}
          <div className="gradient-brand px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base">Asistente TecomRed</h3>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  En línea
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-950/50">
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.type === 'text' && (
                  <div className={`flex gap-2 sm:gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === 'bot' ? 'bg-sky-500/20' : 'bg-indigo-500/20'
                    }`}>
                      {msg.sender === 'bot' ? (
                        <Bot className="w-4 h-4 text-sky-400" />
                      ) : (
                        <User className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>

                    <div className={`max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm whitespace-pre-line ${
                        msg.sender === 'bot'
                          ? 'bg-white/5 text-gray-200 rounded-tl-sm'
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

                {msg.type === 'products' && msg.data && (
                  <div className="space-y-2">
                    {msg.data.map((product: any) => (
                      <div key={product.id} className="glass rounded-xl p-3 flex gap-3 card-hover">
                        <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-sky-400 font-semibold mb-0.5">{product.category}</p>
                          <h4 className="text-white text-xs font-semibold line-clamp-2 mb-1">{product.name}</h4>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-gray-400">{product.rating}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-white">{formatShort(product.price)}</span>
                            <div className="flex gap-1">
                              <Link
                                to={`/producto/${product.id}`}
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                title="Ver detalles"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                              </Link>
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="p-1.5 rounded-lg gradient-brand hover:opacity-90 transition-opacity"
                                title="Agregar al carrito"
                              >
                                <ShoppingCart className="w-3.5 h-3.5 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link
                      to="/productos"
                      onClick={() => setIsOpen(false)}
                      className="block text-center py-2 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      Ver todos los productos
                    </Link>
                  </div>
                )}

                {msg.type === 'card' && msg.data && (
                  <div className="glass rounded-xl p-4 space-y-3">
                    <h4 className="text-white font-bold text-sm">{msg.data.title}</h4>
                    <div className="space-y-2">
                      {msg.data.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-400">{item.label}:</span>
                          <span className="text-gray-200 font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    {msg.data.footer && (
                      <p className="text-xs text-sky-400 pt-2 border-t border-white/10">{msg.data.footer}</p>
                    )}
                  </div>
                )}

                {msg.type === 'buttons' && msg.data && (
                  <div className="flex flex-wrap gap-2 pl-11">
                    {msg.data.buttons.map((btn: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleButtonClick(btn.action)}
                        className="px-4 py-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-xs font-medium transition-colors border border-sky-500/30"
                      >
                        {btn.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-sky-400" />
                </div>
                <div className="px-4 py-3 bg-white/5 rounded-2xl rounded-tl-sm flex gap-1.5">
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
            <div className="px-3 sm:px-4 py-2 border-t border-white/10 bg-gray-950/30">
              <p className="text-xs text-gray-500 mb-2">Respuestas rápidas:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickReplies.map((reply, i) => {
                  const Icon = reply.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(reply)}
                      className="flex items-center gap-2 px-2.5 sm:px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-300 hover:text-white transition-colors border border-white/10"
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{reply.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={e => { e.preventDefault(); handleSend(); }}
            className="p-3 sm:p-4 border-t border-white/10 bg-gray-950/50 shrink-0"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500/50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-brand flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                aria-label="Enviar mensaje"
              >
                <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}


