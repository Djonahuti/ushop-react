// hooks/useCustomerId.ts
import { apiGet } from '@/lib/api';
import { useEffect, useState } from 'react';

export const useCustomerId = () => {
  const [customerId, setCustomerId] = useState<null | number>(null);

  useEffect(() => {
    const getCustomerId = async () => {
      const email = localStorage.getItem('auth_email');
      if (!email) return;

      try {
        const customers = await apiGet<Array<{ customer_id: number }>>(`/customers.php?email=${encodeURIComponent(email)}`);
        const customer = customers?.[0];
        if (customer?.customer_id) {
          setCustomerId(customer.customer_id);
        }
      } catch (error) {
        console.error('Error fetching customer ID:', error);
      }
    };

    getCustomerId();
  }, []);

  return customerId;
};
