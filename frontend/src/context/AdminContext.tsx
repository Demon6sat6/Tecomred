import { createContext, useContext, type ReactNode, useEffect, useState } from 'react';
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

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
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
  saveSettings: (s: StoreSettings) => void;
  // Products (shared with store)
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  // Categories
  categoryList: string[];
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;
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
  stat1Value: '500',  stat1Suffix: '+',     stat1Label: 'Productos en stock',
  stat2Value: '2000', stat2Suffix: '+',     stat2Label: 'Clientes satisfechos',
  stat3Value: '10',   stat3Suffix: ' años', stat3Label: 'De experiencia',
  stat4Value: '24',   stat4Suffix: '/7',    stat4Label: 'Soporte técnico',
};

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

function makeApiCall(apiKey: string) {
  return async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
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
  const [productList, setProductList]         = useLocalStorage<Product[]>('admin_products', initialProducts);
  const [categoryList, setCategoryList]       = useLocalStorage<string[]>('admin_categories', initialCategories.filter(c => c !== 'Todos'));
  const [orders, setOrders]                   = useLocalStorage<Order[]>('admin_orders', []);
  const [customers, setCustomers]             = useLocalStorage<Customer[]>('admin_customers', initialCustomers);
  const [reviewList, setReviewList]           = useLocalStorage<Review[]>('admin_reviews', initialReviewsWithApproval);
  const [coupons, setCoupons]                 = useLocalStorage<Coupon[]>('admin_coupons', initialCoupons);
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
  const saveSettings = (s: StoreSettings) => setSettings(s);

  // Products — CRUD contra MySQL cuando el backend está disponible
  const addProduct = async (p: Omit<Product, 'id'>): Promise<void> => {
    if (isBackendAvailable) {
      try {
        const result = await apiCall<{ data: Product }>('/products', {
          method: 'POST',
          body: JSON.stringify({ ...p, isActive: true }),
        });
        setProductList(prev => [...prev, result.data]);
        return;
      } catch { /* fallback */ }
    }
    setProductList(prev => [...prev, { ...p, id: Date.now() }]);
  };

  const updateProduct = async (p: Product): Promise<void> => {
    if (isBackendAvailable) {
      try {
        await apiCall(`/products/${p.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...p, isActive: true }),
        });
      } catch { /* fallback */ }
    }
    setProductList(prev => prev.map(x => x.id === p.id ? p : x));
  };

  const deleteProduct = async (id: number): Promise<void> => {
    if (isBackendAvailable) {
      try {
        await apiCall(`/products/${id}`, { method: 'DELETE' });
      } catch { /* fallback */ }
    }
    setProductList(prev => prev.filter(x => x.id !== id));
  };

  // Categories
  const addCategory    = (name: string) => setCategoryList(prev => [...prev, name]);
  const deleteCategory = (name: string) => setCategoryList(prev => prev.filter(c => c !== name));

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