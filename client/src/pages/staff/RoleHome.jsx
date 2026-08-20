import { useStaff } from '../../context/StaffContext.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import ManagerDashboard from './ManagerDashboard.jsx';
import GardenerDashboard from './GardenerDashboard.jsx';
import InventoryDashboard from './InventoryDashboard.jsx';
import FinanceDashboard from './FinanceDashboard.jsx';

const RoleHome = () => {
  const { staff } = useStaff();
  if (staff.role === 'admin') return <AdminDashboard />;
  if (staff.role === 'garden_manager') return <ManagerDashboard />;
  if (staff.role === 'gardener') return <GardenerDashboard />;
  if (staff.role === 'inventory_manager') return <InventoryDashboard />;
  if (staff.role === 'finance_manager') return <FinanceDashboard />;
  return <p>No dashboard for this role.</p>;
};

export default RoleHome;
