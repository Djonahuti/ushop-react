import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";

const useCustomerData = () => {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      const email = localStorage.getItem('auth_email');
      if (!email) { setLoading(false); return; }
      try {
        const data = await apiGet<any[]>(`/customers.php?email=${encodeURIComponent(email)}`);
        setCustomer(data?.[0] || null);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
      setLoading(false);
    };

    fetchCustomerData();
  }, []);

  return { customer, loading };
};

export default useCustomerData;