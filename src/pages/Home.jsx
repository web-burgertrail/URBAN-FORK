import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLiveMenu, subscribeToLiveMenu } from '../lib/menuService';
import { useRestaurant } from '../context/RestaurantContext';

const HERO_SLIDES = [
  'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=1600&q=80',
  'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=1600&q=80',
  'https://images.unsplash.com/photo-1478144592103-25e218a04891?w=1600&q=80',
  'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=1600&q=80',
  'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=1600&q=80',
];

const QUICK_CATS = [
  { label: 'Fruit Juices',     img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&q=80', key: 'Fruit Juices' },
  { label: 'Special Juices',   img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&q=80', key: 'Special Juices' },
  { label: 'Dry Fruit Juices', img: 'https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?w=300&q=80', key: 'Dry Fruit Juices' },
  { label: 'Vegetable Juices', img: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=300&q=80', key: 'Vegetable Juices' },
  { label: 'Fruit Salads',     img: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=300&q=80', key: 'Fruit Salads' },
  { label: 'Milk Shakes',      img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80', key: 'Milk Shakes' },
  { label: 'Summer Specials',  img: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=300&q=80', key: 'Summer Specials' },
  { label: 'Punch & Shots',    img: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300&q=80', key: 'Punch & Shots' },
  { label: 'Snacks',           img: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300&q=80', key: 'Snacks' },
];

const BRANCHES = [
  { name: 'Urban Fork Kitchen', location: 'Main Branch — Premium Dining, Hyderabad', img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80' },
  { name: 'Urban Fork Bistro',  location: 'Gachibowli Financial District, Hyderabad', img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80' },
  { name: 'Urban Fork Express', location: 'Hussaini Alam, Hyderabad', img: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80' },
];

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0f2d0f 0%,#1a3d0a 50%,#0f1f0f 100%)' }}/>
      <AnimatePresence mode="sync">
        <motion.div key={current} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 0.35, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0">
          <img src={HERO_SLIDES[current]} alt="" className="w-full h-full object-cover"/>
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(15,31,15,0.7) 0%,rgba(15,31,15,0.3) 50%,rgba(15,31,15,0.9) 100%)' }}/>
    </div>
  );
}

function CountUp({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const endNum = parseInt(end) || 0;
        const startTime = performance.now();
        const step = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * endNum));
          if (progress < 1) requestAnimationFrame(step); else setCount(endNum);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const { restaurantName, outletName, cleanPhone, formattedAddress } = useRestaurant();
  const [menuItems, setMenuItems] = useState([]);
  const [totalCount, setTotalCount] = useState(120);

  const loadMenu = async () => {
    const res = await fetchLiveMenu();
    if (res.success && res.items?.length) {
      setMenuItems(res.items);
      setTotalCount(res.items.length);
    }
  };

  useEffect(() => {
    loadMenu();
    const unsub = subscribeToLiveMenu(() => {
      loadMenu();
    });
    return () => unsub();
  }, []);

  const featured = menuItems.slice(0, 10);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>

      {/* HERO */}
      <section className="relative min-h-screen flex items-end sm:items-center overflow-hidden" style={{ paddingTop: '7.8rem' }}>
        <HeroSlideshow />
        <div className="absolute top-24 right-10 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#f4a017 0%,transparent 70%)' }}/>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-heading uppercase tracking-widest"
              style={{ background: 'rgba(244,160,23,0.15)', border: '1px solid rgba(244,160,23,0.3)', color: '#f4a017' }}>
              Fresh · Natural · Kitchen Synced
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="font-logo leading-none mb-2" style={{ fontSize: 'clamp(2.8rem,11vw,6rem)', color: '#f4a017' }}>
              Urban Fork
            </motion.h1>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="font-display text-cream/80 mb-4" style={{ fontSize: 'clamp(1.2rem,4vw,2rem)' }}>
              Juices, Dining & Specials
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
              className="text-cream/55 text-sm sm:text-base font-body mb-7 max-w-sm leading-relaxed">
              Finest fruit juices, authentic biryanis, cold shakes and chef specials — crafted fresh and served with pride.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
              <button onClick={() => navigate('/menu')}
                className="flex items-center gap-2 text-dark-900 px-8 py-3.5 rounded-full font-heading font-bold text-sm tracking-wider uppercase transition-all hover:scale-105 glow-amber"
                style={{ background: 'linear-gradient(135deg,#f7b84b,#f4a017)' }}>
                View Live Menu
              </button>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-8 mt-10">
              {[
                { label: 'Menu Items',      node: <CountUp end={totalCount} suffix="+" duration={1500}/> },
                { label: 'Happy Customers', node: <CountUp end={50000} suffix="+" duration={2500}/> },
                { label: 'Outlets',         node: <CountUp end={2} suffix="" duration={800}/> },
              ].map(({ label, node }) => (
                <div key={label}>
                  <p className="font-display text-2xl sm:text-3xl" style={{ color: '#f4a017' }}>{node}</p>
                  <p className="text-cream/40 text-[10px] sm:text-xs font-body tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        <motion.div animate={{ y: [0,10,0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
          <div className="w-5 h-8 border-2 rounded-full flex items-start justify-center pt-1.5" style={{ borderColor: 'rgba(244,160,23,0.3)' }}>
            <div className="w-1 h-1.5 rounded-full" style={{ background: '#f4a017' }}/>
          </div>
        </motion.div>
      </section>

      {/* MARQUEE */}
      <div className="py-3 overflow-hidden" style={{ background: 'rgba(244,160,23,0.06)', borderTop: '1px solid rgba(244,160,23,0.15)', borderBottom: '1px solid rgba(244,160,23,0.15)' }}>
        <div className="flex gap-10 whitespace-nowrap" style={{ animation: 'marqueeScroll 16s linear infinite' }}>
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} className="flex items-center gap-10 flex-shrink-0">
              <span className="font-logo text-lg" style={{ color: '#f4a017' }}>{restaurantName}</span>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'rgba(244,160,23,0.4)' }}/>
              <span className="font-body text-sm text-cream/30 tracking-widest uppercase">Fresh Daily</span>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'rgba(244,160,23,0.4)' }}/>
              <span className="font-body text-sm tracking-widest uppercase" style={{ color: 'rgba(244,160,23,0.6)' }}>{outletName || 'Dine-In & Takeaway'}</span>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'rgba(244,160,23,0.4)' }}/>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-7">
          <p className="font-heading text-xs uppercase tracking-widest mb-2" style={{ color: '#f4a017' }}>Explore Our Menu</p>
          <h2 className="font-display text-3xl sm:text-4xl text-cream">Order by <span style={{ color: '#f4a017' }}>Category</span></h2>
        </motion.div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {QUICK_CATS.map(({ label, img, key }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={`/menu?cat=${encodeURIComponent(key)}`} className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden group-hover:scale-105 transition-all duration-300 shadow-md"
                  style={{ border: '2px solid rgba(244,160,23,0.2)' }}>
                  <img src={img} alt={label} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={e => { e.target.parentElement.style.background = '#1e3020'; e.target.style.display = 'none'; }}/>
                </div>
                <span className="text-cream/55 text-[10px] sm:text-xs font-heading group-hover:text-amber-primary transition-colors text-center leading-tight">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-5">
            <div>
              <p className="font-heading text-xs uppercase tracking-widest mb-1" style={{ color: '#f4a017' }}>Live Catalog</p>
              <h2 className="font-display text-3xl sm:text-4xl text-cream">Featured <span style={{ color: '#f4a017' }}>Picks</span></h2>
            </div>
            <Link to="/menu" className="flex items-center gap-1 text-cream/30 hover:text-amber-primary text-xs font-heading transition-colors">
              See all <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </Link>
          </motion.div>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
              {featured.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  style={{ width: '155px', flexShrink: 0 }}>
                  <div className="rounded-2xl overflow-hidden transition-all hover:scale-105 duration-300"
                    style={{ background: '#162416', border: '1px solid rgba(244,160,23,0.15)' }}>
                    <div className="relative h-28" style={{ background: '#1e3020' }}>
                      <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}/>
                      {item.is_available === false ? (
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-heading px-1.5 py-0.5 rounded-full text-white font-bold bg-red-600">
                          Sold Out
                        </span>
                      ) : item.badge ? (
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-heading px-1.5 py-0.5 rounded-full text-dark-900 font-bold" style={{ background: '#f4a017' }}>
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                    <div className="p-2.5">
                      <p className="font-heading text-cream text-xs font-bold line-clamp-2 leading-tight mb-1">{item.name}</p>
                      <p className="font-display text-sm" style={{ color: '#f4a017' }}>
                        ₹{item.price}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BRANCHES */}
      <section className="py-14" style={{ background: 'rgba(22,36,22,0.8)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <p className="font-heading text-xs uppercase tracking-widest mb-2" style={{ color: '#f4a017' }}>Find Us</p>
            <h2 className="font-display text-4xl text-cream">Our <span style={{ color: '#f4a017' }}>Branches</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {BRANCHES.map(({ name, location, img }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden" style={{ background: '#162416', border: '1px solid rgba(244,160,23,0.2)' }}>
                <div className="h-32 overflow-hidden">
                  <img src={img} alt={name} className="w-full h-full object-cover opacity-75 hover:scale-105 transition-transform duration-500"/>
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-heading font-bold text-cream text-base mb-1">{name}</h3>
                  <p className="text-cream/50 text-sm font-body">{location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="absolute inset-0 blur-3xl rounded-3xl opacity-15" style={{ background: '#f4a017' }}/>
              <div className="relative grid grid-cols-2 gap-3">
                {[
                  { src: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&q=80', cls: 'col-span-2 aspect-video' },
                  { src: 'https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?w=400&q=80', cls: 'col-span-1 aspect-square' },
                  { src: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400&q=80', cls: 'col-span-1 aspect-square' },
                ].map(({ src, cls }, i) => (
                  <div key={i} className={`${cls} rounded-2xl overflow-hidden`}>
                    <img src={src} alt="Urban Fork Restaurant" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="font-heading text-xs uppercase tracking-widest mb-3" style={{ color: '#f4a017' }}>Our Craft</p>
              <h2 className="font-display text-4xl sm:text-5xl text-cream mb-5">Crafted with <span style={{ color: '#f4a017' }}>Freshness</span></h2>
              <p className="text-cream/50 font-body text-sm leading-relaxed mb-4">
                Urban Fork serves Hyderabad's finest fruit juices, culinary signatures, and wholesome salads. We source premium produce daily to deliver food and beverages that nourish both body and soul.
              </p>
              <p className="text-cream/40 font-body text-sm leading-relaxed mb-7">
                Open daily from 8:30 AM to 11:30 PM — serving exceptional drinks and dining across Hyderabad.
              </p>
              <div className="flex flex-wrap gap-3">
                {['100% Fresh', 'Chilled Daily', 'Seasonal Fruits', 'Hygiene Assured'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-heading"
                    style={{ background: 'rgba(244,160,23,0.1)', border: '1px solid rgba(244,160,23,0.25)', color: '#f4a017' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl p-10 sm:p-12 text-center overflow-hidden"
            style={{ background: 'rgba(244,160,23,0.07)', border: '1px solid rgba(244,160,23,0.25)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,transparent,#f4a017,transparent)' }}/>
            <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-5">
              <img src="https://images.unsplash.com/photo-1613478223719-2ab802602423?w=200&q=80" alt={restaurantName} className="w-full h-full object-cover"/>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-cream mb-3">
              Hungry or Thirsty? <span style={{ color: '#f4a017' }}>We Have You Covered.</span>
            </h2>
            <p className="text-cream/50 font-body mb-7 max-w-md mx-auto text-sm">
              {formattedAddress || 'Fresh delicacies and cold beverages — prepared fresh daily. Visit our dining outlet or order online.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/menu" className="text-dark-900 px-8 py-3.5 rounded-full font-heading font-bold tracking-wider uppercase transition-all hover:scale-105 text-sm glow-amber"
                style={{ background: 'linear-gradient(135deg,#f7b84b,#f4a017)' }}>
                Browse Live Menu
              </Link>
              {cleanPhone && (
                <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer"
                  className="glass px-8 py-3.5 rounded-full font-heading font-bold tracking-wider uppercase hover:border-green-500/40 hover:text-green-400 transition-all text-sm text-cream/80">
                  WhatsApp Inquiries
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
