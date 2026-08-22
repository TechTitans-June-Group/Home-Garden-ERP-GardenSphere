import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Leaf, LogOut, Menu, RefreshCw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useStaff } from '../context/StaffContext.jsx';
import { ROLE_LABELS, canAccessPath } from '../data/staffData.js';
import { pageTitles, staffMenus } from '../data/staffNav.js';
import { formatDateTime } from '../utils/format.js';

const StaffLayout = () => {
  const { staff, logout, notifications, unreadNotifications, markNotificationRead, markAllNotificationsRead, permissions } = useStaff();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const mainRef = useRef(null);
  const notesRef = useRef(null);
  const roleGroups = (staffMenus[staff.role] || [])
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.end || canAccessPath(permissions, staff.role, item.to)),
    }))
    .filter((group) => group.items.length);
  const knownPaths = new Set(roleGroups.flatMap((group) => group.items.map((item) => item.to)));
  const extras = Object.values(staffMenus)
    .flatMap((groups) => groups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.group }))))
    .filter(
      (item, index, rows) =>
        !item.end &&
        !knownPaths.has(item.to) &&
        canAccessPath(permissions, staff.role, item.to) &&
        rows.findIndex((row) => row.to === item.to) === index
    );
  const groups = extras.length
    ? [...roleGroups, { group: 'EXTRA ACCESS', items: extras }]
    : roleGroups;
  const title = pageTitles[location.pathname] || 'Overview';

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (event) => {
      if (notesRef.current && !notesRef.current.contains(event.target)) setNotesOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F3F7F1] lg:grid lg:grid-cols-[250px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[250px] flex-col border-r border-emerald-100/80 bg-white lg:static ${
          open ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#14532D] text-white">
              <Leaf size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">GardenSphere</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
                {ROLE_LABELS[staff.role]} portal
              </p>
            </div>
          </div>
          <button type="button" className="lg:hidden" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
          {groups.map((group) => (
            <div key={group.group} className="mb-3">
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{group.group}</p>
              <div className="grid gap-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to + item.label}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-r-2xl px-3 py-1.5 text-sm font-medium ${
                        isActive
                          ? 'border-l-4 border-[#16A34A] bg-[#E7F8EC] text-[#15803D]'
                          : 'border-l-4 border-transparent text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-emerald-50 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-2xl bg-white p-2 shadow-sm lg:hidden" onClick={() => setOpen(true)}>
              <Menu size={18} />
            </button>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-white p-2.5 text-slate-500 shadow-sm hover:text-emerald-700"
              aria-label="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <div className="relative" ref={notesRef}>
              <button
                type="button"
                className="relative rounded-2xl bg-white p-2.5 text-slate-500 shadow-sm hover:text-emerald-700"
                aria-label="Notifications"
                onClick={() => setNotesOpen((value) => !value)}
              >
                <Bell size={16} />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#16A34A] px-1 text-[10px] font-bold text-white">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              {notesOpen && (
                <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-lg">
                  <div className="flex items-center justify-between border-b border-emerald-50 px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">Notifications</p>
                    {unreadNotifications > 0 && (
                      <button type="button" className="text-xs font-semibold text-gs-primary" onClick={markAllNotificationsRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p className="px-4 py-6 text-center text-sm text-slate-500">No alerts yet.</p>
                    )}
                    {notifications.slice(0, 12).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`block w-full px-4 py-3 text-left ${item.read ? 'bg-white' : 'bg-[#F3F7F1]'}`}
                        onClick={() => {
                          markNotificationRead(item.id);
                          setNotesOpen(false);
                          if (item.to) navigate(item.to);
                        }}
                      >
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                        <p className="mt-1 text-[11px] text-emerald-600">{formatDateTime(item.time)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 shadow-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#14532D] text-sm font-bold text-white">
                {staff.name.charAt(0)}
              </span>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-4 text-slate-900">{staff.name}</p>
                <p className="text-xs text-slate-500">{ROLE_LABELS[staff.role]}</p>
              </div>
            </div>
          </div>
        </header>
        <main ref={mainRef} className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;

