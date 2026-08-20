import {
  BadgeDollarSign,
  Bug,
  ClipboardList,
  Droplets,
  FlaskConical,
  Leaf,
  Mail,
  Package,
  PieChart,
  Shield,
  ShoppingCart,
  Sprout,
  Truck,
  Users,
  Wallet,
  Warehouse,
  Wheat,
} from 'lucide-react';
import PortalDashboard from '../../components/staff/PortalDashboard.jsx';
import { useStaff } from '../../context/StaffContext.jsx';
import { ROLE_LABELS } from '../../data/staffData.js';
import { KPI_CARDS, buildKpis, formatKpi } from '../../utils/reports.js';

const AdminDashboard = () => {
  const staffData = useStaff();
  const { staff, users, crops, inventory, tasks } = staffData;
  const kpis = buildKpis(staffData);

  return (
    <PortalDashboard
      title="Admin Dashboard"
      greeting={`Welcome back, ${staff.name.split(' ')[0]}. All GardenSphere portals are available from this overview.`}
      quickTo="/staff/users"
      stats={[
        ...KPI_CARDS.filter((card) => card.scopes.includes('full')).map((card) => ({
          label: card.label,
          value: formatKpi(card, kpis),
        })),
        { label: 'Signed in as', value: ROLE_LABELS[staff.role] },
      ]}
      modules={[
        {
          title: 'User & profile management',
          description: 'Create staff accounts, assign roles, and deactivate users across GardenSphere.',
          to: '/staff/users',
          icon: Users,
          tint: 'bg-emerald-100 text-emerald-700',
        },
        {
          title: 'Role & permission control',
          description: 'Assign roles and turn permissions on or off for every staff workspace.',
          to: '/staff/roles',
          icon: Shield,
          tint: 'bg-lime-100 text-lime-700',
        },
        {
          title: 'User activity',
          description: 'Review logins, role changes, password resets, and account deactivations.',
          to: '/staff/activity',
          icon: ClipboardList,
          tint: 'bg-sky-100 text-sky-700',
        },
        {
          title: 'Messages',
          description: 'Read contact form inquiries and reply to customers from the admin inbox.',
          to: '/staff/messages',
          icon: Mail,
          tint: 'bg-lime-100 text-lime-700',
        },
        {
          title: 'System reports',
          description: `Snapshot of ${users.items.length} users, ${crops.items.length} crops, and ${inventory.items.length} inventory items.`,
          to: '/staff/reports',
          icon: PieChart,
          tint: 'bg-amber-100 text-amber-700',
        },
        {
          title: 'Crop management',
          description: 'Track varieties, planting dates, locations, and growth stages.',
          to: '/staff/crops',
          icon: Sprout,
          tint: 'bg-emerald-100 text-emerald-700',
          comingSoon: true,
        },
        {
          title: 'Irrigation control',
          description: 'Schedules, watering quantity, and completed watering logs.',
          to: '/staff/irrigation',
          icon: Droplets,
          tint: 'bg-sky-100 text-sky-700',
          comingSoon: true,
        },
        {
          title: 'Fertilizer records',
          description: 'Applications, crop assignments, quantities, and costs.',
          to: '/staff/fertilizers',
          icon: FlaskConical,
          tint: 'bg-lime-100 text-lime-700',
          comingSoon: true,
        },
        {
          title: 'Pest & disease desk',
          description: 'Severity, treatments, and follow-up status for crop health.',
          to: '/staff/pests',
          icon: Bug,
          tint: 'bg-orange-100 text-orange-700',
          comingSoon: true,
        },
        {
          title: 'Task board',
          description: `${tasks.items.filter((item) => item.status !== 'Completed').length} open garden tasks to assign or complete.`,
          to: '/staff/tasks',
          icon: ClipboardList,
          tint: 'bg-amber-100 text-amber-700',
        },
        {
          title: 'Maintenance',
          description: 'Record mulching, staking, weeding, and other garden care.',
          to: '/staff/maintenance',
          icon: Leaf,
          tint: 'bg-lime-100 text-lime-700',
          comingSoon: true,
        },
        {
          title: 'Harvest records',
          description: 'Quantities, grades, harvest dates, and locations.',
          to: '/staff/harvests',
          icon: Wheat,
          tint: 'bg-yellow-100 text-yellow-800',
        },
        {
          title: 'Sales desk',
          description: 'Link harvest lots to customer sales from pending to completed.',
          to: '/staff/sales',
          icon: ShoppingCart,
          tint: 'bg-rose-100 text-rose-700',
        },
        {
          title: 'Inventory register',
          description: 'Manage seeds, fertilizers, tools, and minimum stock levels.',
          to: '/staff/inventory',
          icon: Warehouse,
          tint: 'bg-emerald-100 text-emerald-700',
        },
        {
          title: 'Purchases',
          description: 'Record supplier purchases and receiving status.',
          to: '/staff/purchases',
          icon: Package,
          tint: 'bg-amber-100 text-amber-700',
        },
        {
          title: 'Suppliers',
          description: 'Keep contacts for seed, compost, and tool suppliers.',
          to: '/staff/suppliers',
          icon: Truck,
          tint: 'bg-sky-100 text-sky-700',
        },
        {
          title: 'Stock transactions',
          description: 'Log stock-in, stock-out, and damaged write-offs against garden materials.',
          to: '/staff/stock',
          icon: ClipboardList,
          tint: 'bg-lime-100 text-lime-700',
        },
        {
          title: 'Expense register',
          description: 'Seeds, fertilizers, water, tools, labour, and other garden costs.',
          to: '/staff/expenses',
          icon: Wallet,
          tint: 'bg-orange-100 text-orange-700',
        },
        {
          title: 'Income register',
          description: 'Vegetable, fruit, plant, and harvest sales income.',
          to: '/staff/income',
          icon: BadgeDollarSign,
          tint: 'bg-emerald-100 text-emerald-700',
        },
      ]}
    />
  );
};

export default AdminDashboard;
