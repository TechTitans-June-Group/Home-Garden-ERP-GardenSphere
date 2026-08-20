import { ClipboardList, Package, PieChart, Truck, Warehouse } from 'lucide-react';
import PortalDashboard from '../../components/staff/PortalDashboard.jsx';
import { useStaff } from '../../context/StaffContext.jsx';
import { ROLE_LABELS } from '../../data/staffData.js';
import { KPI_CARDS, buildKpis, formatKpi } from '../../utils/reports.js';

const InventoryDashboard = () => {
  const staffData = useStaff();
  const { staff, inventory } = staffData;
  const kpis = buildKpis(staffData);

  return (
    <PortalDashboard
      title="Inventory Dashboard"
      greeting={`Welcome ${staff.name.split(' ')[0]}. Keep seeds, soil, tools, and stock movements in one place.`}
      stats={[
        { label: 'Items', value: String(inventory.items.length) },
        ...KPI_CARDS.filter((card) => card.scopes.includes('inventory')).map((card) => ({
          label: card.label,
          value: formatKpi(card, kpis),
        })),
        { label: 'Signed in as', value: ROLE_LABELS[staff.role] },
      ]}
      modules={[
        { title: 'Inventory register', description: 'Manage seeds, fertilizers, tools, and minimum stock levels.', to: '/staff/inventory', icon: Warehouse, tint: 'bg-emerald-100 text-emerald-700', comingSoon: true },
        { title: 'Purchases', description: 'Record supplier purchases and receiving status.', to: '/staff/purchases', icon: Package, tint: 'bg-amber-100 text-amber-700', comingSoon: true },
        { title: 'Suppliers', description: 'Keep contacts for seed, compost, and tool suppliers.', to: '/staff/suppliers', icon: Truck, tint: 'bg-sky-100 text-sky-700', comingSoon: true },
        { title: 'Stock transactions', description: 'Log stock-in and stock-out against garden materials.', to: '/staff/stock', icon: ClipboardList, tint: 'bg-lime-100 text-lime-700', comingSoon: true },
        { title: 'Inventory reports', description: 'Low stock alerts and total inventory value in one report.', to: '/staff/inventory-reports', icon: PieChart, tint: 'bg-teal-100 text-teal-700' },
      ]}
    />
  );
};

export default InventoryDashboard;
