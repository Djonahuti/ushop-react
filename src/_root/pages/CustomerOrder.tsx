import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabaseClient';
import { Bank, Order } from '@/types';
import { generateInvoicePDF } from '@/utils/generateInvoicePDF';
import { toast } from 'sonner';

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<{ customer_id: string } | null>(null);
  const [banks, setBank] = useState<Bank[]>([]);

  const handleReceive = async (invoice_no: number) => {
    await supabase
      .from('orders')
      .update({ order_status: 'RECEIVED' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'COMPLETED' })
      .eq('invoice_no', invoice_no);

      toast.success('RECEIVED!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };
  
  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customerData } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_email', user.email)
        .single();

      if (!customerData) return;
        setCustomer(customerData);

      const { data: orderData } = await supabase
        .from('orders')
        .select('*, customers(customer_name, customer_email)')
        .eq('customer_id', customerData.customer_id)
        .order('created_at', { ascending: false });

      setOrders(orderData || []);
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchBank = async () => {
      const { data: bankData } = await supabase
        .from('banks')
        .select('*')

      setBank(bankData || []);
    }
    fetchBank();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order.order_id} className="border p-4 rounded mb-4">
            <p><strong>Invoice:</strong> {order.invoice_no}</p>
            <p><strong>Amount:</strong> ₦{order.due_amount}</p>
            <p><strong>Status:</strong> {order.order_status}</p>

            {order.order_status === 'Pending' && (
              <Button onClick={() => navigate(`/confirm-pay/${order.invoice_no}`)} className="mt-2">
                Mark as Paid
              </Button>
            )}

            {order.order_status === 'DELIVERED' && (
              <Button onClick={() => handleReceive(order.invoice_no)} className="mt-2">
                Mark as Completed
              </Button>
            )}

            <Button onClick={() => customer && generateInvoicePDF(order, banks)} className="ml-2">
              Download Invoice
            </Button>

          </div>
        ))
      )}
    </div>
  );
}
