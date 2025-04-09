// hooks/useCustomerId.ts
import supabase from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export const useCustomerId = () => {
  const [customerId, setCustomerId] = useState<null | number>(null);

  useEffect(() => {
    const getCustomerId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customer } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_email', user.email)
        .single();

      if (customer?.customer_id) {
        setCustomerId(customer.customer_id);
      }
    };

    getCustomerId();
  }, []);

  return customerId;
};
