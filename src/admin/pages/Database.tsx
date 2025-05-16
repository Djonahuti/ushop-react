import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import supabase from "@/lib/supabaseClient";
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
      const { data, error } = await supabase.from('payments').select('*, banks(bank_name)').order('payment_id', { ascending: false });

      if (error) {
        setError('Failed to fetch payments');
        console.error(error);
      } else {
        setPayments(data || []);
      }

    };

    fetchPayments();
  }, []);
  
  useEffect(() => {
    const fetchOrders = async () => {
        const { data, error } = await supabase
        .from('orders')
        .select('*, customers(customer_name)')
        .order('order_id', { ascending: false });

        if (error) {
            setError('Failed to fetch orders');
            console.error(error);
        } else {
            setOrders(data || []);
        }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchCustomerData = async () => {
        const { data, error } = await supabase.from('customers').select('*').order('customer_id', { ascending: false });

        if (error) {
            setError('Failed to fetch orders');
            console.error(error);
        } else {
            setUsers(data || []);
        }
    };
    fetchCustomerData();
  }, []);
  
  useEffect(() => {
    const fetchPendingOrders = async () => {
      const { data, error } = await supabase
        .from('pending_orders')
        .select(`*, pending_order_items(qty, products(product_title, product_img1)), customers(customer_name)`)
        .order('invoice_no', { ascending: false });

      if (error) {
        setError('Failed to fetch pending orders');
        console.error(error);
      } else {
        setPOrders(data || []);
      }
    };

    fetchPendingOrders();
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


  // Function to delete a payment
  const deletePayment = async (paymentId: number) => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('payment_id', paymentId);
  
    if (error) {
      console.error('Error deleting payment:', error.message);
      toast.error('Failed to delete payment');
    } else {
      toast.success('Payment deleted successfully');
      setPayments(payments.filter(payment => payment.payment_id !== paymentId));
    }
  };

  

  const deleteUser = async (customerId: number): Promise<void> => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('customer_id', customerId);
  
    if (error) {
      console.error('Error deleting account:', error.message);
    } else {
      console.log('Account deleted successfully');
      // Optionally, redirect the user or show a success message
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
           src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${row.original.customer_image}`}
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

