import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Order, OrderItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { IconCashRegister, IconPackageExport, IconTrolleyFilled } from '@tabler/icons-react';
import { BanknoteX, DoorOpen, Handshake, PackageCheck, Truck } from 'lucide-react';
import DeliveryProgressBar from '@/components/shared/DeliveryProgressBar';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminPendingOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPending = async () => {
      const ords = await apiGet<any[]>('/orders.php');
      if (!ords) return;
      const enriched: any[] = [];
      for (const o of ords) {
        const items = await apiGet<any[]>(`/order_items.php?order_id=${o.order_id}`);
        const mapped: any[] = [];
        for (const it of items || []) {
          const p = await apiGet<any>(`/product.php?product_id=${it.product_id}`);
          mapped.push({ ...it, products: { product_title: p?.product_title, product_price: p?.product_price, product_img1: p?.product_img1 } });
        }
        const custs = await apiGet<any[]>(`/customers.php`);
        const customer = custs?.find(c => c.customer_id === o.customer_id);
        enriched.push({ ...o, order_items: mapped, customers: { customer_name: customer?.customer_name } });
          }        
      setOrders(enriched as any);
      setFilteredOrders(enriched as any);
    };

    fetchPending();
  }, []);

  const renderFeedbackStatus = (order: Order) => {
    if (order.order_status !== 'COMPLETED') return null
    return (
      <div className="space-x-2 text-lg">
        <HighestProductFeedback orderId={order.order_id} />
      </div>
    )
  }

  useEffect(() => {
    const filtered = orders.filter(order => {
      const matchStatus = tab === 'all' || order.order_status === tab;
      const matchSearch = search.trim().length === 0 || (
        order.invoice_no.toString().includes(search) ||
         Array.isArray(order.order_items) && order.order_items.some((item: OrderItem) => item.products?.product_title?.toLowerCase().includes(search.toLowerCase())) ||
        order.customers?.customer_name?.toLowerCase().includes(search.toLowerCase())
      );
      return matchStatus && matchSearch;
    });

    setFilteredOrders(filtered);
  }, [search, tab, orders]);  

  const handleConfirm = async (invoice_no: number) => {
    const ords = await apiGet<any[]>('/orders.php');
    const found = ords?.find(o => o.invoice_no === invoice_no);
    if (!found) { toast.error('Failed to find order.'); return; }
    await fetch(`${window.location.origin}/api/orders_status_set.php?invoice_no=${invoice_no}&status=${encodeURIComponent('Payment confirmed')}`, { method: 'POST' });
    await fetch(`${window.location.origin}/api/pending_orders_status_set.php?invoice_no=${invoice_no}&status=${encodeURIComponent('Payment confirmed')}`, { method: 'POST' });
    await fetch(`${window.location.origin}/api/order_status_history.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: found.order_id, status: 'Payment confirmed' }) });
    toast.success('Payment confirmed!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  const handleShipped = async (invoice_no: number) => {
    const ords = await apiGet<any[]>('/orders.php');
    const found = ords?.find(o => o.invoice_no === invoice_no);
    if (!found) { toast.error('Failed to find order.'); return; }
    await fetch(`${window.location.origin}/api/orders_status_set.php?invoice_no=${invoice_no}&status=SHIPPED`, { method: 'POST' });
    await fetch(`${window.location.origin}/api/pending_orders_status_set.php?invoice_no=${invoice_no}&status=SHIPPED`, { method: 'POST' });
    await fetch(`${window.location.origin}/api/order_status_history.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: found.order_id, status: 'Shipped' }) });
    toast.success('SHIPPED!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  const handleWaiting = async (invoice_no: number) => {
    const ords = await apiGet<any[]>('/orders.php');
    const found = ords?.find(o => o.invoice_no === invoice_no);
    if (!found) { toast.error('Failed to find order.'); return; }
    await fetch(`${window.location.origin}/api/orders_status_set.php?invoice_no=${invoice_no}&status=${encodeURIComponent('WAITING TO BE SHIPPED')}`, { method: 'POST' });
    await fetch(`${window.location.origin}/api/pending_orders_status_set.php?invoice_no=${invoice_no}&status=${encodeURIComponent('WAITING TO BE SHIPPED')}`, { method: 'POST' });
    await fetch(`${window.location.origin}/api/order_status_history.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: found.order_id, status: 'Waiting to be Shipped' }) });
    toast.success('WAITING TO BE SHIPPED!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  const handleOutForDelivery = async (invoice_no: number) => {
    const ords = await apiGet<any[]>('/orders.php');
    const found = ords?.find(o => o.invoice_no === invoice_no);
    if (!found) { toast.error('Failed to find order.'); return; }
    await fetch(`${window.location.origin}/api/orders_status_set.php?invoice_no=${invoice_no}&status=${encodeURIComponent('OUT FOR DELIVERY')}`, { method: 'POST' });
    await fetch(`${window.location.origin}/api/pending_orders_status_set.php?invoice_no=${invoice_no}&status=${encodeURIComponent('OUT FOR DELIVERY')}`, { method: 'POST' });
    await fetch(`${window.location.origin}/api/order_status_history.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: found.order_id, status: 'Out for delivery' }) });
    toast.success('OUT FOR DELIVERY!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  const handleDelivered = async (invoice_no: number) => {
    const ords = await apiGet<any[]>('/orders.php');
    const found = ords?.find(o => o.invoice_no === invoice_no);
    if (!found) { toast.error('Failed to find order.'); return; }
    await fetch(`${window.location.origin}/api/orders_status_set.php?invoice_no=${invoice_no}&status=DELIVERED`, { method: 'POST' });
    await fetch(`${window.location.origin}/api/pending_orders_status_set.php?invoice_no=${invoice_no}&status=DELIVERED`, { method: 'POST' });
    await fetch(`${window.location.origin}/api/order_status_history.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: found.order_id, status: 'Delivered' }) });
    toast.success('DELIVERED!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Tabs defaultValue="all" onValueChange={setTab}>
        <TabsList className="flex flex-wrap gap-1 mb-4">
          <TabsTrigger value="all" className="text-[10px] md:text-xs sm:text-xs">All</TabsTrigger>
          <TabsTrigger value="Pending" className="text-[10px] md:text-xs sm:text-xs">To Pay</TabsTrigger>
          <TabsTrigger value="Paid" className="text-[10px] md:text-xs sm:text-xs">Paid</TabsTrigger>
          <TabsTrigger value="Payment confirmed" className="text-[10px] md:text-xs sm:text-xs">Confirmed</TabsTrigger>
          <TabsTrigger value="WAITING TO BE SHIPPED" className="text-[10px] md:text-xs sm:text-xs">To Ship</TabsTrigger>
          <TabsTrigger value="SHIPPED" className="text-[10px] md:text-xs sm:text-xs">Shipped</TabsTrigger>
          <TabsTrigger value="OUT FOR DELIVERY" className="text-[10px] md:text-xs sm:text-xs">Sent</TabsTrigger>
          <TabsTrigger value="DELIVERED" className="text-[10px] md:text-xs sm:text-xs">Arrived</TabsTrigger>
          <TabsTrigger value="COMPLETED" className="text-[10px] md:text-xs sm:text-xs">Completed</TabsTrigger>
        </TabsList>

        <div className="flex gap-2 items-center mb-6">
          <Input
            placeholder="Search by order ID, product, or customer name"
            className="max-w-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => setSearch('')}>Clear</Button>
        </div>

        <TabsContent value={tab}>
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <p className="text-muted-foreground">No orders found.</p>
            ) : (
              filteredOrders.map(order => (
                <Card key={order.order_id} className="shadow-sm">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium capitalize">{order.order_status}</span>
                      </div>
                      <div className="space-x-2 text-sm">
                        <span>Order ID: <span className="text-blue-500">{order.invoice_no}</span></span>
                        <Link
                         to="/order-history" 
                         className="p-0 h-auto text-sm"
                         state={{ order_id: order.order_id }}
                        >
                          See Status History
                        </Link>
                      </div>
                    </div>

                    <Separator className="my-2" />

            {Array.isArray(order.order_items) && order.order_items.map((item: OrderItem, index) => (
                    <div key={`${item.order_item_id}-${index}`} className="flex gap-4">
                      <img
                        src={`/products/${item.products?.product_img1 || 'default.png'}`}
                        alt=""
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          <Label className="font-medium text-sm text-orange-600">
                            {order.customers?.customer_name || 'Your Order'}
                          </Label>
                          <p className="font-medium text-sm mt-1">{item.products?.product_title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            ₦{item.products?.product_price?.toLocaleString()} × {item.qty}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                    <Separator className="my-2" />

                    <div className="text-right text-base font-medium">
                     <div className="flex justify-between text-base">

                      {order.order_status === 'Paid' && (
                    <Button onClick={() => handleConfirm(order.invoice_no)} className="mt-2" title="Confirm Payment">
                      <IconCashRegister stroke={2} />
                     </Button>            
                      )}

                      {order.order_status === 'Payment confirmed' && (
                      <Button onClick={() => handleWaiting(order.invoice_no)} className="mt-2 ml-2" title="Mark as Waiting">
                        <IconTrolleyFilled />
                    </Button>            
                      )}

                      {order.order_status === 'WAITING TO BE SHIPPED' && (
                      <Button onClick={() => handleShipped(order.invoice_no)} className="mt-2 ml-2" title="Mark as Shipped">
                        <Truck />
                    </Button>            
                      )}            

                      {order.order_status === 'SHIPPED' && (
                      <Button onClick={() => handleOutForDelivery(order.invoice_no)} title="Mark as Out for delivery">
                        <IconPackageExport stroke={2} />
                    </Button>            
                      )}            

                      {order.order_status === 'OUT FOR DELIVERY' && (
                      <Button onClick={() => handleDelivered(order.invoice_no)} className="mt-2 ml-2" title="Mark as Delivered">
                        <Handshake />
                    </Button>
                      )}

                      {order.order_status === 'Pending' && (
                     <Button className='mt-2 ml-2'>
                      <BanknoteX />                      
                     </Button>                      
                      )}

                      {order.order_status === 'DELIVERED' && (
                     <Button className='mt-2 ml-2'>
                      <DoorOpen />                     
                     </Button>                      
                      )}

                      {order.order_status === 'COMPLETED' && (
                     <Button className='mt-2 ml-2'>
                      <PackageCheck />
                     </Button>                       
                      )}

                      {renderFeedbackStatus(order)}
                    </div>                                          
                      <DeliveryProgressBar status={order.order_status} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const HighestProductFeedback: React.FC<{ orderId: number }> = ({ orderId }) => {
  const [feedback, setFeedback] = useState<{ rating: number }>({ rating: 0 })
  useEffect(() => {
    (async () => {
      const data = await apiGet<Array<{ rating:number; order_item_id:number | null }>>(`/feedbacks.php?order_id=${orderId}`)
      const top = (data || []).filter(f => f.order_item_id !== null).sort((a,b) => b.rating - a.rating)[0]
      if (top) setFeedback({ rating: top.rating })
    })()
  }, [orderId])
  return (
    <p className="flex items-center">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`${
            index < feedback.rating ? "text-yellow-400" : "text-gray-200"
          }`}
        >
          ★
        </span>
      ))}
    </p>
  )
}