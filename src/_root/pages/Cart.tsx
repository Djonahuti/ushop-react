import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import supabase from '@/lib/supabaseClient';
import { CartItem } from '@/types';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Handle total sum of cart
  const total = items.reduce((sum, item) => sum + (Number(item.p_price) * item.qty), 0);

  const handleRemove = async (cart_id: number) => {
    await supabase.from('cart').delete().eq('cart_id', cart_id);
    setItems(items.filter(item => item.cart_id !== cart_id));
  };
  
  const handleQtyChange = async (cart_id: number, qty: number) => {
    await supabase.from('cart').update({ qty }).eq('cart_id', cart_id);
    setItems(prev => prev.map(item => item.cart_id === cart_id ? { ...item, qty } : item));
  };


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
            <Button
              variant="ghost"
              type="button"
              size="sm"
              className="mt-2 bg-red-500 rounded-full hover:bg-red-600 transition duration-200 text-white"
              onClick={() => handleRemove(item.cart_id)}
            >
              <Trash2 size={16} />
            </Button>
            <Input
              type="number"
              value={item.qty}
              min={1}
              onChange={(e) => handleQtyChange(item.cart_id, Number(e.target.value))}
              className="w-16 border p-1 rounded"
            />

            <div className="text-right font-bold text-lg">
              Total: ₦{total.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
      <Button onClick={() => navigate('/checkout')} className="mt-4">
        Proceed to Checkout
      </Button>
    </div>
  );
}
