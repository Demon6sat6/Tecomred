import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { AdminProvider, useAdmin } from "./context/AdminContext";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import { ProductListsProvider } from "./context/ProductListsContext";
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
import Favorites from "./pages/Favorites";
import Compare from "./pages/Compare";
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
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminReviewsPage = lazy(() => import("./pages/admin/AdminReviewsPage"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminAdministrators = lazy(() => import("./pages/admin/AdminAdministrators"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminMarketing = lazy(() => import("./pages/admin/AdminMarketing"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isVerifying } = useAdmin();
  if (isVerifying) {
    return <PageFallback />;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/cuenta" replace />;
}

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" aria-label="Cargando" />
  </div>
);

function StoreLayout() {
  const { settings, isSettingsLoading } = useAdmin();
  if (!isSettingsLoading && settings.maintenanceMode) {
    return (
      <main className="min-h-screen bg-[#f5f8fc] flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-blue-100 bg-white p-8 sm:p-12 text-center shadow-xl shadow-blue-900/5">
          <img src="/logo.png" alt="SiscomRed" className="mx-auto mb-8 h-24 w-auto object-contain" />
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-green-700">Estamos mejorando la tienda</span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Volvemos muy pronto</h1>
          <p className="mt-4 text-slate-600">Estamos realizando mejoras. Si necesitas un producto o asesoría, contáctanos y te atenderemos directamente.</p>
          <a href={`https://wa.me/${settings.storePhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#0052b8] px-7 font-bold text-white hover:bg-[#003d91]">Hablar con SiscomRed</a>
        </div>
      </main>
    );
  }
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
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/comparar" element={<Compare />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/ubicacion" element={<Ubicacion />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
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
              <ProductListsProvider>
              <AnalyticsProvider>
                <Routes>
                  <Route path="/cuenta" element={<Suspense fallback={<PageFallback />}><Account /></Suspense>} />
                  <Route path="/admin/login" element={<Navigate to="/cuenta" replace />} />
                  <Route path="/admin/*" element={<Suspense fallback={<PageFallback />}><AdminGuard><AdminLayout /></AdminGuard></Suspense>}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard"       element={<AdminDashboard />} />
                    <Route path="productos"       element={<AdminProducts />} />
                    <Route path="inventario"      element={<AdminInventory />} />
                    <Route path="medios"          element={<AdminMedia />} />
                    <Route path="categorias"      element={<AdminCategories />} />
                    <Route path="pedidos"         element={<AdminOrdersPage />} />
                    <Route path="clientes"        element={<AdminCustomers />} />
                    <Route path="cupones"         element={<AdminCoupons />} />
                    <Route path="promociones"     element={<AdminCoupons />} />
                    <Route path="resenas"         element={<AdminReviewsPage />} />
                    <Route path="marketing"       element={<AdminMarketing />} />
                    <Route path="reportes"        element={<AdminAnalytics />} />
                    <Route path="administradores" element={<AdminAdministrators />} />
                    <Route path="ajustes"         element={<AdminSettings />} />
                    <Route path="configuracion"   element={<AdminSettings />} />
                    <Route path="analytics"       element={<Navigate to="/admin/reportes" replace />} />
                    <Route path="seguimiento"     element={<Navigate to="/admin/pedidos" replace />} />
                    <Route path="nosotros"        element={<Navigate to="/admin/ajustes" replace />} />
                    <Route path="*"               element={<NotFound />} />
                  </Route>
                  <Route path="/*" element={
                    <Suspense fallback={<PageFallback />}>
                      <StoreLayout />
                    </Suspense>
                  } />
                </Routes>
              </AnalyticsProvider>
              </ProductListsProvider>
            </CartProvider>
          </ToastProvider>
        </AdminProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
