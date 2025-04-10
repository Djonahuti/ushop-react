import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { PendingOrder } from '@/types';

export default function AdminPendingOrders() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);

  useEffect(() => {
    const fetchPending = async () => {
      const { data } = await supabase
        .from('pending_orders')
        .select('*, products(product_title), customers(customer_name)')


      setOrders(data || []);
    };

    fetchPending();
  }, []);

  const handleConfirm = async (invoice_no: number) => {
    await supabase
      .from('orders')
      .update({ order_status: 'Payment confirmed' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'Payment confirmed' })
      .eq('invoice_no', invoice_no);

    alert('Payment confirmed!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  const handleShipped = async (invoice_no: number) => {
    await supabase
      .from('orders')
      .update({ order_status: 'SHIPPED' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'SHIPPED' })
      .eq('invoice_no', invoice_no);

    alert('SHIPPED!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  const handleWaiting = async (invoice_no: number) => {
    await supabase
      .from('orders')
      .update({ order_status: 'WAITING TO BE SHIPPED' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'WAITING TO BE SHIPPED' })
      .eq('invoice_no', invoice_no);

    alert('WAITING TO BE SHIPPED!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  const handleOutForDelivery = async (invoice_no: number) => {
    await supabase
      .from('orders')
      .update({ order_status: 'OUT FOR DELIVERY' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'OUT FOR DELIVERY' })
      .eq('invoice_no', invoice_no);

    alert('OUT FOR DELIVERY!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  const handleDelivered = async (invoice_no: number) => {
    await supabase
      .from('orders')
      .update({ order_status: 'DELIVERED' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'DELIVERED' })
      .eq('invoice_no', invoice_no);

    alert('DELIVERED!');
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
            <p><strong>Status:</strong> {order.order_status}</p>

          {order.order_status === 'Paid' && (
            <Button onClick={() => handleConfirm(order.invoice_no)} className="mt-2">
            Confirm Payment
          </Button>            
          )}

          {order.order_status === 'Payment confirmed' && (
            <Button onClick={() => handleWaiting(order.invoice_no)} className="mt-2 ml-2">
            Mark as Waiting
          </Button>            
          )}

          {order.order_status === 'WAITING TO BE SHIPPED' && (
            <Button onClick={() => handleShipped(order.invoice_no)} className="mt-2 ml-2">
            Mark as Shipped
          </Button>            
          )}            

          {order.order_status === 'SHIPPED' && (
            <Button onClick={() => handleOutForDelivery(order.invoice_no)} className="mt-2 ml-2">
            Mark as Out for Delivery
          </Button>            
          )}            

          {order.order_status === 'OUT FOR DELIVERY' && (
            <Button onClick={() => handleDelivered(order.invoice_no)} className="mt-2 ml-2">
            Mark as Delivered
          </Button>
          )}

          </div>
        ))
      )}
    </div>
  );
}
