import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiGet, apiPost } from '@/lib/api';
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
      const banksData = await apiGet<Bank[]>('/banks.php');
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
      const email = localStorage.getItem('auth_email');
      if (!email) return;
      const customers = await apiGet<any[]>(`/customers.php?email=${encodeURIComponent(email)}`);
      const customerData = customers?.[0];
      if (!customerData) return;
      setCustomer(customerData);

      const cartData = await apiGet<any[]>(`/cart.php?customer_id=${customerData.customer_id}`);
      const enriched: any[] = [];
      for (const c of (cartData || [])) {
        const p = await apiGet<any>(`/product.php?product_id=${c.product_id}`);
        enriched.push({ ...c, products: { product_title: p?.product_title, product_price: p?.product_price, product_img1: p?.product_img1 } });
      }
      setCart(enriched);
      const totalAmount = (enriched || []).reduce((sum, item) => sum + (Number(item.p_price) * item.qty), 0);
      setTotal(totalAmount);
    };

    fetchCustomerAndCart();
  }, []);

  const handleApplyCoupon = async () => {
    const coupon = await apiGet<any>(`/coupons.php?code=${encodeURIComponent(couponCode)}`);
    if (!coupon) { toast.error('Invalid coupon code'); return; }
    if (coupon.coupon_used >= coupon.coupon_limit) { toast.error('Invalid or Expired coupon'); return; }
    const discounted = total - Number(coupon.coupon_price);
    setDiscount(Number(coupon.coupon_price));
    setTotal(discounted < 0 ? 0 : discounted);
    await apiPost('/coupons_update_used.php', { coupon_id: coupon.coupon_id, coupon_used: coupon.coupon_used + 1 });
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

        const existingOrder = await apiGet<any | null>(`/orders.php?invoice_no=${invoice_no}`);
        const existingPendingOrder = await apiGet<any | null>(`/pending_orders.php?invoice_no=${invoice_no}`);

        isUnique = !existingOrder && !existingPendingOrder;
      }

    // Save to orders
    try {
      const newOrder = await apiPost<any>('/orders.php', {
        customer_id: customer.customer_id,
        due_amount: Math.round(total),
        invoice_no,
        order_date: new Date().toISOString(),
        order_status: 'Pending',
      });

      if (!newOrder?.order_id) {
        toast.error("Failed to place order.");
        return;
      }

      const pendingOrder = await apiPost<any>('/pending_orders.php', {
        customer_id: customer.customer_id,
        invoice_no,
        order_status: 'Pending',
        order_id: newOrder.order_id,
      });

      if (!pendingOrder?.p_order_id) {
        toast.error("Failed to create pending order.");
        return;
      }

      for (const item of cart) {
        const prod = await apiGet<any>(`/product.php?product_id=${item.product_id}`);
        await apiPost('/pending_order_items.php', {
          pending_order_id: pendingOrder.p_order_id,
          product_id: item.product_id,
          qty: item.qty,
          size: item.size,
          seller_id: prod?.seller_id ?? null,
        });

        await apiPost('/order_items.php', {
          order_id: newOrder.order_id,
          product_id: item.product_id,
          qty: item.qty,
          size: item.size,
        });
      }

      await apiPost('/order_status_history.php', { order_id: newOrder.order_id, status: 'Pending' });

    // After successfully placing the order, check for bundles in the cart
    for (const item of cart) {
      const bundle = await apiGet<any>(`/choices.php?choice_id=${item.product_id}`);

      if (bundle && bundle.choice_id) {
        await fetch(`${window.location.origin}/api/choice_products.php?choice_id=${bundle.choice_id}`, { method: 'DELETE' });
        await fetch(`${window.location.origin}/api/choices.php?choice_id=${bundle.choice_id}`, { method: 'DELETE' });
      }
    }                

      // Clear the cart after successful order placement
      await fetch(`${window.location.origin}/api/cart.php?customer_id=${customer.customer_id}`, { method: 'DELETE' });

      // Send invoice email
      if (newOrder?.order_id) {
        try {
          await apiPost('/send_invoice_email.php', { order_id: newOrder.order_id });
        } catch (error) {
          console.error('Failed to send invoice email:', error);
        }
      }

      setModalInvoiceNo(invoice_no ?? null);
      setShowModal(true);
      toast.success("Order placed successfully! Invoice has been sent to your email.");
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
