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
import supabase from '@/lib/supabaseClient'
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
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('order_id')
      .eq('invoice_no', invoice_no)
      .single();

    if (orderError || !orderData) {
      toast.error('Failed to find order.');
      return;
    }

    const orderId = orderData.order_id;

    await supabase
      .from('orders')
      .update({ order_status: 'COMPLETED' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'RECEIVED' })
      .eq('invoice_no', invoice_no);

    // Log the status update in order_status_history
    await supabase
      .from('order_status_history')
      .insert([{ order_id: orderId, status: 'COMPLETED' }]);

    toast.success('RECEIVED!');
    setOrders(order.filter(o => o.invoice_no !== invoice_no));
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customerData } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_email', user?.email)
        .single();

      if (!customerData) return;
        setCustomer(customerData);

      const { data: orderData, error } = await supabase
        .from('orders')
        .select(`*, order_items(*, qty, products(product_title, product_img1, product_price)), customers(customer_name, customer_email)`)
        .eq('customer_id', customerData.customer_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch orders', error.message);
        return;
      }

      setOrders(orderData || []);
      setFilteredOrders(orderData || []);
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
      const { data: bankData } = await supabase
        .from('banks')
        .select('*')

      setBank(bankData || []);
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
    supabase
      .from('feedbacks')
      .select('rating')
      .eq('order_id', orderId)
      .not('order_item_id', 'is', null)
      .order('rating', { ascending: false })
      .limit(1)
      .then(({ data }) => data?.[0] && setFeedback(data[0]))
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