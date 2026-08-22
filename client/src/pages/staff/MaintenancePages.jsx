import { useEffect, useMemo, useState } from 'react';
import { Check, Leaf, Plus, Search, X } from 'lucide-react';
import { useStaff } from '../../context/StaffContext.jsx';
import { toast } from '../../context/ToastContext.jsx';
import { formatDate } from '../../utils/format.js';
import {
  MAINTENANCE_LOCATIONS,
  MAINTENANCE_STATUSES,
  MAINTENANCE_TYPES,
  STATUS_TINTS,
  blankMaintenance,
} from '../../utils/maintenance.js';

const Hero = ({ overdue, action }) => (
  <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#14532D] via-[#15803D] to-[#84CC16] p-6 text-white shadow-[0_20px_50px_rgba(20,83,45,0.22)] sm:p-8">
    <div className="gs-dot-vine pointer-events-none absolute inset-0 opacity-20" />
    <Leaf className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rotate-12 text-white/10" />
    <div className="relative flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-lime-100">
          <Leaf size={14} /> Garden care
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">Maintenance log</h2>
        <p className="mt-2 text-sm text-emerald-50 sm:text-base">
          Record mulching, weeding, staking, pruning, and other garden care. Mark work done when the bed is finished.
          {overdue ? ` ${overdue} overdue ${overdue === 1 ? 'job' : 'jobs'} need attention.` : ''}
        </p>
      </div>
      {action}
    </div>
  </section>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-[#14532D]/45 px-4" onClick={onClose} role="presentation">
    <div
      className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white shadow-[0_24px_60px_rgba(20,83,45,0.25)]"
      onClick={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-start justify-between gap-3 border-b border-emerald-50 bg-gradient-to-r from-emerald-50 to-lime-50 px-6 py-4">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <button type="button" className="rounded-full p-1 text-slate-500 hover:bg-white" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const MaintenancePage = () => {
  const { staff, maintenance, crops } = useStaff();
  const canManage = ['admin', 'garden_manager'].includes(staff?.role);
  const [form, setForm] = useState(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [location, setLocation] = useState('All');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    maintenance.refresh?.().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = (message) => {
    toast.success(message);
    setNotice(message);
    setTimeout(() => setNotice(''), 2200);
  };

  const types = maintenance.types?.length ? maintenance.types : MAINTENANCE_TYPES;
  const statuses = maintenance.statuses?.length ? maintenance.statuses : MAINTENANCE_STATUSES;
  const locations = maintenance.locations?.length ? maintenance.locations : MAINTENANCE_LOCATIONS;
  const cropNames = (crops.items || []).map((crop) => crop.name).filter(Boolean);
  const summary = maintenance.summary || { total: 0, due: 0, overdue: 0, done: 0 };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (maintenance.items || []).filter((row) => {
      const matchesType = type === 'All' || row.type === type;
      const matchesStatus = status === 'All' || row.status === status;
      const matchesLocation = location === 'All' || row.location === location;
      const haystack = `${row.type} ${row.location} ${row.crop} ${row.notes} ${row.recordedByName}`.toLowerCase();
      return matchesType && matchesStatus && matchesLocation && (!needle || haystack.includes(needle));
    });
  }, [location, maintenance.items, query, status, type]);

  const openCreate = () => {
    setError('');
    setForm(blankMaintenance());
  };

  const openEdit = (row) => {
    setError('');
    setForm({ ...row });
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await maintenance.save(form);
      setForm(null);
      flash(form.id ? 'Maintenance record updated.' : 'Maintenance activity recorded.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const markDone = async (row) => {
    try {
      await maintenance.save({ ...row, status: 'Done' });
      flash(`${row.type} marked done.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this maintenance record?')) return;
    try {
      await maintenance.remove(id);
      setForm(null);
      flash('Maintenance record deleted.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <Hero
        overdue={summary.overdue}
        action={
          <button type="button" className="btn-primary inline-flex items-center gap-2 bg-white text-emerald-800 hover:bg-lime-50" onClick={openCreate}>
            <Plus size={16} /> Record activity
          </button>
        }
      />

      {notice && (
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 px-4 py-3 text-sm font-semibold text-white shadow-sm">
          {notice}
        </div>
      )}
      {error && !form && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Records</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{summary.total}</p>
          <p className="mt-1 text-xs text-slate-500">{canManage ? 'All garden care logs' : 'Your recorded work'}</p>
        </article>
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Due</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{summary.due}</p>
          <p className="mt-1 text-xs text-slate-500">Still waiting to be finished</p>
        </article>
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Overdue</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">{summary.overdue}</p>
          <p className="mt-1 text-xs text-slate-500">Past the planned date</p>
        </article>
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Done</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.done}</p>
          <p className="mt-1 text-xs text-slate-500">Completed garden care</p>
        </article>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="input-field pl-9"
            placeholder="Search activity, crop, bed, or notes"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select className="input-field w-40" value={type} onChange={(event) => setType(event.target.value)}>
          <option>All</option>
          {types.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select className="input-field w-32" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option>All</option>
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select className="input-field w-40" value={location} onChange={(event) => setLocation(event.target.value)}>
          <option>All</option>
          {locations.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-[11px] uppercase tracking-[0.14em] text-emerald-800">
            <tr>
              <th className="px-5 py-3">Activity</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Place</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">By</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  No maintenance records yet.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-t border-emerald-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{row.type}</p>
                    <p className="line-clamp-1 text-xs text-slate-500">{row.notes || 'No notes'}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(row.date)}</td>
                  <td className="px-5 py-4">
                    <p>{row.location || '—'}</p>
                    <p className="text-xs text-slate-500">{row.crop || 'Any crop'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.overdue ? 'bg-rose-100 text-rose-800' : STATUS_TINTS[row.status]}`}>
                      {row.overdue ? 'Overdue' : row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{row.recordedByName || '—'}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {row.status === 'Due' && (
                        <button type="button" className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800" onClick={() => markDone(row)}>
                          <span className="inline-flex items-center gap-1">
                            <Check size={12} /> Done
                          </span>
                        </button>
                      )}
                      <button type="button" className="text-xs font-semibold text-emerald-700" onClick={() => openEdit(row)}>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={form.id ? 'Update activity' : 'Record activity'} onClose={() => setForm(null)}>
          <form className="grid gap-3" onSubmit={save}>
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <label className="text-sm font-medium">
              Activity
              <select className="input-field mt-1" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                {types.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Date
                <input type="date" className="input-field mt-1" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
              </label>
              <label className="text-sm font-medium">
                Status
                <select className="input-field mt-1" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  {statuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="text-sm font-medium">
              Location / bed
              <input
                className="input-field mt-1"
                list="maintenance-locations"
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                placeholder="Bed A1"
              />
              <datalist id="maintenance-locations">
                {locations.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </label>
            <label className="text-sm font-medium">
              Crop (optional)
              <input
                className="input-field mt-1"
                list="maintenance-crops"
                value={form.crop}
                onChange={(event) => setForm({ ...form, crop: event.target.value })}
                placeholder="Tomato"
              />
              <datalist id="maintenance-crops">
                {cropNames.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </label>
            <label className="text-sm font-medium">
              Notes
              <textarea className="input-field mt-1 min-h-24" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>
            <div className="mt-2 flex flex-wrap gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={busy}>
                {form.id ? 'Save changes' : 'Save activity'}
              </button>
              {canManage && form.id && (
                <button type="button" className="w-full text-sm font-semibold text-red-600" onClick={() => remove(form.id)}>
                  Delete
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MaintenancePage;
