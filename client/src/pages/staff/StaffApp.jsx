import { Navigate, Route, Routes } from 'react-router-dom';
import StaffProtected from '../../components/staff/StaffProtected.jsx';
import StaffLayout from '../../layouts/StaffLayout.jsx';
import StaffLogin from './StaffLogin.jsx';
import RoleHome from './RoleHome.jsx';
import { SystemReportsPage, ManagerReportsPage, FinanceReportsPage, InventoryReportsPage } from './ReportsHub.jsx';
import { ActivityPage, RolesPage, UsersPage } from './UserManagement.jsx';
import { MyTasksPage, TasksPage } from './TaskPages.jsx';
import { InventoryPage, PurchasesPage, StockPage, SuppliersPage } from './InventoryPages.jsx';
import { ExpensesPage, IncomePage } from './FinancePages.jsx';
import { HarvestReportsPage, HarvestSalesPage, HarvestsPage, RecordHarvestPage } from './HarvestPages.jsx';
import MessagesPage from './MessagesPage.jsx';
import CropsPage from './CropsPages.jsx';
import { IrrigationPage, RecordIrrigationPage } from './IrrigationPages.jsx';
import FertilizersPage from './FertilizersPages.jsx';
import { PestPage, ReportPestPage } from './PestPages.jsx';
import MaintenancePage from './MaintenancePages.jsx';

const StaffApp = () => {
  return (
    <Routes>
      <Route path="login" element={<StaffLogin />} />
      <Route element={<StaffProtected />}>
        <Route element={<StaffLayout />}>
          <Route index element={<RoleHome />} />

          <Route element={<StaffProtected permission="Manage Users" />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Roles" />}>
            <Route path="roles" element={<RolesPage />} />
          </Route>
          <Route element={<StaffProtected permission="View User Activity" />}>
            <Route path="activity" element={<ActivityPage />} />
          </Route>
          <Route element={<StaffProtected permission="View System Reports" />}>
            <Route path="reports" element={<SystemReportsPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Messages" />}>
            <Route path="messages" element={<MessagesPage />} />
          </Route>
          <Route element={<StaffProtected permission={['Manage Crops', 'Crop Updates']} />}>
            <Route path="crops" element={<CropsPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Irrigation" />}>
            <Route path="irrigation" element={<IrrigationPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Fertilizers" />}>
            <Route path="fertilizers" element={<FertilizersPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Pests/Diseases" />}>
            <Route path="pests" element={<PestPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Tasks" />}>
            <Route path="tasks" element={<TasksPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Harvests" />}>
            <Route path="harvests" element={<HarvestsPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Sales" />}>
            <Route path="sales" element={<HarvestSalesPage />} />
          </Route>
          <Route element={<StaffProtected permission="View Reports" />}>
            <Route path="harvest-reports" element={<HarvestReportsPage />} />
            <Route path="manager-reports" element={<ManagerReportsPage />} />
          </Route>
          <Route element={<StaffProtected permission={['View Tasks', 'Update Tasks']} />}>
            <Route path="my-tasks" element={<MyTasksPage />} />
          </Route>
          <Route element={<StaffProtected permission="Record Irrigation" />}>
            <Route path="record-irrigation" element={<RecordIrrigationPage />} />
          </Route>
          <Route element={<StaffProtected permission="Report Pest/Disease" />}>
            <Route path="report-pest" element={<ReportPestPage />} />
          </Route>
          <Route element={<StaffProtected permission="Record Harvest" />}>
            <Route path="record-harvest" element={<RecordHarvestPage />} />
          </Route>
          <Route element={<StaffProtected permission={['Record Maintenance', 'Manage Crops']} />}>
            <Route path="maintenance" element={<MaintenancePage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Inventory" />}>
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="inventory-reports" element={<InventoryReportsPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Purchases" />}>
            <Route path="purchases" element={<PurchasesPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Suppliers" />}>
            <Route path="suppliers" element={<SuppliersPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Stock Transactions" />}>
            <Route path="stock" element={<StockPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Expenses" />}>
            <Route path="expenses" element={<ExpensesPage />} />
          </Route>
          <Route element={<StaffProtected permission="Manage Income" />}>
            <Route path="income" element={<IncomePage />} />
          </Route>
          <Route element={<StaffProtected permission="View Financial Reports" />}>
            <Route path="finance-reports" element={<FinanceReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/staff" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default StaffApp;
