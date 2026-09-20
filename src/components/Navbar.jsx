import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useStoreTimer } from '../hooks/useStoreTimer';

const NAV_TABS = [
  { path: '/', label: 'Home' },
  { path: '/menu', label: 'Menu' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

function TopAnnouncementBar() {
  const { isOpen, formatted } = useStoreTimer();
  const { offers } = useRestaurant();
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  useEffect(() => {
    if (!offers || offers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [offers]);

  const activeOffer = offers && offers.length > 0 ? offers[currentOfferIndex] : null;

  return (
    <div className={`w-full py-1.5 px-3 sm:px-4 text-center flex items-center justify-between gap-2 overflow-hidden ${
      isOpen ? 'bg-green-950/80 border-b border-green-600/30' : 'bg-dark-800/90 border-b border-amber-primary/20'
    }`}>
      {/* Left: Store Open/Closed Timer */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOpen ? 'bg-green-400 animate-pulse' : 'bg-amber-primary/70'}`}/>
        <span className={`text-[11px] font-body ${isOpen ? 'text-green-300' : 'text-cream/50'}`}>
          {isOpen
            ? <>Open • <span className="font-heading font-semibold text-white">Closes in {formatted}</span></>
            : <>Closed • <span className="font-heading font-semibold" style={{ color: '#f4a017' }}>Opens in {formatted}</span></>
          }
        </span>
      </div>

      {/* Center/Right: Live Promotional Offer Announcement Ticker */}
      <div className="flex-1 min-w-0 text-right sm:text-center">
        {activeOffer ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeOffer.id || currentOfferIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-1.5 text-[11px] font-heading font-bold text-amber-300 truncate"
            >
              <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px] tracking-wider uppercase border border-amber-400/30">
                OFFER
              </span>
              <span className="truncate">
                {activeOffer.title || activeOffer.code}: {activeOffer.discount_type === 'PERCENTAGE' ? `${activeOffer.discount_value}% OFF` : `Rs.${activeOffer.discount_value} OFF`}
                {activeOffer.min_order_subtotal > 0 ? ` on orders above Rs.${activeOffer.min_order_subtotal}` : ''}
              </span>
              <span className="hidden md:inline text-white/60 font-mono text-[10px]">
                (Code: {activeOffer.code})
              </span>
            </motion.div>
          </AnimatePresence>
        ) : (
          <span className="text-[11px] text-cream/40 font-body hidden sm:inline">
            Fresh dine-in & takeaway prepared with authentic ingredients
          </span>
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { count, openCart } = useCart();
  const { restaurantName, outletName, logoUrl, cleanPhone, table, isTableSession } = useRestaurant();
  const location = useLocation();

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const brandInitials = restaurantName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'R';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-dark-900/97 backdrop-blur-xl">
      <TopAnnouncementBar />
      <div className="flex items-center justify-between px-3 sm:px-5 lg:px-10 py-2 border-b border-cream/5">
        <Link to="/" onClick={handleHomeClick} className="flex items-center gap-2.5 group flex-shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={restaurantName}
              className="w-9 h-9 rounded-xl object-cover border border-amber-primary/30 shadow-md"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-dark-900 text-sm shadow-md"
              style={{ background: 'linear-gradient(135deg,#f7b84b,#f4a017)' }}
            >
              {brandInitials}
            </div>
          )}
          <div className="flex flex-col leading-none">
            <span className="font-logo" style={{ fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', color: '#f4a017' }}>
              {restaurantName}
            </span>
            <span className="text-cream/40 text-[9px] font-body tracking-widest uppercase truncate max-w-[170px]">
              {isTableSession ? `Table ${table.table_number} • ${outletName}` : (outletName || 'Restaurant')}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isTableSession && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Table {table.table_number}
            </span>
          )}
          {cleanPhone && (
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
              style={{ background: '#25D366' }}
              title="Contact on WhatsApp"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          )}
          <button
            onClick={openCart}
            aria-label="Cart"
            className="relative flex items-center gap-1 glass px-2.5 py-1.5 rounded-full hover:border-amber-primary/40 transition-all group"
          >
            <svg
              className="w-3.5 h-3.5 text-cream/60 group-hover:text-amber-primary transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-cream/60 text-xs font-body hidden sm:block group-hover:text-white transition-colors">
              Cart
            </span>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-dark-900"
                style={{ background: '#f4a017' }}
              >
                {count}
              </motion.span>
            )}
          </button>
        </div>
      </div>


      {/* Nav tabs — no emojis */}
      <div className="bg-dark-800/50 border-b border-cream/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center overflow-x-auto scrollbar-hide px-2 py-2 gap-1">
            {NAV_TABS.map(({ path, label }) => {
              const active = location.pathname === path;
              return (
                <Link key={path} to={path} onClick={path === '/' ? handleHomeClick : undefined}
                  className="flex-shrink-0" style={{ textDecoration: 'none' }}>
                  <motion.div
                    animate={{ y: active ? -2 : 0, backgroundColor: active ? '#f4a017' : 'transparent' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                    style={{
                      padding: active ? '7px 16px' : '7px 12px',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      boxShadow: active ? '0 4px 12px rgba(244,160,23,0.45)' : 'none',
                    }}>
                    <span style={{
                      color: active ? '#0f1f0f' : 'rgba(255,245,230,0.45)',
                      fontSize: '11px',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}>
                      {label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
