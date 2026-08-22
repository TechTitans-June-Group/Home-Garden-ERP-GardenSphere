import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStaff } from '../../context/StaffContext.jsx';
import { hasPermission } from '../../data/staffData.js';

const StaffProtected = ({ roles, permission }) => {
  const { staff, permissions } = useStaff();
  const location = useLocation();

  if (!staff) {
    return <Navigate to="/staff/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(staff.role)) {
    return <Navigate to="/staff" replace />;
  }

  if (permission && !hasPermission(permissions, staff.role, permission)) {
    return <Navigate to="/staff" replace />;
  }

  return <Outlet />;
};

export default StaffProtected;
