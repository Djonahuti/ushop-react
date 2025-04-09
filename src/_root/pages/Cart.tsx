import supabase from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

type CartItem = {
  cart_id: number;
  qty: number;
  p_price: string;
  size: string;
  product_id: number;
  products: {
    product_title: string;
    product_img1: string;
  };
};

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('cart')
        .select('*, products(product_title, product_img1)')
        .eq('ip_add', user.email);

      if (!error) setItems(data || []);
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
