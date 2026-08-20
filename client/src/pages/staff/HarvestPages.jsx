import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeDollarSign,
  Download,
  Leaf,
  Link2,
  MapPin,
  PieChart,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  Wheat,
  X,
} from 'lucide-react';
import { BarChart, PieChart as GardenPie } from '../../components/staff/GardenCharts.jsx';
import { useStaff } from '../../context/StaffContext.jsx';
import { formatDate, formatPrice } from '../../utils/format.js';
import { downloadCsv, toNumber } from '../../utils/reports.js';
import {
  GRADE_TINTS,
  HARVEST_CROPS,
  HARVEST_GRADES,
  HARVEST_SALE_STATUSES,
  HARVEST_UNITS,
  SALE_TINTS,
  blankHarvest,
  blankHarvestSale,
  harvestValue,
  mergeCropOptions,
} from '../../utils/harvest.js';

const Hero = ({ kicker, title, subtitle, icon: Icon, action }) => (
  <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#14532D] via-[#15803D] to-[#84CC16] p-6 text-white shadow-[0_20px_50px_rgba(20,83,45,0.22)] sm:p-8">
    <div className="gs-dot-vine pointer-events-none absolute inset-0 opacity-20" />
    <Leaf className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rotate-12 text-white/10" />
    <div className="relative flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-lime-100">
          <Icon size={14} /> {kicker}
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h2>
        <p className="mt-2 text-sm text-emerald-50 sm:text-base">{subtitle}</p>
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

const Toast = ({ notice }) =>
  notice ? (
    <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 px-4 py-3 text-sm font-semibold text-white shadow-sm">
      {notice}
    </div>
  ) : null;

const SummaryStrip = ({ summary }) => (
  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Harvests</p>
      <p className="mt-1 text-2xl font-bold text-emerald-800">{summary.harvestCount || 0}</p>
      <p className="mt-1 text-xs text-slate-500">{summary.totalQuantity || 0} units picked</p>
    </article>
    <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Total value</p>
      <p className="mt-1 text-2xl font-bold text-emerald-700">{formatPrice(summary.totalValue || 0)}</p>
      <p className="mt-1 text-xs text-slate-500">Quantity × selling price</p>
    </article>
    <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Linked to sales</p>
      <p className="mt-1 text-2xl font-bold text-sky-800">{(summary.listedCount || 0) + (summary.soldCount || 0)}</p>
      <p className="mt-1 text-xs text-slate-500">{summary.soldCount || 0} completed sales</p>
    </article>
    <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Unsold lots</p>
      <p className="mt-1 text-2xl font-bold text-amber-700">{summary.unsoldCount || 0}</p>
      <p className="mt-1 text-xs text-slate-500">Ready to send to the sales desk</p>
    </article>
  </div>
);

const HarvestForm = ({ form, setForm, crops, units, grades, error, onSubmit, onClose, submitLabel }) => {
  const total = harvestValue(form.quantity, form.unitPrice);
  const pickCrop = (name) => {
    const crop = crops.find((row) => row.name === name);
    setForm({
      ...form,
      crop: name,
      cropId: crop?.id || '',
      variety: crop?.variety || form.variety,
      location: crop?.location || form.location,
    });
  };

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <label className="text-sm font-medium">
        Crop
        <select className="input-field mt-1" value={form.crop} onChange={(event) => pickCrop(event.target.value)} required>
          <option value="">Select crop</option>
          {crops.map((crop) => (
            <option key={crop.name} value={crop.name}>
              {crop.name}
              {crop.variety ? ` · ${crop.variety}` : ''}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Harvest date
          <input type="date" className="input-field mt-1" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
        </label>
        <label className="text-sm font-medium">
          Quality / grade
          <select className="input-field mt-1" value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })}>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Quantity
          <input type="number" min="0.001" step="0.001" className="input-field mt-1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} required />
        </label>
        <label className="text-sm font-medium">
          Unit
          <select className="input-field mt-1" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })}>
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="text-sm font-medium">
        Location
        <input className="input-field mt-1" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Bed A2" />
      </label>
      <label className="text-sm font-medium">
        Selling price (Rs. / {form.unit || 'unit'})
        <input type="number" min="0" step="0.01" className="input-field mt-1" value={form.unitPrice} onChange={(event) => setForm({ ...form, unitPrice: event.target.value })} required />
      </label>
      <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Total value</p>
        <p className="mt-1 text-xl font-bold text-emerald-900">{formatPrice(total)}</p>
        <p className="text-xs text-emerald-800">
          {form.quantity || 0} {form.unit || 'unit'} × {formatPrice(form.unitPrice || 0)}/{form.unit || 'unit'}
        </p>
      </div>
      <label className="text-sm font-medium">
        Notes
        <textarea className="input-field mt-1" value={form.notes || ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      </label>
      <div className="mt-2 flex gap-3">
        <button type="button" className="btn-secondary flex-1" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

const SaleForm = ({ form, setForm, harvest, statuses, error, onSubmit, onClose }) => {
  const amount = harvestValue(form.quantity, form.unitPrice);
  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {harvest && (
        <div className="rounded-2xl bg-[#F3F7F1] px-4 py-3 text-sm">
          <p className="font-semibold text-slate-900">
            {harvest.crop} · {harvest.quantity} {harvest.unit} · {harvest.grade}
          </p>
          <p className="text-xs text-slate-500">
            Harvested {formatDate(harvest.date)} at {harvest.location || 'garden'} · {formatPrice(harvest.unitPrice)}/{harvest.unit}
          </p>
        </div>
      )}
      <label className="text-sm font-medium">
        Customer
        <input className="input-field mt-1" value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} required />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Sale date
          <input type="date" className="input-field mt-1" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
        </label>
        <label className="text-sm font-medium">
          Status
          <select className="input-field mt-1" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Quantity
          <input type="number" min="0.001" step="0.001" className="input-field mt-1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} required />
        </label>
        <label className="text-sm font-medium">
          Selling price (Rs.)
          <input type="number" min="0" step="0.01" className="input-field mt-1" value={form.unitPrice} onChange={(event) => setForm({ ...form, unitPrice: event.target.value })} required />
        </label>
      </div>
      <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">Sale amount {formatPrice(amount)}</div>
      <label className="text-sm font-medium">
        Notes
        <textarea className="input-field mt-1" value={form.notes || ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      </label>
      <div className="mt-2 flex gap-3">
        <button type="button" className="btn-secondary flex-1" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1">
          Save sale
        </button>
      </div>
    </form>
  );
};

const HarvestDesk = ({ mode = 'manage' }) => {
  const { staff, harvests, sales, crops } = useStaff();
  const canManage = ['admin', 'garden_manager'].includes(staff?.role);
  const [form, setForm] = useState(null);
  const [saleForm, setSaleForm] = useState(null);
  const [saleHarvest, setSaleHarvest] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [crop, setCrop] = useState('All');
  const [grade, setGrade] = useState('All');
  const [saleStatus, setSaleStatus] = useState('All');

  useEffect(() => {
    harvests.refresh?.().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2200);
  };

  const cropOptions = mergeCropOptions(harvests.crops?.length ? harvests.crops : HARVEST_CROPS, crops.items);
  const units = harvests.units?.length ? harvests.units : HARVEST_UNITS;
  const grades = harvests.grades?.length ? harvests.grades : HARVEST_GRADES;
  const records = harvests.items;
  const cropNames = ['All', ...new Set(records.map((row) => row.crop))];

  const filtered = records.filter((row) => {
    if (crop !== 'All' && row.crop !== crop) return false;
    if (grade !== 'All' && row.grade !== grade) return false;
    if (saleStatus !== 'All' && row.saleStatus !== saleStatus) return false;
    return `${row.crop} ${row.variety} ${row.location} ${row.grade} ${row.notes}`.toLowerCase().includes(query.trim().toLowerCase());
  });

  const openCreate = () => {
    setError('');
    setForm(blankHarvest(cropOptions[0] || HARVEST_CROPS[0]));
  };

  const saveHarvest = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await harvests.save(form);
      flash(form.id ? 'Harvest updated' : 'Harvest recorded');
      setForm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const saveSale = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (saleForm.id) {
        await sales.save(saleForm);
        flash('Sale updated');
      } else {
        await harvests.linkSale(saleHarvest.id, saleForm);
        flash('Harvest linked to sales');
      }
      setSaleForm(null);
      setSaleHarvest(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pb-8">
      <Toast notice={notice} />
      <Hero
        kicker={mode === 'record' ? 'Field work' : 'Harvest desk'}
        title={mode === 'record' ? 'Record harvest' : 'Harvests'}
        subtitle={
          mode === 'record'
            ? 'Log crop, date, quantity, grade, location, and selling price after a pick.'
            : 'Record harvest lots, keep history, and send produce to the sales desk.'
        }
        icon={Wheat}
        action={
          <div className="flex flex-wrap gap-2">
            {canManage && mode === 'manage' && (
              <>
                <Link to="/staff/sales" className="rounded-full bg-white/15 px-4 py-2.5 text-sm font-semibold text-white">
                  Sales desk
                </Link>
                <Link to="/staff/harvest-reports" className="rounded-full bg-white/15 px-4 py-2.5 text-sm font-semibold text-white">
                  Reports
                </Link>
              </>
            )}
            <button type="button" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800" onClick={openCreate}>
              <span className="inline-flex items-center gap-2">
                <Plus size={16} /> Record harvest
              </span>
            </button>
          </div>
        }
      />

      <SummaryStrip summary={harvests.summary} />

      <div className="mt-5 rounded-[24px] border border-emerald-50 bg-white/90 p-4 shadow-[0_10px_40px_rgba(20,83,45,0.05)]">
        <div className="flex flex-wrap gap-2">
          {cropNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCrop(name)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                crop === name ? 'bg-[#14532D] text-white' : 'bg-[#F3F7F1] text-slate-600 hover:bg-emerald-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {['All', ...grades].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setGrade(name)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                grade === name ? 'bg-emerald-700 text-white' : 'bg-[#F3F7F1] text-slate-600'
              }`}
            >
              {name}
            </button>
          ))}
          {['All', 'Unlinked', 'Listed', 'Sold'].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSaleStatus(name)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                saleStatus === name ? 'bg-sky-700 text-white' : 'bg-[#F3F7F1] text-slate-600'
              }`}
            >
              {name === 'All' ? 'All sales' : name}
            </button>
          ))}
        </div>
        <label className="relative mt-3 block max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
          <input className="input-field pl-10" placeholder="Search harvest history" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-5 rounded-[28px] bg-white px-6 py-14 text-center shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <Wheat className="mx-auto text-emerald-500" size={32} />
          <p className="mt-3 text-lg font-semibold text-slate-900">No harvest records match these filters</p>
          <p className="mt-1 text-sm text-slate-500">Record a harvest after picking, or clear a crop filter.</p>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#F3F7F1] text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Harvest</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Qty</th>
                  <th className="px-4 py-3 font-semibold">Grade</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Total value</th>
                  <th className="px-4 py-3 font-semibold">Sales</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-emerald-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{row.crop}</p>
                      <p className="text-xs text-slate-400">{row.variety || 'Garden crop'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(row.date)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {row.quantity} {row.unit}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${GRADE_TINTS[row.grade] || 'bg-slate-100 text-slate-700'}`}>
                        {row.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} /> {row.location || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatPrice(row.unitPrice)}/{row.unit}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{formatPrice(row.totalValue)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${SALE_TINTS[row.saleStatus] || 'bg-slate-100 text-slate-700'}`}>
                        {row.saleStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <button
                          type="button"
                          className="text-gs-primary"
                          onClick={() => {
                            setError('');
                            setForm({ ...row });
                          }}
                        >
                          Edit
                        </button>
                        {canManage && row.saleStatus === 'Unlinked' && (
                          <button
                            type="button"
                            className="text-sky-700"
                            onClick={() => {
                              setError('');
                              setSaleHarvest(row);
                              setSaleForm(blankHarvestSale(row));
                            }}
                          >
                            Link sale
                          </button>
                        )}
                        {canManage && (
                          <button
                            type="button"
                            className="text-red-600"
                            onClick={async () => {
                              if (window.confirm(`Delete the ${row.crop} harvest from ${row.date}?`)) {
                                try {
                                  await harvests.remove(row.id);
                                  flash('Harvest removed');
                                } catch (err) {
                                  alert(err.message);
                                }
                              }
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-emerald-50 bg-[#F8FBF7] px-4 py-3 text-sm">
            <p className="text-slate-500">
              {filtered.length} harvest{filtered.length === 1 ? '' : 's'} in this view
            </p>
            <p className="font-bold text-slate-900">
              Subtotal {formatPrice(filtered.reduce((sum, row) => sum + toNumber(row.totalValue), 0))}
            </p>
          </div>
        </div>
      )}

      {form && (
        <Modal title={form.id ? 'Edit harvest' : 'Record harvest'} onClose={() => setForm(null)}>
          <HarvestForm
            form={form}
            setForm={setForm}
            crops={cropOptions}
            units={units}
            grades={grades}
            error={error}
            onSubmit={saveHarvest}
            onClose={() => setForm(null)}
            submitLabel={form.id ? 'Save harvest' : 'Record harvest'}
          />
        </Modal>
      )}

      {saleForm && (
        <Modal title="Link harvest to sales" onClose={() => setSaleForm(null)}>
          <SaleForm
            form={saleForm}
            setForm={setSaleForm}
            harvest={saleHarvest}
            statuses={sales.statuses?.length ? sales.statuses : HARVEST_SALE_STATUSES}
            error={error}
            onSubmit={saveSale}
            onClose={() => {
              setSaleForm(null);
              setSaleHarvest(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export const HarvestsPage = () => <HarvestDesk mode="manage" />;
export const RecordHarvestPage = () => <HarvestDesk mode="record" />;

export const HarvestSalesPage = () => {
  const { harvests, sales } = useStaff();
  const [form, setForm] = useState(null);
  const [saleHarvest, setSaleHarvest] = useState(null);
  const [picker, setPicker] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    harvests.refresh?.().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2200);
  };

  const unlinked = harvests.items.filter((row) => row.saleStatus === 'Unlinked');
  const filtered = sales.items.filter((row) => {
    if (status !== 'All' && row.status !== status) return false;
    return `${row.crop} ${row.customer} ${row.status}`.toLowerCase().includes(query.trim().toLowerCase());
  });

  const save = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (form.id) {
        await sales.save(form);
        flash('Sale updated');
      } else {
        await sales.link(saleHarvest.id, form);
        flash('Harvest linked to sales');
      }
      setForm(null);
      setSaleHarvest(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pb-8">
      <Toast notice={notice} />
      <Hero
        kicker="Operations"
        title="Harvest sales"
        subtitle="Link harvested lots to customer sales and move them from pending to completed."
        icon={ShoppingCart}
        action={
          <button type="button" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800" onClick={() => setPicker(true)}>
            <span className="inline-flex items-center gap-2">
              <Link2 size={16} /> Link harvest
            </span>
          </button>
        }
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Sales</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{sales.items.length}</p>
        </article>
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Unlinked harvests</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{unlinked.length}</p>
        </article>
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Sale value</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{formatPrice(sales.items.reduce((sum, row) => sum + toNumber(row.amount), 0))}</p>
        </article>
      </div>

      <div className="mt-5 rounded-[24px] border border-emerald-50 bg-white/90 p-4">
        <div className="flex flex-wrap gap-2">
          {['All', ...HARVEST_SALE_STATUSES].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setStatus(name)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status === name ? 'bg-[#14532D] text-white' : 'bg-[#F3F7F1] text-slate-600'}`}
            >
              {name}
            </button>
          ))}
        </div>
        <label className="relative mt-3 block max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
          <input className="input-field pl-10" placeholder="Search sales" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-5 rounded-[28px] bg-white px-6 py-14 text-center shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <ShoppingCart className="mx-auto text-emerald-500" size={32} />
          <p className="mt-3 text-lg font-semibold text-slate-900">No harvest sales yet</p>
          <p className="mt-1 text-sm text-slate-500">Link an unsold harvest lot to a customer order.</p>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#F3F7F1] text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Crop</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Qty</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-emerald-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.crop}</td>
                    <td className="px-4 py-3 text-slate-700">{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(row.date)}</td>
                    <td className="px-4 py-3">
                      {row.quantity} {row.unit}
                    </td>
                    <td className="px-4 py-3 font-bold">{formatPrice(row.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${SALE_TINTS[row.status]}`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-xs font-semibold">
                        <button
                          type="button"
                          className="text-gs-primary"
                          onClick={() => {
                            setError('');
                            setSaleHarvest(harvests.items.find((item) => item.id === row.harvestId) || { crop: row.crop, unit: row.unit, unitPrice: row.unitPrice, quantity: row.quantity, date: row.date, grade: '', location: '' });
                            setForm({ ...row });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={async () => {
                            if (window.confirm('Unlink this harvest sale?')) {
                              try {
                                await sales.remove(row.id);
                                flash('Sale unlinked');
                              } catch (err) {
                                alert(err.message);
                              }
                            }
                          }}
                        >
                          Unlink
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {picker && (
        <Modal title="Choose a harvest to sell" onClose={() => setPicker(false)}>
          {unlinked.length === 0 ? (
            <p className="text-sm text-slate-500">Every harvest lot is already linked. Record a new harvest first.</p>
          ) : (
            <div className="grid gap-2">
              {unlinked.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className="rounded-2xl bg-[#F3F7F1] px-4 py-3 text-left hover:bg-emerald-50"
                  onClick={() => {
                    setSaleHarvest(row);
                    setForm(blankHarvestSale(row));
                    setPicker(false);
                    setError('');
                  }}
                >
                  <p className="font-semibold text-slate-900">
                    {row.crop} · {row.quantity} {row.unit} · {row.grade}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(row.date)} · {formatPrice(row.totalValue)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}

      {form && (
        <Modal title={form.id ? 'Edit harvest sale' : 'Link harvest to sales'} onClose={() => setForm(null)}>
          <SaleForm
            form={form}
            setForm={setForm}
            harvest={saleHarvest}
            statuses={sales.statuses?.length ? sales.statuses : HARVEST_SALE_STATUSES}
            error={error}
            onSubmit={save}
            onClose={() => {
              setForm(null);
              setSaleHarvest(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export const HarvestReportsPage = () => {
  const { harvests } = useStaff();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [crop, setCrop] = useState('All');

  useEffect(() => {
    harvests.refresh?.().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = harvests.items.filter((item) => {
    if (crop !== 'All' && item.crop !== crop) return false;
    if (from && item.date < from) return false;
    if (to && item.date > to) return false;
    return true;
  });

  const totalQty = rows.reduce((sum, row) => sum + toNumber(row.quantity), 0);
  const totalValue = rows.reduce((sum, row) => sum + toNumber(row.totalValue), 0);
  const byCrop = rows.reduce((list, item) => {
    const current = list.find((row) => row.label === item.crop);
    if (current) {
      current.value += toNumber(item.quantity);
      current.amount += toNumber(item.totalValue);
    } else {
      list.push({ label: item.crop, value: toNumber(item.quantity), amount: toNumber(item.totalValue) });
    }
    return list;
  }, []);
  const byGrade = rows.reduce((list, item) => {
    const current = list.find((row) => row.label === item.grade);
    if (current) current.value += toNumber(item.quantity);
    else list.push({ label: item.grade, value: toNumber(item.quantity) });
    return list;
  }, []);

  const report = {
    columns: ['Date', 'Crop', 'Quantity', 'Unit', 'Grade', 'Location', 'Selling price', 'Total value', 'Sales'],
    rows: rows.map((item) => [
      item.date,
      item.crop,
      item.quantity,
      item.unit,
      item.grade,
      item.location,
      `${formatPrice(item.unitPrice)}/${item.unit}`,
      formatPrice(item.totalValue),
      item.saleStatus,
    ]),
  };

  return (
    <div className="pb-8">
      <Hero
        kicker="Harvest reports"
        title="Harvest report"
        subtitle="Quantity, grade, location, selling price, and total value for every recorded harvest."
        icon={PieChart}
        action={
          <div className="flex gap-2">
            <button type="button" className="rounded-full bg-white/15 px-4 py-2.5 text-sm font-semibold text-white" onClick={() => downloadCsv('Harvest Report', report)}>
              <span className="inline-flex items-center gap-2">
                <Download size={16} /> CSV
              </span>
            </button>
            <button type="button" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800" onClick={() => window.print()}>
              <span className="inline-flex items-center gap-2">
                <Printer size={16} /> Print
              </span>
            </button>
          </div>
        }
      />

      <div className="mt-5 grid gap-3 rounded-[24px] border border-emerald-50 bg-white p-4 sm:grid-cols-3">
        <label className="text-sm font-medium">
          From
          <input type="date" className="input-field mt-1" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label className="text-sm font-medium">
          To
          <input type="date" className="input-field mt-1" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
        <label className="text-sm font-medium">
          Crop
          <select className="input-field mt-1" value={crop} onChange={(event) => setCrop(event.target.value)}>
            <option value="All">All crops</option>
            {[...new Set(harvests.items.map((item) => item.crop))].map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Lots</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{rows.length}</p>
        </article>
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Quantity</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{totalQty} units</p>
        </article>
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Harvest value</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{formatPrice(totalValue)}</p>
        </article>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-emerald-50 bg-[#F8FBF6] p-2">
          <BarChart title="Harvest quantity by crop" data={byCrop} />
        </div>
        <div className="rounded-[24px] border border-emerald-50 bg-[#F8FBF6] p-2">
          <GardenPie title="Harvest by grade" data={byGrade} />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-[#F3F7F1] text-slate-700">
              <tr>
                {report.columns.map((column) => (
                  <th key={column} className="px-4 py-3 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={report.columns.length}>
                    No harvest records in this range.
                  </td>
                </tr>
              )}
              {rows.map((item) => (
                <tr key={item.id} className="border-t border-emerald-50">
                  <td className="px-4 py-3">{formatDate(item.date)}</td>
                  <td className="px-4 py-3 font-semibold">{item.crop}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">{item.unit}</td>
                  <td className="px-4 py-3">{item.grade}</td>
                  <td className="px-4 py-3">{item.location}</td>
                  <td className="px-4 py-3">
                    {formatPrice(item.unitPrice)}/{item.unit}
                  </td>
                  <td className="px-4 py-3 font-bold">{formatPrice(item.totalValue)}</td>
                  <td className="px-4 py-3">{item.saleStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-emerald-50 bg-[#F8FBF7] px-4 py-3 text-sm font-bold text-slate-900">
          {rows.length} records · {totalQty} units · {formatPrice(totalValue)}
        </div>
      </div>
    </div>
  );
};

export const HarvestOverviewCards = () => {
  const { harvests } = useStaff();
  return (
    <div className="mb-5 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm shadow-sm">
      <BadgeDollarSign className="text-emerald-700" size={16} />
      <p>
        {harvests.summary.harvestCount || 0} harvests · {formatPrice(harvests.summary.totalValue || 0)} value · {harvests.summary.unsoldCount || 0} unsold lots
      </p>
    </div>
  );
};
