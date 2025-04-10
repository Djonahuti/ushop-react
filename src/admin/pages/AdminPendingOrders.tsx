import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function AdminPendingOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchPending = async () => {
      const { data } = await supabase
        .from('pending_orders')
        .select('*, products(product_title), customers(customer_name)')
        .eq('order_status', 'processed');


      setOrders(data || []);
    };

    fetchPending();
  }, []);

  const handleConfirm = async (invoice_no: number) => {
    await supabase
      .from('orders')
      .update({ order_status: 'completed' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'completed' })
      .eq('invoice_no', invoice_no);

    alert('Payment confirmed!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pending Orders</h2>
      {orders.length === 0 ? (
        <p>No pending orders.</p>
      ) : (
        orders.map(order => (
          <div key={order.p_order_id} className="border p-3 rounded mb-2">
            <p><strong>Customer:</strong> {order.customers?.customer_name}</p>
            <p><strong>Product:</strong> {order.products?.product_title}</p>
            <p><strong>Qty:</strong> {order.qty} | <strong>Size:</strong> {order.size}</p>
            <p><strong>Invoice:</strong> {order.invoice_no}</p>
            <Button onClick={() => handleConfirm(order.invoice_no)} className="mt-2">
              Confirm Payment
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
