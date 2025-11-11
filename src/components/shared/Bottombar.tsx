import { Link } from "react-router-dom";
import { Heart, Home, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Customer } from "@/types";
import { apiGet } from "@/lib/api";

const Bottombar = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      const email = localStorage.getItem('auth_email');
      if (!email) return;

      try {
        const customers = await apiGet<Customer[]>(`/customers.php?email=${encodeURIComponent(email)}`);
        if (customers && customers.length > 0) {
          setCustomer(customers[0]);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
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


          {customer?.customer_id ? (
      <Link to="/profile">
        <Avatar className="h-9 w-9 rounded-full">  
          {customer.customer_image ? (
          <AvatarImage
          src={`/${customer.customer_image}`}
          alt={customer.customer_name}
          className="rounded-full w-9 h-9" 
          /> 
          ):(
            <AvatarFallback className="rounded-full">{customer.customer_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
          )}
        </Avatar>
      </Link>
          ):(
            <Link to="/login">
            <Avatar className="h-9 w-9 rounded-full">
              <AvatarFallback className="rounded-full">US</AvatarFallback>
            </Avatar>
            </Link>
          )}

    </div>
  );
};

export default Bottombar;