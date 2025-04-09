import supabase from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

const useCustomerData = () => {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
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
      setLoading(false);
    };

    fetchCustomerData();
  }, []);

  return { customer, loading };
};

export default useCustomerData;