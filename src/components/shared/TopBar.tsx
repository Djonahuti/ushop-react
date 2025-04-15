
import { Heart, LogOut, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Customer } from "@/types";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { toast } from "sonner";


const Topbar = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      const {data: {user}, error: userError} = await supabase.auth.getUser();

      if (user) {
        const {data, error} = await supabase
        .from('customers')
        .select('*')
        .eq('customer_email', user.email)
        .single();

        if (error) {
          console.error('Error fetching customer data:', error.message);
          toast.error('Error fetching customer data');
        } else {
          setCustomer(data);
        }
      } else if (userError) {
        console.error('Error getting user:', userError.message);
        toast.error('Error getting user');
      }
    };

    fetchCustomerData();
  }, []);

    const handleLogout = async () => {
      await supabase.auth.signOut()
      window.location.href = "/login"
    }  
  //const navigate = useNavigate();
  return (
    <>
    <nav className="fixed top-0 left-0 my-nav w-full h-19 flex justify-between items-center text-sm z-50 space-x-2">
        <Link to="/" className="w-24 h-10 mt-2">
          <img
            src="/src/assets/ushop.svg"
            alt="logo"
            width={170}
            height={35}
          />
        </Link>

        <div className="flex items-center border border-transparent p-1">
          <Link to="/profile">
            <Avatar className="h-8 w-8 rounded-lg">
              {customer?.customer_image ? (
              <AvatarImage
               src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${customer.customer_image}`}
               alt={customer.customer_name}
               className="rounded-full w-10 h-9" 
               />
              ):(
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              )}
            </Avatar>
          </Link>          
          <Link to="/cart" className="p-2">
            <ShoppingCart size={24} />
          </Link>
          <Link to="/wishlist" className="p-2">
            <Heart size={24} />
          </Link>
          <button
           onClick={handleLogout}
           className="flex w-full text-left cursor-pointer"
          >
            <LogOut size={24} />
          </button>
        </div>

    </nav>
    </>
  );
};

export default Topbar;