import { Button } from '@/components/ui/button';
import supabase from '@/lib/supabaseClient';
import { Customer } from '@/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';


export default function Checkout() {
  const [cart, setCart] = useState<{ cart_id: number; qty: number; size: string; p_price: number; product_id: number; products: { product_title: string; product_price: number; product_img1: string } }[]>([]);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'offline'>('paypal');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_email', user.email)
        .single();

    setCustomer(customerData);

      const { data } = await supabase
        .from('cart')
        .select('*, products(product_title, product_price)')
        .eq('customer_id', customer?.customer_id || 0);

      setCart(data || []);
      const totalAmount = (data || []).reduce((sum, item) => sum + (Number(item.p_price) * item.qty), 0);
      setTotal(totalAmount);
    };

    fetchCart();
  }, [customer?.customer_id]);

  const handleApplyCoupon = async () => {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('coupon_code', couponCode)
      .single();

    if (error || !coupon) {
      toast.error("Invalid coupon code");
      return;
    }

    // Only apply if coupon not exhausted
    if (!coupon || coupon.coupon_used >= coupon.coupon_limit) {
      toast.error("Invalid or Expired coupon");
      return;
    }

    const discounted = total - Number(coupon.coupon_price);
    setDiscount(Number(coupon.coupon_price));
    setTotal(discounted < 0 ? 0 : discounted);

    // Optionally increment used count
    await supabase
      .from('coupons')
      .update({ coupon_used: coupon.coupon_used + 1 })
      .eq('coupon_id', coupon.coupon_id);
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'offline') {
    const invoice_no = Math.floor(Math.random() * 900000) + 100000; // 6-digit invoice

    // Save to orders
    for (const item of cart) {
      await supabase.from('orders').insert({
        customer_id: customer?.customer_id,
        due_amount: total,
        invoice_no,
        qty: item.qty,
        size: item.size,
        order_date: new Date().toISOString(),
        order_status: 'pending',
      });

      await supabase.from('pending_orders').insert({
        customer_id: customer?.customer_id,
        invoice_no,
        product_id: item.product_id,
        qty: item.qty,
        size: item.size,
        order_status: 'pending',
      });
    }


    // Clear cart
    await supabase.from('cart').delete().eq('customer_id', customer?.customer_id);

    alert(`Your order has been submitted! Invoice No: ${invoice_no}. Please pay to the following bank accounts...`);
    navigate('/my-orders'); // or to order history
  }
  };  

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Checkout</h2>

      {cart.map(item => (
        <div key={item.cart_id} className="flex items-center justify-between mb-2">
          <div>
            <p>{item.products.product_title}</p>
            <p className="text-sm">Qty: {item.qty} | ₦{item.p_price}</p>
          </div>
          <img src={`/products/${item.products.product_img1}`} className="w-12 h-12 object-cover rounded" />
        </div>
      ))}

      <div className="my-4">
        <input
          type="text"
          placeholder="Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <Button onClick={handleApplyCoupon}>Apply Coupon</Button>
        {discount > 0 && <p className="text-green-600">Discount: ₦{discount}</p>}
      </div>

      <div className="my-4">
        <label className="block mb-1 font-semibold">Payment Method:</label>
        <select
          className="border rounded p-2 w-full"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as 'paypal' | 'offline')}
        >
          <option value="paypal">PayPal</option>
          <option value="offline">Pay Offline</option>
        </select>
      </div>

      <div className="text-right text-lg font-bold">
        Total: ₦{total.toLocaleString()}
      </div>

      <Button onClick={handlePlaceOrder} className="mt-4 w-full">
        Place Order
      </Button>
    </div>
  );
}
