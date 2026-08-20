import { Link } from 'react-router-dom';
import { Leaf, Mail, MapPin, Phone } from 'lucide-react';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm6.2-.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1zM12 9.2A2.8 2.8 0 1 1 9.2 12 2.8 2.8 0 0 1 12 9.2z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3zm4.7 12.6c-.2.6-1.1 1-1.7 1.1-.5.1-1 .2-3.2-.7-2.7-1.1-4.4-3.8-4.5-4-.2-.2-1.3-1.7-1.3-3.3s.8-2.3 1.1-2.6a1.2 1.2 0 0 1 .9-.4h.6c.2 0 .4 0 .6.5l.8 2c.1.2 0 .4-.1.6l-.4.5c-.2.2-.3.3-.1.6a7.4 7.4 0 0 0 1.4 1.7 6.7 6.7 0 0 0 1.9 1.2c.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.4s0 1.2-.5 1.8z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="mt-auto bg-[#14532D] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div>
          <div className="flex items-center gap-2">
            <Leaf />
            <span className="font-display text-2xl">GardenSphere</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-emerald-100">
            Fresh harvest from a carefully managed home garden, brought to customers with harvest dates,
            quality grades, and simple ordering.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="https://facebook.com" className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="https://instagram.com" className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://wa.me/94771234567" className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="WhatsApp">
              <WhatsAppIcon />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white">Quick Links</h3>
          <div className="mt-4 grid gap-2 text-sm text-emerald-100">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/shop" className="hover:text-white">Shop</Link>
            <Link to="/orders" className="hover:text-white">My Orders</Link>
            <Link to="/garden-design" className="hover:text-white">Design Garden</Link>
            <Link to="/garden" className="hover:text-white">Garden Info</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white">Customer</h3>
          <div className="mt-4 grid gap-2 text-sm text-emerald-100">
            <Link to="/login" className="hover:text-white">Login</Link>
            <Link to="/register" className="hover:text-white">Register</Link>
            <Link to="/notifications" className="hover:text-white">Notifications</Link>
            <Link to="/history" className="hover:text-white">Order History</Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white">Contact</h3>
          <div className="mt-4 grid gap-3 text-sm text-emerald-100">
            <p className="flex items-center gap-2">
              <Phone size={16} /> 077 123 4567
            </p>
            <p className="flex items-center gap-2">
              <Mail size={16} /> hello@gardensphere.lk
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} /> GardenSphere Home Garden, Kandy
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 py-5 text-center text-sm text-emerald-100">
        © {new Date().getFullYear()} GardenSphere · EGOTECHWORLD PVT LTD · Grow Smarter. Manage Better.
      </div>
    </footer>
  );
};

export default Footer;
