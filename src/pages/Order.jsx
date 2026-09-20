import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';

export default function Order() {
  const { restaurantName, cleanPhone, isTableSession, table } = useRestaurant();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center pb-20"
      style={{ paddingTop: '7rem' }}
    >
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="text-6xl mb-6">🍽️</div>
        <h1 className="font-display text-4xl text-cream mb-4">
          Order Online at <span style={{ color: '#f4a017' }}>{restaurantName}</span>
        </h1>
        <p className="text-cream/60 font-body mb-8">
          {isTableSession
            ? `You are dining at Table ${table.table_number}. Browse the live menu, customize your dishes, and place your order directly.`
            : 'Browse our live menu, add items to cart, and place your order directly for dine-in or takeaway!'}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/menu"
            className="py-4 rounded-2xl font-heading font-bold text-dark-900 text-lg transition-all hover:scale-105 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f7b84b, #f4a017)' }}
          >
            📋 Browse Live Menu & Order
          </Link>
          {cleanPhone && (
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${restaurantName}! I have a question about the menu.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 text-white py-4 rounded-2xl font-heading font-bold text-base transition-all hover:scale-105"
              style={{ background: '#25D366' }}
            >
              💬 WhatsApp Assistance
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
