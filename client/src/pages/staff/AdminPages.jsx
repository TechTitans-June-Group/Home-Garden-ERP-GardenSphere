import { useStaff } from '../../context/StaffContext.jsx';
import { formatPrice } from '../../utils/format.js';

export const SystemReportsPage = () => {
  const { users, crops, harvests, sales, inventory, expenses, income, tasks } = useStaff();
  const totalIncome = income.items.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = expenses.items.reduce((sum, item) => sum + Number(item.amount), 0);
  const rows = [
    ['Staff users', users.items.length],
    ['Active crops', crops.items.length],
    ['Harvest records', harvests.items.length],
    ['Sales orders', sales.items.length],
    ['Inventory items', inventory.items.length],
    ['Low stock', inventory.items.filter((i) => Number(i.stock) <= Number(i.minStock)).length],
    ['Open tasks', tasks.items.filter((t) => t.status !== 'Completed').length],
    ['Total income', formatPrice(totalIncome)],
    ['Total expenses', formatPrice(totalExpense)],
    ['Net profit', formatPrice(totalIncome - totalExpense)],
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">System Reports</h1>
      <p className="mt-1 text-slate-500">High-level GardenSphere operations and finance snapshot.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <article key={label} className="rounded-[28px] bg-white px-5 py-6 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </div>
    </div>
  );
};
