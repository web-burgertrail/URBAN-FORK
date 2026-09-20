import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { fetchLiveMenu, subscribeToLiveMenu } from '../lib/menuService';

const CATEGORY_ICONS = {
  'Starters': '🥟',
  'Fruit Juices': '🍊',
  'Special Juices': '✨',
  'Dry Fruit Juices': '🥜',
  'Vegetable Juices': '🥦',
  'Fruit Salads': '🥗',
  'Milk Shakes': '🥛',
  'Summer Specials': '☀️',
  'Punch & Shots': '🥃',
  'Snacks': '🍿',
  'Biryani & Rice': '🍚',
  'Curries & Gravies': '🥘',
  'Breads & Naan': '🫓',
  'Desserts': '🍨',
  'Beverages': '☕'
};

const BADGE_STYLES = {
  'Sold Out':     { bg: 'rgba(239,68,68,0.25)', color: '#f87171', border: 'rgba(239,68,68,0.4)' },
  'Bestseller':   { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  "Chef's Pick":  { bg: 'rgba(168,85,247,0.2)', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
  'Popular':      { bg: 'rgba(244,160,23,0.2)', color: '#f4a017', border: 'rgba(244,160,23,0.3)' },
  'Veg':          { bg: 'rgba(34,197,94,0.2)',  color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  'Seasonal':     { bg: 'rgba(249,115,22,0.2)', color: '#f97316', border: 'rgba(249,115,22,0.3)' },
  'Special':      { bg: 'rgba(168,85,247,0.15)', color: '#c084fc', border: 'rgba(168,85,247,0.25)' },
  'Royal':        { bg: 'rgba(244,160,23,0.2)', color: '#f4a017', border: 'rgba(244,160,23,0.3)' }
};

function getBadgeStyle(badge) {
  return BADGE_STYLES[badge] || { bg: 'rgba(244,160,23,0.15)', color: '#f4a017', border: 'rgba(244,160,23,0.25)' };
}

function PriceDisplay({ item }) {
  return <span style={{ color: '#f4a017' }} className="font-display text-lg">₹{item.price}</span>;
}

function ItemModal({ item, onClose }) {
  const { items, addItem, updateQty } = useCart();
  const cartItem = items.find(i => i.id === item.id);
  const isAvailable = item.is_available !== false;
  const bs = isAvailable ? getBadgeStyle(item.badge) : BADGE_STYLES['Sold Out'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{ background: '#162416', border: '1px solid rgba(244,160,23,0.2)' }}>
        <div className="relative aspect-video" style={{ background: '#1e3020' }}>
          <img src={item.image} alt={item.name} className={`w-full h-full object-cover ${!isAvailable ? 'grayscale opacity-60' : ''}`}
            onError={e => { e.target.style.display = 'none'; }}/>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(22,36,22,0.8),transparent)' }}/>
          
          <span className="absolute top-3 left-3 text-xs font-heading px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
            style={{ background: bs.bg, color: bs.color, border: `1px solid ${bs.border}` }}>
            {!isAvailable ? 'Sold Out' : item.badge}
          </span>
          
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
            style={{ background: 'rgba(15,31,15,0.8)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h2 className="font-heading font-bold text-cream text-xl leading-tight">{item.name}</h2>
              {!isAvailable && (
                <span className="text-xs text-red-400 font-semibold mt-1 inline-block">Currently Out of Stock</span>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <PriceDisplay item={item}/>
            </div>
          </div>
          <p className="text-cream/50 text-sm font-body leading-relaxed mb-4">{item.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-cream/70 text-sm font-heading">{item.rating}</span>
              <span className="text-cream/30 text-xs ml-1">({item.reviews})</span>
            </div>
            {!isAvailable ? (
              <span className="px-4 py-2 rounded-full font-heading font-bold text-xs uppercase tracking-wider bg-stone-800/80 text-stone-400 border border-stone-700">
                Unavailable
              </span>
            ) : !cartItem ? (
              <button onClick={() => { addItem(item); onClose(); }}
                className="flex items-center gap-2 text-dark-900 px-5 py-2 rounded-full font-heading font-bold text-sm transition-all hover:scale-105 glow-amber-sm"
                style={{ background: 'linear-gradient(135deg,#f7b84b,#f4a017)' }}>
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.id, cartItem.quantity - 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-cream"
                  style={{ background: 'rgba(244,160,23,0.2)', border: '1px solid rgba(244,160,23,0.3)' }}>-</button>
                <span className="text-cream font-heading font-bold w-6 text-center">{cartItem.quantity}</span>
                <button onClick={() => updateQty(item.id, cartItem.quantity + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-dark-900"
                  style={{ background: '#f4a017' }}>+</button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MenuItemCard({ item }) {
  const [modal, setModal] = useState(false);
  const { items, addItem, updateQty } = useCart();
  const cartItem = items.find(i => i.id === item.id);
  const isAvailable = item.is_available !== false;
  const bs = isAvailable ? getBadgeStyle(item.badge) : BADGE_STYLES['Sold Out'];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-300 ${!isAvailable ? 'opacity-70' : ''}`}
        style={{ background: '#162416', border: isAvailable ? '1px solid rgba(244,160,23,0.12)' : '1px solid rgba(239,68,68,0.2)' }}
        onClick={() => setModal(true)}>
        <div className="relative h-36 sm:h-44" style={{ background: '#1e3020' }}>
          <img src={item.image} alt={item.name} loading="lazy"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!isAvailable ? 'grayscale opacity-60' : ''}`}
            onError={e => { e.target.style.display = 'none'; }}/>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(22,36,22,0.65),transparent 60%)' }}/>
          
          <span className="absolute top-2 left-2 text-[10px] font-heading px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
            style={{ background: bs.bg, color: bs.color, border: `1px solid ${bs.border}` }}>
            {!isAvailable ? 'Sold Out' : item.badge}
          </span>
        </div>
        <div className="p-3">
          <h3 className="font-heading font-bold text-cream text-sm leading-tight mb-1 line-clamp-2">{item.name}</h3>
          <p className="text-cream/40 text-xs font-body leading-relaxed mb-3 line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between">
            <PriceDisplay item={item}/>
            {!isAvailable ? (
              <span className="text-[11px] font-heading font-bold px-2.5 py-1 rounded-full bg-stone-800 text-stone-400 border border-stone-700 pointer-events-none">
                Sold Out
              </span>
            ) : !cartItem ? (
              <button onClick={e => { e.stopPropagation(); addItem(item); }}
                className="text-dark-900 px-3 py-1.5 rounded-full font-heading font-bold text-xs transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#f7b84b,#f4a017)' }}>
                Add
              </button>
            ) : (
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => updateQty(item.id, cartItem.quantity - 1)}
                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-cream"
                  style={{ background: 'rgba(244,160,23,0.2)' }}>-</button>
                <span className="text-cream font-bold text-xs w-5 text-center">{cartItem.quantity}</span>
                <button onClick={() => updateQty(item.id, cartItem.quantity + 1)}
                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-dark-900"
                  style={{ background: '#f4a017' }}>+</button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      <AnimatePresence>{modal && <ItemModal item={item} onClose={() => setModal(false)}/>}</AnimatePresence>
    </>
  );
}

function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
}

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'all');
  const [search, setSearch] = useState('');
  const [menuState, setMenuState] = useState({ categories: [], items: [], categorized: {}, loading: true });
  const isMobile = useIsMobile();
  const { count, openCart } = useCart();
  const { outletId } = useRestaurant();

  const loadMenu = async () => {
    const res = await fetchLiveMenu(outletId);
    if (res.success) {
      setMenuState({
        categories: res.categories,
        items: res.items,
        categorized: res.categorized,
        loading: false
      });
    } else {
      setMenuState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadMenu();
    const unsubscribe = subscribeToLiveMenu(() => {
      loadMenu();
    });
    return () => unsubscribe();
  }, [outletId]);

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const allItems = menuState.items;
  const isSearching = search.trim().length > 0;
  const items = isSearching
    ? allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : (activeCategory === 'all' ? allItems : menuState.categorized[activeCategory] || []);

  const getCategoryCount = (catName) => {
    if (catName === 'all') return allItems.length;
    return (menuState.categorized[catName] || []).length;
  };

  const setCategory = (cat) => {
    setActiveCategory(cat);
    setSearch('');
    if (cat !== 'all') setSearchParams({ cat }); else setSearchParams({});
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="min-h-screen" style={{ paddingTop: '7.8rem', paddingBottom: isMobile ? '7rem' : '2rem' }}>

      {/* Header */}
      <div className="border-b px-4 sm:px-6 lg:px-8 py-4" style={{ background: 'rgba(22,36,22,0.8)', borderColor: 'rgba(255,245,230,0.05)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-heading text-xs uppercase tracking-widest mb-0.5" style={{ color: '#f4a017' }}>What are you craving?</p>
            <h1 className="font-display text-3xl sm:text-5xl text-cream">Live <span style={{ color: '#f4a017' }}>Menu</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
            <span className="text-xs text-cream/60 font-body">Live Kitchen Synced</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="sticky top-14 z-30 backdrop-blur-xl border-b px-4 sm:px-6 lg:px-8 py-2.5"
        style={{ background: 'rgba(15,31,15,0.97)', borderColor: 'rgba(255,245,230,0.05)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="relative max-w-lg">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search dishes, juices, snacks..."
              className="w-full rounded-full pl-9 pr-8 py-2.5 text-cream text-sm font-body placeholder-cream/30 focus:outline-none transition-colors"
              style={{ background: '#1e3020', border: '1px solid rgba(244,160,23,0.2)' }}/>
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream text-sm">x</button>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop sidebar */}
        {!isMobile && (
          <div className="w-56 flex-shrink-0 sticky top-28 self-start h-[calc(100vh-7rem)] overflow-y-auto py-3 hidden md:block scrollbar-hide"
            style={{ borderRight: '1px solid rgba(255,245,230,0.05)' }}>
            <button onClick={() => setCategory('all')}
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left transition-all"
              style={{
                background: activeCategory === 'all' && !isSearching ? 'rgba(244,160,23,0.1)' : 'transparent',
                borderLeft: activeCategory === 'all' && !isSearching ? '3px solid #f4a017' : '3px solid transparent',
              }}>
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🍽️</span>
                <span className="font-heading text-sm" style={{ color: activeCategory === 'all' && !isSearching ? '#f4a017' : 'rgba(255,245,230,0.45)' }}>All Items</span>
              </div>
              <span className="text-xs font-heading px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: 'rgba(244,160,23,0.15)', color: '#f4a017' }}>{allItems.length}</span>
            </button>
            {menuState.categories.map(cat => {
              const isActive = activeCategory === cat.name && !isSearching;
              const count = getCategoryCount(cat.name);
              const icon = CATEGORY_ICONS[cat.name] || '🍲';
              return (
                <button key={cat.id} onClick={() => setCategory(cat.name)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left transition-all"
                  style={{
                    background: isActive ? 'rgba(244,160,23,0.1)' : 'transparent',
                    borderLeft: isActive ? '3px solid #f4a017' : '3px solid transparent',
                  }}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{icon}</span>
                    <span className="font-heading text-xs leading-tight" style={{ color: isActive ? '#f4a017' : 'rgba(255,245,230,0.45)' }}>{cat.name}</span>
                  </div>
                  <span className="text-xs font-heading px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: isActive ? 'rgba(244,160,23,0.2)' : 'rgba(244,160,23,0.08)', color: isActive ? '#f4a017' : 'rgba(255,245,230,0.3)' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          {!isSearching && (
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-display text-xl text-cream">
                {activeCategory === 'all' ? 'All Items' : activeCategory}
              </h2>
              <span className="font-heading text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(244,160,23,0.15)', color: '#f4a017' }}>
                {items.length} items
              </span>
            </div>
          )}

          {menuState.loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="rounded-2xl h-48 bg-stone-900/40 border border-stone-800 animate-pulse"/>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {items.map(item => <MenuItemCard key={item.id} item={item}/>)}
            </div>
          )}

          {!menuState.loading && items.length === 0 && (
            <div className="text-center py-20">
              <p className="text-cream/50 font-body">No items found for "{search}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom category tab bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t overflow-x-auto scrollbar-hide"
          style={{ background: 'rgba(15,31,15,0.98)', borderColor: 'rgba(244,160,23,0.12)' }}>
          <div className="flex whitespace-nowrap py-1 px-1 gap-0.5">
            <button
              onClick={() => setCategory('all')}
              className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all"
              style={{
                color: activeCategory === 'all' && !isSearching ? '#f4a017' : 'rgba(255,245,230,0.4)',
                borderTop: activeCategory === 'all' && !isSearching ? '2px solid #f4a017' : '2px solid transparent',
                background: activeCategory === 'all' && !isSearching ? 'rgba(244,160,23,0.05)' : 'transparent',
              }}>
              <span className="text-base">🍽️</span>
              <span className="text-[9px] font-heading tracking-wide">All</span>
            </button>
            {menuState.categories.map(cat => {
              const isActive = activeCategory === cat.name && !isSearching;
              const icon = CATEGORY_ICONS[cat.name] || '🍲';
              return (
                <button key={cat.id} onClick={() => setCategory(cat.name)}
                  className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all"
                  style={{
                    color: isActive ? '#f4a017' : 'rgba(255,245,230,0.4)',
                    borderTop: isActive ? '2px solid #f4a017' : '2px solid transparent',
                    background: isActive ? 'rgba(244,160,23,0.05)' : 'transparent',
                  }}>
                  <span className="text-base">{icon}</span>
                  <span className="text-[9px] font-heading tracking-wide">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile cart bar */}
      {isMobile && count > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed left-0 right-0 z-50 p-3" style={{ bottom: '4rem' }}>
          <button onClick={openCart} className="w-full text-dark-900 py-4 rounded-2xl font-heading font-bold tracking-wider flex items-center justify-center gap-3 glow-amber"
            style={{ background: 'linear-gradient(135deg,#f7b84b,#f4a017)' }}>
            View Cart ({count} items)
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
