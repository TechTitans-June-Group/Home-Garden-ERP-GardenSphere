import { Navigate, useLocation } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user } = useCustomer();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
