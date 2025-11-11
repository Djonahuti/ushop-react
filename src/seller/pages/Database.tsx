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


export const Database = () => {
  const [pOrders, setPOrders] = useState<PendingOrder[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentsData = await apiGet<Payment[]>('/payments.php');
        const banks = await apiGet<Array<{ bank_id: number; bank_name: string }>>('/banks.php');
        const hydrated = (paymentsData || []).map(p => ({
          ...p,
          banks: banks?.find(b => b.bank_id === p.bank_id),
        }));
        setPayments(hydrated.sort((a, b) => b.payment_id - a.payment_id));
      } catch (err) {
        setError('Failed to fetch payments');
        console.error(err);
      }
    };

    fetchPayments();
  }, []);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await apiGet<Order[]>('/orders.php');
        const customers = await apiGet<Array<{ customer_id: number; customer_name: string }>>('/customers.php');
        const hydrated = (ordersData || []).map(o => ({
          ...o,
          customers: customers?.find(c => c.customer_id === o.customer_id) || null,
        }));
        setOrders(hydrated.sort((a, b) => b.order_id - a.order_id) as Order[]);
      } catch (err) {
        setError('Failed to fetch orders');
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const customersData = await apiGet<Customer[]>('/customers.php');
        setUsers((customersData || []).sort((a, b) => b.customer_id - a.customer_id));
      } catch (err) {
        setError('Failed to fetch customers');
        console.error(err);
      }
    };
    fetchCustomerData();
  }, []);
  
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const ordersData = await apiGet<any[]>('/pending_orders.php');
        const products = await apiGet<Array<{ product_id: number; product_title: string; product_img1: string }>>('/products.php');
        const customers = await apiGet<Array<{ customer_id: number; customer_name: string }>>('/customers.php');
        
        const hydrated = (ordersData || []).map(order => ({
          ...order,
          products: products?.find(p => p.product_id === order.product_id),
          customers: customers?.find(c => c.customer_id === order.customer_id),
        }));
        
        setPOrders(hydrated.sort((a, b) => b.invoice_no - a.invoice_no));
      } catch (err) {
        setError('Failed to fetch pending orders');
        console.error(err);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleConfirm = async (invoice_no: number) => {
    try {
      await apiPost('/orders_status_set.php', { invoice_no, order_status: 'Payment confirmed' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, order_status: 'Payment confirmed' });
      alert('Payment confirmed!');
      setOrders(orders.filter(o => o.invoice_no !== invoice_no));
    } catch (err) {
      console.error(err);
      alert('Failed to confirm payment.');
    }
  };

  const handleShipped = async (invoice_no: number) => {
    try {
      await apiPost('/orders_status_set.php', { invoice_no, order_status: 'SHIPPED' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, order_status: 'SHIPPED' });
      alert('SHIPPED!');
      setOrders(orders.filter(o => o.invoice_no !== invoice_no));
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    }
  };

  const handleWaiting = async (invoice_no: number) => {
    try {
      await apiPost('/orders_status_set.php', { invoice_no, order_status: 'WAITING TO BE SHIPPED' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, order_status: 'WAITING TO BE SHIPPED' });
      alert('WAITING TO BE SHIPPED!');
      setOrders(orders.filter(o => o.invoice_no !== invoice_no));
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    }
  };

  const handleOutForDelivery = async (invoice_no: number) => {
    try {
      await apiPost('/orders_status_set.php', { invoice_no, order_status: 'OUT FOR DELIVERY' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, order_status: 'OUT FOR DELIVERY' });
      alert('OUT FOR DELIVERY!');
      setOrders(orders.filter(o => o.invoice_no !== invoice_no));
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    }
  };

  const handleDelivered = async (invoice_no: number) => {
    try {
      await apiPost('/orders_status_set.php', { invoice_no, order_status: 'DELIVERED' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, order_status: 'DELIVERED' });
      alert('DELIVERED!');
      setOrders(orders.filter(o => o.invoice_no !== invoice_no));
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    }
  };


  // Function to delete a payment
  const deletePayment = async (paymentId: number) => {
    try {
      await apiDelete('/payments.php', { payment_id: paymentId });
      toast.success('Payment deleted successfully');
      setPayments(payments.filter(payment => payment.payment_id !== paymentId));
    } catch (err) {
      console.error('Error deleting payment:', err);
      toast.error('Failed to delete payment');
    }
  };

  

  const deleteUser = async (customerId: number): Promise<void> => {
    try {
      const customer = users.find(u => u.customer_id === customerId);
      if (!customer) return;
      
      await apiDelete('/customers.php', { email: customer.customer_email });
      toast.success('Customer deleted successfully');
      setUsers(users.filter(u => u.customer_id !== customerId));
    } catch (err) {
      console.error('Error deleting account:', err);
      toast.error('Failed to delete customer');
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
    { accessorKey: "qty", header: "Quantity" },
    { accessorKey: "due_amount", header: "Total Price" },
    { accessorKey: "size", header: "Size" },
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
    { accessorKey: "product_id", header: "Product",
      cell: ({ row }) => row.original.products?.product_title || "Unknown",
     },
    { accessorKey: "product_img1", header: "Image",
     cell: ({ row }) => <img src={`/products/${row.original.products?.product_img1}`} alt="Product" width="50" className="rounded-full" />,
    },
    { accessorKey: "invoice_no", header: "Invoice NO" },
    { accessorKey: "order_status", header: "Status" },
    { accessorKey: "qty", header: "Qty" },
    { accessorKey: "size", header: "Size" },
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
        ) : ("No Image")
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

