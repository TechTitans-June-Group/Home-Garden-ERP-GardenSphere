import { useEffect, useState } from 'react';
import {
  BadgeDollarSign,
  Leaf,
  Plus,
  Search,
  Tags,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { useStaff } from '../../context/StaffContext.jsx';
import { formatDate, formatPrice } from '../../utils/format.js';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_TINTS,
  INCOME_CATEGORIES,
  INCOME_TINTS,
  METHOD_TINTS,
  PAYMENT_METHODS,
  blankFinanceEntry,
} from '../../utils/finance.js';

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

const SummaryStrip = ({ summary }) => {
  const profit = summary.netProfit || 0;
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Total income</p>
        <p className="mt-1 text-2xl font-bold text-emerald-700">{formatPrice(summary.totalIncome || 0)}</p>
        <p className="mt-1 text-xs text-slate-500">{summary.incomeCount || 0} harvest sales records</p>
      </article>
      <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Total expenses</p>
        <p className="mt-1 text-2xl font-bold text-rose-700">{formatPrice(summary.totalExpenses || 0)}</p>
        <p className="mt-1 text-xs text-slate-500">{summary.expenseCount || 0} garden cost records</p>
      </article>
      <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Net profit</p>
        <p className={`mt-1 text-2xl font-bold ${profit < 0 ? 'text-rose-700' : 'text-emerald-800'}`}>{formatPrice(profit)}</p>
        <p className="mt-1 text-xs text-slate-500">Income − Expenses</p>
      </article>
    </div>
  );
};

const CategoryModal = ({ kind, labels, categories, onClose, onSave, onDelete }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const rows = (categories.all || []).filter((row) => row.kind === kind);

  const add = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await onSave({ kind, name });
      setName('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal title={`Manage ${labels.plural}`} onClose={onClose}>
      <form className="grid gap-3" onSubmit={add}>
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="text-sm font-medium">
          New {labels.singular}
          <div className="mt-1 flex gap-2">
            <input className="input-field flex-1" value={name} onChange={(event) => setName(event.target.value)} placeholder={`e.g. ${labels.example}`} />
            <button type="submit" className="btn-primary whitespace-nowrap px-4">
              Add
            </button>
          </div>
        </label>
      </form>
      <div className="mt-4 grid gap-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between rounded-2xl bg-[#F3F7F1] px-3 py-2 text-sm">
            <span className="font-medium text-slate-800">{row.name}</span>
            {row.locked ? (
              <span className="text-[11px] font-semibold text-slate-400">Default</span>
            ) : (
              <button
                type="button"
                className="text-xs font-semibold text-red-600"
                onClick={async () => {
                  if (window.confirm(`Remove ${row.name}?`)) {
                    try {
                      await onDelete(row.id);
                    } catch (err) {
                      setError(err.message);
                    }
                  }
                }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

const LedgerPage = ({
  kind,
  kicker,
  title,
  subtitle,
  icon: Icon,
  records,
  fallbackCategories,
  tints,
  addLabel,
  onSave,
  onDelete,
}) => {
  const { finance } = useStaff();
  const [form, setForm] = useState(null);
  const [manage, setManage] = useState(false);
  const [manageMethods, setManageMethods] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    finance.refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2200);
  };

  const categories = finance.categories?.[kind]?.length ? finance.categories[kind] : fallbackCategories;
  const methods = finance.categories?.payment?.length ? finance.categories.payment : PAYMENT_METHODS;
  const filtered = records.filter((row) => {
    if (category !== 'All' && row.category !== category) return false;
    return `${row.category} ${row.description} ${row.method} ${row.notes}`.toLowerCase().includes(query.trim().toLowerCase());
  });
  const pageTotal = filtered.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const save = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await onSave(form);
      flash(form.id ? `${addLabel} updated` : `${addLabel} recorded`);
      setForm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pb-8">
      <Toast notice={notice} />
      <Hero
        kicker={kicker}
        title={title}
        subtitle={subtitle}
        icon={Icon}
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-full bg-white/15 px-4 py-2.5 text-sm font-semibold text-white" onClick={() => setManage(true)}>
              <span className="inline-flex items-center gap-2">
                <Tags size={16} /> Categories
              </span>
            </button>
            <button type="button" className="rounded-full bg-white/15 px-4 py-2.5 text-sm font-semibold text-white" onClick={() => setManageMethods(true)}>
              Methods
            </button>
            <button
              type="button"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800"
              onClick={() => {
                setError('');
                setForm(blankFinanceEntry(categories[0] || fallbackCategories[0]));
              }}
            >
              <span className="inline-flex items-center gap-2">
                <Plus size={16} /> Record {addLabel.toLowerCase()}
              </span>
            </button>
          </div>
        }
      />

      <SummaryStrip summary={finance.summary} />

      <div className="mt-5 rounded-[24px] border border-emerald-50 bg-white/90 p-4 shadow-[0_10px_40px_rgba(20,83,45,0.05)]">
        <div className="flex flex-wrap gap-2">
          {['All', ...categories].map((name) => (
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
        <label className="relative mt-3 block max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
          <input className="input-field pl-10" placeholder={`Search ${addLabel.toLowerCase()}s`} value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-5 rounded-[28px] bg-white px-6 py-14 text-center shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <Icon className="mx-auto text-emerald-500" size={32} />
          <p className="mt-3 text-lg font-semibold text-slate-900">No {addLabel.toLowerCase()}s match these filters</p>
          <p className="mt-1 text-sm text-slate-500">Record a transaction or clear a category filter.</p>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-[#F3F7F1] text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-emerald-50">
                    <td className="px-4 py-3 text-slate-600">{formatDate(row.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tints[row.category] || 'bg-slate-100 text-slate-700'}`}>
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{row.description}</p>
                      {row.notes ? <p className="text-xs text-slate-400">{row.notes}</p> : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${METHOD_TINTS[row.method] || 'bg-slate-100 text-slate-700'}`}>
                        {row.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{formatPrice(row.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-xs font-semibold">
                        <button type="button" className="text-gs-primary" onClick={() => { setError(''); setForm({ ...row }); }}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={async () => {
                            if (window.confirm(`Delete this ${addLabel.toLowerCase()}?`)) {
                              try {
                                await onDelete(row.id);
                                flash(`${addLabel} removed`);
                              } catch (err) {
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
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-emerald-50 bg-[#F8FBF7] px-4 py-3 text-sm">
            <p className="text-slate-500">{filtered.length} record{filtered.length === 1 ? '' : 's'} in this view</p>
            <p className="font-bold text-slate-900">Subtotal {formatPrice(pageTotal)}</p>
          </div>
        </div>
      )}

      {form && (
        <Modal title={form.id ? `Edit ${addLabel.toLowerCase()}` : `Record ${addLabel.toLowerCase()}`} onClose={() => setForm(null)}>
          <form className="grid gap-3" onSubmit={save}>
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <label className="text-sm font-medium">
              Category
              <select className="input-field mt-1" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
                {categories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Description
              <input className="input-field mt-1" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Date
                <input type="date" className="input-field mt-1" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
              </label>
              <label className="text-sm font-medium">
                Amount (Rs.)
                <input type="number" min="1" step="0.01" className="input-field mt-1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
              </label>
            </div>
            <label className="text-sm font-medium">
              Payment method
              <select className="input-field mt-1" value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })} required>
                {methods.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Notes
              <textarea className="input-field mt-1" value={form.notes || ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>
            <div className="mt-2 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Save {addLabel.toLowerCase()}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {manage && (
        <CategoryModal
          kind={kind}
          labels={
            kind === 'expense'
              ? { singular: 'expense category', plural: 'expense categories', example: 'Insurance' }
              : { singular: 'income category', plural: 'income categories', example: 'Herb sales' }
          }
          categories={finance.categories}
          onClose={() => setManage(false)}
          onSave={finance.saveCategory}
          onDelete={finance.removeCategory}
        />
      )}

      {manageMethods && (
        <CategoryModal
          kind="payment"
          labels={{ singular: 'payment method', plural: 'payment methods', example: 'Mobile pay' }}
          categories={finance.categories}
          onClose={() => setManageMethods(false)}
          onSave={finance.saveCategory}
          onDelete={finance.removeCategory}
        />
      )}
    </div>
  );
};

export const ExpensesPage = () => {
  const { expenses } = useStaff();
  return (
    <LedgerPage
      kind="expense"
      kicker="Money out"
      title="Expenses"
      subtitle="Record seeds, water, labour, transport, and every garden cost."
      icon={Wallet}
      records={expenses.items}
      fallbackCategories={EXPENSE_CATEGORIES}
      tints={EXPENSE_TINTS}
      addLabel="Expense"
      onSave={expenses.save}
      onDelete={expenses.remove}
    />
  );
};

export const IncomePage = () => {
  const { income } = useStaff();
  return (
    <LedgerPage
      kind="income"
      kicker="Money in"
      title="Income"
      subtitle="Record vegetable, fruit, plant, and other harvest sales."
      icon={BadgeDollarSign}
      records={income.items}
      fallbackCategories={INCOME_CATEGORIES}
      tints={INCOME_TINTS}
      addLabel="Income"
      onSave={income.save}
      onDelete={income.remove}
    />
  );
};

export const FinanceOverviewCards = () => {
  const { finance } = useStaff();
  const profit = finance.summary.netProfit || 0;
  return (
    <div className="mb-5 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm shadow-sm">
      {profit < 0 ? <TrendingDown className="text-rose-600" size={16} /> : <TrendingUp className="text-emerald-700" size={16} />}
      <p>
        Net profit {formatPrice(profit)} · {formatPrice(finance.summary.totalIncome || 0)} in · {formatPrice(finance.summary.totalExpenses || 0)} out
      </p>
    </div>
  );
};
