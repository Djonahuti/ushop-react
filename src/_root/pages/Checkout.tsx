import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import supabase from '@/lib/supabaseClient';
import { Bank, Customer } from '@/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';


export default function Checkout() {
  const [cart, setCart] = useState<{ cart_id: number; qty: number; size: string; p_price: number; product_id: number; products: { product_title: string; product_price: number; product_img1: string } }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalInvoiceNo, setModalInvoiceNo] = useState<number | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);

  useEffect(() => {
    const loadBanks = async () => {
      const { data: banksData } = await supabase.from('banks').select('*');
      setBanks(banksData || []);
    };
    loadBanks();
  }, []);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'offline'>('paypal');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerAndCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_email', user.email)
        .single();

      if (!customerData) return;

    setCustomer(customerData);

      const { data: cartData } = await supabase
        .from('cart')
        .select('*, products(product_title, product_price, product_img1)')
        .eq('customer_id', customerData.customer_id || 0);

      setCart(cartData || []);
      const totalAmount = (cartData || []).reduce((sum, item) => sum + (Number(item.p_price) * item.qty), 0);
      setTotal(totalAmount);
    };

    fetchCustomerAndCart();
  }, []);

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
      if (!customer) {
        toast.error("Customer not found. Please log in again.");
        return;
      }

      let invoice_no;
      let isUnique = false;

      // Generate a unique invoice number
      while (!isUnique) {
        invoice_no = Math.floor(Math.random() * 900000000000) + 100000000000; // Generate a random invoice number
  
        // Check if the invoice number already exists in both tables
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('invoice_no')
          .eq('invoice_no', invoice_no)
          .single();
  
        const { data: existingPendingOrder } = await supabase
          .from('pending_orders')
          .select('invoice_no')
          .eq('invoice_no', invoice_no)
          .single();
  
        // If no existing invoice found in both tables, we have a unique invoice number
        isUnique = !existingOrder && !existingPendingOrder;
      }

    // Save to orders
    try {
      // First, insert the order into the orders table
      const { error: orderInsertError } = await supabase.from('orders').insert({
        customer_id: customer.customer_id,
        due_amount: Math.round(total),
        invoice_no,
        order_date: new Date().toISOString(),
        order_status: 'Pending',
      });

      if (orderInsertError) {
        console.error("Order insert error:", orderInsertError);
        toast.error("Failed to place order.");
        return;
      }

      // Retrieve the order ID of the newly created order
      const { data: orderData, error: orderFetchError } = await supabase
        .from('orders')
        .select('order_id')
        .eq('invoice_no', invoice_no)
        .single();

      if (orderFetchError || !orderData) {
        console.error("Failed to fetch order ID:", orderFetchError);
        toast.error("Failed to log order status.");
        return;
      }

        // Now insert each product into the pending_orders and pending_order_items
        const { error: pendingOrderError } = await supabase.from('pending_orders').insert({
          customer_id: customer.customer_id,
          invoice_no, // Use the same invoice_no for all products
          order_status: 'Pending',
        });
  
        if (pendingOrderError) {
          console.error("Pending order insert error:", pendingOrderError);
          toast.error("Failed to create pending order.");
          return;
        }
  
        // Retrieve the pending order ID
        const { data: pendingOrderData, error: pendingOrderFetchError } = await supabase
          .from('pending_orders')
          .select('p_order_id')
          .eq('invoice_no', invoice_no)
          .single();
  
        if (pendingOrderFetchError || !pendingOrderData) {
          console.error("Failed to fetch pending order ID:", pendingOrderFetchError);
          toast.error("Failed to log pending order status.");
          return;
        }      

        // Insert each product into the order_items and pending_order_items table
        for (const item of cart) {
          // Retrieve the seller_id from the product
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('seller_id')
            .eq('product_id', item.product_id)
            .single();
  
          if (productError || !productData) {
            console.error("Failed to fetch product data:", productError?.message);
            toast.error("Failed to retrieve product information.");
            return;
          }

          // Insert into pending_order_items
          const { error: pendingOrderItemError } = await supabase.from('pending_order_items').insert({
            pending_order_id: pendingOrderData.p_order_id, // Use the pending order ID
            product_id: item.product_id,
            qty: item.qty,
            size: item.size,
            seller_id: productData.seller_id, // Include seller_id
          });
  
          if (pendingOrderItemError) {
            console.error("Pending order item insert error:", pendingOrderItemError);
            toast.error("Failed to add product to pending order.");
            return;
          }          
  
          // Insert into order_items
          const { error: orderItemError } = await supabase.from('order_items').insert({
            order_id: orderData.order_id, // Use the order ID from the orders table
            product_id: item.product_id,
            qty: item.qty,
            size: item.size,
          });
  
          if (orderItemError) {
            console.error("Order item insert error:", orderItemError);
            toast.error("Failed to add product to order.");
            return;
          }
  
        }

      // Log the status update in order_status_history
      await supabase
        .from('order_status_history')
        .insert([{ order_id: orderData.order_id, status: 'Pending' }]);

    // After successfully placing the order, check for bundles in the cart
    for (const item of cart) {
      const { data: bundle } = await supabase
        .from('choices')
        .select('*')
        .eq('choice_id', item.product_id) // Assuming product_id is used to identify bundles
        .single();

      if (bundle) {
        // Delete from choices and choice_products
        await supabase.from('choice_products').delete().eq('choice_id', bundle.choice_id);
        await supabase.from('choices').delete().eq('choice_id', bundle.choice_id);
      }
    }                

      // Clear the cart after successful order placement
      await supabase.from('cart').delete().eq('customer_id', customer.customer_id);

      setModalInvoiceNo(invoice_no ?? null);
      setShowModal(true);
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error("Unexpected error placing order:", err);
      toast.error("Something went wrong while placing your order.");
    }
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
          <div className="myBox rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Order Submitted!</h3>
            <p className="mb-2">
              Your order has been submitted!<br />
              <span className="font-semibold">Invoice No:</span> {modalInvoiceNo}
            </p>
            <p className="mb-2">Please pay to one of the following bank accounts:</p>
            <Table>
              <TableCaption>Please pay to one of the following bank accounts:</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead className="w-[100px]">Bank</TableHead>
                  <TableHead>AC NO</TableHead>
                  <TableHead className="text-right">AC Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banks.length === 0 && <TableRow><TableCell>No Banks found</TableCell></TableRow>}
                {banks.map((bank) => (
                  <TableRow key={bank.bank_id}>
                    <TableCell><img src={bank.logo_url} alt="bankLogo" width="50" /></TableCell>
                    <TableCell className="font-medium">{bank.bank_name}</TableCell>
                    <TableCell>{bank.account_number}</TableCell>
                    <TableCell>{bank.account_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
              onClick={() => {
                setShowModal(false);
                navigate('/my-orders');
              }}
              className="w-full"
            >
              OK
            </Button>
          </div>
        </div>
      )}      
    </div>
  );
}
