import { Link } from "react-router-dom";
import { Home, ShoppingCart, User } from "lucide-react";

const Bottombar = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full my-nav flex justify-around p-4 z-50">
      <Link to="/"><Home size={24} /></Link>
      <Link to="/cart"><ShoppingCart size={24} /></Link>
      <Link to="/profile"><User size={24} /></Link>
    </div>
  );
};

export default Bottombar;