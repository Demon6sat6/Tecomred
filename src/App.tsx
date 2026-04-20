import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminCoupons from './pages/admin/AdminCoupons';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdmin();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin" replace />;
}

function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/productos"    element={<Products />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/carrito"      element={<Cart />} />
          <Route path="/checkout"     element={<Checkout />} />
          <Route path="/contacto"     element={<Contact />} />
          <Route path="*"             element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <ToastProvider>
          <CartProvider>
            <Routes>
              {/* Admin routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/*" element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }>
                <Route path="dashboard"  element={<AdminDashboard />} />
                <Route path="productos"  element={<AdminProducts />} />
                <Route path="categorias" element={<AdminCategories />} />
                <Route path="pedidos"    element={<AdminOrders />} />
                <Route path="clientes"   element={<AdminCustomers />} />
                <Route path="resenas"    element={<AdminReviews />} />
                <Route path="cupones"    element={<AdminCoupons />} />
                <Route path="ajustes"    element={<AdminSettings />} />
              </Route>

              {/* Store routes */}
              <Route path="/*" element={<StoreLayout />} />
            </Routes>
          </CartProvider>
        </ToastProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}
