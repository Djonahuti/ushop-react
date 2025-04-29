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
  const [bundleItems, setBundleItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchBundles() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: customer } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_email', user.email)
        .single();
      if (!customer) return;
  
      // fetch all bundles for this customer
      const { data } = await supabase
        .from('choices')
        .select(`
          choice_id,
          total_price,
          choice_products (
            choice_product_id,
            original_price,
            discounted_price,
            products ( product_title, product_img1 )
          )
        `)
        .eq('customer_id', customer.customer_id);
  
      setBundleItems(data || []);
    }
  
    fetchBundles();
  }, []);

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

  const handleCheckoutBundle = (bundle: {
    choice_id: number;
    total_price: number;
    choice_products: {
      choice_product_id: number;
      discounted_price: number;
      products: { product_title: string; product_img1: string };
    }[];
  }) => {
    // send the entire bundle payload into location.state
    navigate('/checkout', {
      state: {
        isBundle: true,
        choiceId: bundle.choice_id,
        items: bundle.choice_products.map(cp => ({
          product_title: cp.products.product_title,
          product_img1: cp.products.product_img1,
          p_price: cp.discounted_price,
          qty: 1,            // assume qty=1 per choice_product
        })),
        total: bundle.total_price,
      }
    });
  };
  

  if (loading) return <div>Loading cart...</div>;
  if (items.length === 0) return <div>Your cart is empty</div>;

  return (
    <>
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Your Cart</h2>
      {items.map((item) => (
        <div key={item.cart_id} className="border p-2 rounded flex items-center gap-4">
          <img src={`/products/${item.products.product_img1}`} className="w-20 h-20 object-cover" />
          <div>
            <h3 className="font-semibold">{item.products.product_title}</h3>
            <p>Qty: {item.qty}</p>
            <p>Size: {item.size}</p>
            <p>Price: ₦{Number(item.p_price).toFixed(2)}</p>
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

    {bundleItems.length > 0 && (
  <div className="mt-8 p-4 border-t">
    <h2 className="text-xl font-bold mb-4">Your Bundles</h2>

    {bundleItems.map(bundle => (
      <div key={bundle.choice_id} className="mb-6">
        {bundle.choice_products.map(cp => (
          <div key={cp.choice_product_id} className="flex items-center gap-4 mb-2">
            <img src={`/products/${cp.products.product_img1}`} className="w-16 h-16 object-cover rounded" />
            <div>
              <p className="font-medium">{cp.products.product_title}</p>
              <p className="text-sm">₦{cp.discounted_price.toFixed(2)}</p>
            </div>
          </div>
        ))}

        <div className="text-right font-bold">Bundle Total: ₦{bundle.total_price.toFixed(2)}</div>
        <Button
          variant="default"
          className="mt-2"
          onClick={() => handleCheckoutBundle(bundle)}
        >
          Checkout Bundle
        </Button>
      </div>
    ))}
  </div>
)}

    </>
  );
}
