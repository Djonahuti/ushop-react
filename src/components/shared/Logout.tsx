import supabase from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

const Logout: React.FC = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      console.log('Logged out successfully');
      // Optionally, redirect the user or update the UI state
      navigate ('/login'); // Redirect to login page or home page
    }
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