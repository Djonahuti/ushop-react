import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import supabase from "@/lib/supabaseClient";
import { Customer, PendingOrder, Product } from "@/types";
import { toast } from "sonner";
import { BanknoteX, Handshake, PackageCheck, Truck } from "lucide-react";
import { IconCashRegister, IconPackageExport, IconTrolleyFilled } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


export const DataFetch = () => {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*, manufacturers(manufacturer_title), categories(cat_title), product_categories(p_cat_title)').order('product_id', { ascending: false });

      if (error) {
        setError('Failed to fetch products');
        console.error(error);
      } else {
        setProducts(data || []);
      }

    };

    fetchProducts();
  }, []);
  
  
  useEffect(() => {
    const fetchOrders = async () => {
        const { data, error } = await supabase
        .from('pending_orders')
        .select(`*, pending_order_items(qty, products(product_title, product_price, product_img1)), customers(customer_name)`)
        .order('p_order_id', { ascending: false });

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

  const handleConfirm = async (invoice_no: number) => {
    const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('order_id')
    .eq('invoice_no', invoice_no)
    .single();

    if (orderError || !orderData) {
      alert('Failed to find order.');
      return;
    }

    await supabase
      .from('orders')
      .update({ order_status: 'Payment confirmed' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'Payment confirmed' })
      .eq('invoice_no', invoice_no);

    // Log the status update in order_status_history
    await supabase
      .from('order_status_history')
      .insert([{ order_id: orderData.order_id, status: 'Payment confirmed' }]);      

    alert('Payment confirmed!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  const handleShipped = async (invoice_no: number) => {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('order_id')
      .eq('invoice_no', invoice_no)
      .single();

    if (orderError || !orderData) {
      alert('Failed to find order.');
      return;
    }

    await supabase
      .from('orders')
      .update({ order_status: 'SHIPPED' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'SHIPPED' })
      .eq('invoice_no', invoice_no);

    // Log the status update in order_status_history
    await supabase
      .from('order_status_history')
      .insert([{ order_id: orderData.order_id, status: 'Shipped' }]);      

    alert('SHIPPED!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  const handleWaiting = async (invoice_no: number) => {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('order_id')
      .eq('invoice_no', invoice_no)
      .single();

    if (orderError || !orderData) {
      alert('Failed to find order.');
      return;
    } 

    await supabase
      .from('orders')
      .update({ order_status: 'WAITING TO BE SHIPPED' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'WAITING TO BE SHIPPED' })
      .eq('invoice_no', invoice_no);

    // Log the status update in order_status_history
    await supabase
      .from('order_status_history')
      .insert([{ order_id: orderData.order_id, status: 'Waiting to be Shipped' }]);      

    alert('WAITING TO BE SHIPPED!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  const handleOutForDelivery = async (invoice_no: number) => {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('order_id')
      .eq('invoice_no', invoice_no)
      .single();

    if (orderError || !orderData) {
      alert('Failed to find order.');
      return;
    }    
    await supabase
      .from('orders')
      .update({ order_status: 'OUT FOR DELIVERY' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'OUT FOR DELIVERY' })
      .eq('invoice_no', invoice_no);

    // Log the status update in order_status_history
    await supabase
      .from('order_status_history')
      .insert([{ order_id: orderData.order_id, status: 'Out for delivery' }]);      

    alert('OUT FOR DELIVERY!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };

  const handleDelivered = async (invoice_no: number) => {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('order_id')
      .eq('invoice_no', invoice_no)
      .single();

    if (orderError || !orderData) {
      alert('Failed to find order.');
      return;
    }    
    
    await supabase
      .from('orders')
      .update({ order_status: 'DELIVERED' })
      .eq('invoice_no', invoice_no);

    await supabase
      .from('pending_orders')
      .update({ order_status: 'DELIVERED' })
      .eq('invoice_no', invoice_no);

    // Log the status update in order_status_history
    await supabase
      .from('order_status_history')
      .insert([{ order_id: orderData.order_id, status: 'Delivered' }]);      

    alert('DELIVERED!');
    setOrders(orders.filter(o => o.invoice_no !== invoice_no));
  };


  // Function to delete a product
  const deleteProduct = async (productId: number) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', productId);
  
    if (error) {
      console.error('Error deleting product:', error.message);
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted successfully');
      // Optionally, refresh the product list or redirect
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

  const orderColumns: ColumnDef<PendingOrder>[] = [
    { accessorKey: "customerName", header: "Customer",
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
          <Button onClick={() => handleConfirm(row.original.invoice_no)} title="Confirm Payment"><IconCashRegister /></Button>          
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

  const productColumns: ColumnDef<Product>[] = [
    { accessorKey: "product_title", header: "Title" },
    { accessorKey: "product_price", header: "Price" },
    { accessorKey: "product_label", header: "Label" },
    {
      accessorKey: "cat_id",
      header: "Categories",
      cell: ({ row }) => row.original.categories?.cat_title || "Unknown",
    },
    {
      accessorKey: "p_cat_id",
      header: "Product Categories",
      cell: ({ row }) => row.original.product_categories?.p_cat_title || "Unknown",
    },
    {
      accessorKey: "manufacturer_id",
      header: "Manufacturers",
      cell: ({ row }) => row.original.manufacturers?.manufacturer_title || "Unknown",
    },
    {
      accessorKey: "product_img1",
      header: "Image",
      cell: ({ row }) => <img src={`/products/${row.original.product_img1}`} alt="Product" width="50" />,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button onClick={() => deleteProduct(row.original.product_id)} variant="destructive">Delete</Button>
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
    <div id="products-section">
    <Tabs defaultValue="orders">
      <TabsList>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
      </TabsList>
      <TabsContent value="orders">
        <DataTable columns={orderColumns} data={orders} />
      </TabsContent>
      <TabsContent value="products">
        <DataTable columns={productColumns} data={products} />
      </TabsContent>
      <TabsContent value="users">
        <DataTable columns={userColumns} data={users} />
      </TabsContent>
    </Tabs>
    </div>
  );
};


