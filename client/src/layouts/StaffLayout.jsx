import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Leaf, LogOut, Menu, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { useStaff } from '../context/StaffContext.jsx';
import { ROLE_LABELS } from '../data/staffData.js';
import { pageTitles, staffMenus } from '../data/staffNav.js';

const StaffLayout = () => {
  const { staff, logout } = useStaff();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const groups = staffMenus[staff.role] || [];
  const title = pageTitles[location.pathname] || 'Overview';

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  return (
    <div className="min-h-screen bg-[#F3F7F1] lg:grid lg:grid-cols-[250px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-emerald-100/80 bg-white lg:static ${
          open ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#14532D] text-white">
              <Leaf size={20} />
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

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {groups.map((group) => (
            <div key={group.group} className="mb-5">
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{group.group}</p>
              <div className="grid gap-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to + item.label}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-r-2xl px-3 py-2.5 text-sm font-medium ${
                        isActive
                          ? 'border-l-4 border-[#16A34A] bg-[#E7F8EC] text-[#15803D]'
                          : 'border-l-4 border-transparent text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <item.icon size={17} />
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

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-3 px-4 py-4 lg:px-8">
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
            <button type="button" className="relative rounded-2xl bg-white p-2.5 text-slate-500 shadow-sm" aria-label="Notifications">
              <Bell size={16} />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#16A34A] text-[10px] font-bold text-white">
                3
              </span>
            </button>
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
        <main className="flex-1 px-4 pb-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
