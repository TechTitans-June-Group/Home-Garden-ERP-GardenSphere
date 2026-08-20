import ResourcePage from '../../components/staff/ResourcePage.jsx';
import { useStaff } from '../../context/StaffContext.jsx';

export const ExpensesPage = () => {
  const { expenses } = useStaff();
  return (
    <ResourcePage
      title="Manage Expenses"
      subtitle="Seeds, fertilizers, water, tools, labour, and other garden costs."
      records={expenses.items}
      onSave={expenses.save}
      onDelete={expenses.remove}
      defaults={{ category: 'Seeds', description: '', date: '', amount: '', method: 'Cash' }}
      columns={[
        { key: 'category', label: 'Category' },
        { key: 'description', label: 'Description' },
        { key: 'date', label: 'Date' },
        { key: 'amount', label: 'Amount' },
        { key: 'method', label: 'Method' },
      ]}
      fields={[
        { name: 'category', label: 'Category', type: 'select', options: ['Seeds', 'Fertilizers', 'Soil', 'Tools', 'Water', 'Electricity', 'Pest treatments', 'Labour', 'Other'] },
        { name: 'description', label: 'Description' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'amount', label: 'Amount', type: 'number' },
        { name: 'method', label: 'Payment method', type: 'select', options: ['Cash', 'Bank', 'Card'] },
      ]}
    />
  );
};

export const IncomePage = () => {
  const { income } = useStaff();
  return (
    <ResourcePage
      title="Manage Income"
      subtitle="Vegetable, fruit, plant, and harvest sales income."
      records={income.items}
      onSave={income.save}
      onDelete={income.remove}
      defaults={{ category: 'Vegetable sales', description: '', date: '', amount: '', method: 'Cash' }}
      columns={[
        { key: 'category', label: 'Category' },
        { key: 'description', label: 'Description' },
        { key: 'date', label: 'Date' },
        { key: 'amount', label: 'Amount' },
        { key: 'method', label: 'Method' },
      ]}
      fields={[
        { name: 'category', label: 'Category', type: 'select', options: ['Vegetable sales', 'Fruit sales', 'Plant sales', 'Other harvest sales'] },
        { name: 'description', label: 'Description' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'amount', label: 'Amount', type: 'number' },
        { name: 'method', label: 'Payment method', type: 'select', options: ['Cash', 'Bank', 'Card'] },
      ]}
    />
  );
};

export { FinanceReportsPage } from './ReportsHub.jsx';
