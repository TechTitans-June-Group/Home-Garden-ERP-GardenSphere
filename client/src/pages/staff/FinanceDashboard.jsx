import { BadgeDollarSign, PieChart, Wallet } from 'lucide-react';
import PortalDashboard from '../../components/staff/PortalDashboard.jsx';
import { useStaff } from '../../context/StaffContext.jsx';
import { ROLE_LABELS } from '../../data/staffData.js';
import { formatPrice } from '../../utils/format.js';

const FinanceDashboard = () => {
  const { staff, expenses, income } = useStaff();
  const totalIncome = income.items.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = expenses.items.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <PortalDashboard
      title="Finance Dashboard"
      greeting={`Hello ${staff.name.split(' ')[0]}. Track garden expenses, harvest income, and net profit.`}
      stats={[
        { label: 'Income', value: formatPrice(totalIncome) },
        { label: 'Expenses', value: formatPrice(totalExpense) },
        { label: 'Signed in as', value: ROLE_LABELS[staff.role] },
      ]}
      modules={[
        { title: 'Expense register', description: 'Seeds, fertilizers, water, tools, labour, and other garden costs.', to: '/staff/expenses', icon: Wallet, tint: 'bg-orange-100 text-orange-700', comingSoon: true },
        { title: 'Income register', description: 'Vegetable, fruit, plant, and harvest sales income.', to: '/staff/income', icon: BadgeDollarSign, tint: 'bg-emerald-100 text-emerald-700', comingSoon: true },
        { title: 'Financial reports', description: 'Income vs expenses with net profit for GardenSphere operations.', to: '/staff/finance-reports', icon: PieChart, tint: 'bg-lime-100 text-lime-700', comingSoon: true },
      ]}
    />
  );
};

export default FinanceDashboard;
