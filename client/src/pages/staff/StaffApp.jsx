import { Navigate, Route, Routes } from 'react-router-dom';
import StaffProtected from '../../components/staff/StaffProtected.jsx';
import StaffLayout from '../../layouts/StaffLayout.jsx';
import StaffLogin from './StaffLogin.jsx';
import RoleHome from './RoleHome.jsx';
import ComingSoon from './ComingSoon.jsx';
import { SystemReportsPage, ManagerReportsPage, FinanceReportsPage, InventoryReportsPage } from './ReportsHub.jsx';
import { ActivityPage, RolesPage, UsersPage } from './UserManagement.jsx';
import { MyTasksPage, TasksPage } from './TaskPages.jsx';

const StaffApp = () => {
  return (
    <Routes>
      <Route path="login" element={<StaffLogin />} />
      <Route element={<StaffProtected />}>
        <Route element={<StaffLayout />}>
          <Route index element={<RoleHome />} />

          <Route element={<StaffProtected roles={['admin']} />}>
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="reports" element={<SystemReportsPage />} />
          </Route>

          <Route element={<StaffProtected roles={['admin', 'garden_manager']} />}>
            <Route path="crops" element={<ComingSoon title="Crops" />} />
            <Route path="irrigation" element={<ComingSoon title="Irrigation" />} />
            <Route path="fertilizers" element={<ComingSoon title="Fertilizers" />} />
            <Route path="pests" element={<ComingSoon title="Pests / Diseases" />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="harvests" element={<ComingSoon title="Harvests" />} />
            <Route path="sales" element={<ComingSoon title="Sales" />} />
            <Route path="manager-reports" element={<ManagerReportsPage />} />
          </Route>

          <Route element={<StaffProtected roles={['gardener']} />}>
            <Route path="my-tasks" element={<MyTasksPage />} />
          </Route>

          <Route element={<StaffProtected roles={['admin', 'gardener']} />}>
            <Route path="record-irrigation" element={<ComingSoon title="Irrigation" />} />
            <Route path="maintenance" element={<ComingSoon title="Maintenance" />} />
            <Route path="report-pest" element={<ComingSoon title="Pest Report" />} />
            <Route path="record-harvest" element={<ComingSoon title="Harvest" />} />
          </Route>

          <Route element={<StaffProtected roles={['admin', 'inventory_manager']} />}>
            <Route path="inventory" element={<ComingSoon title="Inventory" />} />
            <Route path="purchases" element={<ComingSoon title="Purchases" />} />
            <Route path="suppliers" element={<ComingSoon title="Suppliers" />} />
            <Route path="stock" element={<ComingSoon title="Stock Moves" />} />
            <Route path="inventory-reports" element={<InventoryReportsPage />} />
          </Route>

          <Route element={<StaffProtected roles={['admin', 'finance_manager']} />}>
            <Route path="expenses" element={<ComingSoon title="Expenses" />} />
            <Route path="income" element={<ComingSoon title="Income" />} />
            <Route path="finance-reports" element={<FinanceReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/staff" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default StaffApp;
