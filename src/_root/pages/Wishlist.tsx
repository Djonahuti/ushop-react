import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { useCustomerId } from '@/hooks/useCustomerId';

type WishlistItem = {
  wishlist_id: number;
  product_id: number;
  products: {
    product_title: string;
    product_img1: string;
  };
};

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const customerId = useCustomerId();

useEffect(() => {
  const fetchWishlist = async () => {
    if (!customerId) return;

    const { data, error } = await supabase
      .from('wishlist')
      .select('*, products(*, manufacturers(manufacturer_name))')
      .eq('customer_id', customerId);

      if (!error) setWishlist(data || []);
      setLoading(false);
  };

  fetchWishlist();
}, [customerId]);


  if (loading) return <div>Loading wishlist...</div>;
  if (wishlist.length === 0) return <div>Your wishlist is empty</div>;

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Your Wishlist</h2>
      {wishlist.map((item) => (
        <div key={item.wishlist_id} className="border p-2 rounded flex items-center gap-4">
          <img src={`/products/${item.products.product_img1}`} className="w-20 h-20 object-cover" />
          <div>
            <h3 className="font-semibold">{item.products.product_title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
