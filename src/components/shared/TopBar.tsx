
import { Heart, LogOut, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";


const Topbar = () => {
  //const navigate = useNavigate();
  return (
    <>
    <nav className="fixed top-0 left-0 nav-bg w-full h-10 flex justify-between md:hidden items-center text-sm">
        <Link to="/" className="w-24 h-10 mt-2">
          <img
            src="/src/assets/ushop.svg"
            alt="logo"
            width={170}
            height={35}
          />
        </Link>

        <div className="flex items-center border border-transparent p-1">
          <Link to="/cart" className="p-2">
            <ShoppingCart size={24} />
          </Link>
          
          <Link to="/wishlist" className="p-2">
            <Heart size={24} />
          </Link>

          <Button variant="ghost">
            <LogOut size={24} />
          </Button>
        </div>

    </nav>
    </>
  );
};

export default Topbar;