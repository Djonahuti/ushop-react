import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabaseClient';
import { Order } from '@/types';
import { generateInvoicePDF } from '@/utils/generateInvoicePDF';

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<{ customer_id: string } | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: customer } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_email', user?.email)
        .single();
        setCustomer(customer);

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customer?.customer_id)
        .order('created_at', { ascending: false });

      setOrders(data || []);
    };

    fetchOrders();
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

            {order.order_status === 'pending' && (
              <Button onClick={() => navigate(`/confirm-pay/${order.invoice_no}`)} className="mt-2">
                Mark as Completed
              </Button>
            )}

            <Button onClick={() => customer && generateInvoicePDF(order, customer)} className="ml-2">
              Download Invoice
            </Button>

          </div>
        ))
      )}
    </div>
  );
}
