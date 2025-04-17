import { Link } from "react-router-dom";
import { Home, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Customer } from "@/types";
import supabase from "@/lib/supabaseClient";
import { toast } from "sonner";

const Bottombar = () => {
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

  return (
    <div className="fixed bottom-0 left-0 w-full my-nav flex justify-around p-4 z-50">
      <Link to="/"><Home size={24} /></Link>
      <Link to="/cart"><ShoppingCart size={24} /></Link>
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
    </div>
  );
};

export default Bottombar;