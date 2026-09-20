import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStoreTimer } from '../hooks/useStoreTimer';
import { useRestaurant } from '../context/RestaurantContext';

const MAPS_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.4116030999516!2d78.435!3d17.385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIzJzA2LjAiTiA3OMKwMjYnMDUuOSJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin';

function LiveStatusBadge() {
  const { isOpen, formatted } = useStoreTimer();
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-heading ${
        isOpen ? 'bg-green-900/60 text-green-300 border border-green-600/40' : 'bg-dark-800/80 text-amber-primary border border-amber-primary/30'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-400 animate-pulse' : 'bg-amber-primary'}`} />
      {isOpen ? (
        <span>Open now — Closes in <strong className="text-white font-bold">{formatted}</strong></span>
      ) : (
        <span>Closed now — Opens in <strong className="text-white font-bold">{formatted}</strong></span>
      )}
    </div>
  );
}

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [locError, setLocError] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const { restaurantName, outletName, formattedAddress, phone, cleanPhone, socialLinks } = useRestaurant();

  const handleOrder = () => {
    setLoading(true);
    setLocError(false);
    if (!navigator.geolocation) {
      setLoading(false);
      setLocError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const link = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
        window.open(
          `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${restaurantName}!\n\nI want to place an order.\n\nMy Location:\n${link}`)}`,
          '_blank'
        );
        setLoading(false);
      },
      () => {
        setLoading(false);
        setLocError(true);
      },
      { timeout: 10000 }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-20"
      style={{ paddingTop: '7rem' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="font-heading text-xs uppercase tracking-widest mb-3" style={{ color: '#f4a017' }}>Get In Touch</p>
          <h1 className="font-display text-5xl sm:text-7xl text-cream mb-4">
            Find <span style={{ color: '#f4a017' }}>Us</span>
          </h1>
          <p className="text-cream/40 font-body text-sm">Come visit our restaurant or order directly online.</p>
        </motion.div>

        {/* Live Status + Contact Details Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16 items-start">
          {/* Left: Outlet Information Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 sm:p-8"
            style={{ background: '#162416', border: '1px solid rgba(244,160,23,0.15)' }}
          >
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h2 className="font-display text-2xl text-cream">{restaurantName}</h2>
                <p className="text-xs font-heading" style={{ color: '#f4a017' }}>{outletName || 'Main Restaurant'}</p>
              </div>
              <LiveStatusBadge />
            </div>

            <div className="space-y-4 text-sm font-body mb-8">
              <div className="flex items-start gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-cream/40 text-xs font-heading uppercase">Address</p>
                  <p className="text-cream/80">{formattedAddress || 'Restaurant Dining Location'}</p>
                </div>
              </div>

              {phone && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">📞</span>
                  <div>
                    <p className="text-cream/40 text-xs font-heading uppercase">Phone</p>
                    <a href={`tel:${phone}`} className="text-cream hover:text-amber-primary transition">
                      {phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp Direct Ordering Card */}
            <div
              className="p-5 rounded-2xl"
              style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)' }}
            >
              <h3 className="font-heading font-bold text-cream text-base mb-1">WhatsApp Concierge</h3>
              <p className="text-cream/40 font-body text-xs mb-4">Chat with our team for table reservations, special requests, or queries.</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOrder}
                disabled={loading}
                className="w-full text-white py-3 rounded-full font-heading font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-md"
                style={{ background: '#25D366' }}
              >
                {loading ? (
                  <span>Getting Location...</span>
                ) : (
                  <span>Chat on WhatsApp</span>
                )}
              </motion.button>
              {locError && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2">
                  <p className="text-amber-400 text-xs font-body">Location denied. Enter your location manually:</p>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Area, landmark, street..."
                    className="w-full rounded-lg px-3 py-2 text-cream text-xs font-body placeholder-cream/30 focus:outline-none"
                    style={{ background: '#1e3020', border: '1px solid rgba(244,160,23,0.2)' }}
                  />
                  <button
                    onClick={() => window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${restaurantName}!\n\nAddress:\n${manualAddress}`)}`, '_blank')}
                    className="w-full py-2.5 rounded-full text-xs font-heading font-medium transition-all text-cream/60 hover:text-green-400"
                    style={{ background: '#162416', border: '1px solid rgba(244,160,23,0.15)' }}
                  >
                    Send on WhatsApp
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right: Google Map */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden min-h-[460px]"
            style={{ border: '1px solid rgba(244,160,23,0.15)' }}
          >
            <iframe
              src={MAPS_EMBED_URL}
              className="w-full h-full min-h-[460px]"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.8)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${restaurantName} Location`}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
