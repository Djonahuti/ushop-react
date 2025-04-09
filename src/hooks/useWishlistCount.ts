// hooks/useWishlistCount.ts
import { useEffect, useState } from 'react';
import { useCustomerId } from './useCustomerId';
import supabase from '@/lib/supabaseClient';

export const useWishlistCount = () => {
  const [count, setCount] = useState(0);
  const customerId = useCustomerId();

  useEffect(() => {
    const getCount = async () => {
      if (!customerId) return;

      const { count } = await supabase
        .from('wishlist')
        .select('wishlist_id', { count: 'exact', head: true })
        .eq('customer_id', customerId);

      setCount(count || 0);
    };

    getCount();
  }, [customerId]);

  return count;
};
