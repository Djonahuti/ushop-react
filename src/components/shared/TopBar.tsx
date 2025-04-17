
import { BellIcon, CreditCardIcon, Heart, LogOutIcon, ShoppingCart, UserCircleIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Customer } from "@/types";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import ThemeToggle from "../ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

const Topbar = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);  

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
        } else {
          setCustomer(data);
        }
      } else if (userError) {
        console.error('Error getting user:', userError.message);
      }
    };

    fetchCustomerData();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: customer, error } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_email', user.email)
        .single();

      if (error || !customer) return;

      const { count: cCount } = await supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customer.customer_id);

      const { count: wCount } = await supabase
        .from('wishlist')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customer.customer_id);
  
      setWishlistCount(wCount || 0);
      setCartCount(cCount || 0);
    };
  
    fetchCounts();
  }, []);  

    const handleLogout = async () => {
      await supabase.auth.signOut()
      window.location.href = "/login"
    }  
  //const navigate = useNavigate();
  return (
    <>
    <nav className="fixed top-0 left-0 my-nav w-full h-16 flex justify-between items-center text-sm z-50 space-x-2">
        <Link to="/" className="w-24 h-10 mt-2">
          <img
            src="/src/assets/ushop.svg"
            alt="logo"
            width={170}
            height={35}
          />
        </Link>

        <div className="flex items-center border border-transparent p-1">
        {customer && customer.customer_image ? (
      <DropdownMenu>
        <DropdownMenuTrigger>
            <Avatar className="h-10 w-10 rounded-lg">
            {customer.customer_image ? (
            <AvatarImage
            src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${customer.customer_image}`}
            alt={customer.customer_name}
            className="w-10 h-10 rounded-full border-gray-300" 
            />
            ):(
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            )}
            </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-full grayscale">
            {customer.customer_image ? (
                <AvatarImage
                  src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${customer.customer_image}`} 
                  alt={customer.customer_name}
                  className="rounded-full" 
                />
                ):(
                    <AvatarFallback className="rounded-full">CN</AvatarFallback>
                )}
              </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{customer.customer_name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                  {customer.customer_email}
                  </span>
                </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link to="/overview" className="flex justify-between gap-2">
                <UserCircleIcon />Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCardIcon />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BellIcon />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <button onClick={handleLogout} className="flex space-x-0 w-full text-left cursor-pointer">
              <LogOutIcon />
              Log out
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
        <Link to="/login" className="rounded-full">
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarFallback className="rounded-full">CN</AvatarFallback>
          </Avatar>        
        </Link>

  )}   
      
          <Link
           to="/cart" 
           className="p-2 flex items-center space-x-1 relative">
            <ShoppingCart size={24} />
          {customer && (
            <span className="bg-green-500 text-white rounded-full px-2 text-xs">{cartCount}</span>
          )}
          </Link>
          <Link
           to="/wishlist" 
           className="p-2 flex items-center space-x-1 relative">
            <Heart size={24} />
            {customer && (
            <span className="bg-red-500 text-white rounded-full px-2 text-xs">{wishlistCount}</span>
          )}
          </Link>


        <ThemeToggle />

        </div>

    </nav>
    </>
  );
};

export default Topbar;