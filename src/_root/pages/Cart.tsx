import supabase from '@/lib/supabaseClient';
import { CartItem } from '@/types';
import { useEffect, useState } from 'react';


export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customer, error } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_email', user.email)
        .single();

      if (error || !customer) return;

      const { data, error: fetchError } = await supabase
        .from('cart')
        .select('*, products(product_title, product_img1)')
        .eq('customer_id', customer.customer_id);

      if (!fetchError) setItems(data || []);
      setLoading(false);
    };

    fetchCart();
  }, []);

  if (loading) return <div>Loading cart...</div>;
  if (items.length === 0) return <div>Your cart is empty</div>;

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Your Cart</h2>
      {items.map((item) => (
        <div key={item.cart_id} className="border p-2 rounded flex items-center gap-4">
          <img src={`/products/${item.products.product_img1}`} className="w-20 h-20 object-cover" />
          <div>
            <h3 className="font-semibold">{item.products.product_title}</h3>
            <p>Qty: {item.qty}</p>
            <p>Size: {item.size}</p>
            <p>Price: ${item.p_price}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
