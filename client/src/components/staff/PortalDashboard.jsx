import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, ShoppingBag, Wheat } from 'lucide-react';
import { useStaff } from '../../context/StaffContext.jsx';
import { canAccessPath } from '../../data/staffData.js';
import { toast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/format.js';

const HubCard = ({ module }) => {
  const Icon = module.icon;
  return (
    <article className="flex h-full flex-col rounded-[28px] bg-white p-6 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${module.tint}`}>
        <Icon size={20} />
      </span>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{module.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{module.description}</p>
      {module.comingSoon ? (
        <p className="mt-5 text-sm font-semibold text-amber-600">Coming soon</p>
      ) : (
        <Link
          to={module.to}
          className="mt-5 inline-flex w-fit rounded-full bg-[#16A34A] px-5 py-2 text-sm font-semibold text-white hover:bg-[#14532D]"
        >
          View
        </Link>
      )}
    </article>
  );
};

const STATUS_TINT = {
  Pending: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-sky-100 text-sky-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-rose-100 text-rose-700',
};

const PortalDashboard = ({ title, greeting, stats = [], modules = [], quickTo }) => {
  const { staff, purchases, sales, harvests, permissions } = useStaff();
  const visibleModules = modules.filter((module) => canAccessPath(permissions, staff?.role, module.to));
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [note, setNote] = useState(() => localStorage.getItem('gs_staff_note') || '');
  const [saved, setSaved] = useState(false);
  const hasModules = visibleModules.length > 0;

  useEffect(() => {
    const load = () => {
      purchases.refresh?.().catch(() => {});
      harvests.refresh?.().catch(() => {});
    };
    load();
    const timer = window.setInterval(load, 8000);
    return () => window.clearInterval(timer);
    // Refresh live shop/harvest numbers while the dashboard is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff?.id]);

  const shopOrders = (purchases.items || []).filter((row) => (row.source || 'supplier') === 'customer');
  const openOrders = shopOrders.filter((row) => row.status === 'Pending' || row.status === 'Confirmed');
  const openSales = (sales.items || []).filter((row) => row.status === 'Pending' || row.status === 'Confirmed');
  const latestOrders = [...openOrders].slice(0, 3);
  const latestSales = [...openSales].slice(0, 3);
  const canPurchases = ['admin', 'inventory_manager', 'garden_manager'].includes(staff?.role);
  const canSales = ['admin', 'garden_manager'].includes(staff?.role);
  const orderTo = canPurchases ? '/staff/purchases' : '/staff';
  const saleTo = canSales ? '/staff/sales' : staff?.role === 'gardener' ? '/staff/record-harvest' : '/staff/income';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return visibleModules.filter((item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
  }, [query, visibleModules]);

  const saveNote = () => {
    localStorage.setItem('gs_staff_note', note);
    setSaved(true);
    toast.success('Note saved', 'Your dashboard reminder was updated.');
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{title}</h1>
          <p className="mt-2 text-slate-500">{greeting}</p>
        </div>
          {quickTo && canAccessPath(permissions, staff?.role, quickTo) && (
            <button
              type="button"
              onClick={() => navigate(quickTo)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#16A34A] to-[#84CC16] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(22,163,74,0.28)]"
            >
              <Plus size={16} /> Quick Action
            </button>
          )}
      </div>

      <div className={`mt-6 grid gap-3 ${stats.length + 2 > 3 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3'}`}>
        {[
          { label: 'Open shop orders', value: String(openOrders.length) },
          { label: 'Open harvest sales', value: String(openSales.length) },
          ...stats,
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-white/80 bg-white/80 px-5 py-4 shadow-[0_8px_24px_rgba(20,83,45,0.04)]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">{stat.value}</p>
          </article>
        ))}
      </div>

      {hasModules && (
      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1fr_300px]">
        <section>
          <h2 className="text-xl font-bold text-slate-900">Operations hub</h2>
          <p className="mt-1 text-sm text-slate-500">Open a GardenSphere module to manage records.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {visibleModules.map((module) => (
              <HubCard key={module.to} module={module} />
            ))}
          </div>
        </section>

        <aside className="grid gap-4">
          <article className="rounded-[28px] bg-gradient-to-br from-[#14532D] via-[#15803D] to-[#84CC16] p-5 text-white shadow-[0_16px_40px_rgba(20,83,45,0.22)]">
            <h3 className="font-bold">Quick search</h3>
            <p className="mt-1 text-sm text-emerald-50/90">Find a module instantly.</p>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-3 text-emerald-600" size={16} />
              <input
                className="w-full rounded-2xl border-0 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none"
                placeholder="Search modules..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            {filtered.length > 0 && (
              <div className="mt-3 grid gap-2">
                {filtered.map((item) =>
                  item.comingSoon ? (
                    <span key={item.to} className="rounded-xl bg-white/15 px-3 py-2 text-sm">
                      {item.title} · Coming soon
                    </span>
                  ) : (
                    <Link key={item.to} to={item.to} className="rounded-xl bg-white/15 px-3 py-2 text-sm hover:bg-white/25">
                      {item.title}
                    </Link>
                  )
                )}
              </div>
            )}
          </article>

          <article className="rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
            <h3 className="font-bold text-slate-900">Live orders</h3>
            <p className="mt-1 text-xs text-slate-500">Shop orders and harvest sales update here.</p>
            <div className="mt-3 grid gap-2">
              {latestOrders.length === 0 && latestSales.length === 0 ? (
                <p className="rounded-2xl bg-[#F8FAF7] px-3 py-2 text-sm text-slate-500">No open customer orders right now.</p>
              ) : null}
              {latestOrders.map((row) => (
                <Link
                  key={row.id || row.orderRef}
                  to={orderTo}
                  className="rounded-2xl bg-[#F8FAF7] px-3 py-2 hover:bg-emerald-50"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ShoppingBag size={14} className="text-emerald-600" />
                    {row.item || row.itemName}
                  </p>
                  <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{row.customerName || row.supplier} · {row.orderRef || 'Shop'}</span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_TINT[row.status] || 'bg-slate-100 text-slate-600'}`}>
                      {row.status}
                    </span>
                  </p>
                </Link>
              ))}
              {latestSales.map((row) => (
                <Link
                  key={row.id}
                  to={saleTo}
                  className="rounded-2xl bg-[#F8FAF7] px-3 py-2 hover:bg-emerald-50"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Wheat size={14} className="text-amber-600" />
                    {row.crop}
                  </p>
                  <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{row.customer} · {formatPrice(row.amount)}</span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_TINT[row.status] || 'bg-slate-100 text-slate-600'}`}>
                      {row.status}
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
            <h3 className="font-bold text-slate-900">Quick note</h3>
            <textarea
              className="mt-3 min-h-32 w-full resize-none rounded-2xl border border-emerald-100 bg-[#F8FAF7] p-3 text-sm outline-none focus:border-emerald-400"
              placeholder="Garden reminders, harvest notes, shift tasks..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <button type="button" onClick={saveNote} className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {saved ? 'Saved' : 'Save note'}
            </button>
          </article>

          <article className="overflow-hidden rounded-[28px] shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
            <img
              src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=700&q=80"
              alt="GardenSphere beds"
              className="h-36 w-full object-cover"
            />
            <p className="bg-white px-4 py-3 text-xs text-slate-500">Signed in as {staff.name}</p>
          </article>
        </aside>
      </div>
      )}
    </div>
  );
};

export default PortalDashboard;
