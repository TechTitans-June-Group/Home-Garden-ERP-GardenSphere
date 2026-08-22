import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  FlaskConical,
  History,
  Leaf,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useStaff } from '../../context/StaffContext.jsx';
import { toast } from '../../context/ToastContext.jsx';
import { formatDate, formatPrice } from '../../utils/format.js';

const Hero = ({ kicker, title, subtitle, icon: Icon, action }) => (
  <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0F766E] via-[#0D9488] to-[#2DD4BF] p-6 text-white shadow-[0_20px_50px_rgba(13,148,136,0.22)] sm:p-8">
    <div className="gs-dot-vine pointer-events-none absolute inset-0 opacity-20" />
    <FlaskConical className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rotate-12 text-white/10" />
    <div className="relative flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-teal-100">
          <Icon size={14} /> {kicker}
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h2>
        <p className="mt-2 text-sm text-teal-50 sm:text-base">{subtitle}</p>
      </div>
      {action}
    </div>
  </section>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-teal-950/40 px-4" onClick={onClose} role="presentation">
    <div
      className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white shadow-xl border border-teal-50"
      onClick={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-start justify-between gap-3 border-b border-teal-50 bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <button type="button" className="rounded-full p-1 text-slate-500 hover:bg-white" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Toast = ({ notice }) =>
  notice ? (
    <div className="mb-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm">
      {notice}
    </div>
  ) : null;

export const FertilizersPage = () => {
  const { fertilizers, crops, staff } = useStaff();
  const [activeTab, setActiveTab] = useState('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // Modals visibility
  const [showStockModal, setShowStockModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);

  // Forms state
  const [stockForm, setStockForm] = useState({
    id: '',
    name: '',
    stock: 0,
    unit: 'KG',
    minStock: 5,
    description: '',
  });

  const [appForm, setAppForm] = useState({
    id: '',
    fertilizerId: '',
    crop: '',
    date: new Date().toISOString().slice(0, 10),
    quantity: '',
    cost: '',
    status: 'Scheduled',
    notes: '',
  });

  const showNotice = (text) => {
    toast.success(text);
    setNotice(text);
    setTimeout(() => setNotice(''), 3500);
  };

  // KPI calculations
  const stats = useMemo(() => {
    const stockList = fertilizers.stock || [];
    const appsList = fertilizers.items || [];

    const activeTasks = appsList.filter((a) => a.status === 'Scheduled').length;
    const lowStockCount = stockList.filter((f) => f.stock <= f.minStock).length;
    const totalCost = appsList
      .filter((a) => a.status === 'Applied')
      .reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

    return {
      activeTasks,
      lowStockCount,
      totalCost,
      totalApps: appsList.length,
    };
  }, [fertilizers.stock, fertilizers.items]);

  // Filters
  const filteredStock = useMemo(() => {
    const items = fertilizers.stock || [];
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (f) => f.name?.toLowerCase().includes(query) || f.description?.toLowerCase().includes(query)
    );
  }, [fertilizers.stock, searchQuery]);

  const filteredApps = useMemo(() => {
    const items = fertilizers.items || [];
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (a) =>
        a.name?.toLowerCase().includes(query) ||
        a.crop?.toLowerCase().includes(query) ||
        a.status?.toLowerCase().includes(query) ||
        a.notes?.toLowerCase().includes(query)
    );
  }, [fertilizers.items, searchQuery]);

  // Operations
  const handleSaveStock = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await fertilizers.saveStock(stockForm);
      setShowStockModal(false);
      showNotice(stockForm.id ? 'Fertilizer stock updated.' : 'New fertilizer added.');
    } catch (err) {
      setError(err.message || 'Failed to save fertilizer stock');
    }
  };

  const handleSaveApplication = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await fertilizers.save({
        ...appForm,
        quantity: Number(appForm.quantity),
        cost: appForm.cost ? Number(appForm.cost) : 0,
      });
      setShowAppModal(false);
      showNotice(appForm.id ? 'Fertilizer application updated.' : 'Fertilizer application recorded.');
    } catch (err) {
      setError(err.message || 'Failed to save application');
    }
  };

  const handleEditStock = (item) => {
    setStockForm({
      id: item.id,
      name: item.name,
      stock: item.stock,
      unit: item.unit,
      minStock: item.minStock,
      description: item.description,
    });
    setError('');
    setShowStockModal(true);
  };

  const handleEditApplication = (item) => {
    setAppForm({
      id: item.id,
      fertilizerId: item.fertilizerId,
      crop: item.crop,
      date: item.date,
      quantity: item.quantity,
      cost: item.cost || '',
      status: item.status,
      notes: item.notes,
    });
    setError('');
    setShowAppModal(true);
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fertilizer from stock? It will fail if there are past applications logged.')) return;
    try {
      await fertilizers.removeStock(id);
      showNotice('Fertilizer deleted.');
    } catch (err) {
      alert(err.message || 'Failed to delete fertilizer');
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application record? If it was marked as Applied, the quantity will be returned to stock.')) return;
    try {
      await fertilizers.remove(id);
      showNotice('Application record deleted.');
    } catch (err) {
      alert(err.message || 'Failed to delete application');
    }
  };

  const handleMarkApplied = async (item) => {
    setError('');
    try {
      await fertilizers.save({
        ...item,
        status: 'Applied',
      });
      showNotice(`Successfully applied ${item.quantity} ${item.unit || 'KG'} of ${item.name} to ${item.crop}!`);
    } catch (err) {
      alert(err.message || 'Failed to apply fertilizer');
    }
  };

  const isManager = ['admin', 'garden_manager'].includes(staff?.role);

  return (
    <div className="space-y-6">
      <Hero
        kicker="Ops Desk"
        title="Fertilizer Management"
        subtitle="Manage fertilizer inventory stock, track costs, schedule applications, and view crop application logs."
        icon={FlaskConical}
      />

      <Toast notice={notice} />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-teal-100 bg-white p-5 shadow-[0_10px_30px_rgba(13,148,136,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Scheduled Tasks</p>
          <p className="mt-1 text-2xl font-bold text-teal-800">{stats.activeTasks}</p>
          <p className="mt-1 text-xs text-slate-500">Upcoming applications</p>
        </article>
        <article className="rounded-3xl border border-teal-100 bg-white p-5 shadow-[0_10px_30px_rgba(13,148,136,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Low Stock Alert</p>
          <p className={`mt-1 text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {stats.lowStockCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Fertilizers under minimum stock</p>
        </article>
        <article className="rounded-3xl border border-teal-100 bg-white p-5 shadow-[0_10px_30px_rgba(13,148,136,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Total Fertilizer Cost</p>
          <p className="mt-1 text-2xl font-bold text-teal-700">{formatPrice(stats.totalCost)}</p>
          <p className="mt-1 text-xs text-slate-500">Total cost spent on applied fertilizer</p>
        </article>
        <article className="rounded-3xl border border-teal-100 bg-white p-5 shadow-[0_10px_30px_rgba(13,148,136,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Applications logged</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{stats.totalApps}</p>
          <p className="mt-1 text-xs text-slate-500">Schedules and history logs</p>
        </article>
      </div>

      {/* Tabs & Search controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-teal-50 pb-2">
        <div className="flex gap-2">
          {[
            { id: 'stock', label: 'Fertilizer Stock', icon: FlaskConical },
            { id: 'applications', label: 'Applications & Schedules', icon: Calendar },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-teal-800 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-teal-50/50 hover:text-teal-800'
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
              >
                <TabIcon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 items-center gap-3 justify-end max-w-md w-full">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 grid place-items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder={`Search ${activeTab === 'stock' ? 'fertilizers' : 'applications'}...`}
              className="w-full rounded-2xl border border-teal-100 bg-white py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isManager && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-teal-700 hover:to-emerald-650 shrink-0"
              onClick={() => {
                setError('');
                if (activeTab === 'stock') {
                  setStockForm({ id: '', name: '', stock: 0, unit: 'KG', minStock: 5, description: '' });
                  setShowStockModal(true);
                } else {
                  const fertList = fertilizers.stock || [];
                  const cropsList = crops.items || [];
                  setAppForm({
                    id: '',
                    fertilizerId: fertList?.[0]?.id || '',
                    crop: cropsList?.[0]?.name || '',
                    date: new Date().toISOString().slice(0, 10),
                    quantity: '',
                    cost: '',
                    status: 'Scheduled',
                    notes: '',
                  });
                  setShowAppModal(true);
                }
              }}
            >
              <Plus size={16} /> Add {activeTab === 'stock' ? 'Fertilizer' : 'Task'}
            </button>
          )}
        </div>
      </div>

      {/* Main Table Views */}
      <div className="overflow-hidden rounded-[24px] bg-white border border-teal-50 shadow-[0_10px_40px_rgba(13,148,136,0.03)]">
        {activeTab === 'stock' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#EBF5F3] text-slate-700 font-semibold border-b border-teal-50">
              <tr>
                <th className="px-5 py-3">Fertilizer Name</th>
                <th className="px-5 py-3">Stock Level</th>
                <th className="px-5 py-3">Minimum Stock</th>
                <th className="px-5 py-3">Description</th>
                {isManager && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {filteredStock.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 5 : 4} className="px-5 py-8 text-center text-slate-500">
                    No fertilizers registered in stock.
                  </td>
                </tr>
              ) : (
                filteredStock.map((item) => {
                  const isLow = item.stock <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          {item.name}
                          {isLow && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[9px] font-bold text-rose-700 uppercase tracking-wide">
                              <AlertTriangle size={10} /> Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-5 py-3 font-bold ${isLow ? 'text-rose-600' : 'text-teal-800'}`}>
                        {item.stock} {item.unit}
                      </td>
                      <td className="px-5 py-3 text-slate-600 font-medium">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{item.description || '--'}</td>
                      {isManager && (
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-3 text-xs font-semibold">
                            <button
                              type="button"
                              className="text-gs-primary"
                              onClick={() => handleEditStock(item)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-red-600"
                              onClick={() => handleDeleteStock(item.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'applications' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#EBF5F3] text-slate-700 font-semibold border-b border-teal-50">
              <tr>
                <th className="px-5 py-3">Fertilizer</th>
                <th className="px-5 py-3">Target Crop</th>
                <th className="px-5 py-3">Application Date</th>
                <th className="px-5 py-3">Applied Quantity</th>
                <th className="px-5 py-3">Cost</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actor / Notes</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                    No fertilizer application records found.
                  </td>
                </tr>
              ) : (
                filteredApps.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.fertilizerName || item.name}</td>
                    <td className="px-5 py-3 font-medium text-slate-700">{item.crop}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(item.date)}</td>
                    <td className="px-5 py-3 font-bold text-teal-800">
                      {item.quantity} {item.unit || 'KG'}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {item.cost ? formatPrice(item.cost) : '--'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                          item.status === 'Applied'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-700 text-xs">{item.recordedByName || 'System'}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs" title={item.notes}>
                        {item.notes || 'No notes'}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        {item.status === 'Scheduled' && (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 px-2 py-1 rounded-lg transition"
                            onClick={() => handleMarkApplied(item)}
                            title="Mark as Applied"
                          >
                            <Check size={12} /> Apply
                          </button>
                        )}
                        {isManager && (
                          <>
                            <button
                              type="button"
                              className="text-gs-primary"
                              onClick={() => handleEditApplication(item)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-red-600"
                              onClick={() => handleDeleteApplication(item.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* FERTILIZER STOCK MODAL */}
      {showStockModal && (
        <Modal
          title={stockForm.id ? 'Edit Fertilizer Stock' : 'Register New Fertilizer'}
          onClose={() => setShowStockModal(false)}
        >
          <form onSubmit={handleSaveStock} className="grid gap-4">
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <label className="text-sm font-medium text-slate-700">
              Fertilizer Name *
              <input
                type="text"
                placeholder="e.g. Compost mix"
                className="input-field mt-1 w-full"
                value={stockForm.name}
                onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
                required
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm font-medium text-slate-700 sm:col-span-1">
                Unit *
                <select
                  className="input-field mt-1 w-full"
                  value={stockForm.unit}
                  onChange={(e) => setStockForm({ ...stockForm, unit: e.target.value })}
                  required
                >
                  <option value="KG">KG</option>
                  <option value="L">L</option>
                  <option value="g">g</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-1">
                Stock Level *
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50"
                  className="input-field mt-1 w-full"
                  value={stockForm.stock}
                  onChange={(e) => setStockForm({ ...stockForm, stock: e.target.value })}
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-1">
                Min Stock *
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 10"
                  className="input-field mt-1 w-full"
                  value={stockForm.minStock}
                  onChange={(e) => setStockForm({ ...stockForm, minStock: e.target.value })}
                  required
                />
              </label>
            </div>

            <label className="text-sm font-medium text-slate-700">
              Description
              <textarea
                className="input-field mt-1 w-full h-20"
                placeholder="Nutrient values (N-P-K), supplier details, or application tips."
                value={stockForm.description}
                onChange={(e) => setStockForm({ ...stockForm, description: e.target.value })}
              />
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 py-3 font-semibold text-white shadow-md hover:from-teal-700 hover:to-emerald-650"
            >
              Save Fertilizer
            </button>
          </form>
        </Modal>
      )}

      {/* FERTILIZER APPLICATION MODAL */}
      {showAppModal && (
        <Modal
          title={appForm.id ? 'Edit Fertilizer Task' : 'Record Fertilizer Application'}
          onClose={() => setShowAppModal(false)}
        >
          <form onSubmit={handleSaveApplication} className="grid gap-4">
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <label className="text-sm font-medium text-slate-700">
              Select Fertilizer *
              <select
                className="input-field mt-1 w-full"
                value={appForm.fertilizerId}
                onChange={(e) => setAppForm({ ...appForm, fertilizerId: e.target.value })}
                required
              >
                <option value="">Select Fertilizer</option>
                {(fertilizers.stock || []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Stock: {f.stock} {f.unit})
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Target Crop / Plant *
              <select
                className="input-field mt-1 w-full"
                value={appForm.crop}
                onChange={(e) => setAppForm({ ...appForm, crop: e.target.value })}
                required
              >
                <option value="">Select Crop</option>
                {(crops.items || []).map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.variety ? `(${c.variety})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Application Date *
                <input
                  type="date"
                  className="input-field mt-1 w-full"
                  value={appForm.date}
                  onChange={(e) => setAppForm({ ...appForm, date: e.target.value })}
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Status *
                <select
                  className="input-field mt-1 w-full"
                  value={appForm.status}
                  onChange={(e) => setAppForm({ ...appForm, status: e.target.value })}
                  required
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Applied">Applied</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Quantity *
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  placeholder="e.g. 5"
                  className="input-field mt-1 w-full"
                  value={appForm.quantity}
                  onChange={(e) => setAppForm({ ...appForm, quantity: e.target.value })}
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Cost (Rupees)
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  className="input-field mt-1 w-full"
                  value={appForm.cost}
                  onChange={(e) => setAppForm({ ...appForm, cost: e.target.value })}
                />
              </label>
            </div>

            <label className="text-sm font-medium text-slate-700">
              Notes
              <textarea
                className="input-field mt-1 w-full h-20"
                placeholder="Specific application areas, watering after applying, or health remarks."
                value={appForm.notes}
                onChange={(e) => setAppForm({ ...appForm, notes: e.target.value })}
              />
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 py-3 font-semibold text-white shadow-md hover:from-teal-700 hover:to-emerald-650"
            >
              Save Application Record
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default FertilizersPage;
