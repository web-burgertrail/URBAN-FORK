import { motion } from 'framer-motion';

const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&q=80', caption: 'Fresh Fruit Juices', tall: true },
  { src: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&q=80', caption: 'Exotic Punch', tall: false },
  { src: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80', caption: 'Special Creations', tall: false },
  { src: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80', caption: 'Fruit Salads', tall: true },
  { src: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80', caption: 'Milk Shakes', tall: false },
  { src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80', caption: 'Dry Fruit Premium', tall: false },
  { src: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80', caption: 'Mango Special', tall: true },
  { src: 'https://images.unsplash.com/photo-1583167617041-7d3c56d17ff9?w=600&q=80', caption: 'Royal Falooda', tall: false },
  { src: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&q=80', caption: 'Strawberry Delight', tall: false },
  { src: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&q=80', caption: 'Tropical Fruits', tall: true },
  { src: 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=600&q=80', caption: 'Watermelon Fresh', tall: false },
  { src: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', caption: 'Cool Summer Drinks', tall: false },
];

export default function Gallery() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      className="min-h-screen pb-20" style={{ paddingTop: '7rem' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="font-heading text-xs uppercase tracking-widest mb-3" style={{ color: '#f4a017' }}>Fresh Every Day</p>
          <h1 className="font-display text-5xl sm:text-6xl text-cream">Our <span style={{ color: '#f4a017' }}>Gallery</span></h1>
        </motion.div>
        <div className="masonry-grid">
          {GALLERY_IMAGES.map(({ src, caption, tall }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="masonry-item group relative overflow-hidden rounded-2xl cursor-pointer"
              style={{ border: '1px solid rgba(244,160,23,0.1)' }}>
              <img src={src} alt={caption} loading="lazy"
                className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${tall ? 'aspect-[3/4]' : 'aspect-square'}`}/>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"
                style={{ background: 'linear-gradient(to top, rgba(15,31,15,0.9), transparent)' }}>
                <p className="text-cream text-sm font-heading font-bold">{caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
