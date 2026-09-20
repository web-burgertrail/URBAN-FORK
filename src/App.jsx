import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, Suspense } from 'react';
import { RestaurantProvider } from './context/RestaurantContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Order from './pages/Order';
import { PwaPushPrompt } from './components/PwaPushPrompt';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-4xl animate-bounce">🍽️</div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/order" element={<Order />} />
        {/* Table & Customer QR Routes */}
        <Route path="/c/:outletCode/:tableToken" element={<Menu />} />
        <Route path="/c/:outletCode" element={<Menu />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RestaurantProvider>
        <CartProvider>
          <div className="min-h-screen text-cream relative overflow-x-hidden" style={{ background: '#0f1f0f' }}>
            {/* Ambient background glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(244,160,23,0.04) 0%, transparent 70%)' }}/>
              <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.03) 0%, transparent 70%)' }}/>
            </div>
            <ScrollToTop />
            <Navbar />
            <CartDrawer />
            <main className="relative z-10">
              <Suspense fallback={<PageLoader />}>
                <AnimatedRoutes />
              </Suspense>
            </main>
            <PwaPushPrompt />
            <Footer />
          </div>
        </CartProvider>
      </RestaurantProvider>
    </BrowserRouter>
  );
}

