import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnnouncementBar from './components/AnnouncementBar';
import ToastContainer from './components/ToastContainer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <AnnouncementBar />
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
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
