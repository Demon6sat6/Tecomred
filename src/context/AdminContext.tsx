import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Product } from '../types';
import { products as initialProducts, categories as initialCategories } from '../data/products';
import { reviews as initialReviews } from '../data/reviews';
import type { Review } from '../data/reviews';

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  date: string;
  total: number;
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

interface AdminContextType {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  // Products
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: number) => void;
  // Categories
  categoryList: string[];
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;
  // Orders
  orders: Order[];
  addOrder: (o: Omit<Order, 'id'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  // Customers
  customers: Customer[];
  addCustomer: (c: Omit<Customer, 'id'>) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: number) => void;
  // Reviews
  reviews: Review[];
  deleteReview: (id: number) => void;
  // Coupons
  coupons: Coupon[];
  addCoupon: (c: Omit<Coupon, 'id'>) => void;
  updateCoupon: (c: Coupon) => void;
  deleteCoupon: (id: number) => void;
}

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'tecomred2026';

const fakeOrders: Order[] = [
  { id: 'TR-001234', customer: 'Carlos Mendoza',  email: 'carlos@email.com',  phone: '+58 412 1234567', date: '18 Abr 2026', total: 695.00, status: 'Entregado',  city: 'Caracas',      address: 'Av. Principal 123', notes: '', items: [{ productId: 1, name: 'Switch Cisco Catalyst', qty: 1, price: 485 }, { productId: 3, name: 'Cable UTP Cat6', qty: 1, price: 210 }] },
  { id: 'TR-001235', customer: 'María González',  email: 'maria@email.com',   phone: '+57 300 9876543', date: '17 Abr 2026', total: 514.00, status: 'Enviado',    city: 'Bogotá',       address: 'Calle 50 #20-30',   notes: 'Entregar en portería', items: [{ productId: 4, name: 'Procesador Intel i7', qty: 1, price: 389 }, { productId: 5, name: 'RAM Kingston 32GB', qty: 1, price: 125 }] },
  { id: 'TR-001236', customer: 'Roberto Silva',   email: 'roberto@email.com', phone: '+51 987 654321',  date: '17 Abr 2026', total: 210.00, status: 'Procesando', city: 'Lima',         address: 'Jr. Miraflores 456', notes: '', items: [{ productId: 2, name: 'Router MikroTik', qty: 1, price: 210 }] },
  { id: 'TR-001237', customer: 'Ana Rodríguez',   email: 'ana@email.com',     phone: '+52 55 12345678', date: '16 Abr 2026', total: 389.00, status: 'Pendiente',  city: 'México DF',    address: 'Col. Roma Norte 789', notes: 'Llamar antes de entregar', items: [{ productId: 4, name: 'Procesador Intel i7', qty: 1, price: 389 }] },
  { id: 'TR-001238', customer: 'Luis Pérez',      email: 'luis@email.com',    phone: '+56 9 87654321',  date: '16 Abr 2026', total: 163.00, status: 'Entregado',  city: 'Santiago',     address: 'Av. Providencia 321', notes: '', items: [{ productId: 3, name: 'Cable UTP Cat6', qty: 1, price: 65 }, { productId: 10, name: 'Kit Herramientas', qty: 1, price: 45 }, { productId: 9, name: 'Switch TP-Link', qty: 1, price: 38 }] },
  { id: 'TR-001239', customer: 'Sofia Torres',    email: 'sofia@email.com',   phone: '+54 11 98765432', date: '15 Abr 2026', total: 98.00,  status: 'Cancelado',  city: 'Buenos Aires', address: 'Palermo 654',         notes: 'Cliente canceló', items: [{ productId: 6, name: 'SSD Samsung 970', qty: 1, price: 98 }] },
  { id: 'TR-001240', customer: 'Diego Fernández', email: 'diego@email.com',   phone: '+58 424 5556677', date: '15 Abr 2026', total: 564.00, status: 'Enviado',    city: 'Caracas',      address: 'Urb. Las Mercedes',   notes: '', items: [{ productId: 1, name: 'Switch Cisco', qty: 1, price: 485 }, { productId: 10, name: 'Kit Herramientas', qty: 1, price: 45 }, { productId: 3, name: 'Cable UTP', qty: 1, price: 34 }] },
];

const fakeCustomers: Customer[] = [
  { id: 1, name: 'Carlos Mendoza',  email: 'carlos@email.com',  phone: '+58 412 1234567', city: 'Caracas',      orders: 5,  totalSpent: 2340.00, joined: 'Ene 2025', status: 'Activo' },
  { id: 2, name: 'María González',  email: 'maria@email.com',   phone: '+57 300 9876543', city: 'Bogotá',       orders: 3,  totalSpent: 1250.00, joined: 'Feb 2025', status: 'Activo' },
  { id: 3, name: 'Roberto Silva',   email: 'roberto@email.com', phone: '+51 987 654321',  city: 'Lima',         orders: 8,  totalSpent: 3890.00, joined: 'Mar 2024', status: 'Activo' },
  { id: 4, name: 'Ana Rodríguez',   email: 'ana@email.com',     phone: '+52 55 12345678', city: 'México DF',    orders: 1,  totalSpent: 389.00,  joined: 'Abr 2026', status: 'Activo' },
  { id: 5, name: 'Luis Pérez',      email: 'luis@email.com',    phone: '+56 9 87654321',  city: 'Santiago',     orders: 4,  totalSpent: 780.00,  joined: 'Jun 2025', status: 'Activo' },
  { id: 6, name: 'Sofia Torres',    email: 'sofia@email.com',   phone: '+54 11 98765432', city: 'Buenos Aires', orders: 2,  totalSpent: 210.00,  joined: 'Ago 2025', status: 'Inactivo' },
  { id: 7, name: 'Diego Fernández', email: 'diego@email.com',   phone: '+58 424 5556677', city: 'Caracas',      orders: 12, totalSpent: 5670.00, joined: 'Dic 2023', status: 'Activo' },
];

const fakeCoupons: Coupon[] = [
  { id: 1, code: 'BIENVENIDO10', type: 'porcentaje', value: 10, minOrder: 50,  uses: 45,  maxUses: 100, expiry: '2026-12-31', active: true },
  { id: 2, code: 'REDES25',      type: 'porcentaje', value: 25, minOrder: 200, uses: 12,  maxUses: 50,  expiry: '2026-06-30', active: true },
  { id: 3, code: 'DESCUENTO20',  type: 'fijo',       value: 20, minOrder: 100, uses: 89,  maxUses: 200, expiry: '2026-05-31', active: false },
  { id: 4, code: 'TECH50',       type: 'fijo',       value: 50, minOrder: 300, uses: 3,   maxUses: 20,  expiry: '2026-08-15', active: true },
];

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [productList, setProductList]   = useState<Product[]>(initialProducts);
  const [categoryList, setCategoryList] = useState<string[]>(initialCategories.filter(c => c !== 'Todos'));
  const [orders, setOrders]             = useState<Order[]>(fakeOrders);
  const [customers, setCustomers]       = useState<Customer[]>(fakeCustomers);
  const [reviewList, setReviewList]     = useState<Review[]>(initialReviews);
  const [coupons, setCoupons]           = useState<Coupon[]>(fakeCoupons);

  const login = (user: string, pass: string) => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) { setIsAuthenticated(true); return true; }
    return false;
  };
  const logout = () => setIsAuthenticated(false);

  // Products
  const addProduct    = (p: Omit<Product, 'id'>) => setProductList(prev => [...prev, { ...p, id: Date.now() }]);
  const updateProduct = (p: Product)              => setProductList(prev => prev.map(x => x.id === p.id ? p : x));
  const deleteProduct = (id: number)              => setProductList(prev => prev.filter(x => x.id !== id));

  // Categories
  const addCategory    = (name: string) => setCategoryList(prev => [...prev, name]);
  const deleteCategory = (name: string) => setCategoryList(prev => prev.filter(c => c !== name));

  // Orders
  const addOrder = (o: Omit<Order, 'id'>) =>
    setOrders(prev => [{ ...o, id: `TR-${Date.now().toString().slice(-6)}` }, ...prev]);
  const updateOrderStatus = (id: string, status: Order['status']) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  const deleteOrder = (id: string) => setOrders(prev => prev.filter(o => o.id !== id));

  // Customers
  const addCustomer    = (c: Omit<Customer, 'id'>) => setCustomers(prev => [...prev, { ...c, id: Date.now() }]);
  const updateCustomer = (c: Customer)              => setCustomers(prev => prev.map(x => x.id === c.id ? c : x));
  const deleteCustomer = (id: number)               => setCustomers(prev => prev.filter(x => x.id !== id));

  // Reviews
  const deleteReview = (id: number) => setReviewList(prev => prev.filter(r => r.id !== id));

  // Coupons
  const addCoupon    = (c: Omit<Coupon, 'id'>) => setCoupons(prev => [...prev, { ...c, id: Date.now() }]);
  const updateCoupon = (c: Coupon)              => setCoupons(prev => prev.map(x => x.id === c.id ? c : x));
  const deleteCoupon = (id: number)             => setCoupons(prev => prev.filter(x => x.id !== id));

  return (
    <AdminContext.Provider value={{
      isAuthenticated, login, logout,
      products: productList, addProduct, updateProduct, deleteProduct,
      categoryList, addCategory, deleteCategory,
      orders, addOrder, updateOrderStatus, deleteOrder,
      customers, addCustomer, updateCustomer, deleteCustomer,
      reviews: reviewList, deleteReview,
      coupons, addCoupon, updateCoupon, deleteCoupon,
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
