import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Ticket, CreditCard, Truck, Package, CheckCircle, Clock, Wallet } from "lucide-react"
import { Customer } from "@/types"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Link } from "react-router-dom"

export default function Overview() {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomerData = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('customer_email', user.email)
                    .single();

                if (error) {
                    console.error('Error fetching customer data:', error.message);
                    toast.error('No customer found')
                } else {
                    setCustomer(data);
                }
            } else if (userError) {
                console.error('Error getting user:', userError.message);
            }
            setLoading(false);
        };

        fetchCustomerData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!customer) {
        return <div>No customer data found.</div>
    }

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

      {/* More to Love Section */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">More to love</h3>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 pb-4">
            {/* You can map this from a product array */}
            {[
              { name: "Wireless Mouse", price: "₦1,460.72", sold: "600+", img: "/mouse.png" },
              { name: "Air Pro 6 TWS", price: "₦6,243.78", sold: "427", img: "/earbuds.png" },
              { name: "Laptop Stand", price: "₦12,266.59", sold: "293", img: "/stand.png" },
              { name: "USB 3.0 2TB", price: "₦2,210.49", sold: "1000+", img: "/usb.png" },
              { name: "Xiaomi Mijia J18", price: "₦7,016.73", sold: "359", img: "/xiaomi.png" },
            ].map((item, index) => (
              <Card key={index} className="min-w-[160px]">
                <img src={item.img} alt={item.name} className="w-full h-28 object-contain p-2" />
                <CardContent className="space-y-1 py-2 text-sm">
                  <p className="line-clamp-2">{item.name}</p>
                  <p className="font-semibold text-primary">{item.price}</p>
                  <p className="text-xs text-muted-foreground">{item.sold} sold</p>
                </CardContent>
              </Card>
            ))}
         </div>
        </ScrollArea>
      </div>                    
                </div>
            </div>
        </div>

    </div>
  )
}
