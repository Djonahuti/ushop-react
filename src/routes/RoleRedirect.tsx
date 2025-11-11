import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleRedirect() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    switch (user.role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'seller':
        navigate('/seller-dashboard');
        break;
      default:
        navigate('/overview');
        break;
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center my-nav">
          <img
            src="/logo/ushop-small.svg"
            alt="logo"
            className="animate-bounce"
          />
        </div>
    );
  }

  return null; // This component only handles redirects
}
