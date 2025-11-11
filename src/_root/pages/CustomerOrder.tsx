'use client'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { Bank, Order, OrderItem } from '@/types'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { generateInvoicePDF } from '@/utils/generateInvoicePDF'
import { IconCreditCard, IconMessage, IconReceipt } from '@tabler/icons-react'
import { PackageCheck } from 'lucide-react'
import DeliveryTimeline from '@/components/shared/DeliveryTimeline'

const CustomerOrders = () => {
  const [order, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();  
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [banks, setBank] = useState<Bank[]>([]);

  const [customer, setCustomer] = useState<{ customer_id: string } | null>(null);    

  const handleReceive = async (invoice_no: number) => {
    try {
      const all = await apiGet<any[]>('/orders.php');
      const found = all.find(o => o.invoice_no === invoice_no);
      if (!found) { toast.error('Failed to find order.'); return; }
      const orderId = found.order_id;
      await fetch(`${window.location.origin}/api/order_status_history.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId, status: 'COMPLETED' }) });
      await fetch(`${window.location.origin}/api/orders_status_set.php?invoice_no=${invoice_no}&status=COMPLETED`, { method: 'POST' });
      await fetch(`${window.location.origin}/api/pending_orders_status_set.php?invoice_no=${invoice_no}&status=RECEIVED`, { method: 'POST' });
    toast.success('RECEIVED!');
    setOrders(order.filter(o => o.invoice_no !== invoice_no));
    } catch {
      toast.error('Failed to update order');
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const email = localStorage.getItem('auth_email');
      if (!email) return;
      const customers = await apiGet<Array<{ customer_id:string; customer_name:string; customer_email:string }>>('/customers.php?email=' + encodeURIComponent(email));
      const customerData = customers?.[0];
      if (!customerData) return;
      setCustomer({ customer_id: customerData.customer_id as any });
      const allOrders = await apiGet<any[]>(`/orders.php?customer_id=${customerData.customer_id}`);
      const enriched: any[] = [];
      for (const o of allOrders) {
        const items = await apiGet<any[]>(`/order_items.php?order_id=${o.order_id}`);
        const mapped: any[] = [];
        for (const it of items) {
          const p = await apiGet<any>(`/product.php?product_id=${it.product_id}`);
          mapped.push({ ...it, products: { product_title: p?.product_title, product_img1: p?.product_img1, product_price: p?.product_price } });
        }
        enriched.push({ ...o, order_items: mapped, customers: { customer_name: customerData.customer_name, customer_email: customerData.customer_email } });
      }
      setOrders(enriched as any);
      setFilteredOrders(enriched as any);
    };

    fetchOrders();
  }, []);

  const handleLeaveFeedback = (orderId: number) => {
    navigate('/feedback', { state: { order_id: orderId } })
  }

  const renderFeedbackStatus = (order: Order) => {
    if (order.order_status !== 'COMPLETED') return null
    if (!order.feedback_complete) {
      return (
        <Button className="mt-2" title="Leave Feedback" onClick={() => handleLeaveFeedback(order.order_id)}>
          <IconMessage />
        </Button>
      )
    }
    // fetch/display highest-rated product feedback for this order
    return (
      <div className="text-lg space-x-2">
        <HighestProductFeedback orderId={order.order_id} />
      </div>

    )
  }  

  useEffect(() => {
    const filtered = order.filter(o => {
      const matchStatus = tab === 'all' || o.order_status === tab;
      const matchSearch = search.trim().length === 0 || (
        o.invoice_no.toString().includes(search) ||
        Array.isArray(o.order_items) && o.order_items.some((item: OrderItem) => item.products?.product_title?.toLowerCase().includes(search.toLowerCase())) ||
        o.customers?.customer_name?.toLowerCase().includes(search.toLowerCase())
      );
      return matchStatus && matchSearch;
    });

    setFilteredOrders(filtered);
  }, [search, tab, order]);

  useEffect(() => {
    const fetchBank = async () => {
      const data = await apiGet<Bank[]>('/banks.php');
      setBank(data || []);
    }
    fetchBank();
  }, []);  
    
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Tabs defaultValue="all" onValueChange={setTab}>
        <TabsList className="flex flex-wrap gap-2 mb-4">
          <TabsTrigger value="all">View all</TabsTrigger>
          <TabsTrigger value="Pending">To Pay</TabsTrigger>
          <TabsTrigger value="DELIVERED">Arrived</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
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
              filteredOrders.map(order => {
                return (
                  <Card key={order.order_id} className="shadow-sm">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium capitalize">{order.order_status}</span>
                      </div>
                      <div className="space-x-2 text-sm">
                        <span>Order ID: <span className="text-blue-500">{order.invoice_no}</span></span>
                        <Link
                         to="/order" 
                         className="p-0 h-auto text-sm"
                         state={{ order_id: order.order_id }}
                        >
                          See Status History
                        </Link>
                      </div>
                    </div>

                    <Separator className="my-2" />

            {Array.isArray(order.order_items) && order.order_items.map((item: OrderItem) => (
                    <div key={item.order_item_id} className="flex gap-4">
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
                    </div>))}

                    <Separator className="my-2" />

                    <div className="text-right text-base font-medium">
                      <div className="flex justify-between text-base mb-2">
                        {order.order_status === 'Pending' && (
                          <Button onClick={() => navigate(`/confirm-pay/${order.invoice_no}`)} className="mt-2" title="Mark as paid">
                            <IconCreditCard stroke={2} />
                          </Button>
                        )}

                        {order.order_status === 'DELIVERED' && (
                          <Button onClick={() => handleReceive(order.invoice_no)} className="mt-2" title="Mark as Recieved">
                            <PackageCheck />
                          </Button>
                        )}

                        {renderFeedbackStatus(order)} 

                        <Button onClick={() => customer && generateInvoicePDF(order, banks)} className="ml-2" title="Download Invoice">
                            <IconReceipt stroke={2} />
                        </Button>                       
                      </div>                      
                      Total: ₦{order.due_amount?.toLocaleString()}
                      <DeliveryTimeline status={order.order_status} />
                    </div>

                  </CardContent>
                </Card>
                );
              })
            )}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}

// HighestProductFeedback component: fetch highest-rated product feedback
const HighestProductFeedback: React.FC<{ orderId: number }> = ({ orderId }) => {
  const [feedback, setFeedback] = useState<{ rating: number }>({ rating: 0 })
  useEffect(() => {
    (async () => {
      const data = await apiGet<Array<{ rating:number; order_item_id:number | null }>>(`/feedbacks.php?order_id=${orderId}`)
      const top = (data || [])
        .filter(f => f.order_item_id !== null)
        .sort((a, b) => b.rating - a.rating)[0]
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

export default CustomerOrders