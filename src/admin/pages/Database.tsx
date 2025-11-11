import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Customer, PendingOrder, Payment, Order } from "@/types";
import { toast } from "sonner";
import { BanknoteX, Handshake, PackageCheck, Truck } from "lucide-react";
import { IconCashRegister, IconPackageExport, IconTrolleyFilled } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


export const Database = () => {
  const [pOrders, setPOrders] = useState<PendingOrder[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentsData = await apiGet<any[]>('/payments.php');
        const banks = await apiGet<any[]>('/banks.php');
        
        const hydrated = (paymentsData || []).sort((a, b) => b.payment_id - a.payment_id).map(p => ({
          ...p,
          banks: banks?.find(b => b.bank_id === p.bank_id),
        }));
        
        setPayments(hydrated);
      } catch (error) {
        setError('Failed to fetch payments');
        console.error(error);
      }
    };

    fetchPayments();
  }, []);
  
  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const ordersData = await apiGet<any[]>('/orders.php');
            const customers = await apiGet<any[]>('/customers.php');
            
            const hydrated = (ordersData || []).sort((a, b) => b.order_id - a.order_id).map(o => ({
                ...o,
                customers: customers?.find(c => c.customer_id === o.customer_id),
            }));
            
            setOrders(hydrated);
        } catch (error) {
            setError('Failed to fetch orders');
            console.error(error);
        }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchCustomerData = async () => {
        try {
            const customersData = await apiGet<any[]>('/customers.php');
            setUsers((customersData || []).sort((a, b) => b.customer_id - a.customer_id));
        } catch (error) {
            setError('Failed to fetch customers');
            console.error(error);
        }
    };
    fetchCustomerData();
  }, []);
  
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const pendingOrdersData = await apiGet<any[]>('/pending_orders.php');
        const pendingOrderItems = await apiGet<any[]>('/pending_order_items.php');
        const products = await apiGet<any[]>('/products.php');
        const customers = await apiGet<any[]>('/customers.php');
        
        const hydrated = (pendingOrdersData || []).sort((a, b) => b.invoice_no - a.invoice_no).map(po => ({
          ...po,
          pending_order_items: pendingOrderItems?.filter(poi => poi.pending_order_id === po.pending_order_id).map(poi => ({
            ...poi,
            products: products?.find(p => p.product_id === poi.product_id),
          })),
          customers: customers?.find(c => c.customer_id === po.customer_id),
        }));
        
        setPOrders(hydrated);
      } catch (error) {
        setError('Failed to fetch pending orders');
        console.error(error);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleConfirm = async (invoice_no: number) => {
    try {
      await apiPost('/orders_status_set.php', { invoice_no, status: 'Payment confirmed' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, status: 'Payment confirmed' });
      await fetch(`${window.location.origin}/api/order_status_history.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_no, status: 'Payment confirmed', updated_by: 'admin' }),
      });
      setOrders(prev => prev.map(o => o.invoice_no === invoice_no ? { ...o, order_status: 'Payment confirmed' } : o));
      setPOrders(prev => prev.map(po => po.invoice_no === invoice_no ? { ...po, order_status: 'Payment confirmed' } : po));
      toast.success('Payment confirmed!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to confirm payment');
    }
  };

  const handleShipped = async (invoice_no: number) => {
    try {
      await apiPost('/orders_status_set.php', { invoice_no, status: 'SHIPPED' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, status: 'SHIPPED' });
      await fetch(`${window.location.origin}/api/order_status_history.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_no, status: 'SHIPPED', updated_by: 'admin' }),
      });
      setOrders(prev => prev.map(o => o.invoice_no === invoice_no ? { ...o, order_status: 'SHIPPED' } : o));
      setPOrders(prev => prev.map(po => po.invoice_no === invoice_no ? { ...po, order_status: 'SHIPPED' } : po));
      toast.success('Marked as SHIPPED!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark as shipped');
    }
  };

  const handleWaiting = async (invoice_no: number) => {
    try {
      await apiPost('/orders_status_set.php', { invoice_no, status: 'WAITING TO BE SHIPPED' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, status: 'WAITING TO BE SHIPPED' });
      await fetch(`${window.location.origin}/api/order_status_history.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_no, status: 'WAITING TO BE SHIPPED', updated_by: 'admin' }),
      });
      setOrders(prev => prev.map(o => o.invoice_no === invoice_no ? { ...o, order_status: 'WAITING TO BE SHIPPED' } : o));
      setPOrders(prev => prev.map(po => po.invoice_no === invoice_no ? { ...po, order_status: 'WAITING TO BE SHIPPED' } : po));
      toast.success('Marked as WAITING TO BE SHIPPED!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark as waiting');
    }
  };

  const handleOutForDelivery = async (invoice_no: number) => {
    try {
      await apiPost('/orders_status_set.php', { invoice_no, status: 'OUT FOR DELIVERY' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, status: 'OUT FOR DELIVERY' });
      await fetch(`${window.location.origin}/api/order_status_history.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_no, status: 'OUT FOR DELIVERY', updated_by: 'admin' }),
      });
      setOrders(prev => prev.map(o => o.invoice_no === invoice_no ? { ...o, order_status: 'OUT FOR DELIVERY' } : o));
      setPOrders(prev => prev.map(po => po.invoice_no === invoice_no ? { ...po, order_status: 'OUT FOR DELIVERY' } : po));
      toast.success('Marked as OUT FOR DELIVERY!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark as out for delivery');
    }
  };

  const handleDelivered = async (invoice_no: number) => {
    try {
      await apiPost('/orders_status_set.php', { invoice_no, status: 'DELIVERED' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, status: 'DELIVERED' });
      await fetch(`${window.location.origin}/api/order_status_history.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_no, status: 'DELIVERED', updated_by: 'admin' }),
      });
      setOrders(prev => prev.map(o => o.invoice_no === invoice_no ? { ...o, order_status: 'DELIVERED' } : o));
      setPOrders(prev => prev.map(po => po.invoice_no === invoice_no ? { ...po, order_status: 'DELIVERED' } : po));
      toast.success('Marked as DELIVERED!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark as delivered');
    }
  };

  // Function to delete a payment
  const deletePayment = async (paymentId: number) => {
    try {
      await apiDelete('/payments.php', { payment_id: paymentId });
      toast.success('Payment deleted successfully');
      setPayments(prev => prev.filter(payment => payment.payment_id !== paymentId));
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
    }
  };

  

  const deleteUser = async (customerId: number): Promise<void> => {
    try {
      await apiDelete('/customers.php', { customer_id: customerId });
      setUsers(prev => prev.filter(u => u.customer_id !== customerId));
      toast.success('Account deleted successfully');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const orderColumns: ColumnDef<Order>[] = [
    { accessorKey: "order_id", header: "Order ID" },
    { accessorKey: "customer_id", header: "Customer",
      cell: ({ row }) => row.original.customers?.customer_name || "Unknown",
     },
    { accessorKey: "invoice_no", header: "Invoice No" },
    { accessorKey: "order_date", header: "Order Date",
      cell: ({ row }) => {
        const date = new Date(row.original.order_date);
        return formatDistanceToNow(date, { addSuffix: true });
      },
     },
    { accessorKey: "order_status", header: "Status" },
    { accessorKey: "due_amount", header: "Total Price" },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
         {row.original.order_status === 'Paid' && (
          <Button onClick={() => handleConfirm(row.original.invoice_no)} title="Confirm Payment"><IconCashRegister stroke={2} /></Button>
         )}

         {row.original.order_status === 'Payment confirmed' && (
          <Button onClick={() => handleWaiting(row.original.invoice_no)} title="Mark as Waiting"><IconTrolleyFilled /></Button>          
         )}

         {row.original.order_status === 'WAITING TO BE SHIPPED' && (
          <Button onClick={() => handleShipped(row.original.invoice_no)} title="Mark as Shipped"><Truck /></Button>
         )}

         {row.original.order_status === 'SHIPPED' && (
          <Button onClick={() => handleOutForDelivery(row.original.invoice_no)} title="Mark as Out for delivery"><IconPackageExport stroke={2} /></Button>
         )}

         {row.original.order_status === 'OUT FOR DELIVERY' && (
          <Button onClick={() => handleDelivered(row.original.invoice_no)} title="Mark as Delivered"><Handshake /></Button>
         )}

         {row.original.order_status === 'Pending' && (
          <BanknoteX />
         )}

         {row.original.order_status === 'COMPLETED' && (
          <PackageCheck />
         )} 

        </div>
      ),
    },
  ];

  const pOrderColumns: ColumnDef<PendingOrder>[] = [
    { accessorKey: "p_order_id", header: "ID" },
    { accessorKey: "customer_id", header: "Customer",
      cell: ({ row }) => row.original.customers?.customer_name || "Unknown",
     },
    { accessorKey: "invoice_no", header: "Invoice NO" },
    { accessorKey: "order_status", header: "Status" },
    { accessorKey: "created_at", header: "Order Date",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return formatDistanceToNow(date, { addSuffix: true });
      },
     },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
         {row.original.order_status === 'Paid' && (
          <Button onClick={() => handleConfirm(row.original.invoice_no)} title="Confirm Payment"><IconCashRegister stroke={2} /></Button>
         )}

         {row.original.order_status === 'Payment confirmed' && (
          <Button onClick={() => handleWaiting(row.original.invoice_no)} title="Mark as Waiting"><IconTrolleyFilled /></Button>          
         )}

         {row.original.order_status === 'WAITING TO BE SHIPPED' && (
          <Button onClick={() => handleShipped(row.original.invoice_no)} title="Mark as Shipped"><Truck /></Button>
         )}

         {row.original.order_status === 'SHIPPED' && (
          <Button onClick={() => handleOutForDelivery(row.original.invoice_no)} title="Mark as Out for delivery"><IconPackageExport stroke={2} /></Button>
         )}

         {row.original.order_status === 'OUT FOR DELIVERY' && (
          <Button onClick={() => handleDelivered(row.original.invoice_no)} title="Mark as Delivered"><Handshake /></Button>
         )}

         {row.original.order_status === 'Pending' && (
          <BanknoteX />
         )}

         {row.original.order_status === 'RECEIVED' && (
          <PackageCheck />
         )} 

        </div>
      ),
    },
  ];  

  const paymentColumns: ColumnDef<Payment>[] = [
    { accessorKey: "payment_id", header: "Payment ID" },
    { accessorKey: "amount", header: "Price" },
    { accessorKey: "ref_no", header: "Rederence NO" },
    { accessorKey: "payment_date", header: "Payment Date" },
    { accessorKey: "banks", header: "Bank",
      cell: ({ row }) => row.original.banks?.bank_name || "Unknown",
     },
    { accessorKey: "payment_mode", header: "Payment Mode" },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button onClick={() => deletePayment(row.original.payment_id)} variant="destructive">Delete</Button>
      ),
    },
  ];

  const userColumns: ColumnDef<Customer>[] = [
    { accessorKey: "customer_name", header: "Name" },
    { accessorKey: "customer_email", header: "Email" },
    {
      accessorKey: "profileImage",
      header: "Profile Photo",
      cell: ({ row }) => (
        row.original.customer_image ? (
          <img
           src={`/${row.original.customer_image}`}
           alt={row.original.customer_name} 
           className="w-10 h-10 rounded-full border" />
        ) : (
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarFallback className="rounded-full">{row.original.customer_name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
          </Avatar>          
        )
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button onClick={() => deleteUser(row.original.customer_id)} variant="destructive">Delete</Button>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 flex items-center justify-center gap-2">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <Tabs defaultValue="users">
                  <TabsList>
                    <TabsTrigger value="pOrders">Pending Orders</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pOrders">
                    <DataTable columns={pOrderColumns} data={pOrders} />
                  </TabsContent>
                  <TabsContent value="orders">
                    <DataTable columns={orderColumns} data={orders} />
                  </TabsContent>                  
                  <TabsContent value="payments">
                    <DataTable columns={paymentColumns} data={payments} />
                  </TabsContent>
                  <TabsContent value="users">
                    <DataTable columns={userColumns} data={users} />
                  </TabsContent>
                </Tabs>
            </div>
        </div>
    </div>
  );
};

