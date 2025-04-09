import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import supabase from "@/lib/supabaseClient";
import { Customer, Order, Product } from "@/types";
import { toast } from "sonner";


export const DataFetch = () => {
  const [orders, setOrders] = useState<Order[]>([]);
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

  const getOrders = async (): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders').select('*, customers(customer_name)').order('order_id', { ascending: false });
    if (error) {
      console.error('Error fetching orders:', error.message);
      toast.error('Failed to fetch orders');
      return [];
    }
    return data || [];
  };  
  
  useEffect(() => {
    const fetchOrders = async () => {
        const { data, error } = await supabase.from('orders').select('*, customers(customer_name)').order('order_id', { ascending: false });

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

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    getOrders().then(setOrders);
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

  const orderColumns: ColumnDef<Order>[] = [
    { accessorKey: "id", header: "Order ID" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "status", header: "Status" },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button onClick={() => handleUpdateOrderStatus(String(row.original.order_id), "Shipped")}>Mark as Shipped</Button>
      ),
    },
  ];

  const productColumns: ColumnDef<Product>[] = [
    { accessorKey: "product_title", header: "Title" },
    { accessorKey: "product_price", header: "Price" },
    { accessorKey: "product_desc", header: "Description" },
    { accessorKey: "product_features", header: "Features" },
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
async function updateOrderStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('order_id', id);

  if (error) {
    console.error('Error updating order status:', error.message);
    toast.error('Failed to update order status');
  } else {
    toast.success('Order status updated successfully');
  }
}


