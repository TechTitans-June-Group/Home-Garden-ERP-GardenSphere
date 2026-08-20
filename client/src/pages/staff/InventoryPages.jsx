import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Droplets,
  FlaskConical,
  History,
  Image as ImageIcon,
  LayoutGrid,
  Leaf,
  List,
  Package,
  Plus,
  Search,
  ShieldAlert,
  ShoppingBag,
  Sprout,
  Truck,
  Warehouse,
  Wrench,
  X,
} from 'lucide-react';
import { useStaff } from '../../context/StaffContext.jsx';
import { formatDate, formatPrice } from '../../utils/format.js';
import {
  CATEGORY_TINTS,
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
  ITEM_STATUS_STYLES,
  PURCHASE_STATUSES,
  CUSTOMER_PURCHASE_STATUSES,
  STOCK_TYPE_STYLES,
  STOCK_TYPES,
  blankInventoryItem,
  isInventoryLow,
  resolveItemImage,
  resolvePurchaseVisual,
  todayIso,
  toQty,
} from '../../utils/inventory.js';

const CATEGORY_ICONS = {
  Seeds: Sprout,
  Fertilizers: FlaskConical,
  Soil: Leaf,
  Compost: Leaf,
  Pesticides: ShieldAlert,
  'Gardening Tools': Wrench,
  'Irrigation Equipment': Droplets,
  'Plant Containers': Package,
  'Other Materials': Warehouse,
};

const ItemThumb = ({ item, className = 'h-12 w-12' }) => {
  const [failed, setFailed] = useState(false);
  const src = resolveItemImage(item);
  const Icon = CATEGORY_ICONS[item.category] || Warehouse;
  if (!src || failed) {
    return (
      <span className={`grid shrink-0 place-items-center overflow-hidden ${className} ${CATEGORY_TINTS[item.category] || 'bg-slate-100'}`}>
        <Icon size={18} />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={item.item || ''}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
};

const readImageFile = (file) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve('');
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file.'));
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 480;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(size / img.width, size / img.height);
        const width = img.width * scale;
        const height = img.height * scale;
        ctx.drawImage(img, (size - width) / 2, (size - height) / 2, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('Could not read that image.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });

const PURCHASE_STYLES = {
  Ordered: 'bg-amber-100 text-amber-800',
  Received: 'bg-emerald-100 text-emerald-800',
  Pending: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-sky-100 text-sky-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-slate-100 text-slate-600',
};

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

const emptyMove = { itemId: '', type: 'Stock In', quantity: '', date: todayIso(), note: '', unitCost: '' };
const emptyPurchase = { itemId: '', supplierId: '', quantity: '', unitCost: '', date: todayIso(), status: 'Ordered' };
const emptySupplier = { name: '', contact: '', email: '', category: 'Seeds', address: '', status: 'Active' };

export const InventoryPage = () => {
  const { inventory, suppliers } = useStaff();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [itemForm, setItemForm] = useState(null);
  const [moveForm, setMoveForm] = useState(null);
  const [adjustForm, setAdjustForm] = useState(null);
  const [view, setView] = useState('cards');

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2200);
  };

  const records = inventory.items;
  const lowItems = records.filter(isInventoryLow);
  const damagedItems = records.filter((item) => toQty(item.damaged) > 0);
  const valuation = records.reduce((sum, item) => sum + toQty(item.value), 0);
  const outCount = records.filter((item) => item.status === 'Out of Stock').length;

  const filtered = useMemo(() => {
    return records.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      const haystack = `${item.item} ${item.category} ${item.location} ${item.unit}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [category, query, records, statusFilter]);

  const openCreate = () => {
    setError('');
    setItemForm({ ...blankInventoryItem(), stock: '', minStock: '', unitCost: '', active: true });
  };

  const openEdit = (item) => {
    setError('');
    setItemForm({ ...item, active: item.status !== 'Inactive' });
  };

  const saveItem = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (!itemForm.item?.trim()) throw new Error('Item name is required.');
      await inventory.save({
        ...itemForm,
        status: itemForm.active === false ? 'Inactive' : 'Available',
      });
      flash(itemForm.id ? `${itemForm.item} updated` : `${itemForm.item} added to the shed`);
      setItemForm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const submitMove = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await inventory.moveStock(moveForm);
      flash(`${moveForm.type} recorded`);
      setMoveForm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const submitAdjust = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await inventory.adjustStock(adjustForm.itemId, adjustForm.quantity, adjustForm.note);
      flash('Stock updated');
      setAdjustForm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pb-8">
      <Toast notice={notice} />
      <Hero
        kicker="Supply desk"
        title="Inventory register"
        subtitle="Seeds, soil, tools, and every garden material — with min stock, valuation, and alerts."
        icon={Warehouse}
        action={
          <button type="button" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm" onClick={openCreate}>
            <span className="inline-flex items-center gap-2">
              <Plus size={16} /> Add item
            </span>
          </button>
        }
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Items on hand', records.length, 'SKUs in the shed'],
          ['Inventory value', formatPrice(valuation), 'Current stock × unit cost'],
          ['Low-stock alerts', lowItems.length, 'At or below minimum'],
          ['Out of stock', outCount, 'Need a purchase soon'],
        ].map(([label, value, hint]) => (
          <article key={label} className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          </article>
        ))}
      </div>

      {lowItems.length > 0 && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 shrink-0" size={16} />
          <p>
            <span className="font-semibold">{lowItems.length} low-stock alert{lowItems.length === 1 ? '' : 's'}.</span>{' '}
            {lowItems.map((item) => item.item).join(', ')} {lowItems.length === 1 ? 'is' : 'are'} at or below the minimum.
          </p>
        </div>
      )}

      <div className="mt-5 rounded-[24px] border border-emerald-50 bg-white/90 p-4 shadow-[0_10px_40px_rgba(20,83,45,0.05)]">
        <div className="flex flex-wrap gap-2">
          {['All', ...INVENTORY_CATEGORIES].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                category === name ? 'bg-[#14532D] text-white' : 'bg-[#F3F7F1] text-slate-600 hover:bg-emerald-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="relative min-w-[220px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
            <input
              className="input-field pl-10"
              placeholder="Search item, category, or location"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select className="input-field w-44" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All statuses</option>
            {['Available', 'Low Stock', 'Out of Stock', 'Inactive'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="inline-flex rounded-full bg-[#F3F7F1] p-1">
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold ${view === 'cards' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'}`}
              onClick={() => setView('cards')}
            >
              <LayoutGrid size={14} /> Cards
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold ${view === 'table' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'}`}
              onClick={() => setView('table')}
            >
              <List size={14} /> Table
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="mt-5 rounded-[28px] bg-white px-6 py-14 text-center shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <Warehouse className="mx-auto text-emerald-500" size={32} />
          <p className="mt-3 text-lg font-semibold text-slate-900">No items match these filters</p>
          <p className="mt-1 text-sm text-slate-500">Clear a filter or add a new garden material.</p>
        </div>
      )}

      {view === 'cards' && filtered.length > 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((item) => {
            const stockRatio = item.minStock ? Math.min((item.stock / item.minStock) * 50, 100) : item.stock > 0 ? 100 : 0;
            return (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(20,83,45,0.14)]"
              >
                <div className="relative h-44 bg-[#F3F7F1]">
                  <ItemThumb item={item} className="h-full w-full" />
                  <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${ITEM_STATUS_STYLES[item.status]}`}>
                    {item.status}
                  </span>
                  <span className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${CATEGORY_TINTS[item.category] || 'bg-white text-slate-700'}`}>
                    {item.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-lg font-bold leading-6 text-slate-900">{item.item}</h3>
                  <p className="mt-1 text-xs text-slate-400">{item.location || 'Unspecified location'}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-2xl bg-[#F3F7F1] px-2 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Stock</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900">
                        {item.stock}
                        <span className="font-medium text-slate-500"> {item.unit}</span>
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#F3F7F1] px-2 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Min</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900">{item.minStock}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F3F7F1] px-2 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Value</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900">{formatPrice(item.value)}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-50">
                    <div
                      className={`h-full rounded-full ${item.status === 'Out of Stock' ? 'bg-rose-400' : item.status === 'Low Stock' ? 'bg-amber-400' : 'bg-emerald-500'}`}
                      style={{ width: `${stockRatio}%` }}
                    />
                  </div>
                  {item.damaged > 0 && (
                    <p className="mt-2 text-xs font-semibold text-rose-600">{item.damaged} {item.unit} damaged</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <button type="button" className="rounded-full bg-[#F3F7F1] px-3 py-1.5 text-[11px] font-semibold text-gs-primary" onClick={() => openEdit(item)}>
                      Edit
                    </button>
                    <button type="button" className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700" onClick={() => { setError(''); setMoveForm({ ...emptyMove, itemId: item.id, type: 'Stock In', unitCost: item.unitCost }); }}>
                      In
                    </button>
                    <button type="button" className="rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-700" onClick={() => { setError(''); setMoveForm({ ...emptyMove, itemId: item.id, type: 'Stock Out' }); }}>
                      Out
                    </button>
                    <button type="button" className="rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-600" onClick={() => { setError(''); setMoveForm({ ...emptyMove, itemId: item.id, type: 'Damaged' }); }}>
                      Damaged
                    </button>
                    <button type="button" className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700" onClick={() => { setError(''); setAdjustForm({ itemId: item.id, quantity: item.stock, note: 'Manual stock update' }); }}>
                      Update
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {view === 'table' && filtered.length > 0 && (
      <div className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-[#F3F7F1] text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Min</th>
                <th className="px-4 py-3 font-semibold">Unit</th>
                <th className="px-4 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-emerald-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ItemThumb item={item} className="h-14 w-14 rounded-2xl shadow-sm" />
                        <div>
                          <p className="font-semibold text-slate-900">{item.item}</p>
                          <p className="text-xs text-slate-400">{item.location || 'Unspecified location'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.category}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {item.stock}
                      {item.damaged > 0 && <span className="ml-1 text-xs font-medium text-rose-500">· {item.damaged} dmg</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.minStock}</td>
                    <td className="px-4 py-3 text-slate-600">{item.unit}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{formatPrice(item.value)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ITEM_STATUS_STYLES[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <button type="button" className="text-gs-primary" onClick={() => openEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="text-emerald-700" onClick={() => { setError(''); setMoveForm({ ...emptyMove, itemId: item.id, type: 'Stock In', unitCost: item.unitCost }); }}>
                          In
                        </button>
                        <button type="button" className="text-sky-700" onClick={() => { setError(''); setMoveForm({ ...emptyMove, itemId: item.id, type: 'Stock Out' }); }}>
                          Out
                        </button>
                        <button type="button" className="text-rose-600" onClick={() => { setError(''); setMoveForm({ ...emptyMove, itemId: item.id, type: 'Damaged' }); }}>
                          Damaged
                        </button>
                        <button type="button" className="text-amber-700" onClick={() => { setError(''); setAdjustForm({ itemId: item.id, quantity: item.stock, note: 'Manual stock update' }); }}>
                          Update
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

      {damagedItems.length > 0 && (
        <section className="mt-6 rounded-[28px] border border-rose-100 bg-rose-50/60 p-5">
          <h3 className="flex items-center gap-2 font-bold text-rose-800">
            <ShieldAlert size={18} /> Damaged stock
          </h3>
          <p className="mt-1 text-sm text-rose-700">These quantities were written off from available stock and stay on the item record.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {damagedItems.map((item) => (
              <article key={item.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                <ItemThumb item={item} className="h-12 w-12 rounded-2xl" />
                <div>
                  <p className="font-semibold text-slate-900">{item.item}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.damaged} {item.unit} damaged · {item.stock} still available
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {itemForm && (
        <Modal title={itemForm.id ? 'Edit inventory item' : 'Add inventory item'} onClose={() => setItemForm(null)}>
          <form className="grid gap-3" onSubmit={saveItem}>
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="flex items-center gap-3 rounded-2xl bg-[#F3F7F1] p-3">
              <ItemThumb item={itemForm} className="h-16 w-16 rounded-2xl shadow-sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Item photo</p>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm">
                  <ImageIcon size={14} /> Upload image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (!file) return;
                      try {
                        const image = await readImageFile(file);
                        setItemForm((prev) => ({ ...prev, image }));
                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                  />
                </label>
                {itemForm.image && (
                  <button type="button" className="ml-2 text-xs font-semibold text-rose-600" onClick={() => setItemForm({ ...itemForm, image: '' })}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            <label className="text-sm font-medium">
              Photo URL (optional)
              <input
                className="input-field mt-1"
                placeholder="/products/tomato.jpg"
                value={itemForm.image?.startsWith('data:') ? '' : itemForm.image || ''}
                onChange={(event) => setItemForm({ ...itemForm, image: event.target.value })}
              />
            </label>
            <label className="text-sm font-medium">
              Item name
              <input className="input-field mt-1" value={itemForm.item} onChange={(event) => setItemForm({ ...itemForm, item: event.target.value })} required />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Category
                <select className="input-field mt-1" value={itemForm.category} onChange={(event) => setItemForm({ ...itemForm, category: event.target.value })}>
                  {INVENTORY_CATEGORIES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Unit
                <select className="input-field mt-1" value={itemForm.unit} onChange={(event) => setItemForm({ ...itemForm, unit: event.target.value })}>
                  {INVENTORY_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                {itemForm.id ? 'Current stock' : 'Opening stock'}
                <input
                  type="number"
                  min="0"
                  className="input-field mt-1"
                  value={itemForm.stock}
                  onChange={(event) => setItemForm({ ...itemForm, stock: event.target.value })}
                  readOnly={Boolean(itemForm.id)}
                />
              </label>
              <label className="text-sm font-medium">
                Minimum stock
                <input type="number" min="0" className="input-field mt-1" value={itemForm.minStock} onChange={(event) => setItemForm({ ...itemForm, minStock: event.target.value })} required />
              </label>
              <label className="text-sm font-medium">
                Unit cost (Rs.)
                <input type="number" min="0" className="input-field mt-1" value={itemForm.unitCost} onChange={(event) => setItemForm({ ...itemForm, unitCost: event.target.value })} />
              </label>
              <label className="text-sm font-medium">
                Location
                <input className="input-field mt-1" value={itemForm.location} onChange={(event) => setItemForm({ ...itemForm, location: event.target.value })} />
              </label>
            </div>
            <label className="text-sm font-medium">
              Preferred supplier
              <select className="input-field mt-1" value={itemForm.supplierId} onChange={(event) => setItemForm({ ...itemForm, supplierId: event.target.value })}>
                <option value="">None</option>
                {suppliers.items.filter((row) => row.status !== 'Inactive').map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Notes
              <textarea className="input-field mt-1 min-h-20" value={itemForm.notes} onChange={(event) => setItemForm({ ...itemForm, notes: event.target.value })} />
            </label>
            {itemForm.id && (
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={itemForm.active !== false} onChange={(event) => setItemForm({ ...itemForm, active: event.target.checked })} />
                Item is active
              </label>
            )}
            <div className="mt-2 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setItemForm(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Save item
              </button>
            </div>
          </form>
        </Modal>
      )}

      {moveForm && (
        <Modal title={moveForm.type} onClose={() => setMoveForm(null)}>
          <form className="grid gap-3" onSubmit={submitMove}>
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <p className="text-sm text-slate-500">
              {records.find((item) => item.id === moveForm.itemId)?.item} · on hand{' '}
              {records.find((item) => item.id === moveForm.itemId)?.stock}{' '}
              {records.find((item) => item.id === moveForm.itemId)?.unit}
            </p>
            <label className="text-sm font-medium">
              Quantity
              <input type="number" min="1" className="input-field mt-1" value={moveForm.quantity} onChange={(event) => setMoveForm({ ...moveForm, quantity: event.target.value })} required />
            </label>
            {moveForm.type === 'Stock In' && (
              <label className="text-sm font-medium">
                Unit cost (optional)
                <input type="number" min="0" className="input-field mt-1" value={moveForm.unitCost} onChange={(event) => setMoveForm({ ...moveForm, unitCost: event.target.value })} />
              </label>
            )}
            <label className="text-sm font-medium">
              Date
              <input type="date" className="input-field mt-1" value={moveForm.date} onChange={(event) => setMoveForm({ ...moveForm, date: event.target.value })} />
            </label>
            <label className="text-sm font-medium">
              Note
              <textarea className="input-field mt-1 min-h-20" value={moveForm.note} onChange={(event) => setMoveForm({ ...moveForm, note: event.target.value })} placeholder={moveForm.type === 'Damaged' ? 'Why was this written off?' : 'Where did it go, or where did it come from?'} />
            </label>
            <div className="mt-2 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setMoveForm(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Record
              </button>
            </div>
          </form>
        </Modal>
      )}

      {adjustForm && (
        <Modal title="Update stock" onClose={() => setAdjustForm(null)}>
          <form className="grid gap-3" onSubmit={submitAdjust}>
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <label className="text-sm font-medium">
              Counted quantity
              <input type="number" min="0" className="input-field mt-1" value={adjustForm.quantity} onChange={(event) => setAdjustForm({ ...adjustForm, quantity: event.target.value })} required />
            </label>
            <label className="text-sm font-medium">
              Note
              <input className="input-field mt-1" value={adjustForm.note} onChange={(event) => setAdjustForm({ ...adjustForm, note: event.target.value })} />
            </label>
            <div className="mt-2 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setAdjustForm(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Update stock
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export const PurchasesPage = () => {
  const { inventory, suppliers, purchases } = useStaff();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');

  useEffect(() => {
    inventory.refresh().catch(() => {});
    // Load latest customer orders when this page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh once on mount
  }, []);

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2200);
  };

  const filtered = purchases.items.filter((row) => {
    const source = row.source || 'supplier';
    if (sourceFilter === 'Supplier' && source !== 'supplier') return false;
    if (sourceFilter === 'Customer' && source !== 'customer') return false;
    const haystack = `${row.item} ${row.supplier} ${row.customerName} ${row.orderRef} ${row.status} ${source}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  const save = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await purchases.save(form);
      flash(form.source === 'customer' ? 'Customer order updated' : form.status === 'Received' ? 'Purchase received and stock updated' : 'Purchase saved');
      setForm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (row, status, message) => {
    try {
      await purchases.save({ ...row, status });
      flash(message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pb-8">
      <Toast notice={notice} />
      <Hero
        kicker="Buying"
        title="Purchases"
        subtitle="Supplier restocks and customer shop orders both appear here."
        icon={Package}
        action={
          <button type="button" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800" onClick={() => { setError(''); setForm({ ...emptyPurchase }); }}>
            <span className="inline-flex items-center gap-2">
              <Plus size={16} /> Record purchase
            </span>
          </button>
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="relative max-w-md flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
          <input className="input-field pl-10" placeholder="Search purchases" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2">
          {['All', 'Supplier', 'Customer'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSourceFilter(item)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                sourceFilter === item ? 'bg-gs-primary text-white' : 'bg-white text-gs-deep'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="mt-5 rounded-[28px] bg-white px-6 py-14 text-center shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <Package className="mx-auto text-emerald-500" size={32} />
          <p className="mt-3 text-lg font-semibold text-slate-900">No purchases match these filters</p>
          <p className="mt-1 text-sm text-slate-500">Record a supplier restock or wait for a customer shop order.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-[#F3F7F1] text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">From</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Qty</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const isCustomer = (row.source || 'supplier') === 'customer';
                  const visual = resolvePurchaseVisual(row, inventory.items);
                  return (
                    <tr key={row.id} className="border-t border-emerald-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ItemThumb item={visual} className="h-14 w-14 rounded-2xl shadow-sm" />
                          <div>
                            <p className="font-semibold text-slate-900">{row.item}</p>
                            {row.orderRef ? <p className="text-xs text-slate-400">{row.orderRef}</p> : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          isCustomer ? 'bg-sky-100 text-sky-800' : 'bg-lime-100 text-lime-800'
                        }`}>
                          {isCustomer ? <ShoppingBag size={12} /> : <Truck size={12} />}
                          {isCustomer ? 'Customer' : 'Supplier'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.supplier || row.customerName || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(row.date)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {row.quantity}
                        <span className="font-medium text-slate-500">{row.unit ? ` ${row.unit}` : ''}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{formatPrice(row.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${PURCHASE_STYLES[row.status] || 'bg-slate-100 text-slate-600'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          <button type="button" className="text-gs-primary" onClick={() => { setError(''); setForm({ ...row }); }}>
                            {isCustomer ? 'View' : 'Edit'}
                          </button>
                          {!isCustomer && row.status === 'Ordered' && (
                            <button type="button" className="text-emerald-700" onClick={() => updateStatus(row, 'Received', 'Marked received — stock increased')}>
                              Receive
                            </button>
                          )}
                          {isCustomer && row.status === 'Pending' && (
                            <button type="button" className="text-sky-700" onClick={() => updateStatus(row, 'Confirmed', 'Customer order confirmed')}>
                              Confirm
                            </button>
                          )}
                          {isCustomer && row.status === 'Confirmed' && (
                            <button type="button" className="text-emerald-700" onClick={() => updateStatus(row, 'Completed', 'Customer order completed')}>
                              Complete
                            </button>
                          )}
                          <button
                            type="button"
                            className="text-red-600"
                            onClick={async () => {
                              if (window.confirm(isCustomer ? 'Delete this customer order from purchases?' : 'Delete this purchase? Received stock will be reversed if still available.')) {
                                try {
                                  await purchases.remove(row.id);
                                  flash('Purchase removed');
                                } catch (err) {
                                  setNotice('');
                                  alert(err.message);
                                }
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {form && form.source === 'customer' && (
        <Modal title={form.orderRef ? `Order ${form.orderRef}` : 'Customer order'} onClose={() => setForm(null)}>
          <form className="grid gap-3" onSubmit={save}>
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <ItemThumb item={resolvePurchaseVisual(form, inventory.items)} className="h-36 w-full rounded-2xl" />
            <p className="text-lg font-semibold text-slate-900">{form.item}</p>
            <div className="grid gap-1 text-sm text-slate-600">
              <p>Customer: {form.customerName || form.supplier}</p>
              {form.customerEmail ? <p>Email: {form.customerEmail}</p> : null}
              {form.phone ? <p>Phone: {form.phone}</p> : null}
              {form.address ? <p>Address: {form.address}</p> : null}
              <p>Qty: {form.quantity}{form.unit ? ` ${form.unit}` : ''} · {formatPrice(form.amount)}</p>
              {form.notes ? <p>Notes: {form.notes}</p> : null}
            </div>
            <label className="text-sm font-medium">
              Status
              <select className="input-field mt-1" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                {CUSTOMER_PURCHASE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-2 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setForm(null)}>
                Close
              </button>
              <button type="submit" className="btn-primary flex-1">
                Save status
              </button>
            </div>
          </form>
        </Modal>
      )}

      {form && form.source !== 'customer' && (
        <Modal title={form.id ? 'Edit purchase' : 'Record purchase'} onClose={() => setForm(null)}>
          <form className="grid gap-3" onSubmit={save}>
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <ItemThumb item={resolvePurchaseVisual(form, inventory.items)} className="h-28 w-full rounded-2xl" />
            <label className="text-sm font-medium">
              Item
              <select
                className="input-field mt-1"
                value={form.itemId}
                onChange={(event) => {
                  const itemId = event.target.value;
                  const picked = inventory.items.find((item) => item.id === itemId);
                  setForm({
                    ...form,
                    itemId,
                    item: picked?.item || '',
                    image: picked?.image || '',
                    category: picked?.category || '',
                    unit: picked?.unit || form.unit,
                  });
                }}
                required
              >
                <option value="">Select item</option>
                {inventory.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Supplier
              <select className="input-field mt-1" value={form.supplierId} onChange={(event) => setForm({ ...form, supplierId: event.target.value })} required>
                <option value="">Select supplier</option>
                {suppliers.items.filter((row) => row.status !== 'Inactive').map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Quantity
                <input type="number" min="1" className="input-field mt-1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} required />
              </label>
              <label className="text-sm font-medium">
                Unit cost (Rs.)
                <input type="number" min="0" className="input-field mt-1" value={form.unitCost} onChange={(event) => setForm({ ...form, unitCost: event.target.value })} required />
              </label>
              <label className="text-sm font-medium">
                Date
                <input type="date" className="input-field mt-1" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
              </label>
              <label className="text-sm font-medium">
                Status
                <select className="input-field mt-1" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  {PURCHASE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-sm text-slate-500">Amount: {formatPrice(toQty(form.quantity) * toQty(form.unitCost))}</p>
            <div className="mt-2 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Save purchase
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export const SuppliersPage = () => {
  const { suppliers } = useStaff();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2200);
  };

  const filtered = suppliers.items.filter((row) => `${row.name} ${row.category} ${row.email} ${row.contact}`.toLowerCase().includes(query.trim().toLowerCase()));

  const save = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await suppliers.save(form);
      flash(form.id ? 'Supplier updated' : 'Supplier added');
      setForm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pb-8">
      <Toast notice={notice} />
      <Hero
        kicker="Vendors"
        title="Suppliers"
        subtitle="Keep contacts for seeds, compost, tools, and every garden input."
        icon={Truck}
        action={
          <button type="button" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800" onClick={() => { setError(''); setForm({ ...emptySupplier }); }}>
            <span className="inline-flex items-center gap-2">
              <Plus size={16} /> Add supplier
            </span>
          </button>
        }
      />

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
          <input className="input-field pl-10" placeholder="Search suppliers" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {filtered.map((row) => (
          <article key={row.id} className="rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{row.name}</p>
                <p className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CATEGORY_TINTS[row.category] || 'bg-slate-100'}`}>
                  {row.category}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                {row.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{row.contact}</p>
            <p className="text-sm text-slate-500">{row.email}</p>
            {row.address && <p className="mt-1 text-xs text-slate-400">{row.address}</p>}
            <div className="mt-4 flex gap-3 text-xs font-semibold">
              <button type="button" className="text-gs-primary" onClick={() => { setError(''); setForm({ ...row }); }}>
                Edit
              </button>
              <button
                type="button"
                className="text-red-600"
                onClick={async () => {
                  if (window.confirm(`Remove ${row.name}?`)) {
                    try {
                      await suppliers.remove(row.id);
                      flash('Supplier removed');
                    } catch (err) {
                      setError(err.message);
                    }
                  }
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {form && (
        <Modal title={form.id ? 'Edit supplier' : 'Add supplier'} onClose={() => setForm(null)}>
          <form className="grid gap-3" onSubmit={save}>
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <label className="text-sm font-medium">
              Name
              <input className="input-field mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Phone
                <input className="input-field mt-1" value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} />
              </label>
              <label className="text-sm font-medium">
                Email
                <input type="email" className="input-field mt-1" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
            </div>
            <label className="text-sm font-medium">
              Category
              <select className="input-field mt-1" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                {INVENTORY_CATEGORIES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Address
              <input className="input-field mt-1" value={form.address || ''} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </label>
            <label className="text-sm font-medium">
              Status
              <select className="input-field mt-1" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
            <div className="mt-2 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Save supplier
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export const StockPage = () => {
  const { inventory, stock } = useStaff();
  const [typeFilter, setTypeFilter] = useState('All');
  const [itemFilter, setItemFilter] = useState('All');
  const [moveForm, setMoveForm] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2200);
  };

  const records = stock.items.filter((row) => {
    if (typeFilter !== 'All' && row.type !== typeFilter) return false;
    if (itemFilter !== 'All' && row.itemId !== itemFilter) return false;
    return true;
  });

  const submitMove = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await inventory.moveStock(moveForm);
      flash(`${moveForm.type} recorded`);
      setMoveForm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pb-8">
      <Toast notice={notice} />
      <Hero
        kicker="Movements"
        title="Stock transactions"
        subtitle="Every stock in, stock out, damage write-off, and adjustment stays in this history."
        icon={History}
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800" onClick={() => { setError(''); setMoveForm({ ...emptyMove, type: 'Stock In' }); }}>
              <ArrowDownToLine size={16} /> Stock in
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2.5 text-sm font-semibold text-white" onClick={() => { setError(''); setMoveForm({ ...emptyMove, type: 'Stock Out' }); }}>
              <ArrowUpFromLine size={16} /> Stock out
            </button>
          </div>
        }
      />

      <div className="mt-5 flex flex-wrap gap-3">
        <select className="input-field w-44" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
          <option value="All">All types</option>
          {STOCK_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select className="input-field w-56" value={itemFilter} onChange={(event) => setItemFilter(event.target.value)}>
          <option value="All">All items</option>
          {inventory.items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.item}
            </option>
          ))}
        </select>
      </div>

      <ol className="relative mt-6 grid gap-3 border-l-2 border-emerald-100 pl-5">
        {records.length === 0 && (
          <p className="rounded-2xl border border-dashed border-emerald-100 bg-white px-4 py-10 text-center text-sm text-slate-400">
            No movements match these filters.
          </p>
        )}
        {records.map((row) => (
          <li key={row.id} className="relative rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(20,83,45,0.06)]">
            <span className="absolute -left-[27px] top-6 h-3.5 w-3.5 rounded-full bg-emerald-500" />
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{row.item}</p>
                <p className="mt-1 text-sm text-slate-500">{row.note || 'No note'}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STOCK_TYPE_STYLES[row.type]}`}>{row.type}</span>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {row.quantity} units · {formatDate(row.date)} · {row.actorName || 'Staff'}
            </p>
          </li>
        ))}
      </ol>

      {moveForm && (
        <Modal title={moveForm.type} onClose={() => setMoveForm(null)}>
          <form className="grid gap-3" onSubmit={submitMove}>
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <label className="text-sm font-medium">
              Item
              <select className="input-field mt-1" value={moveForm.itemId} onChange={(event) => setMoveForm({ ...moveForm, itemId: event.target.value })} required>
                <option value="">Select item</option>
                {inventory.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item} ({item.stock} {item.unit})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Type
              <select className="input-field mt-1" value={moveForm.type} onChange={(event) => setMoveForm({ ...moveForm, type: event.target.value })}>
                {STOCK_TYPES.filter((type) => type !== 'Adjustment').map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Quantity
              <input type="number" min="1" className="input-field mt-1" value={moveForm.quantity} onChange={(event) => setMoveForm({ ...moveForm, quantity: event.target.value })} required />
            </label>
            {moveForm.type === 'Stock In' && (
              <label className="text-sm font-medium">
                Unit cost (optional)
                <input type="number" min="0" className="input-field mt-1" value={moveForm.unitCost} onChange={(event) => setMoveForm({ ...moveForm, unitCost: event.target.value })} />
              </label>
            )}
            <label className="text-sm font-medium">
              Date
              <input type="date" className="input-field mt-1" value={moveForm.date} onChange={(event) => setMoveForm({ ...moveForm, date: event.target.value })} />
            </label>
            <label className="text-sm font-medium">
              Note
              <textarea className="input-field mt-1 min-h-20" value={moveForm.note} onChange={(event) => setMoveForm({ ...moveForm, note: event.target.value })} />
            </label>
            <div className="mt-2 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setMoveForm(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Record
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
