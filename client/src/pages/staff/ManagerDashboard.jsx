import { Bug, ClipboardList, Droplets, FlaskConical, Mail, Package, PieChart, ShoppingCart, Sprout, Truck, Warehouse, Wheat } from 'lucide-react';
import PortalDashboard from '../../components/staff/PortalDashboard.jsx';
import { useStaff } from '../../context/StaffContext.jsx';
import { ROLE_LABELS } from '../../data/staffData.js';
import { KPI_CARDS, buildKpis, formatKpi } from '../../utils/reports.js';

const ManagerDashboard = () => {
  const staffData = useStaff();
  const { staff, irrigation, tasks } = staffData;
  const kpis = buildKpis(staffData);

  return (
    <PortalDashboard
      title="Garden Manager Dashboard"
      greeting={`Good day, ${staff.name.split(' ')[0]}. Crops, irrigation, harvests, and sales are ready.`}
      stats={[
        ...KPI_CARDS.filter((card) => card.scopes.includes('garden')).map((card) => ({
          label: card.label,
          value: formatKpi(card, kpis),
        })),
        { label: 'Irrigation due', value: String(irrigation.items.filter((item) => item.status === 'Due').length) },
        { label: 'Signed in as', value: ROLE_LABELS[staff.role] },
      ]}
      modules={[
        { title: 'Messages', description: 'Read contact form inquiries and reply to customers.', to: '/staff/messages', icon: Mail, tint: 'bg-lime-100 text-lime-700' },
        { title: 'Crop management', description: 'Track varieties, planting dates, locations, and growth stages.', to: '/staff/crops', icon: Sprout, tint: 'bg-emerald-100 text-emerald-700', comingSoon: true },
        { title: 'Irrigation control', description: 'Schedules, watering quantity, and completed watering logs.', to: '/staff/irrigation', icon: Droplets, tint: 'bg-sky-100 text-sky-700', comingSoon: true },
        { title: 'Fertilizer records', description: 'Applications, crop assignments, quantities, and costs.', to: '/staff/fertilizers', icon: FlaskConical, tint: 'bg-lime-100 text-lime-700', comingSoon: true },
        { title: 'Pest & disease desk', description: 'Severity, treatments, and follow-up status for crop health.', to: '/staff/pests', icon: Bug, tint: 'bg-orange-100 text-orange-700', comingSoon: true },
        { title: 'Task board', description: `${tasks.items.filter((item) => item.status !== 'Completed').length} open garden tasks to assign or complete.`, to: '/staff/tasks', icon: ClipboardList, tint: 'bg-amber-100 text-amber-700' },
        { title: 'Harvest records', description: 'Quantities, grades, harvest dates, locations, and selling price.', to: '/staff/harvests', icon: Wheat, tint: 'bg-yellow-100 text-yellow-800' },
        { title: 'Sales desk', description: 'Link harvested lots to customer sales from pending to completed.', to: '/staff/sales', icon: ShoppingCart, tint: 'bg-rose-100 text-rose-700' },
        { title: 'Inventory register', description: 'Manage seeds, fertilizers, tools, and minimum stock levels.', to: '/staff/inventory', icon: Warehouse, tint: 'bg-emerald-100 text-emerald-700' },
        { title: 'Purchases', description: 'Supplier restocks and customer shop orders.', to: '/staff/purchases', icon: Package, tint: 'bg-amber-100 text-amber-700' },
        { title: 'Suppliers', description: 'Keep contacts for seed, compost, and tool suppliers.', to: '/staff/suppliers', icon: Truck, tint: 'bg-sky-100 text-sky-700' },
        { title: 'Garden reports', description: 'Crop, harvest, task, inventory, and profit reports for the garden.', to: '/staff/manager-reports', icon: PieChart, tint: 'bg-teal-100 text-teal-700' },
      ]}
    />
  );
};

export default ManagerDashboard;
