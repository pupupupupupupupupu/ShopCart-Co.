import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ADMIN_ROLE = 5150;

const RequireAdmin = () => {
  const { auth } = useAuth();

  const isAdmin =
    auth?.roles && Array.isArray(auth.roles) && auth.roles.includes(ADMIN_ROLE);

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default RequireAdmin;
