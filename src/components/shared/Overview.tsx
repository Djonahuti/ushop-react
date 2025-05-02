import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
//import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Ticket, CreditCard, Truck, Package, CheckCircle, Clock, Wallet } from "lucide-react"
import { Customer, Order, OrderItem, Product } from "@/types"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { Badge } from "../ui/badge"

export default function Overview() {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [recommended, setRecommended] = useState<Product[]>([]);

    useEffect(() => {
      const fetchCustomerData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
  
        const { data: customerData, error } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_email', user.email)
          .single();
  
        if (error || !customerData) {
          toast.error('No customer found');
          setLoading(false);
          return;
        }
  
        setCustomer(customerData);
  
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select(`*, order_items(*, product_id, products(cat_id, p_cat_id, manufacturer_id))`)
          .eq('customer_id', customerData.customer_id);

          if (ordersError) {
            toast.error('Error fetching orders');
            setLoading(false);
            return;
          }          
  
        const seenIds = new Set<number>();
        const catIds = new Set<number>();
        const pCatIds = new Set<number>();
        const manuIds = new Set<number>();
  
    // Loop through orders and extract product information

    (orders as Order[])?.forEach((order: Order) => {
      order.order_items.forEach((item: OrderItem) => {
        if (item.product_id) seenIds.add(item.product_id);
        if (item.products) {
          if (item.products.cat_id) catIds.add(item.products.cat_id);
          if (item.products.p_cat_id) pCatIds.add(item.products.p_cat_id);
          if (item.products.manufacturer_id) manuIds.add(item.products.manufacturer_id);
        }
      });
    });
  
        const filters = [
          ...Array.from(catIds).map(id => `cat_id.eq.${id}`),
          ...Array.from(pCatIds).map(id => `p_cat_id.eq.${id}`),
          ...Array.from(manuIds).map(id => `manufacturer_id.eq.${id}`)
        ];
  
        if (filters.length > 0) {
          const { data: recs, error: recsError } = await supabase
            .from('products')
            .select('*, manufacturers(manufacturer_title)')
            .or(filters.join(','))
            .not('product_id', 'in', `(${Array.from(seenIds).join(',')})`)
            .limit(10);
      
          if (recsError) {
            toast.error('Error fetching recommendations');
          } else {
            setRecommended(recs || []);
          }
        } else {
          setRecommended([]);
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
              <Avatar className="h-14 w-14 rounded-lg">
                {customer.customer_image ? (
                <AvatarImage
                 src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${customer.customer_image}`}
                 alt={customer.customer_name}
                 className="rounded-full" 
                 />
                ):(
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
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
