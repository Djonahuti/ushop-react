
import { BellIcon, CreditCardIcon, LogOutIcon, UserCircleIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Customer } from "@/types";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import ThemeToggle from "../ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

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
        } else {
          setCustomer(data);
        }
      } else if (userError) {
        console.error('Error getting user:', userError.message);
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
    <nav className="fixed top-0 left-0 my-nav w-full h-16 flex justify-between items-center text-sm z-50 space-x-2">
        <Link to="/" className="w-24 h-10 mt-2 p-2">
          <img
            src="/logo/ushop.svg"
            alt="logo"
            width={170}
            height={35}
          />
        </Link>

        <div className="flex items-center border border-transparent p-1">
        {customer && customer.customer_id ? (
      <DropdownMenu>
        <DropdownMenuTrigger>
            <Avatar className="h-10 w-10 rounded-full">
            {customer.customer_image ? (
            <AvatarImage
            src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${customer.customer_image}`}
            alt={customer.customer_name}
            className="w-10 h-10 rounded-full border-gray-300" 
            />
            ):(
                <AvatarFallback className="rounded-full">{customer.customer_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
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
                    <AvatarFallback className="rounded-full">{customer.customer_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
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
            <AvatarFallback className="rounded-full">US</AvatarFallback>
          </Avatar>        
        </Link>

  )}


        <ThemeToggle />

        </div>

    </nav>
    </>
  );
};

export default Topbar;