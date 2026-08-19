import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Leaf, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { formatDateTime } from '../utils/format.js';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/orders', label: 'My Orders' },
  { to: '/garden-design', label: 'Design Garden' },
  { to: '/garden', label: 'Garden Info' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const { user, logout, notifications, unreadCount, markRead, markAllRead } = useCustomer();
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotes, setOpenNotes] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const notesRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (event) => {
      if (notesRef.current && !notesRef.current.contains(event.target)) setOpenNotes(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setOpenProfile(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = () => {
    logout();
    setOpenProfile(false);
    setOpenMenu(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gs-deep text-white shadow-card">
            <Leaf size={20} />
          </span>
          <span className="font-display text-xl text-gs-deep">GardenSphere</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gs-deep lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'text-gs-primary' : 'hover:text-gs-primary'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notesRef}>
            <button
              type="button"
              onClick={() => setOpenNotes((prev) => !prev)}
              className="relative rounded-full border border-emerald-100 p-2 text-gs-deep hover:bg-gs-light"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gs-orange px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {openNotes && (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-card">
                <div className="flex items-center justify-between border-b border-emerald-50 px-4 py-3">
                  <p className="font-semibold">Notifications</p>
                  <button type="button" className="text-xs text-gs-primary" onClick={markAllRead}>
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => markRead(item.id)}
                      className={`block w-full px-4 py-3 text-left ${item.read ? 'bg-white' : 'bg-gs-light/70'}`}
                    >
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-emerald-800/80">{item.description}</p>
                      <p className="mt-1 text-[11px] text-emerald-600">{formatDateTime(item.time)}</p>
                    </button>
                  ))}
                </div>
                <Link
                  to="/notifications"
                  onClick={() => setOpenNotes(false)}
                  className="block border-t border-emerald-50 py-3 text-center text-sm font-semibold text-gs-primary"
                >
                  View all
                </Link>
              </div>
            )}
          </div>

          {user ? (
            <div className="relative hidden sm:block" ref={profileRef}>
              <button
                type="button"
                onClick={() => setOpenProfile((prev) => !prev)}
                className="flex items-center gap-2 rounded-full bg-gs-light px-3 py-2 text-sm font-semibold text-gs-deep"
              >
                <UserRound size={16} />
                {user.name.split(' ')[0]}
                <ChevronDown size={14} />
              </button>
              {openProfile && (
                <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-card">
                  <Link to="/profile" onClick={() => setOpenProfile(false)} className="block px-4 py-3 text-sm hover:bg-gs-light">
                    Profile
                  </Link>
                  <Link to="/orders" onClick={() => setOpenProfile(false)} className="block px-4 py-3 text-sm hover:bg-gs-light">
                    My Orders
                  </Link>
                  <Link to="/history" onClick={() => setOpenProfile(false)} className="block px-4 py-3 text-sm hover:bg-gs-light">
                    Order History
                  </Link>
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn-secondary !px-4 !py-2">
                Login
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2">
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            className="rounded-full border border-emerald-100 p-2 lg:hidden"
            onClick={() => setOpenMenu((prev) => !prev)}
            aria-label="Menu"
          >
            {openMenu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {openMenu && (
        <div className="border-t border-emerald-100 bg-white px-4 py-4 lg:hidden">
          <div className="grid gap-2 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpenMenu(false)} className="rounded-xl px-3 py-2 hover:bg-gs-light">
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpenMenu(false)} className="rounded-xl px-3 py-2 hover:bg-gs-light">
                  Profile
                </Link>
                <button type="button" onClick={handleLogout} className="rounded-xl px-3 py-2 text-left text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link to="/login" onClick={() => setOpenMenu(false)} className="btn-secondary flex-1">
                  Login
                </Link>
                <Link to="/register" onClick={() => setOpenMenu(false)} className="btn-primary flex-1">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
