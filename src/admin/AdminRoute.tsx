import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/admin-login" />
  }

  return children
};

export default AdminRoute;
