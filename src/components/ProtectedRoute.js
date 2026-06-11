import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, role }) {
  const { auth } = useAuth();

  if (!auth) return <Navigate to="/auth" />;
  if (role && auth.role !== role) return <Navigate to="/" />;

  return children;
}

export default ProtectedRoute;