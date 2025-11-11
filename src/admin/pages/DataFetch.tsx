import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
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
      try {
        const productsData = await apiGet<Product[]>('/products.php');
        const manufacturers = await apiGet<Array<{ manufacturer_id: number; manufacturer_title: string }>>('/manufacturers.php');
        const categories = await apiGet<Array<{ cat_id: number; cat_title: string }>>('/categories.php');
        const productCategories = await apiGet<Array<{ p_cat_id: number; p_cat_title: string }>>('/product_categories.php');
        
        const hydrated = (productsData || []).map(p => ({
          ...p,
          manufacturers: manufacturers?.find(m => m.manufacturer_id === p.manufacturer_id) || null,
          categories: categories?.find(c => c.cat_id === p.cat_id) || null,
          product_categories: productCategories?.find(pc => pc.p_cat_id === p.p_cat_id) || null,
        }));
        
        setProducts(hydrated.sort((a, b) => b.product_id - a.product_id) as Product[]);
      } catch (err) {
        setError('Failed to fetch products');
        console.error(err);
      }
    };

    fetchProducts();
  }, []);
  
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await apiGet<any[]>('/pending_orders.php');
        const customers = await apiGet<Array<{ customer_id: number; customer_name: string }>>('/customers.php');
        const products = await apiGet<Array<{ product_id: number; product_title: string; product_price: number; product_img1: string }>>('/products.php');
        
        const hydrated = await Promise.all((ordersData || []).map(async (order) => {
          const items = await apiGet<Array<{ qty: number; product_id: number }>>(`/pending_order_items.php?p_order_id=${order.p_order_id}`);
          const customer = customers?.find(c => c.customer_id === order.customer_id);
          
          const pending_order_items = (items || []).map(item => ({
            ...item,
            products: products?.find(p => p.product_id === item.product_id),
          }));
          
          return {
            ...order,
            customers: customer ? { customer_name: customer.customer_name } : undefined,
            pending_order_items,
          };
        }));
        
        setOrders(hydrated.sort((a, b) => b.p_order_id - a.p_order_id));
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

  const handleConfirm = async (invoice_no: number) => {
    try {
      const ordersData = await apiGet<any[]>(`/orders.php?invoice_no=${invoice_no}`);
      const order = ordersData?.[0];
      
      if (!order) {
        alert('Failed to find order.');
        return;
      }

      await apiPost('/orders_status_set.php', { invoice_no, order_status: 'Payment confirmed' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, order_status: 'Payment confirmed' });
      await apiPost('/order_status_history.php', { order_id: order.order_id, status: 'Payment confirmed' });

      alert('Payment confirmed!');
      setOrders(orders.filter(o => o.invoice_no !== invoice_no));
    } catch (err) {
      console.error(err);
      alert('Failed to confirm payment.');
    }
  };

  const handleShipped = async (invoice_no: number) => {
    try {
      const ordersData = await apiGet<any[]>(`/orders.php?invoice_no=${invoice_no}`);
      const order = ordersData?.[0];
      
      if (!order) {
        alert('Failed to find order.');
        return;
      }

      await apiPost('/orders_status_set.php', { invoice_no, order_status: 'SHIPPED' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, order_status: 'SHIPPED' });
      await apiPost('/order_status_history.php', { order_id: order.order_id, status: 'Shipped' });

      alert('SHIPPED!');
      setOrders(orders.filter(o => o.invoice_no !== invoice_no));
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    }
  };

  const handleWaiting = async (invoice_no: number) => {
    try {
      const ordersData = await apiGet<any[]>(`/orders.php?invoice_no=${invoice_no}`);
      const order = ordersData?.[0];
      
      if (!order) {
        alert('Failed to find order.');
        return;
      }

      await apiPost('/orders_status_set.php', { invoice_no, order_status: 'WAITING TO BE SHIPPED' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, order_status: 'WAITING TO BE SHIPPED' });
      await apiPost('/order_status_history.php', { order_id: order.order_id, status: 'Waiting to be Shipped' });

      alert('WAITING TO BE SHIPPED!');
      setOrders(orders.filter(o => o.invoice_no !== invoice_no));
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    }
  };

  const handleOutForDelivery = async (invoice_no: number) => {
    try {
      const ordersData = await apiGet<any[]>(`/orders.php?invoice_no=${invoice_no}`);
      const order = ordersData?.[0];
      
      if (!order) {
        alert('Failed to find order.');
        return;
      }

      await apiPost('/orders_status_set.php', { invoice_no, order_status: 'OUT FOR DELIVERY' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, order_status: 'OUT FOR DELIVERY' });
      await apiPost('/order_status_history.php', { order_id: order.order_id, status: 'Out for delivery' });

      alert('OUT FOR DELIVERY!');
      setOrders(orders.filter(o => o.invoice_no !== invoice_no));
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    }
  };

  const handleDelivered = async (invoice_no: number) => {
    try {
      const ordersData = await apiGet<any[]>(`/orders.php?invoice_no=${invoice_no}`);
      const order = ordersData?.[0];
      
      if (!order) {
        alert('Failed to find order.');
        return;
      }

      await apiPost('/orders_status_set.php', { invoice_no, order_status: 'DELIVERED' });
      await apiPost('/pending_orders_status_set.php', { invoice_no, order_status: 'DELIVERED' });
      await apiPost('/order_status_history.php', { order_id: order.order_id, status: 'Delivered' });

      alert('DELIVERED!');
      setOrders(orders.filter(o => o.invoice_no !== invoice_no));
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    }
  };


  // Function to delete a product
  const deleteProduct = async (productId: number) => {
    try {
      await apiDelete(`/products.php`, { product_id: productId });
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p.product_id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  

  const deleteUser = async (customerId: number): Promise<void> => {
    try {
      const customer = users.find(u => u.customer_id === customerId);
      if (!customer) return;
      
      await apiDelete(`/customers.php`, { email: customer.customer_email });
      toast.success('Customer deleted successfully');
      setUsers(users.filter(u => u.customer_id !== customerId));
    } catch (err) {
      console.error('Error deleting account:', err);
      toast.error('Failed to delete customer');
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

         {row.original.order_status === 'RECEIVED' && (
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


