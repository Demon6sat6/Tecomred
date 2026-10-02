import { createContext, useContext, type ReactNode, useEffect, useState, useRef } from 'react';
import type { Product } from '../types';
import { categories as initialCategories } from '../data/products';
import type { Review } from '../data/reviews';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLocation } from 'react-router-dom';

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
  showAnnouncementBar?: boolean;
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
  productsError: string;
  ordersError: string;
  adminRecordsError: string;
  /** Momento de la última sincronización correcta con el servidor. */
  lastSync: Date | null;
  syncOnline: boolean;
  isDataLoading: boolean;
  refreshAll: () => Promise<void>;
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
  addCustomer: (c: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (c: Customer) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  // Reviews
  reviews: Review[];
  deleteReview: (id: number) => Promise<void>;
  approveReview: (id: number) => Promise<void>;
  // Coupons
  coupons: Coupon[];
  addCoupon: (c: Omit<Coupon, 'id'>) => Promise<void>;
  updateCoupon: (c: Coupon) => Promise<void>;
  deleteCoupon: (id: number) => Promise<void>;
  applyCoupon: (code: string, total: number) => Promise<{ valid: boolean; discount: number; message: string }>;
}

const defaultSettings: StoreSettings = {
  storeName: 'SiscomRed',
  storeEmail: 'siscomred2017@gmail.com',
  storePhone: '+51 997 176 721',
  storeAddress: 'Av. Javier Prado Este 4200, San Isidro, Lima',
  supportHours: 'Lun-Vie 9am-7pm',
  storeWebsite: 'https://siscomred.pe',
  freeShippingMin: '300',
  currency: 'PEN',
  taxRate: '18',
  maintenanceMode: false,
  showOutOfStock: true,
  allowReviews: true,
  showAnnouncementBar: false,
  apiKey: '',
  gaId: '',
  adminUser: 'admin',
  adminPass: '',
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

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

function makeApiCall() {
  return async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      cache: 'no-store',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: string; details?: { fieldErrors?: Record<string, string[]> } };
      const fieldErrors = Object.entries(errorData.details?.fieldErrors ?? {}).map(([field, messages]) => `${field}: ${messages[0]}`);
      if (response.status === 401) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
      throw new Error([errorData.error || `Error ${response.status}`, ...fieldErrors].join(' · '));
    }
    return response.status === 204 ? undefined as T : response.json();
  };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('admin_auth', false);
  const [settings, setSettings]               = useLocalStorage<StoreSettings>('admin_settings', defaultSettings);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const settingsRevision = useRef(0);
  const settingsSaving = useRef(false);
  const [productList, setProductList]         = useState<Product[]>([]);
  const [productsError, setProductsError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [adminRecordsError, setAdminRecordsError] = useState('');
  const categoryList = settings.categories;
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [isVerifying, setIsVerifying] = useState(() => isAuthenticated as boolean);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncOnline, setSyncOnline] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const apiCall = makeApiCall();
  const ordersChannel = useRef<BroadcastChannel | null>(null);

  // Sincronización en tiempo real multi-pestaña para pedidos
  useEffect(() => {
    try {
      ordersChannel.current = new BroadcastChannel('tr_orders');
      ordersChannel.current.onmessage = (event) => {
        const msg = event.data;
        if (!msg) return;
        if (msg.type === 'NEW_ORDER' && msg.order) {
          setOrders(prev => [msg.order, ...prev.filter(o => o.id !== msg.order.id)]);
        } else if (msg.type === 'ORDER_DELETED' && msg.id) {
          setOrders(prev => prev.filter(o => o.id !== msg.id));
        } else if (msg.type === 'ORDER_STATUS' && msg.id) {
          setOrders(prev => prev.map(o => o.id === msg.id ? { ...o, status: msg.status } : o));
        } else if (msg.type === 'ORDER_UPDATED' && msg.order) {
          setOrders(prev => prev.map(o => o.id === msg.order.id ? msg.order : o));
        }
      };
    } catch {
      // BroadcastChannel is optional; server polling remains available.
    }
    return () => {
      ordersChannel.current?.close();
    };
  }, []);

  // Polling automático en tiempo real de pedidos en el panel admin
  useEffect(() => {
    if (!isAuthenticated || !pathname.startsWith('/admin')) return;

    void Promise.all([fetchOrders(), loadAdminRecords()]).finally(() => setIsDataLoading(false));
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void fetchOrders();
        void loadAdminRecords();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, pathname]);

  // Al montar: verifica la sesión guardada y carga los datos del servidor.
  useEffect(() => {
    if (isAuthenticated) {
      void verifySession().then(async () => {
        await fetchProducts();
        if (localStorage.getItem('admin_token')) {
          await Promise.all([fetchOrders(), loadAdminRecords()]);
        }
      });
    } else {
      void fetchProducts();
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
        if (response.ok) {
          const result = await response.json() as { data: Partial<StoreSettings> };
          if (!disposed && revision === settingsRevision.current) {
            if (result.data && Object.keys(result.data).length > 0) {
              setSettings(prev => ({ ...prev, ...result.data }));
            }
            setSettingsError('');
          }
        }
      } catch {
        // Fallback local silencioso si el backend no está disponible
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
      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        localStorage.removeItem('admin_token');
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsVerifying(false);
    }
  }

  async function fetchOrders() {
    try {
      const data = await apiCall<{ data: Order[] }>('/orders');
      if (!Array.isArray(data?.data)) throw new Error('Respuesta de pedidos inválida');
      setOrders(data.data);
      setOrdersError('');
      setLastSync(new Date());
      setSyncOnline(true);
    } catch (error) {
      setSyncOnline(false);
      setOrdersError(error instanceof Error ? error.message : 'No se pudieron cargar los pedidos');
    }
  }

  async function fetchProducts() {
    try {
      const data = await apiCall<{ data: Product[] }>('/products');
      if (!Array.isArray(data.data)) throw new Error('Respuesta de catálogo inválida');
      setProductList(data.data);
      setProductsError('');
    } catch (error) {
      setProductsError(error instanceof Error ? error.message : 'No se pudo cargar el catálogo');
    }
  }

  async function loadAdminRecords() {
    try {
      const [customerResult, couponResult, reviewResult] = await Promise.all([
        apiCall<{ data: Customer[] }>('/admin-records/customer'),
        apiCall<{ data: Coupon[] }>('/admin-records/coupon'),
        apiCall<{ data: Review[] }>('/admin-records/review'),
      ]);
      setCustomers(customerResult.data);
      setCoupons(couponResult.data);
      setReviewList(reviewResult.data);
      setAdminRecordsError('');
      setLastSync(new Date());
      setSyncOnline(true);
    } catch (error) {
      setSyncOnline(false);
      setAdminRecordsError(error instanceof Error ? error.message : 'No se pudieron cargar los datos del panel');
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void fetchProducts();
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    void Promise.all([fetchOrders(), loadAdminRecords()]);
  };
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
        throw new Error('La contraseña se gestiona desde Administradores.');
      }
      const patch = Object.fromEntries(Object.entries(s).filter(([key]) =>
        !['apiKey', 'adminUser', 'adminPass'].includes(key)));
      const result = await apiCall<{ data: Partial<StoreSettings> }>('/settings', {
        method: 'PATCH', body: JSON.stringify(patch),
      });
      if (!result.data) throw new Error('Respuesta de configuración inválida');
      setSettings(prev => ({ ...prev, ...result.data }));
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
    try {
      const data = await apiCall<{ data: Administrator[] }>('/administrators');
      if (data?.data && Array.isArray(data.data)) {
        setAdministrators(data.data);
      }
    } catch (error) {
      setAdministrators([]);
      throw error;
    }
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

  const addProduct = async (p: Omit<Product, 'id'>): Promise<void> => {
    const result = await apiCall<{ data: Product }>('/products', {
      method: 'POST', body: JSON.stringify(p),
    });
    setProductList(prev => [result.data, ...prev]);
  };

  const updateProduct = async (p: Product): Promise<void> => {
    const result = await apiCall<{ data: Product }>(`/products/${p.id}`, {
      method: 'PUT', body: JSON.stringify(p),
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

  // Orders — server is the source of truth for every mutation.
  const addOrder = async (o: Omit<Order, 'id'> & { id?: string }): Promise<string> => {
    const id = o.id ?? `TR-${Date.now().toString().slice(-6)}`;
    const order: Order = { ...o, id };
    const result = await apiCall<{ data: Order }>('/orders', { method: 'POST', body: JSON.stringify(order) });
    setOrders(prev => [result.data, ...prev.filter(x => x.id !== id)]);
    ordersChannel.current?.postMessage({ type: 'NEW_ORDER', order: result.data });
    return id;
  };

  const updateOrder = async (o: Order): Promise<void> => {
    const result = await apiCall<{ data: Order }>(`/orders/${o.id}`, { method: 'PUT', body: JSON.stringify(o) });
    setOrders(prev => prev.map(x => x.id === o.id ? result.data : x));
    ordersChannel.current?.postMessage({ type: 'ORDER_UPDATED', order: result.data });
  };

  const updateOrderStatus = async (id: string, status: Order['status']): Promise<void> => {
    await apiCall(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    ordersChannel.current?.postMessage({ type: 'ORDER_STATUS', id, status });
  };

  const deleteOrder = async (id: string): Promise<void> => {
    await apiCall(`/orders/${id}`, { method: 'DELETE' });
    setOrders(prev => prev.filter(o => o.id !== id));
    ordersChannel.current?.postMessage({ type: 'ORDER_DELETED', id });
  };

  const loadOrders = async (): Promise<void> => {
    await fetchOrders();
  };

  const refreshAll = async (): Promise<void> => {
    await Promise.all([fetchOrders(), loadAdminRecords(), fetchProducts()]);
  };

  // Customers, coupons and reviews are persisted in MySQL.
  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    const result = await apiCall<{ data: Customer }>('/admin-records/customer', { method: 'POST', body: JSON.stringify(customer) });
    setCustomers(prev => [result.data, ...prev]);
  };
  const updateCustomer = async (customer: Customer) => {
    const result = await apiCall<{ data: Customer }>(`/admin-records/customer/${customer.id}`, { method: 'PUT', body: JSON.stringify(customer) });
    setCustomers(prev => prev.map(item => item.id === customer.id ? result.data : item));
  };
  const deleteCustomer = async (id: number) => {
    await apiCall(`/admin-records/customer/${id}`, { method: 'DELETE' });
    setCustomers(prev => prev.filter(item => item.id !== id));
  };

  const deleteReview = async (id: number) => {
    await apiCall(`/admin-records/review/${id}`, { method: 'DELETE' });
    setReviewList(prev => prev.filter(item => item.id !== id));
  };
  const approveReview = async (id: number) => {
    const review = reviewList.find(item => item.id === id);
    if (!review) return;
    const updated = { ...review, approved: !review.approved };
    const result = await apiCall<{ data: Review }>(`/admin-records/review/${id}`, { method: 'PUT', body: JSON.stringify(updated) });
    setReviewList(prev => prev.map(item => item.id === id ? result.data : item));
  };

  const addCoupon = async (coupon: Omit<Coupon, 'id'>) => {
    const result = await apiCall<{ data: Coupon }>('/admin-records/coupon', { method: 'POST', body: JSON.stringify(coupon) });
    setCoupons(prev => [result.data, ...prev]);
  };
  const updateCoupon = async (coupon: Coupon) => {
    const result = await apiCall<{ data: Coupon }>(`/admin-records/coupon/${coupon.id}`, { method: 'PUT', body: JSON.stringify(coupon) });
    setCoupons(prev => prev.map(item => item.id === coupon.id ? result.data : item));
  };
  const deleteCoupon = async (id: number) => {
    await apiCall(`/admin-records/coupon/${id}`, { method: 'DELETE' });
    setCoupons(prev => prev.filter(item => item.id !== id));
  };

  const applyCoupon = (code: string, total: number) =>
    apiCall<{ valid: boolean; discount: number; message: string }>('/coupons/validate', {
      method: 'POST', body: JSON.stringify({ code, subtotal: total }),
    });

  return (
    <AdminContext.Provider value={{
      isAuthenticated, isVerifying, apiKey: localStorage.getItem('admin_token') ?? '', login, logout, settings, saveSettings,
      isSettingsLoading, isSavingSettings, settingsError,
      administrators, loadAdministrators, addAdministrator, updateAdministrator, deleteAdministrator,
      products: productList, productsError, ordersError, adminRecordsError, lastSync, syncOnline, isDataLoading, refreshAll, addProduct, updateProduct, deleteProduct,
      categoryList, addCategory, deleteCategory,
      orders, addOrder, updateOrder, updateOrderStatus, deleteOrder, loadOrders,
      customers, addCustomer, updateCustomer, deleteCustomer,
      reviews: reviewList, deleteReview, approveReview,
      coupons, addCoupon, updateCoupon, deleteCoupon, applyCoupon,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
