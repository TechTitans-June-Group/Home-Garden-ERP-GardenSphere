import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeDollarSign,
  Bug,
  CheckCircle2,
  ClipboardList,
  Download,
  Droplets,
  FlaskConical,
  Leaf,
  Package,
  PieChart,
  Printer,
  Sprout,
  TrendingUp,
  Wallet,
  Warehouse,
  Wheat,
} from 'lucide-react';
import { BarChart, PieChart as GardenPie } from '../../components/staff/GardenCharts.jsx';
import { useStaff } from '../../context/StaffContext.jsx';
import { formatPrice } from '../../utils/format.js';
import {
  KPI_CARDS,
  REPORT_CATALOG,
  buildKpis,
  buildReport,
  downloadCsv,
  formatKpi,
  toNumber,
} from '../../utils/reports.js';

const SCOPE_COPY = {
  full: {
    title: 'Garden intelligence',
    kicker: 'Reports & dashboard',
    subtitle: 'See plants, harvests, stock, tasks, and profit in one colourful garden snapshot.',
  },
  garden: {
    title: 'Garden performance',
    kicker: 'Manager reports',
    subtitle: 'Track crops, water, pests, harvests, and the work waiting in the beds.',
  },
  finance: {
    title: 'Money in the garden',
    kicker: 'Finance reports',
    subtitle: 'Income, expenses, and profit/loss with monthly and yearly views.',
  },
  inventory: {
    title: 'Shed & stock',
    kicker: 'Inventory reports',
    subtitle: 'Spot low stock early and see where inventory value sits.',
  },
};

const KPI_ICONS = {
  totalPlants: Sprout,
  activeCrops: Leaf,
  readyCrops: Wheat,
  pendingTasks: ClipboardList,
  completedTasks: CheckCircle2,
  lowStockItems: AlertTriangle,
  inventoryValue: Warehouse,
  totalHarvest: Package,
  harvestValue: BadgeDollarSign,
  totalExpenses: Wallet,
  totalIncome: BadgeDollarSign,
  netProfit: TrendingUp,
};

const REPORT_ICONS = {
  crop: Sprout,
  harvest: Wheat,
  inventory: Warehouse,
  irrigation: Droplets,
  fertilizer: FlaskConical,
  pest: Bug,
  tasks: ClipboardList,
  expense: Wallet,
  income: BadgeDollarSign,
  profit: TrendingUp,
  monthly: PieChart,
  yearly: PieChart,
};

const countBy = (items, key) => {
  const map = new Map();
  items.forEach((item) => {
    const label = item[key] || 'Other';
    map.set(label, (map.get(label) || 0) + 1);
  });
  return [...map.entries()].map(([label, value]) => ({ label, value }));
};

export const ReportsHub = ({ scope = 'full' }) => {
  const staffData = useStaff();
  const { finance } = staffData;

  useEffect(() => {
    if (scope === 'finance' || scope === 'full') {
      finance?.refresh?.().catch(() => {});
    }
    if (scope === 'garden' || scope === 'full') {
      staffData.harvests?.refresh?.().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);
  const kpis = useMemo(() => buildKpis(staffData), [staffData]);
  const kpiCards = KPI_CARDS.filter((card) => card.scopes.includes(scope));
  const catalog = REPORT_CATALOG.filter((report) => report.scopes.includes(scope));
  const [activeId, setActiveId] = useState(catalog[0]?.id || 'crop');
  const active = catalog.find((report) => report.id === activeId) || catalog[0];
  const report = useMemo(
    () => (active ? buildReport(active.id, staffData) : { columns: [], rows: [], summary: '' }),
    [active, staffData]
  );
  const copy = SCOPE_COPY[scope];
  const ActiveIcon = REPORT_ICONS[active?.id] || PieChart;

  const overviewBar = useMemo(() => {
    if (scope === 'inventory') {
      return {
        title: 'Stock by item',
        data: staffData.inventory.items.map((item) => ({ label: item.item, value: toNumber(item.stock) })),
      };
    }
    if (scope === 'finance') {
      return {
        title: 'Income vs expenses',
        data: [
          { label: 'Income', value: kpis.totalIncome, color: '#16A34A' },
          { label: 'Expenses', value: kpis.totalExpenses, color: '#F97316' },
        ],
      };
    }
    return {
      title: 'Harvest by crop',
      data: staffData.harvests.items.reduce((rows, item) => {
        const current = rows.find((row) => row.label === item.crop);
        if (current) current.value += toNumber(item.quantity);
        else rows.push({ label: item.crop, value: toNumber(item.quantity) });
        return rows;
      }, []),
    };
  }, [kpis.totalExpenses, kpis.totalIncome, scope, staffData.harvests.items, staffData.inventory.items]);

  const overviewPie = useMemo(() => {
    if (scope === 'inventory') {
      return {
        title: 'Value by category',
        data: staffData.inventory.items.reduce((rows, item) => {
          const current = rows.find((row) => row.label === item.category);
          if (current) current.value += toNumber(item.value);
          else rows.push({ label: item.category, value: toNumber(item.value) });
          return rows;
        }, []),
      };
    }
    if (scope === 'finance') {
      return {
        title: 'Income mix',
        data: staffData.income.items.reduce((rows, item) => {
          const current = rows.find((row) => row.label === item.category);
          if (current) current.value += toNumber(item.amount);
          else rows.push({ label: item.category, value: toNumber(item.amount) });
          return rows;
        }, []),
      };
    }
    return {
      title: 'Task status mix',
      data: countBy(staffData.tasks.items, 'status'),
    };
  }, [scope, staffData.income.items, staffData.inventory.items, staffData.tasks.items]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 rounded-[36px] bg-gradient-to-br from-emerald-100/80 via-lime-50 to-transparent" />

      <section className="no-print relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#14532D] via-[#15803D] to-[#84CC16] p-6 text-white shadow-[0_20px_50px_rgba(20,83,45,0.25)] sm:p-8">
        <div className="gs-dot-vine pointer-events-none absolute inset-0 opacity-20" />
        <Leaf className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rotate-12 text-white/10" />
        <Sprout className="pointer-events-none absolute bottom-4 right-24 h-16 w-16 text-white/15" />
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-lime-100">{copy.kicker}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl sm:text-4xl">{copy.title}</h1>
            <p className="mt-2 text-sm text-emerald-50 sm:text-base">{copy.subtitle}</p>
          </div>
          <div className="rounded-3xl bg-white/15 px-5 py-4 backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime-100">Net profit</p>
            <p className={`mt-1 text-2xl font-bold ${kpis.netProfit < 0 ? 'text-orange-100' : 'text-white'}`}>
              {formatPrice(kpis.netProfit)}
            </p>
          </div>
        </div>
      </section>

      <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = KPI_ICONS[card.key] || Leaf;
          return (
            <article
              key={card.key}
              className="rounded-[24px] border border-white/80 bg-white/90 p-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]"
            >
              <span className={`grid h-10 w-10 place-items-center rounded-2xl ${card.tint}`}>
                <Icon size={18} />
              </span>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{card.label}</p>
              <p className={`mt-1 text-2xl font-bold ${card.key === 'netProfit' && kpis.netProfit < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {formatKpi(card, kpis)}
              </p>
            </article>
          );
        })}
      </div>

      <div className="relative mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] bg-gradient-to-br from-white to-emerald-50 p-2 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <BarChart title={overviewBar.title} data={overviewBar.data} />
        </article>
        <article className="rounded-[28px] bg-gradient-to-br from-white to-lime-50 p-2 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <GardenPie title={overviewPie.title} data={overviewPie.data} />
        </article>
      </div>

      <div className="no-print relative mt-8 rounded-[28px] bg-white p-5 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
        <h2 className="text-xl font-bold text-slate-900">Choose a report</h2>
        <p className="mt-1 text-sm text-slate-500">Tap a card to see its bar chart, pie chart, and table.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {catalog.map((item) => {
            const Icon = REPORT_ICONS[item.id] || PieChart;
            const selected = active?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                  selected
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-emerald-50 bg-[#F8FBF6] text-slate-600 hover:border-emerald-200'
                }`}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${selected ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700'}`}>
                  <Icon size={16} />
                </span>
                <span className="text-sm font-semibold leading-5">{item.title.replace(' Report', '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {active && (
        <section id="report-print" className="relative mt-6 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.08)]">
          <div className="bg-gradient-to-r from-emerald-50 via-white to-lime-50 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-600 text-white">
                  <ActiveIcon size={22} />
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{active.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{report.summary}</p>
                </div>
              </div>
              <div className="no-print flex gap-2">
                <button type="button" className="btn-secondary" onClick={() => downloadCsv(active.title, report)}>
                  <Download size={16} /> CSV
                </button>
                <button type="button" className="btn-primary" onClick={() => window.print()}>
                  <Printer size={16} /> Print
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 lg:grid-cols-2">
            <div className="rounded-[24px] border border-emerald-50 bg-[#F8FBF6] p-2">
              <BarChart title={report.bar?.title || 'Bar chart'} data={report.bar?.data || []} />
            </div>
            <div className="rounded-[24px] border border-emerald-50 bg-[#F8FBF6] p-2">
              <GardenPie title={report.pie?.title || 'Pie chart'} data={report.pie?.data || []} />
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="overflow-x-auto rounded-[24px] border border-emerald-50">
              <table className="w-full min-w-[640px] text-left text-sm">
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
                  {report.rows.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-400" colSpan={Math.max(report.columns.length, 1)}>
                        No records in this report yet.
                      </td>
                    </tr>
                  )}
                  {report.rows.map((row, index) => (
                    <tr key={`${active.id}-${index}`} className="border-t border-emerald-50 odd:bg-white even:bg-emerald-50/30">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3 text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {report.extra?.length > 0 && (
              <div className="mt-5 rounded-[24px] bg-emerald-50/60 p-4">
                <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-700">{report.extraTitle}</h4>
                <table className="mt-3 w-full max-w-md text-left text-sm">
                  <thead className="text-slate-600">
                    <tr>
                      {report.extraColumns.map((column) => (
                        <th key={column} className="px-3 py-2 font-semibold">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.extra.map((row, index) => (
                      <tr key={`extra-${index}`} className="border-t border-emerald-100">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 text-slate-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export const SystemReportsPage = () => <ReportsHub scope="full" />;
export const ManagerReportsPage = () => <ReportsHub scope="garden" />;
export const FinanceReportsPage = () => <ReportsHub scope="finance" />;
export const InventoryReportsPage = () => <ReportsHub scope="inventory" />;
