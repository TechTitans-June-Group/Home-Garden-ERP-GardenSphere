import ResourcePage from '../../components/staff/ResourcePage.jsx';
import { useStaff } from '../../context/StaffContext.jsx';
import { ROLE_LABELS, ROLE_PERMISSIONS } from '../../data/staffData.js';
import { formatPrice } from '../../utils/format.js';

export const UsersPage = () => {
  const { users } = useStaff();
  return (
    <ResourcePage
      title="Manage Users"
      subtitle="Create staff accounts, assign roles, and deactivate users."
      records={users.items}
      onSave={users.save}
      onDelete={users.remove}
      statusKey="status"
      defaults={{ name: '', email: '', phone: '', role: 'gardener', password: 'Staff@123', status: 'Active' }}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'phone', label: 'Phone' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'name', label: 'Full name' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone' },
        { name: 'password', label: 'Password' },
        { name: 'role', label: 'Role', type: 'select', options: Object.keys(ROLE_LABELS) },
        { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      ]}
    />
  );
};

export const RolesPage = () => (
  <div>
    <h1 className="text-3xl font-bold text-slate-900">Manage Roles</h1>
    <p className="mt-1 text-slate-500">Role-based access for GardenSphere staff workspaces.</p>
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
        <article key={role} className="rounded-[28px] bg-white p-6 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">{role}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{ROLE_LABELS[role]}</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {permissions.map((item) => (
              <li key={item} className="rounded-2xl bg-[#F3F7F1] px-3 py-2 text-slate-600">
                {item}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  </div>
);

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
