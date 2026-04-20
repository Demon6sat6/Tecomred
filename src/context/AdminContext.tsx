import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Product } from '../types';
import { products as initialProducts } from '../data/products';

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
  items: number;
  city: string;
}

interface AdminContextType {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: number) => void;
  orders: Order[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'tecomred2026';

// Fake orders
const fakeOrders: Order[] = [
  { id: 'TR-001234', customer: 'Carlos Mendoza',  email: 'carlos@email.com',  date: '18 Abr 2026', total: 695.00, status: 'Entregado',  items: 2, city: 'Caracas' },
  { id: 'TR-001235', customer: 'María González',  email: 'maria@email.com',   date: '17 Abr 2026', total: 514.00, status: 'Enviado',    items: 3, city: 'Bogotá' },
  { id: 'TR-001236', customer: 'Roberto Silva',   email: 'roberto@email.com', date: '17 Abr 2026', total: 210.00, status: 'Procesando', items: 1, city: 'Lima' },
  { id: 'TR-001237', customer: 'Ana Rodríguez',   email: 'ana@email.com',     date: '16 Abr 2026', total: 389.00, status: 'Pendiente',  items: 1, city: 'México DF' },
  { id: 'TR-001238', customer: 'Luis Pérez',      email: 'luis@email.com',    date: '16 Abr 2026', total: 163.00, status: 'Entregado',  items: 2, city: 'Santiago' },
  { id: 'TR-001239', customer: 'Sofia Torres',    email: 'sofia@email.com',   date: '15 Abr 2026', total: 98.00,  status: 'Cancelado',  items: 1, city: 'Buenos Aires' },
  { id: 'TR-001240', customer: 'Diego Fernández', email: 'diego@email.com',   date: '15 Abr 2026', total: 564.00, status: 'Enviado',    items: 4, city: 'Caracas' },
  { id: 'TR-001241', customer: 'Valeria Castro',  email: 'valeria@email.com', date: '14 Abr 2026', total: 304.00, status: 'Entregado',  items: 2, city: 'Medellín' },
  { id: 'TR-001242', customer: 'Andrés Morales',  email: 'andres@email.com',  date: '14 Abr 2026', total: 179.00, status: 'Procesando', items: 1, city: 'Quito' },
  { id: 'TR-001243', customer: 'Camila Reyes',    email: 'camila@email.com',  date: '13 Abr 2026', total: 735.00, status: 'Entregado',  items: 3, city: 'Caracas' },
];

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(fakeOrders);

  const login = (user: string, pass: string) => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAuthenticated(false);

  const addProduct = (p: Product) =>
    setProductList(prev => [...prev, { ...p, id: Date.now() }]);

  const updateProduct = (p: Product) =>
    setProductList(prev => prev.map(x => x.id === p.id ? p : x));

  const deleteProduct = (id: number) =>
    setProductList(prev => prev.filter(x => x.id !== id));

  const updateOrderStatus = (id: string, status: Order['status']) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

  return (
    <AdminContext.Provider value={{
      isAuthenticated, login, logout,
      products: productList, addProduct, updateProduct, deleteProduct,
      orders, updateOrderStatus,
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
