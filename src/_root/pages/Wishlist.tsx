import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { WishlistItem } from '@/types';


export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customer, error } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_email', user.email)
        .single();

      if (error || !customer) return;

      const { data, error: fetchError } = await supabase
        .from('wishlist')
        .select('*, products(product_title, product_img1, product_price)')
        .eq('customer_id', customer.customer_id);

      if (!fetchError) setItems(data || []);
      setLoading(false);
    };

    fetchWishlist();
  }, []);

  if (loading) return <div>Loading wishlist...</div>;
  if (items.length === 0) return <div>Your wishlist is empty</div>;

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Your Wishlist</h2>
      {items.map((item) => (
        <div key={item.wishlist_id} className="border p-2 rounded flex items-center gap-4">
          <img src={`/products/${item.products.product_img1}`} className="w-20 h-20 object-cover" />
          <div>
            <h3 className="font-semibold">{item.products.product_title}</h3>
            <p className="text-green-700 font-semibold">₦{item.products.product_price}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
