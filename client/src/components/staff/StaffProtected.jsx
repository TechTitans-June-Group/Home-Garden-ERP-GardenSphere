import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStaff } from '../../context/StaffContext.jsx';

const StaffProtected = ({ roles }) => {
  const { staff } = useStaff();
  const location = useLocation();

  if (!staff) {
    return <Navigate to="/staff/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(staff.role)) {
    return <Navigate to="/staff" replace />;
  }

  return <Outlet />;
};

export default StaffProtected;
