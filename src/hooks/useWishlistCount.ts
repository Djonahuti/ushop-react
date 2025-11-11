// hooks/useWishlistCount.ts
import { useEffect, useState } from 'react';
import { useCustomerId } from './useCustomerId';
import { apiGet } from '@/lib/api';

export const useWishlistCount = () => {
  const [count, setCount] = useState(0);
  const customerId = useCustomerId();

  useEffect(() => {
    const getCount = async () => {
      if (!customerId) return;

      const items = await apiGet<any[]>(`/wishlist.php?customer_id=${customerId}`);
      setCount(items?.length || 0);
    };

    getCount();
  }, [customerId]);

  return count;
};
