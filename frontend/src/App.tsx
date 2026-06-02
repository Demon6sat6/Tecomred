import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { AdminProvider, useAdmin } from "./context/AdminContext";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ToastContainer from "./components/ToastContainer";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Terminos from "./pages/Terminos";
import Privacidad from "./pages/Privacidad";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminCoupons from "./pages/admin/AdminCoupons";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isVerifying } = useAdmin();
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin" replace />;
}

function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="*" element={<NotFound />} />
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
    <ErrorBoundary>
      <BrowserRouter>
        <AdminProvider>
          <ToastProvider>
            <CartProvider>
              <AnalyticsProvider>
                <Routes>
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/*" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                    <Route path="dashboard"  element={<AdminDashboard />} />
                    <Route path="analytics"  element={<AdminAnalytics />} />
                    <Route path="productos"  element={<AdminProducts />} />
                    <Route path="medios"     element={<AdminMedia />} />
                    <Route path="categorias" element={<AdminCategories />} />
                    <Route path="pedidos"    element={<AdminOrdersPage />} />
                    <Route path="clientes"   element={<AdminCustomers />} />
                    <Route path="resenas"    element={<AdminReviewsPage />} />
                    <Route path="cupones"    element={<AdminCoupons />} />
                    <Route path="ajustes"    element={<AdminSettings />} />
                  </Route>
                  <Route path="/*" element={<StoreLayout />} />
                </Routes>
              </AnalyticsProvider>
            </CartProvider>
          </ToastProvider>
        </AdminProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
