import { Navigate } from 'react-router-dom';

function ProtectedRoute({ user, children }) {
  if (!user && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
