import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { AdminProvider, useAdmin } from "./context/AdminContext";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import ErrorBoundary from "./components/ErrorBoundary";
import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ToastContainer from "./components/ToastContainer";
import Chatbot from "./components/Chatbot";
import BackToTop from "./components/BackToTop";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

// Código dividido (code splitting): las páginas menos visitadas y TODO el panel
// administrativo se cargan bajo demanda, reduciendo el bundle inicial.
const Contact = lazy(() => import("./pages/Contact"));
const Nosotros = lazy(() => import("./pages/Nosotros"));
const Proyectos = lazy(() => import("./pages/Proyectos"));
const Ubicacion = lazy(() => import("./pages/Ubicacion"));
const Terminos = lazy(() => import("./pages/Terminos"));
const Privacidad = lazy(() => import("./pages/Privacidad"));
const Account = lazy(() => import("./pages/Account"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminReviewsPage = lazy(() => import("./pages/admin/AdminReviewsPage"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminAdministrators = lazy(() => import("./pages/admin/AdminAdministrators"));
const AdminTracking = lazy(() => import("./pages/admin/AdminTracking"));
const AdminAbout = lazy(() => import("./pages/admin/AdminAbout"));

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isVerifying } = useAdmin();
  if (isVerifying) {
    return <PageFallback />;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin" replace />;
}

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" aria-label="Cargando" />
  </div>
);

function StoreLayout() {
  const { settings } = useAdmin();
  return (
    <div className="min-h-screen flex flex-col">
      {settings.showAnnouncementBar && <AnnouncementBar />}
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/ubicacion" element={<Ubicacion />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/cuenta" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      <ToastContainer />
      <Chatbot />
      <BackToTop />
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
                  <Route path="/admin" element={<Suspense fallback={<PageFallback />}><AdminLogin /></Suspense>} />
                  <Route path="/admin/*" element={<Suspense fallback={<PageFallback />}><AdminGuard><AdminLayout /></AdminGuard></Suspense>}>
                    <Route path="dashboard"  element={<AdminDashboard />} />
                    <Route path="analytics"  element={<AdminAnalytics />} />
                    <Route path="productos"  element={<AdminProducts />} />
                    <Route path="medios"     element={<AdminMedia />} />
                    <Route path="categorias" element={<AdminCategories />} />
                    <Route path="pedidos"    element={<AdminOrdersPage />} />
                    <Route path="clientes"   element={<AdminCustomers />} />
                    <Route path="resenas"    element={<AdminReviewsPage />} />
                    <Route path="cupones"    element={<AdminCoupons />} />
                    <Route path="administradores" element={<AdminAdministrators />} />
                    <Route path="seguimiento" element={<AdminTracking />} />
                    <Route path="nosotros" element={<AdminAbout />} />
                    <Route path="ajustes"    element={<AdminSettings />} />
                  </Route>
                  <Route path="/*" element={
                    <Suspense fallback={<PageFallback />}>
                      <StoreLayout />
                    </Suspense>
                  } />
                </Routes>
              </AnalyticsProvider>
            </CartProvider>
          </ToastProvider>
        </AdminProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
