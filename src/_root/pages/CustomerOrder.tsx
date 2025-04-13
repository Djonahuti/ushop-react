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
import { Bank, Order } from '@/types'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { generateInvoicePDF } from '@/utils/generateInvoicePDF'
import { IconCreditCard, IconReceipt } from '@tabler/icons-react'
import { PackageCheck } from 'lucide-react'
import DeliveryTimeline from '@/components/shared/DeliveryTimeline'


export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();  
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [banks, setBank] = useState<Bank[]>([]);

  const [customer, setCustomer] = useState<{ customer_id: string } | null>(null);    

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
        .eq('customer_email', user?.email)
        .single();

      if (!customerData) return;
        setCustomer(customerData);

      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*, products(product_title, product_img1, product_price), customers(customer_name, customer_email)')
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

  useEffect(() => {
    const filtered = orders.filter(order => {
      const matchStatus = tab === 'all' || order.order_status === tab;
      const matchSearch = search.trim().length === 0 || (
        order.invoice_no.toString().includes(search) ||
        order.products?.product_title?.toLowerCase().includes(search.toLowerCase()) ||
        order.customers?.customer_name?.toLowerCase().includes(search.toLowerCase())
      );
      return matchStatus && matchSearch;
    });

    setFilteredOrders(filtered);
  }, [search, tab, orders]);

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
          <TabsTrigger value="Paid">Paid</TabsTrigger>
          <TabsTrigger value="Payment confirmed">Payment Confirmed</TabsTrigger>
          <TabsTrigger value="WAITING TO BE SHIPPED">To Ship</TabsTrigger>
          <TabsTrigger value="SHIPPED">Shipped</TabsTrigger>
          <TabsTrigger value="OUT FOR DELIVERY">Out for delivery</TabsTrigger>
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
              filteredOrders.map(order => (
                <Card key={order.order_id} className="shadow-sm">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium capitalize">{order.order_status}</span>
                      </div>
                      <div className="space-x-2 text-sm">
                        <span>Order ID: <span className="text-blue-500">{order.invoice_no}</span></span>
                        <Button variant="link" className="p-0 h-auto text-sm">Order details</Button>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="flex gap-4">
                      <img
                        src={`/products/${order.products?.product_img1 || 'default.png'}`}
                        alt=""
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          <Label className="font-medium text-sm text-orange-600">
                            {order.customers?.customer_name || 'Your Order'}
                          </Label>
                          <p className="font-medium text-sm mt-1">{order.products?.product_title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            ₦{order.products?.product_price?.toLocaleString()} × {order.qty} = ₦{order.due_amount?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="text-right text-base font-medium">
                      Total: ₦{order.due_amount?.toLocaleString()}
                      <DeliveryTimeline status={order.order_status} />                      
                    <div>
                    {order.order_status === 'Pending' && (
                      <Button onClick={() => navigate(`/confirm-pay/${order.invoice_no}`)} className="mt-2" title="Mark as paid">
                        <IconCreditCard stroke={2} />
                      </Button>
                    )}

                    {order.order_status === 'DELIVERED' && (
                      <Button onClick={() => handleReceive(order.invoice_no)} className="mt-2">
                        <PackageCheck />
                      </Button>
                    )}

                    <Button onClick={() => customer && generateInvoicePDF(order, banks)} className="ml-2" title="Download Invoice">
                        <IconReceipt stroke={2} />
                    </Button>
                    </div>                      

                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
