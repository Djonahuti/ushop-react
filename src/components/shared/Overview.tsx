import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Ticket, CreditCard, Truck, Package, CheckCircle, Clock, Wallet } from "lucide-react"
import { Customer, Order, OrderItem, Product } from "@/types"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { Badge } from "../ui/badge"

export default function Overview() {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [recommended, setRecommended] = useState<Product[]>([]);

    useEffect(() => {
      const fetchCustomerData = async () => {
        const email = localStorage.getItem('auth_email');
        if (!email) { setLoading(false); return; }
  
        try {
          const customers = await apiGet<Customer[]>(`/customers.php?email=${encodeURIComponent(email)}`);
          const customerData = customers?.[0];
          
          if (!customerData) {
            toast.error('No customer found');
            setLoading(false);
            return;
          }
  
          setCustomer(customerData);
  
          const orders = await apiGet<Order[]>(`/orders.php?customer_id=${customerData.customer_id}`);
          if (!orders) {
            toast.error('Error fetching orders');
            setLoading(false);
            return;
          }

          const enrichedOrders: Order[] = [];
          for (const order of orders) {
            const orderItems = await apiGet<OrderItem[]>(`/order_items.php?order_id=${order.order_id}`);
            const enrichedItems: OrderItem[] = [];
            for (const item of orderItems || []) {
              const product = await apiGet<any>(`/products.php?product_id=${item.product_id}`);
              enrichedItems.push({
                ...item,
                products: product || null,
              });
            }
            enrichedOrders.push({
              ...order,
              order_items: enrichedItems,
            });
          }
  
          const seenIds = new Set<number>();
          const catIds = new Set<number>();
          const pCatIds = new Set<number>();
          const manuIds = new Set<number>();
  
          enrichedOrders.forEach((order: Order) => {
            order.order_items.forEach((item: OrderItem) => {
              if (item.product_id) seenIds.add(item.product_id);
              if (item.products) {
                if (item.products.cat_id) catIds.add(item.products.cat_id);
                if (item.products.p_cat_id) pCatIds.add(item.products.p_cat_id);
                if (item.products.manufacturer_id) manuIds.add(item.products.manufacturer_id);
              }
            });
          });
  
          if (catIds.size > 0 || pCatIds.size > 0 || manuIds.size > 0) {
            const allProducts = await apiGet<Product[]>('/products.php');
            const manufacturers = await apiGet<Array<{ manufacturer_id: number; manufacturer_title: string }>>('/manufacturers.php');
            
            const recs = (allProducts || [])
              .filter(p => 
                (catIds.has(p.cat_id) || pCatIds.has(p.p_cat_id) || manuIds.has(p.manufacturer_id)) &&
                !seenIds.has(p.product_id)
              )
              .slice(0, 10)
              .map(p => ({
                ...p,
                manufacturers: manufacturers?.find(m => m.manufacturer_id === p.manufacturer_id)
                  ? { manufacturer_title: manufacturers.find(m => m.manufacturer_id === p.manufacturer_id)!.manufacturer_title }
                  : null,
              })) as Product[];
            
            setRecommended(recs);
          } else {
            setRecommended([]);
          }
        } catch (error) {
          console.error('Error fetching customer data:', error);
          toast.error('Error loading data');
        }
        setLoading(false);
      };
  
      fetchCustomerData();
    }, []);
  
    if (loading) return <div>Loading...</div>;
    if (!customer) return <div>No customer data found.</div>;

  return (
  <div className="flex flex-1 flex-col">
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="container mx-auto px-4 py-8 space-y-4">
      {/* User Profile Section */}
      <Card className="space-y-4">
        <CardContent className="flex items-center gap-4 py-6">
              <Avatar className="h-14 w-14 rounded-full">
                {customer.customer_image ? (
                <AvatarImage
                 src={`/${customer.customer_image}`}
                 alt={customer.customer_name}
                 className="rounded-full" 
                 />
                ):(
                  <AvatarFallback className="rounded-full">CN</AvatarFallback>
                )}
              </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{customer.customer_name}</h2>
            <div className="grid grid-cols-4 gap-2 mt-2 text-center text-sm text-muted-foreground">
              <Link to="/wishlists" className="flex flex-col items-center">
                <Heart className="w-5 h-5 mb-1 text-orange-500" />
                WishList
              </Link>
              <div className="flex flex-col items-center">
                <Clock className="w-5 h-5 mb-1 text-orange-500" />
                Viewed
              </div>
              <div className="flex flex-col items-center">
                <Ticket className="w-5 h-5 mb-1 text-orange-500" />
                Coupons
              </div>
              <div className="flex flex-col items-center">
                <CreditCard className="w-5 h-5 mb-1 text-orange-500" />
                Shopping Credit
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Orders Section */}
      <Card className="space-y-4">
        <CardContent className="py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">My Orders</h3>
            <Link to="/my-orders" className="text-xs px-0 h-auto">View All</Link>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center">
            <Link to="/my-orders">
                <Wallet className="w-6 h-6 mb-1 text-orange-500" />
                Unpaid           
            </Link>                
            </div>
            <div className="flex flex-col items-center">
            <Link to="/my-orders">
                <Package className="w-6 h-6 mb-1 text-orange-500" />
                To be shipped           
            </Link>
            </div>
            <div className="flex flex-col items-center">
            <Link to="/my-orders">
                <Truck className="w-6 h-6 mb-1 text-orange-500" />
                Shipped         
            </Link>                
            </div>
            <div className="flex flex-col items-center">
            <Link to="/my-orders">
                <CheckCircle className="w-6 h-6 mb-1 text-orange-500" />
                To be reviewed            
            </Link>
            </div>
          </div>

          <div className="mt-4 text-sm space-y-2">
            <div className="flex justify-between border-t pt-2">
              <span>📝 My appeal</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>⚖️ In dispute</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Products Section */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-700 mb-4">Recommended for you</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommended.length === 0 ? (
              <p className="text-muted-foreground">No recommendations yet.</p>
            ) : (
              recommended.map((item, index) => (
                <Card key={index}  className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <CardHeader>
                    <CardTitle className="text-orange-400 text-center">
                      <Link to={`/products/${item.product_id}`} className="hover:underline">
                        {item.product_title}
                      </Link>
                    </CardTitle>
                    <Badge className="bg-black text-xs text-white">
                      {item.manufacturers?.manufacturer_title}
                    </Badge>
                  </CardHeader>

                  <CardContent>
                    <img
                     src={`/products/${item.product_img1 || 'default.png'}`} 
                     alt={item.product_title} 
                     className="w-full h-32 object-contain rounded-md mb-2"
                    />                    
                    <p className="text-gray-300">
                      <s className="text-gray-500">{item.product_psp_price && `₦${item.product_psp_price}`}</s>{""}
                      ₦{item.product_price}
                    </p>
                    <p className="text-xs text-muted-foreground">Suggested for you</p>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/products/${item.product_id}`}>
                      <Button variant="outline" className="w-full text-sm hover:bg-orange-400">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
      </div>
                    
                </div>
            </div>
        </div>

    </div>
  )
}
