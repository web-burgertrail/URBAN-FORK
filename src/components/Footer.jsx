import { Link } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';

const QUICK_LINKS = [
  ['/', 'Home'],
  ['/menu', 'Menu'],
  ['/gallery', 'Gallery'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
  ['/order', 'Order'],
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { restaurantName, outletName, formattedAddress, phone, cleanPhone, socialLinks, logoUrl } = useRestaurant();

  const brandInitials = restaurantName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'R';

  return (
    <footer className="relative mt-8" style={{ background: '#162416', borderTop: '1px solid rgba(255,245,230,0.05)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, #f4a017, transparent)', opacity: 0.5 }}/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              {logoUrl ? (
                <img src={logoUrl} alt={restaurantName} className="w-8 h-8 rounded-full object-cover border border-amber-primary/30" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f7b84b, #f4a017)' }}>
                  <span className="text-dark-900 font-black text-xs">{brandInitials}</span>
                </div>
              )}
              <div className="flex flex-col leading-none">
                <span className="font-logo text-lg" style={{ color: '#f4a017' }}>{restaurantName}</span>
                <span className="text-cream/30 text-[8px] font-body tracking-widest uppercase">{outletName || 'Dine-In & Takeaway'}</span>
              </div>
            </Link>
            <p className="text-cream/35 text-xs font-body leading-relaxed mb-3 max-w-xs">
              Delicious culinary recipes and beverages prepared fresh for dining and takeaway.
            </p>
            <div className="flex gap-2">
              {cleanPhone && (
                <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                  style={{ background: '#25D366' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              )}
              {socialLinks?.instagram_url && (
                <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram"
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                  style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {socialLinks?.google_review_url && (
                <a href={socialLinks.google_review_url} target="_blank" rel="noopener noreferrer" title="Google Reviews"
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                  style={{ background: '#4285F4' }}>
                  <span className="text-white font-black text-xs">G</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-heading font-semibold text-cream uppercase tracking-widest text-[10px] sm:text-xs mb-3">Quick Links</h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {QUICK_LINKS.map(([to, label]) => (
                <Link key={to} to={to} className="text-cream/40 hover:text-amber-primary text-xs font-body transition-colors truncate">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Hours & Contact */}
          <div className="col-span-1">
            <h3 className="font-heading font-semibold text-cream uppercase tracking-widest text-[10px] sm:text-xs mb-3">Hours & Contact</h3>
            <div className="space-y-1.5 text-xs font-body">
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                <span className="text-cream/40">Mon – Sun</span>
                <span className="font-medium" style={{ color: '#f4a017' }}>Open Daily</span>
              </div>
              {phone && (
                <div className="mt-2">
                  <a href={`tel:${phone}`} className="text-cream/60 hover:text-green-400 text-xs transition-colors">
                    📞 {phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-heading font-semibold text-cream uppercase tracking-widest text-[10px] sm:text-xs mb-3">Location</h3>
            <div className="space-y-2 text-xs font-body">
              <p className="text-cream/40 leading-relaxed">
                {formattedAddress || (outletName ? `${outletName} Location` : 'Visit our restaurant')}
              </p>
              {formattedAddress && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(`${restaurantName} ${formattedAddress}`)}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors text-xs mt-1" style={{ color: 'rgba(244,160,23,0.7)' }}>
                  📍 View on Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderTop: '1px solid rgba(255,245,230,0.05)' }}>
          <p className="text-cream/20 text-[10px] font-body">© {year} {restaurantName}. All rights reserved.</p>
          <a href="https://www.idesign4u.in" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-cream/20 hover:text-amber-primary transition-colors text-[10px] font-body group">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
            Powered by <span className="ml-0.5 group-hover:text-amber-primary" style={{ color: 'rgba(244,160,23,0.5)' }}>iDesign4U POS</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
