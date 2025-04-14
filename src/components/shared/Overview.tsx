import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Ticket, CreditCard, Truck, Package, CheckCircle, Clock, Wallet } from "lucide-react"
import { Customer, Product } from "@/types"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Link } from "react-router-dom"

export default function Overview() {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [recommended, setRecommended] = useState<Product[]>([]);

    useEffect(() => {
      const fetchCustomerData = async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
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
  
        const { data: orders } = await supabase
          .from('orders')
          .select('product_id, products(cat_id, p_cat_id, manufacturer_id)')
          .eq('customer_id', customerData.customer_id);
  
        const seenIds = new Set<number>();
        const catIds = new Set<number>();
        const pCatIds = new Set<number>();
        const manuIds = new Set<number>();
  
        orders?.forEach((o) => {
          if (o.product_id) seenIds.add(o.product_id);
          const p = o.products;
          if (p?.cat_id) catIds.add(p.cat_id);
          if (p?.p_cat_id) pCatIds.add(p.p_cat_id);
          if (p?.manufacturer_id) manuIds.add(p.manufacturer_id);
        });
  
        const filters = [
          ...Array.from(catIds).map(id => `cat_id.eq.${id}`),
          ...Array.from(pCatIds).map(id => `p_cat_id.eq.${id}`),
          ...Array.from(manuIds).map(id => `manufacturer_id.eq.${id}`)
        ];
  
        const { data: recs } = await supabase
          .from('products')
          .select('*')
          .or(filters.join(','))
          .not('product_id', 'in', `(${Array.from(seenIds).join(',')})`)
          .limit(10);
  
        setRecommended(recs || []);
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
              <div className="flex flex-col items-center">
                <Heart className="w-5 h-5 mb-1" />
                Wish List
              </div>
              <div className="flex flex-col items-center">
                <Clock className="w-5 h-5 mb-1" />
                Viewed
              </div>
              <div className="flex flex-col items-center">
                <Ticket className="w-5 h-5 mb-1" />
                Coupons
              </div>
              <div className="flex flex-col items-center">
                <CreditCard className="w-5 h-5 mb-1" />
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
            <Button variant="link" className="text-xs px-0 h-auto">View All</Button>
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
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Recommended for you</h3>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 pb-4">
            {recommended.length === 0 ? (
              <p className="text-muted-foreground">No recommendations yet.</p>
            ) : (
              recommended.map((item, index) => (
                <Card key={index} className="min-w-[160px]">
                  <img src={`/products/${item.product_img1 || 'default.png'}`} alt={item.product_title} className="w-full h-28 object-contain p-2" />
                  <CardContent className="space-y-1 py-2 text-sm">
                    <p className="line-clamp-2">{item.product_title}</p>
                    <p className="font-semibold text-primary">₦{item.product_price?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Suggested for you</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
                    
                </div>
            </div>
        </div>

    </div>
  )
}
