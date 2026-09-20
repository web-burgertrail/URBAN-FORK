import { motion } from 'framer-motion';
import { useRestaurant } from '../context/RestaurantContext';

const VALUES = [
  { image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&q=80', emoji: '🌿', title: 'Farm Fresh Daily', desc: 'We source only the finest seasonal ingredients from trusted local farms — prepared fresh every single day.' },
  { image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80', emoji: '⭐', title: 'Premium Quality', desc: 'Crafted recipes where every dish and drink reflects our commitment to premium culinary quality.' },
  { image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80', emoji: '🏙️', title: 'Authentic Flavours', desc: 'Proud to serve our guests with authentic flavours, warm hospitality, and memorable dining moments.' },
];

const TEAM_STATS = [
  { number: '100%', label: 'Fresh Daily' },
  { number: 'Live', label: 'Digital Menu' },
  { number: '60+', label: 'Menu Items' },
  { number: '5★', label: 'Guest Service' },
];

export default function About() {
  const { restaurantName, outletName, formattedAddress } = useRestaurant();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      className="min-h-screen pb-20" style={{ paddingTop: '7rem' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="font-heading text-xs uppercase tracking-widest mb-3" style={{ color: '#f4a017' }}>Who We Are</p>
          <h1 className="font-display text-5xl sm:text-7xl text-cream mb-4">Our <span style={{ color: '#f4a017' }}>Story</span></h1>
          <div className="w-20 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #f7b84b, #f4a017)' }}/>
        </motion.div>

        {/* Story */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="font-heading text-xs uppercase tracking-widest mb-4" style={{ color: '#f4a017' }}>Fresh Craft & Hospitality</p>
            <h2 className="font-display text-4xl text-cream mb-6">Where Culinary Craft Becomes a Passion</h2>
            <p className="text-cream/50 font-body leading-relaxed mb-4">
              At {restaurantName}, we believe that the freshest ingredients, authentic recipes, and warm hospitality should be available to every guest. Starting from our dedicated kitchen, we grew through word of mouth and community love.
            </p>
            <p className="text-cream/40 font-body leading-relaxed mb-4">
              Over the years, our culinary team has perfected a diverse menu of delicious specialties, refreshing beverages, and delightful handcrafted recipes made fresh daily.
            </p>
            <p className="text-cream/40 font-body leading-relaxed">
              Today, {restaurantName} proudly serves guests with live digital ordering, instant staff verification, and warm dining experiences.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-3">
            {[
              { src: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&q=80', cls: 'col-span-2 aspect-video' },
              { src: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&q=80', cls: 'col-span-1 aspect-square' },
              { src: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80', cls: 'col-span-1 aspect-square' },
            ].map(({ src, cls }, i) => (
              <div key={i} className={`${cls} rounded-2xl overflow-hidden`} style={{ background: '#1e3020' }}>
                <img src={src} alt={restaurantName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {TEAM_STATS.map(({ number, label }) => (
            <div key={label} className="text-center p-6 rounded-2xl"
              style={{ background: 'rgba(244,160,23,0.06)', border: '1px solid rgba(244,160,23,0.2)' }}>
              <p className="font-display text-4xl sm:text-5xl mb-1" style={{ color: '#f4a017' }}>{number}</p>
              <p className="text-cream/50 text-sm font-body">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Values */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="font-display text-4xl text-cream">What Makes Us <span style={{ color: '#f4a017' }}>Unique</span></h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {VALUES.map(({ image, emoji, title, desc }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden" style={{ background: '#162416', border: '1px solid rgba(244,160,23,0.15)' }}>
              <div className="relative h-48" style={{ background: '#1e3020' }}>
                <img src={image} alt={title} className="w-full h-full object-cover opacity-70"/>
                <div className="absolute inset-0 flex items-end p-4" style={{ background: 'linear-gradient(to top, rgba(22,36,22,0.9), transparent)' }}>
                  <span className="text-3xl">{emoji}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-cream text-lg mb-2">{title}</h3>
                <p className="text-cream/45 text-sm font-body leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Branches & Locations */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-3xl p-8 sm:p-12 text-center" style={{ background: 'rgba(244,160,23,0.06)', border: '1px solid rgba(244,160,23,0.2)' }}>
          <p className="font-heading text-xs uppercase tracking-widest mb-3" style={{ color: '#f4a017' }}>Find Us Near You</p>
          <h2 className="font-display text-4xl text-cream mb-8">Our <span style={{ color: '#f4a017' }}>Locations</span></h2>
          <div className="max-w-md mx-auto">
            <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(244,160,23,0.08)', border: '1px solid rgba(244,160,23,0.15)' }}>
              <p className="font-heading font-bold text-cream text-base">{restaurantName}</p>
              <p className="font-heading text-xs mt-0.5" style={{ color: '#f4a017' }}>{outletName || 'Main Dining Location'}</p>
              <p className="text-cream/60 text-xs font-body mt-2 leading-relaxed">{formattedAddress || 'Visit our dining outlet for authentic delicacies.'}</p>
            </div>
          </div>
        </motion.div>


      </div>
    </motion.div>
  );
}
