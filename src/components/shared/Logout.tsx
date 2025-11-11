import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

const Logout: React.FC = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
      localStorage.removeItem('auth_email');
      localStorage.removeItem('auth_role');
      console.log('Logged out successfully');
      navigate('/login');
  };

  return (
    <Button variant="ghost"
      onClick={handleLogout}
      className="py-2 rounded"
    >
      <LogOut size={24} />
    </Button>
  );
};

export default Logout;