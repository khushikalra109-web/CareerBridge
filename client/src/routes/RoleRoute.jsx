import { Navigate } from 'react-router-dom';

function RoleRoute({ user, allowedRoles, children }) {
  const role = user?.role || JSON.parse(localStorage.getItem('user') || 'null')?.role;
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default RoleRoute;
