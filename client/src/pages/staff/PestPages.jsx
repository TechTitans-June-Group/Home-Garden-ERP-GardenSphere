import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bug,
  Calendar,
  CheckCircle,
  ChevronDown,
  Leaf,
  Plus,
  Search,
  ShieldAlert,
  Stethoscope,
  X,
  Zap,
} from 'lucide-react';
import { useStaff } from '../../context/StaffContext.jsx';
import { toast } from '../../context/ToastContext.jsx';
import { formatDate } from '../../utils/format.js';

// ─── Design tokens ────────────────────────────────────────────────────────────

const SEVERITY_META = {
  Low:      { color: 'bg-emerald-100 text-emerald-800 border-emerald-200',   dot: 'bg-emerald-500' },
  Medium:   { color: 'bg-amber-100 text-amber-800 border-amber-200',         dot: 'bg-amber-500' },
  High:     { color: 'bg-orange-100 text-orange-800 border-orange-200',      dot: 'bg-orange-500' },
  Critical: { color: 'bg-red-100 text-red-800 border-red-200',               dot: 'bg-red-500' },
};

const STATUS_META = {
  Active:      { color: 'bg-red-100 text-red-800 border-red-200' },
  'In Progress':{ color: 'bg-amber-100 text-amber-800 border-amber-200' },
  Monitoring:  { color: 'bg-blue-100 text-blue-800 border-blue-200' },
  Resolved:    { color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

const TYPE_META = {
  Pest:        { icon: Bug,            color: 'text-rose-600' },
  Disease:     { icon: Stethoscope,    color: 'text-purple-600' },
  Deficiency:  { icon: Leaf,           color: 'text-amber-600' },
  Other:       { icon: AlertTriangle,  color: 'text-slate-500' },
};

const ISSUE_TYPES  = ['Pest', 'Disease', 'Deficiency', 'Other'];
const SEVERITIES   = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES     = ['Active', 'In Progress', 'Monitoring', 'Resolved'];

// ─── Shared components ────────────────────────────────────────────────────────

const Hero = ({ kicker, title, subtitle, action }) => (
  <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#A855F7] p-6 text-white shadow-[0_20px_50px_rgba(109,40,217,0.25)] sm:p-8">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),transparent)]" />
    <Bug className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rotate-12 text-white/10" />
    <div className="relative flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-200">
          <ShieldAlert size={14} /> {kicker}
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h2>
        <p className="mt-2 text-sm text-violet-100 sm:text-base">{subtitle}</p>
      </div>
      {action}
    </div>
  </section>
);

const Modal = ({ title, children, onClose, wide }) => (
  <div
    className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 px-4 py-6"
    onClick={onClose}
    role="presentation"
  >
    <div
      className={`max-h-[92vh] w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} overflow-y-auto rounded-[28px] bg-white shadow-xl border border-violet-50`}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-start justify-between gap-3 border-b border-violet-50 bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <button type="button" className="rounded-full p-1 text-slate-500 hover:bg-white" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Toast = ({ notice, error }) => {
  if (error) return (
    <div className="mb-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-sm">
      {error}
    </div>
  );
  if (notice) return (
    <div className="mb-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-sm">
      {notice}
    </div>
  );
  return null;
};

const SeverityBadge = ({ severity }) => {
  const meta = SEVERITY_META[severity] || SEVERITY_META.Low;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {severity}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.Active;
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>
      {status}
    </span>
  );
};

const TypeIcon = ({ type, size = 16 }) => {
  const meta = TYPE_META[type] || TYPE_META.Other;
  const Icon = meta.icon;
  return <Icon size={size} className={meta.color} />;
};

// ─── Shared Form Component ────────────────────────────────────────────────────

const PestForm = ({ form, setForm, onSubmit, crops, error, submitLabel = 'Save Record', isReport = false }) => (
  <form onSubmit={onSubmit} className="grid gap-4">
    {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">
        Issue / Problem Name *
        <input
          type="text"
          className="input-field mt-1 w-full"
          placeholder="e.g. Aphids, Leaf Spot, Root Rot"
          value={form.issue}
          onChange={(e) => setForm({ ...form, issue: e.target.value })}
          required
        />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Problem Type *
        <select
          className="input-field mt-1 w-full"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          required
        >
          {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">
        Affected Crop *
        <select
          className="input-field mt-1 w-full"
          value={form.crop}
          onChange={(e) => setForm({ ...form, crop: e.target.value })}
          required
        >
          <option value="">Select Crop</option>
          {(crops?.items || []).map((c) => (
            <option key={c.id} value={c.name}>{c.name}{c.variety ? ` (${c.variety})` : ''}</option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium text-slate-700">
        Location / Bed
        <input
          type="text"
          className="input-field mt-1 w-full"
          placeholder="e.g. Bed A1, Greenhouse 2"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </label>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">
        Severity *
        <select
          className="input-field mt-1 w-full"
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: e.target.value })}
          required
        >
          {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>

      <label className="text-sm font-medium text-slate-700">
        Date Detected *
        <input
          type="date"
          className="input-field mt-1 w-full"
          value={form.dateDetected}
          onChange={(e) => setForm({ ...form, dateDetected: e.target.value })}
          required
        />
      </label>
    </div>

    <label className="text-sm font-medium text-slate-700">
      Treatment Applied / Recommended
      <input
        type="text"
        className="input-field mt-1 w-full"
        placeholder="e.g. Neem oil spray, Remove affected leaves"
        value={form.treatment}
        onChange={(e) => setForm({ ...form, treatment: e.target.value })}
      />
    </label>

    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">
        Treatment Date
        <input
          type="date"
          className="input-field mt-1 w-full"
          value={form.treatmentDate}
          onChange={(e) => setForm({ ...form, treatmentDate: e.target.value })}
        />
      </label>

      {!isReport && (
        <label className="text-sm font-medium text-slate-700">
          Status *
          <select
            className="input-field mt-1 w-full"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            required
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      )}
    </div>

    <label className="text-sm font-medium text-slate-700">
      Notes / Observations
      <textarea
        className="input-field mt-1 w-full h-20"
        placeholder="Describe the symptoms, spread, and any other relevant observations."
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
    </label>

    <button
      type="submit"
      className="mt-2 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 py-3 font-semibold text-white shadow-md hover:from-violet-700 hover:to-purple-600 transition"
    >
      {submitLabel}
    </button>
  </form>
);

const emptyForm = () => ({
  id: '',
  issue: '',
  type: 'Pest',
  crop: '',
  location: '',
  severity: 'Medium',
  dateDetected: new Date().toISOString().slice(0, 10),
  treatment: '',
  treatmentDate: '',
  status: 'Active',
  notes: '',
});

// ─── Detail Drawer ─────────────────────────────────────────────────────────────

const DetailDrawer = ({ record, onClose, onEdit, isManager }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 px-0"
    onClick={onClose}
    role="presentation"
  >
    <div
      className="relative h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-violet-50 bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
            <TypeIcon type={record.type} size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-500">{record.type}</p>
            <h3 className="text-lg font-bold text-slate-900">{record.issue}</h3>
          </div>
        </div>
        <button type="button" className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-700" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="space-y-5 p-6">
        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          <SeverityBadge severity={record.severity} />
          <StatusBadge status={record.status} />
        </div>

        {/* Key details */}
        <div className="grid gap-3 rounded-2xl border border-violet-50 bg-violet-50/30 p-4 text-sm">
          {[
            { label: 'Affected Crop', value: record.crop },
            { label: 'Location / Bed', value: record.location || '—' },
            { label: 'Date Detected', value: record.dateDetected ? formatDate(record.dateDetected) : '—' },
            { label: 'Reported By', value: record.reportedByName || 'System' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-2">
              <span className="font-medium text-slate-500">{label}</span>
              <span className="text-right font-semibold text-slate-800">{value}</span>
            </div>
          ))}
        </div>

        {/* Treatment */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">Treatment</p>
          {record.treatment ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">{record.treatment}</p>
              {record.treatmentDate && (
                <p className="mt-1 text-xs text-emerald-700">Applied: {formatDate(record.treatmentDate)}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No treatment recorded yet.</p>
          )}
        </div>

        {/* Notes */}
        {record.notes && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">Notes / Observations</p>
            <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">{record.notes}</p>
          </div>
        )}

        {isManager && (
          <button
            type="button"
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 py-3 font-semibold text-white shadow-md hover:from-violet-700 hover:to-purple-600 transition"
            onClick={() => { onEdit(record); onClose(); }}
          >
            Edit Record
          </button>
        )}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. MANAGER VIEW: /staff/pests
// ─────────────────────────────────────────────────────────────────────────────

export const PestPage = () => {
  const { pests, crops, staff } = useStaff();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const showNotice = (text) => { toast.success(text); setNotice(text); setTimeout(() => setNotice(''), 3500); };
  const isManager = ['admin', 'garden_manager'].includes(staff?.role);

  const stats = useMemo(() => {
    const list = pests.items || [];
    return {
      total: list.length,
      active: list.filter((r) => r.status === 'Active').length,
      critical: list.filter((r) => r.severity === 'Critical' || r.severity === 'High').length,
      resolved: list.filter((r) => r.status === 'Resolved').length,
      inProgress: list.filter((r) => r.status === 'In Progress').length,
    };
  }, [pests.items]);

  const filtered = useMemo(() => {
    let list = pests.items || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.issue?.toLowerCase().includes(q) ||
          r.crop?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          r.treatment?.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q)
      );
    }
    if (filterSeverity) list = list.filter((r) => r.severity === filterSeverity);
    if (filterStatus) list = list.filter((r) => r.status === filterStatus);
    if (filterType) list = list.filter((r) => r.type === filterType);
    return list;
  }, [pests.items, searchQuery, filterSeverity, filterStatus, filterType]);

  const openAdd = () => {
    setForm(emptyForm());
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (record) => {
    setForm({
      id: record.id,
      issue: record.issue,
      type: record.type,
      crop: record.crop,
      location: record.location || '',
      severity: record.severity,
      dateDetected: record.dateDetected || '',
      treatment: record.treatment || '',
      treatmentDate: record.treatmentDate || '',
      status: record.status,
      notes: record.notes || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await pests.save(form);
      setShowModal(false);
      showNotice(form.id ? 'Pest/disease record updated.' : 'New pest/disease record added.');
    } catch (err) {
      setFormError(err.message || 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pest/disease record? This cannot be undone.')) return;
    try {
      await pests.remove(id);
      showNotice('Record deleted.');
    } catch (err) {
      alert(err.message || 'Failed to delete record.');
    }
  };

  const clearFilters = () => { setFilterSeverity(''); setFilterStatus(''); setFilterType(''); setSearchQuery(''); };
  const hasFilters = filterSeverity || filterStatus || filterType || searchQuery;

  return (
    <div className="space-y-6">
      <Hero
        kicker="Garden Health"
        title="Pest & Disease Management"
        subtitle="Track outbreaks, log treatments, and monitor resolution status across all garden beds."
      />

      <Toast notice={notice} />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Records', value: stats.total, sub: 'Problems logged in system', color: 'text-violet-800' },
          { label: 'Currently Active', value: stats.active, sub: 'Outbreaks requiring action', color: 'text-red-700' },
          { label: 'High / Critical', value: stats.critical, sub: 'Urgent severity cases', color: 'text-orange-700' },
          { label: 'Resolved', value: stats.resolved, sub: 'Successfully treated problems', color: 'text-emerald-700' },
        ].map((kpi) => (
          <article key={kpi.label} className="rounded-3xl border border-violet-100 bg-white p-5 shadow-[0_10px_30px_rgba(109,40,217,0.04)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{kpi.label}</p>
            <p className={`mt-1 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="mt-1 text-xs text-slate-500">{kpi.sub}</p>
          </article>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
          <input
            type="text"
            id="pest-search"
            placeholder="Search by issue, crop, location, treatment…"
            className="w-full rounded-2xl border border-violet-100 bg-white py-2 pl-10 pr-4 text-sm focus:border-violet-400 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter: type */}
        <div className="relative">
          <select
            className="appearance-none rounded-2xl border border-violet-100 bg-white py-2 pl-3 pr-8 text-sm text-slate-600 focus:border-violet-400 focus:outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2 top-3 text-slate-400" />
        </div>

        {/* Filter: severity */}
        <div className="relative">
          <select
            className="appearance-none rounded-2xl border border-violet-100 bg-white py-2 pl-3 pr-8 text-sm text-slate-600 focus:border-violet-400 focus:outline-none"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            aria-label="Filter by severity"
          >
            <option value="">All Severities</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2 top-3 text-slate-400" />
        </div>

        {/* Filter: status */}
        <div className="relative">
          <select
            className="appearance-none rounded-2xl border border-violet-100 bg-white py-2 pl-3 pr-8 text-sm text-slate-600 focus:border-violet-400 focus:outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2 top-3 text-slate-400" />
        </div>

        {hasFilters && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition"
            onClick={clearFilters}
          >
            <X size={13} /> Clear
          </button>
        )}

        {isManager && (
          <button
            type="button"
            className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-violet-700 hover:to-purple-600 transition"
            onClick={openAdd}
          >
            <Plus size={16} /> Log Problem
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[24px] bg-white border border-violet-50 shadow-[0_10px_40px_rgba(109,40,217,0.04)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F5F3FF] text-slate-700 font-semibold border-b border-violet-50">
            <tr>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Issue / Problem</th>
              <th className="px-5 py-3">Affected Crop</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Detected</th>
              <th className="px-5 py-3">Severity</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Treatment</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Bug size={32} className="text-violet-200" />
                    <p className="font-semibold text-slate-500">No records found</p>
                    <p className="text-xs">
                      {hasFilters ? 'Try adjusting your filters.' : 'Log the first pest or disease problem to get started.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-violet-50/30 transition">
                  <td className="px-5 py-3">
                    <TypeIcon type={item.type} size={18} />
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800 max-w-[160px]">
                    <span className="line-clamp-1">{item.issue}</span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700">{item.crop}</td>
                  <td className="px-5 py-3 text-slate-500">{item.location || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {item.dateDetected ? formatDate(item.dateDetected) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <SeverityBadge severity={item.severity} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-3 text-slate-500 max-w-[160px]">
                    <span className="line-clamp-1 text-xs">{item.treatment || '—'}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-3 text-xs font-semibold">
                      <button
                        type="button"
                        className="text-gs-primary"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-600"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Result count */}
      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-center">
          Showing {filtered.length} of {pests.items?.length || 0} records
        </p>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={form.id ? 'Edit Pest / Disease Record' : 'Log New Problem'}
          onClose={() => setShowModal(false)}
          wide
        >
          <PestForm
            form={form}
            setForm={setForm}
            onSubmit={handleSave}
            crops={crops}
            error={formError}
            submitLabel={saving ? 'Saving…' : (form.id ? 'Update Record' : 'Log Problem')}
          />
        </Modal>
      )}

      {/* Detail Drawer */}
      {showDrawer && (
        <DetailDrawer
          record={showDrawer}
          onClose={() => setShowDrawer(null)}
          onEdit={openEdit}
          isManager={isManager}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GARDENER VIEW: /staff/report-pest
// ─────────────────────────────────────────────────────────────────────────────

export const ReportPestPage = () => {
  const { pests, crops, staff } = useStaff();
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const showNotice = (text) => { toast.success(text); setNotice(text); setTimeout(() => setNotice(''), 4000); };

  // Only show this gardener's recent reports (or all if none attributed)
  const myReports = useMemo(() => {
    const all = pests.items || [];
    // Show most recent 8 reports visible to gardener
    return [...all].sort((a, b) => new Date(b.dateDetected) - new Date(a.dateDetected)).slice(0, 12);
  }, [pests.items]);

  const activeCount = useMemo(
    () => (pests.items || []).filter((r) => r.status === 'Active' || r.status === 'In Progress').length,
    [pests.items]
  );

  const openReport = () => {
    setForm({ ...emptyForm(), status: 'Active' });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await pests.save({ ...form, status: 'Active' });
      setShowModal(false);
      showNotice(`✓ Pest/disease report submitted for ${form.crop}. The garden manager has been alerted.`);
    } catch (err) {
      setFormError(err.message || 'Failed to submit report.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Hero
        kicker="Field Operations"
        title="Report a Pest or Disease"
        subtitle="Spotted something wrong? Log it immediately so the garden manager can plan treatment."
        action={
          <button
            type="button"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-violet-900 shadow-md hover:bg-violet-50 transition"
            onClick={openReport}
            id="report-pest-btn"
          >
            + Report Problem
          </button>
        }
      />

      {notice && (
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-sm">
          {notice}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-3xl border border-violet-100 bg-white p-5 shadow-[0_8px_24px_rgba(109,40,217,0.05)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50">
              <Zap size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Issues</p>
              <p className="text-2xl font-bold text-red-700">{activeCount}</p>
            </div>
          </div>
        </article>
        <article className="rounded-3xl border border-violet-100 bg-white p-5 shadow-[0_8px_24px_rgba(109,40,217,0.05)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50">
              <Bug size={20} className="text-violet-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Logged</p>
              <p className="text-2xl font-bold text-violet-700">{pests.items?.length || 0}</p>
            </div>
          </div>
        </article>
      </div>

      {/* How to guide */}
      <div className="rounded-[24px] border border-amber-100 bg-amber-50/50 p-5">
        <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600" />
          When to report a pest or disease
        </p>
        <ul className="mt-2 space-y-1 text-sm text-amber-700 list-disc list-inside">
          <li>Visible insects, larvae, or droppings on plants or soil</li>
          <li>Discoloration, spots, lesions, mold, or wilting leaves</li>
          <li>Unusual growth patterns or stunted plants</li>
          <li>Leaf curl, yellowing (could be nutrient deficiency)</li>
        </ul>
        <p className="mt-2 text-xs text-amber-600">Report as early as possible — early detection prevents larger outbreaks.</p>
      </div>

      {/* Recent reports list */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Pest & Disease Reports</h2>

        {myReports.length === 0 ? (
          <div className="rounded-2xl border border-violet-100 bg-violet-50/30 p-8 text-center">
            <CheckCircle size={36} className="mx-auto mb-2 text-emerald-400" />
            <p className="font-semibold text-slate-700">No active problems logged!</p>
            <p className="text-sm text-slate-400 mt-1">The garden is looking healthy. Keep monitoring and report anything unusual.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myReports.map((item) => {
              const sev = SEVERITY_META[item.severity] || SEVERITY_META.Low;
              const stat = STATUS_META[item.status] || STATUS_META.Active;
              return (
                <article
                  key={item.id}
                  className="rounded-[24px] border border-violet-100 bg-white p-5 shadow-[0_8px_24px_rgba(109,40,217,0.04)] hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon type={item.type} size={18} />
                      <span className="font-bold text-slate-800 text-sm">{item.issue}</span>
                    </div>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${stat.color}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <Leaf size={12} className="text-slate-400 shrink-0" />
                      <span className="font-medium">{item.crop}</span>
                      {item.location && <span className="text-slate-400">· {item.location}</span>}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar size={12} className="text-slate-400 shrink-0" />
                      {item.dateDetected ? formatDate(item.dateDetected) : '—'}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <SeverityBadge severity={item.severity} />
                    {item.treatment && (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 rounded-full px-2 py-0.5">
                        Treatment noted
                      </span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="mt-3 text-xs text-slate-500 line-clamp-2 border-t border-slate-50 pt-3">
                      {item.notes}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showModal && (
        <Modal
          title="Report Pest or Disease"
          onClose={() => setShowModal(false)}
          wide
        >
          <p className="mb-4 text-sm text-slate-500">
            Fill out the details below. The garden manager will review and plan treatment.
          </p>
          <PestForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            crops={crops}
            error={formError}
            submitLabel={saving ? 'Submitting…' : 'Submit Report'}
            isReport
          />
        </Modal>
      )}
    </div>
  );
};

export default PestPage;
