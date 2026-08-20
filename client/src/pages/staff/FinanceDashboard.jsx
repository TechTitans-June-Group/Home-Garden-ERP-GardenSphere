import { BadgeDollarSign, PieChart, Wallet } from 'lucide-react';
import PortalDashboard from '../../components/staff/PortalDashboard.jsx';
import { useStaff } from '../../context/StaffContext.jsx';
import { ROLE_LABELS } from '../../data/staffData.js';
import { KPI_CARDS, buildKpis, formatKpi } from '../../utils/reports.js';

const FinanceDashboard = () => {
  const staffData = useStaff();
  const { staff } = staffData;
  const kpis = buildKpis(staffData);

  return (
    <PortalDashboard
      title="Finance Dashboard"
      greeting={`Hello ${staff.name.split(' ')[0]}. Track garden expenses, harvest income, and net profit.`}
      stats={[
        ...KPI_CARDS.filter((card) => card.scopes.includes('finance')).map((card) => ({
          label: card.label,
          value: formatKpi(card, kpis),
        })),
        { label: 'Signed in as', value: ROLE_LABELS[staff.role] },
      ]}
      modules={[
        { title: 'Expense register', description: 'Seeds, fertilizers, water, tools, labour, and other garden costs.', to: '/staff/expenses', icon: Wallet, tint: 'bg-orange-100 text-orange-700', comingSoon: true },
        { title: 'Income register', description: 'Vegetable, fruit, plant, and harvest sales income.', to: '/staff/income', icon: BadgeDollarSign, tint: 'bg-emerald-100 text-emerald-700', comingSoon: true },
        { title: 'Financial reports', description: 'Expense, income, profit/loss, monthly, and yearly performance.', to: '/staff/finance-reports', icon: PieChart, tint: 'bg-lime-100 text-lime-700' },
      ]}
    />
  );
};

export default FinanceDashboard;
