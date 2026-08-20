import ResourcePage from '../../components/staff/ResourcePage.jsx';
import { useStaff } from '../../context/StaffContext.jsx';

export const InventoryPage = () => {
  const { inventory } = useStaff();
  return (
    <ResourcePage
      title="Manage Inventory"
      subtitle="Seeds, fertilizers, tools, and other garden materials."
      records={inventory.items}
      onSave={inventory.save}
      onDelete={inventory.remove}
      defaults={{ item: '', category: 'Seeds', stock: '', minStock: '', unit: 'Pcs', value: '' }}
      columns={[
        { key: 'item', label: 'Item' },
        { key: 'category', label: 'Category' },
        { key: 'stock', label: 'Stock' },
        { key: 'minStock', label: 'Min' },
        { key: 'unit', label: 'Unit' },
        { key: 'value', label: 'Value' },
      ]}
      fields={[
        { name: 'item', label: 'Item name' },
        { name: 'category', label: 'Category', type: 'select', options: ['Seeds', 'Fertilizers', 'Soil', 'Pesticides', 'Tools', 'Irrigation equipment'] },
        { name: 'stock', label: 'Stock', type: 'number' },
        { name: 'minStock', label: 'Minimum stock', type: 'number' },
        { name: 'unit', label: 'Unit' },
        { name: 'value', label: 'Value', type: 'number' },
      ]}
    />
  );
};

export const PurchasesPage = () => {
  const { purchases } = useStaff();
  return (
    <ResourcePage
      title="Manage Purchases"
      subtitle="Supplier purchases and receiving status."
      records={purchases.items}
      onSave={purchases.save}
      onDelete={purchases.remove}
      statusKey="status"
      defaults={{ item: '', supplier: '', date: '', quantity: '', amount: '', status: 'Ordered' }}
      columns={[
        { key: 'item', label: 'Item' },
        { key: 'supplier', label: 'Supplier' },
        { key: 'date', label: 'Date' },
        { key: 'quantity', label: 'Qty' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'item', label: 'Item' },
        { name: 'supplier', label: 'Supplier' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'quantity', label: 'Quantity', type: 'number' },
        { name: 'amount', label: 'Amount', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['Ordered', 'Received'] },
      ]}
    />
  );
};

export const SuppliersPage = () => {
  const { suppliers } = useStaff();
  return (
    <ResourcePage
      title="Manage Suppliers"
      subtitle="Seed, compost, tool, and material suppliers."
      records={suppliers.items}
      onSave={suppliers.save}
      onDelete={suppliers.remove}
      statusKey="status"
      defaults={{ name: '', contact: '', email: '', category: 'Seeds', status: 'Active' }}
      columns={[
        { key: 'name', label: 'Supplier' },
        { key: 'contact', label: 'Contact' },
        { key: 'email', label: 'Email' },
        { key: 'category', label: 'Category' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'name', label: 'Name' },
        { name: 'contact', label: 'Phone' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'category', label: 'Category' },
        { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      ]}
    />
  );
};

export const StockPage = () => {
  const { stock } = useStaff();
  return (
    <ResourcePage
      title="Stock Transactions"
      subtitle="Stock-in and stock-out history for garden materials."
      records={stock.items}
      onSave={stock.save}
      onDelete={stock.remove}
      defaults={{ item: '', type: 'Stock In', quantity: '', date: '', note: '' }}
      columns={[
        { key: 'item', label: 'Item' },
        { key: 'type', label: 'Type' },
        { key: 'quantity', label: 'Qty' },
        { key: 'date', label: 'Date' },
        { key: 'note', label: 'Note' },
      ]}
      fields={[
        { name: 'item', label: 'Item' },
        { name: 'type', label: 'Type', type: 'select', options: ['Stock In', 'Stock Out'] },
        { name: 'quantity', label: 'Quantity', type: 'number' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'note', label: 'Note', required: false },
      ]}
    />
  );
};

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
