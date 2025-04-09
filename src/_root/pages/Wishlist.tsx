import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { WishlistItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';


export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Handle remove item from wishlist
  const handleRemove = async (wishlist_id: number) => {
    await supabase.from('wishlist').delete().eq('wishlist_id', wishlist_id);
    setItems(items.filter(item => item.wishlist_id !== wishlist_id));
  };

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
            <Button
              variant="ghost"
              type="button"
              size="sm"
              className="mt-2 bg-red-500 rounded-full hover:bg-red-600 transition duration-200 text-white"
              onClick={() => handleRemove(item.wishlist_id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
