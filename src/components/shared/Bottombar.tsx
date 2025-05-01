import { Link } from "react-router-dom";
import { Heart, Home, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Customer } from "@/types";
import supabase from "@/lib/supabaseClient";

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
        } else {
          setCustomer(data);
        }
      } else if (userError) {
        console.error('Error getting user:', userError.message);
      }
    };

    fetchCustomerData();
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full my-nav flex justify-around p-4 z-50">
      <Link to="/"><Home size={24} /></Link>
      
      {customer?.customer_id ? (
        <Link to="/wishlist"><Heart size={24} /></Link>
      ):(
          <Link to="/login"><Heart size={24} /></Link>
      )}

      {customer?.customer_id ? (
        <Link to="/cart"><ShoppingCart size={24} /></Link>
      ):(
          <Link to="/login"><ShoppingCart size={24} /></Link>
      )}      


          {customer?.customer_image ? (
      <Link to="/profile">
        <Avatar className="h-9 w-9 rounded-full">            
          <AvatarImage
           src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${customer.customer_image}`}
           alt={customer.customer_name}
           className="rounded-full w-9 h-9" 
           />        
        </Avatar>
      </Link>
          ):(
            <Link to="/login">
            <Avatar className="h-9 w-9 rounded-full">
              <AvatarFallback className="rounded-full">CN</AvatarFallback>
            </Avatar>
            </Link>
          )}

    </div>
  );
};

export default Bottombar;