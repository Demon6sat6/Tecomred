import { createContext, useContext, type ReactNode, useEffect, useState, useRef } from 'react';
import type { Product } from '../types';
import { products as initialProducts, categories as initialCategories } from '../data/products';
import { reviews as initialReviews } from '../data/reviews';
import type { Review } from '../data/reviews';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  date: string;
  total: number;
  discount: number;
  couponCode: string;
  status: 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
  items: { productId: number; name: string; qty: number; price: number }[];
  city: string;
  address: string;
  notes: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  orders: number;
  totalSpent: number;
  joined: string;
  status: 'Activo' | 'Inactivo';
}

export interface Coupon {
  id: number;
  code: string;
  type: 'porcentaje' | 'fijo';
  value: number;
  minOrder: number;
  uses: number;
  maxUses: number;
  expiry: string;
  active: boolean;
}

export interface Administrator {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: 'admin' | 'editor';
  isActive: boolean;
  createdAt: string;
}

export interface AboutPerson {
  name: string;
  role: string;
  image: string;
}

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  supportHours: string;
  storeWebsite: string;
  freeShippingMin: string;
  currency: string;
  taxRate: string;
  maintenanceMode: boolean;
  showOutOfStock: boolean;
  allowReviews: boolean;
  apiKey: string;
  gaId: string;
  adminUser: string;
  adminPass: string;
  brands: { name: string; colorClass: string }[];
  categories: string[];
  aboutMission: string;
  aboutVision: string;
  aboutTeam: AboutPerson[];
  // Hero stats
  stat1Value: string;
  stat1Suffix: string;
  stat1Label: string;
  stat2Value: string;
  stat2Suffix: string;
  stat2Label: string;
  stat3Value: string;
  stat3Suffix: string;
  stat3Label: string;
  stat4Value: string;
  stat4Suffix: string;
  stat4Label: string;
}

interface AdminContextType {
  isAuthenticated: boolean;
  isVerifying: boolean;
  apiKey: string;
  login: () => void;
  logout: () => void;
  settings: StoreSettings;
  saveSettings: (s: Partial<StoreSettings>) => Promise<boolean>;
  isSettingsLoading: boolean;
  isSavingSettings: boolean;
  settingsError: string;
  administrators: Administrator[];
  loadAdministrators: () => Promise<void>;
  addAdministrator: (data: { name: string; username: string; email: string; password: string; role: Administrator['role'] }) => Promise<void>;
  updateAdministrator: (id: number, data: { name: string; email: string; password?: string; role: Administrator['role']; isActive: boolean }) => Promise<void>;
  deleteAdministrator: (id: number) => Promise<void>;
  // Products (shared with store)
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  // Categories
  categoryList: string[];
  addCategory: (name: string) => Promise<boolean>;
  deleteCategory: (name: string) => Promise<boolean>;
  // Orders
  orders: Order[];
  addOrder: (o: Omit<Order, 'id'> & { id?: string }) => Promise<string>;
  updateOrder: (o: Order) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  loadOrders: () => Promise<void>;
  // Customers
  customers: Customer[];
  addCustomer: (c: Omit<Customer, 'id'>) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: number) => void;
  // Reviews
  reviews: Review[];
  deleteReview: (id: number) => void;
  approveReview: (id: number) => void;
  // Coupons
  coupons: Coupon[];
  addCoupon: (c: Omit<Coupon, 'id'>) => void;
  updateCoupon: (c: Coupon) => void;
  deleteCoupon: (id: number) => void;
  applyCoupon: (code: string, total: number) => { valid: boolean; discount: number; message: string };
  incrementCouponUse: (code: string) => void;
}

const defaultSettings: StoreSettings = {
  storeName: 'TecomRed',
  storeEmail: 'ventas@tecomred.pe',
  storePhone: '+51 1 234-5678',
  storeAddress: 'Av. Javier Prado Este 4200, San Isidro, Lima',
  supportHours: 'Lun-Vie 9am-7pm',
  storeWebsite: 'https://tecomred.pe',
  freeShippingMin: '300',
  currency: 'PEN',
  taxRate: '18',
  maintenanceMode: false,
  showOutOfStock: true,
  allowReviews: true,
  apiKey: 'change-this-api-key',
  gaId: '',
  adminUser: 'admin',
  adminPass: 'tecomred2026',
  brands: [
    { name: 'Cisco',    colorClass: 'text-blue-400' },
    { name: 'MikroTik', colorClass: 'text-red-400' },
    { name: 'Ubiquiti', colorClass: 'text-sky-400' },
    { name: 'Intel',    colorClass: 'text-blue-300' },
    { name: 'Samsung',  colorClass: 'text-blue-500' },
    { name: 'Kingston', colorClass: 'text-red-500' },
    { name: 'TP-Link',  colorClass: 'text-green-400' },
    { name: 'Seagate',  colorClass: 'text-emerald-400' },
  ],
  categories: initialCategories.filter(c => c !== 'Todos'),
  aboutMission: 'Brindar soluciones tecnológicas de red confiables y accesibles para empresas y hogares del Perú.',
  aboutVision: 'Ser la tienda líder en equipos de redes y tecnología en la región, reconocida por calidad y servicio.',
  aboutTeam: [
    { name: 'Carlos Mendoza', role: 'Gerente General', image: 'https://i.pravatar.cc/150?img=11' },
    { name: 'Lucía Torres', role: 'Jefa de Ventas', image: 'https://i.pravatar.cc/150?img=47' },
    { name: 'Miguel Ríos', role: 'Soporte Técnico', image: 'https://i.pravatar.cc/150?img=15' },
    { name: 'Ana Paredes', role: 'Atención al Cliente', image: 'https://i.pravatar.cc/150?img=45' },
  ],
  stat1Value: '500',  stat1Suffix: '+',     stat1Label: 'Productos en stock',
  stat2Value: '2000', stat2Suffix: '+',     stat2Label: 'Clientes satisfechos',
  stat3Value: '10',   stat3Suffix: ' años', stat3Label: 'De experiencia',
  stat4Value: '24',   stat4Suffix: '/7',    stat4Label: 'Soporte técnico',
};

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)
  ?? (import.meta.env.DEV ? '/api' : 'https://tecomred-production-910c.up.railway.app/api');

function makeApiCall(apiKey: string) {
  return async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('admin_token') ?? apiKey;
    const response = await fetch(`${API_URL}${endpoint}`, {
      cache: 'no-store',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options?.headers || {}),
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}`);
    }
    return response.json();
  };
}

const initialOrders: Order[] = [
  { id: 'TR-001234', customer: 'Carlos Mendoza',   email: 'carlos@email.com',   phone: '+51 987 654 321', date: '18 Abr 2026', total: 2607.50, discount: 0, couponCode: '', status: 'Entregado',  city: 'Lima',          address: 'Av. Javier Prado 1234, San Isidro',    notes: '',                              items: [{ productId: 1, name: 'Switch Cisco Catalyst', qty: 1, price: 1820 }, { productId: 3, name: 'Cable UTP Cat6', qty: 1, price: 787.50 }] },
  { id: 'TR-001235', customer: 'María González',   email: 'maria@email.com',    phone: '+51 956 789 012', date: '17 Abr 2026', total: 1927.50, discount: 0, couponCode: '', status: 'Enviado',    city: 'Arequipa',      address: 'Calle Mercaderes 234, Cercado',         notes: 'Entregar en recepción',         items: [{ productId: 4, name: 'Procesador Intel i7', qty: 1, price: 1458.75 }, { productId: 5, name: 'RAM Kingston 32GB', qty: 1, price: 468.75 }] },
  { id: 'TR-001236', customer: 'Roberto Silva',    email: 'roberto@email.com',  phone: '+51 945 123 456', date: '17 Abr 2026', total: 787.50,  discount: 0, couponCode: '', status: 'Procesando', city: 'Trujillo',      address: 'Jr. Pizarro 456, Centro',              notes: '',                              items: [{ productId: 2, name: 'Router MikroTik', qty: 1, price: 787.50 }] },
  { id: 'TR-001237', customer: 'Ana Rodríguez',    email: 'ana@email.com',      phone: '+51 934 567 890', date: '16 Abr 2026', total: 1458.75, discount: 0, couponCode: '', status: 'Pendiente',  city: 'Cusco',         address: 'Av. El Sol 789, Wanchaq',              notes: 'Llamar antes de entregar',      items: [{ productId: 4, name: 'Procesador Intel i7', qty: 1, price: 1458.75 }] },
  { id: 'TR-001238', customer: 'Luis Pérez',       email: 'luis@email.com',     phone: '+51 923 456 789', date: '16 Abr 2026', total: 555.00,  discount: 0, couponCode: '', status: 'Entregado',  city: 'Piura',         address: 'Av. Grau 321, Piura',                  notes: '',                              items: [{ productId: 3, name: 'Cable UTP Cat6', qty: 1, price: 243.75 }, { productId: 10, name: 'Kit Herramientas', qty: 1, price: 168.75 }, { productId: 9, name: 'Switch TP-Link', qty: 1, price: 142.50 }] },
  { id: 'TR-001239', customer: 'Sofia Torres',     email: 'sofia@email.com',    phone: '+51 912 345 678', date: '15 Abr 2026', total: 367.50,  discount: 0, couponCode: '', status: 'Cancelado',  city: 'Chiclayo',      address: 'Av. Balta 654, Chiclayo',              notes: 'Cliente canceló',               items: [{ productId: 6, name: 'SSD Samsung 970', qty: 1, price: 367.50 }] },
  { id: 'TR-001240', customer: 'Diego Fernández',  email: 'diego@email.com',    phone: '+51 901 234 567', date: '15 Abr 2026', total: 2158.75, discount: 0, couponCode: '', status: 'Enviado',    city: 'Lima',          address: 'Av. La Marina 1500, San Miguel',        notes: '',                              items: [{ productId: 1, name: 'Switch Cisco', qty: 1, price: 1820 }, { productId: 10, name: 'Kit Herramientas', qty: 1, price: 168.75 }, { productId: 3, name: 'Cable UTP', qty: 1, price: 170 }] },
];

const initialCustomers: Customer[] = [
  { id: 1, name: 'Carlos Mendoza',   email: 'carlos@email.com',   phone: '+51 987 654 321', city: 'Lima',      orders: 5,  totalSpent: 8775.00,  joined: 'Ene 2025', status: 'Activo' },
  { id: 2, name: 'María González',   email: 'maria@email.com',    phone: '+51 956 789 012', city: 'Arequipa',  orders: 3,  totalSpent: 4687.50,  joined: 'Feb 2025', status: 'Activo' },
  { id: 3, name: 'Roberto Silva',    email: 'roberto@email.com',  phone: '+51 945 123 456', city: 'Trujillo',  orders: 8,  totalSpent: 14587.50, joined: 'Mar 2024', status: 'Activo' },
  { id: 4, name: 'Ana Rodríguez',    email: 'ana@email.com',      phone: '+51 934 567 890', city: 'Cusco',     orders: 1,  totalSpent: 1458.75,  joined: 'Abr 2026', status: 'Activo' },
  { id: 5, name: 'Luis Pérez',       email: 'luis@email.com',     phone: '+51 923 456 789', city: 'Piura',     orders: 4,  totalSpent: 2925.00,  joined: 'Jun 2025', status: 'Activo' },
  { id: 6, name: 'Sofia Torres',     email: 'sofia@email.com',    phone: '+51 912 345 678', city: 'Chiclayo',  orders: 2,  totalSpent: 787.50,   joined: 'Ago 2025', status: 'Inactivo' },
  { id: 7, name: 'Diego Fernández',  email: 'diego@email.com',    phone: '+51 901 234 567', city: 'Lima',      orders: 12, totalSpent: 21262.50, joined: 'Dic 2023', status: 'Activo' },
];

const initialCoupons: Coupon[] = [
  { id: 1, code: 'BIENVENIDO10', type: 'porcentaje', value: 10, minOrder: 200,  uses: 45, maxUses: 100, expiry: '2026-12-31', active: true },
  { id: 2, code: 'REDES25',      type: 'porcentaje', value: 25, minOrder: 750,  uses: 12, maxUses: 50,  expiry: '2026-06-30', active: true },
  { id: 3, code: 'DESCUENTO75',  type: 'fijo',       value: 75, minOrder: 375,  uses: 89, maxUses: 200, expiry: '2026-05-31', active: false },
  { id: 4, code: 'TECH200',      type: 'fijo',       value: 200, minOrder: 1125, uses: 3, maxUses: 20,  expiry: '2026-08-15', active: true },
];

// Add approved field to reviews
const initialReviewsWithApproval = initialReviews.map(r => ({ ...r, approved: true }));

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('admin_auth', false);
  const [settings, setSettings]               = useLocalStorage<StoreSettings>('admin_settings', defaultSettings);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const settingsRevision = useRef(0);
  const settingsSaving = useRef(false);
  const [productList, setProductList]         = useLocalStorage<Product[]>('admin_products', initialProducts);
  const categoryList = settings.categories;
  const [orders, setOrders]                   = useLocalStorage<Order[]>('admin_orders', []);
  const [customers, setCustomers]             = useLocalStorage<Customer[]>('admin_customers', initialCustomers);
  const [reviewList, setReviewList]           = useLocalStorage<Review[]>('admin_reviews', initialReviewsWithApproval);
  const [coupons, setCoupons]                 = useLocalStorage<Coupon[]>('admin_coupons', initialCoupons);
  const [administrators, setAdministrators]   = useState<Administrator[]>([]);
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(() => isAuthenticated as boolean);
  const apiCall = makeApiCall(settings.apiKey);

  // Al montar: verifica la sesión guardada y la disponibilidad del backend
  useEffect(() => {
    if (isAuthenticated) {
      verifySession().then(() => checkBackend());
    } else {
      checkBackend();
    }
  }, []);

  // Actualiza también una tienda que ya estaba abierta en otro dispositivo.
  useEffect(() => {
    let disposed = false;
    const refresh = async () => {
      if (settingsSaving.current) return;
      const revision = settingsRevision.current;
      try {
        const response = await fetch(`${API_URL}/settings`, { cache: 'no-store' });
        if (!response.ok) throw new Error('No se pudo cargar la configuración del servidor.');
        const result = await response.json() as { data: Partial<StoreSettings> };
        if (!disposed && revision === settingsRevision.current) {
          if (result.data && Object.keys(result.data).length > 0) {
            setSettings(prev => ({ ...prev, ...result.data }));
          }
          setSettingsError('');
        }
      } catch (error) {
        if (!disposed) setSettingsError(error instanceof Error ? error.message : 'Error de conexión');
      } finally {
        if (!disposed) setIsSettingsLoading(false);
      }
    };
    const onFocus = () => { void refresh(); void fetchProducts(); };
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') onFocus();
    }, 60000);
    window.addEventListener('focus', onFocus);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  async function verifySession() {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setIsAuthenticated(false);
      setIsVerifying(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setIsAuthenticated(false);
        localStorage.removeItem('admin_token');
      }
    } catch {
      // Backend no disponible — mantiene la sesión local
    } finally {
      setIsVerifying(false);
    }
  }

  async function checkBackend() {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        setIsBackendAvailable(true);
        await Promise.all([fetchOrders(), fetchProducts()]);
      } else {
        setIsBackendAvailable(false);
        setOrders(initialOrders);
      }
    } catch {
      setIsBackendAvailable(false);
      setOrders(initialOrders);
    }
  }

  async function fetchOrders() {
    try {
      const data = await apiCall<{ data: Order[] }>('/orders');
      setOrders(data.data);
    } catch {
      setOrders(initialOrders);
    }
  }

  async function fetchProducts() {
    try {
      const data = await apiCall<{ data: Product[] }>('/products');
      setProductList(data.data);
    } catch {
      // Mantiene los productos de localStorage como fallback
    }
  }

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_token');
  };
  const saveSettings = async (s: Partial<StoreSettings>): Promise<boolean> => {
    if (settingsSaving.current) return false;
    settingsSaving.current = true;
    settingsRevision.current += 1;
    setIsSavingSettings(true);
    setSettingsError('');
    try {
      if (s.adminPass !== undefined && s.adminPass !== settings.adminPass) {
        throw new Error('Cambia la contraseña desde Administradores; no se guarda en los ajustes públicos.');
      }
      // Actualiza inmediatamente el estado y localStorage
      const updated: StoreSettings = { ...settings, ...s };
      setSettings(updated);

      const patch = Object.fromEntries(Object.entries(s).filter(([key]) =>
        !['apiKey', 'adminUser', 'adminPass'].includes(key)));

      try {
        const result = await apiCall<{ data: Partial<StoreSettings> }>('/settings', {
          method: 'PATCH', body: JSON.stringify(patch),
        });
        if (result.data && Object.keys(result.data).length > 0) {
          setSettings(prev => ({ ...prev, ...result.data }));
        }
      } catch (apiErr) {
        console.warn('Ajustes guardados localmente (sin conexión con el backend):', apiErr);
      }
      return true;
    } catch (error) {
      setSettingsError(`No se guardaron los cambios: ${error instanceof Error ? error.message : 'sin conexión con el servidor'}`);
      return false;
    } finally {
      settingsRevision.current += 1;
      settingsSaving.current = false;
      setIsSavingSettings(false);
    }
  };

  const loadAdministrators = async () => {
    const data = await apiCall<{ data: Administrator[] }>('/administrators');
    setAdministrators(data.data);
  };

  const addAdministrator = async (data: { name: string; username: string; email: string; password: string; role: Administrator['role'] }) => {
    await apiCall('/administrators', { method: 'POST', body: JSON.stringify(data) });
    await loadAdministrators();
  };

  const updateAdministrator = async (id: number, data: { name: string; email: string; password?: string; role: Administrator['role']; isActive: boolean }) => {
    await apiCall(`/administrators/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    await loadAdministrators();
  };

  const deleteAdministrator = async (id: number) => {
    await apiCall(`/administrators/${id}`, { method: 'DELETE' });
    await loadAdministrators();
  };

  // No confirmar cambios locales cuando el servidor rechaza el guardado.
  const addProduct = async (p: Omit<Product, 'id'>): Promise<void> => {
    const result = await apiCall<{ data: Product }>('/products', {
      method: 'POST', body: JSON.stringify({ ...p, isActive: true }),
    });
    setProductList(prev => [...prev, result.data]);
  };

  const updateProduct = async (p: Product): Promise<void> => {
    const result = await apiCall<{ data: Product }>(`/products/${p.id}`, {
      method: 'PUT', body: JSON.stringify({ ...p, isActive: true }),
    });
    setProductList(prev => prev.map(x => x.id === p.id ? result.data : x));
  };

  const deleteProduct = async (id: number): Promise<void> => {
    await apiCall(`/products/${id}`, { method: 'DELETE' });
    setProductList(prev => prev.filter(x => x.id !== id));
  };

  // Categories — compartidas por el panel y todos los visitantes.
  const addCategory = (name: string) => saveSettings({ categories: [...categoryList, name] });
  const deleteCategory = (name: string) => saveSettings({ categories: categoryList.filter(c => c !== name) });

  // Orders — CRUD contra MySQL cuando el backend está disponible
  const addOrder = async (o: Omit<Order, 'id'> & { id?: string }): Promise<string> => {
    const id = o.id ?? `TR-${Date.now().toString().slice(-6)}`;
    const order: Order = { ...o, id };

    if (isBackendAvailable) {
      try {
        await apiCall('/orders', {
          method: 'POST',
          body: JSON.stringify(order),
        });
        await fetchOrders();
        return id;
      } catch {
        // Fallback local en caso de error
        setOrders(prev => [order, ...prev]);
        return id;
      }
    } else {
      setOrders(prev => [order, ...prev]);
      return id;
    }
  };

  const updateOrder = async (o: Order): Promise<void> => {
    if (isBackendAvailable) {
      try {
        await apiCall(`/orders/${o.id}`, {
          method: 'PUT',
          body: JSON.stringify(o),
        });
        await fetchOrders();
      } catch {
        setOrders(prev => prev.map(x => x.id === o.id ? o : x));
      }
    } else {
      setOrders(prev => prev.map(x => x.id === o.id ? o : x));
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']): Promise<void> => {
    if (isBackendAvailable) {
      try {
        await apiCall(`/orders/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        });
        await fetchOrders();
      } catch {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      }
    } else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  const deleteOrder = async (id: string): Promise<void> => {
    if (isBackendAvailable) {
      try {
        await apiCall(`/orders/${id}`, { method: 'DELETE' });
        await fetchOrders();
      } catch {
        setOrders(prev => prev.filter(o => o.id !== id));
      }
    } else {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const loadOrders = async (): Promise<void> => {
    if (isBackendAvailable) {
      await fetchOrders();
    }
  };

  // Customers
  const addCustomer    = (c: Omit<Customer, 'id'>) => setCustomers(prev => [...prev, { ...c, id: Date.now() }]);
  const updateCustomer = (c: Customer)              => setCustomers(prev => prev.map(x => x.id === c.id ? c : x));
  const deleteCustomer = (id: number)               => setCustomers(prev => prev.filter(x => x.id !== id));

  // Reviews
  const deleteReview  = (id: number) => setReviewList(prev => prev.filter(r => r.id !== id));
  const approveReview = (id: number) => setReviewList(prev => prev.map(r => r.id === id ? { ...r, approved: !((r as any).approved ?? true) } : r));

  // Coupons
  const addCoupon    = (c: Omit<Coupon, 'id'>) => setCoupons(prev => [...prev, { ...c, id: Date.now() }]);
  const updateCoupon = (c: Coupon)              => setCoupons(prev => prev.map(x => x.id === c.id ? c : x));
  const deleteCoupon = (id: number)             => setCoupons(prev => prev.filter(x => x.id !== id));

  const applyCoupon = (code: string, total: number): { valid: boolean; discount: number; message: string } => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon)          return { valid: false, discount: 0, message: 'Cupón no encontrado' };
    if (!coupon.active)   return { valid: false, discount: 0, message: 'Este cupón no está activo' };
    if (coupon.uses >= coupon.maxUses) return { valid: false, discount: 0, message: 'Cupón agotado' };
    if (coupon.expiry && new Date(coupon.expiry) < new Date())
      return { valid: false, discount: 0, message: 'Cupón expirado' };
    if (total < coupon.minOrder)
      return { valid: false, discount: 0, message: `Mínimo de compra: $${coupon.minOrder}` };
    const discount = coupon.type === 'porcentaje'
      ? Math.round((total * coupon.value / 100) * 100) / 100
      : Math.min(coupon.value, total);
    return { valid: true, discount, message: `¡Cupón aplicado! -$${discount.toFixed(2)}` };
  };

  const incrementCouponUse = (code: string) =>
    setCoupons(prev => prev.map(c => c.code.toUpperCase() === code.toUpperCase() ? { ...c, uses: c.uses + 1 } : c));

  return (
    <AdminContext.Provider value={{
      isAuthenticated, isVerifying, apiKey: settings.apiKey, login, logout, settings, saveSettings,
      isSettingsLoading, isSavingSettings, settingsError,
      administrators, loadAdministrators, addAdministrator, updateAdministrator, deleteAdministrator,
      products: productList, addProduct, updateProduct, deleteProduct,
      categoryList, addCategory, deleteCategory,
      orders, addOrder, updateOrder, updateOrderStatus, deleteOrder, loadOrders,
      customers, addCustomer, updateCustomer, deleteCustomer,
      reviews: reviewList, deleteReview, approveReview,
      coupons, addCoupon, updateCoupon, deleteCoupon, applyCoupon, incrementCouponUse,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}