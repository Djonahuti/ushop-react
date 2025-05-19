import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { WishlistItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


export default function Wishlist({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Handle remove item from wishlist
  const handleRemove = async (wishlist_id: number) => {
    await supabase.from('wishlist').delete().eq('wishlist_id', wishlist_id);
    setItems(items.filter(item => item.wishlist_id !== wishlist_id));
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customer, error } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_email', user.email)
        .single();

      if (error || !customer) return;

      const { data, error: fetchError } = await supabase
        .from('wishlist')
        .select('*, products(product_title, product_img1, product_price, product_psp_price, manufacturers(manufacturer_title), manufacturer_id)')
        .eq('customer_id', customer.customer_id);

      if (!fetchError) setItems(data || []);
      setLoading(false);
    };

    fetchWishlist();
  }, []);

  if (loading) return <div>Loading wishlist...</div>;
  if (items.length === 0) return (
          <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
              <div className={cn("flex flex-col gap-6", className)} {...props}>
                <div className="justify text-center">
                  <h1 className="mb-4 text-4xl font-semibold text-red-500">Empty Wishlist</h1>
                  <p className="mb-4 text-lg text-gray-600">Your have nothing on your wishlist</p>
                  <div className="animate-bounce">
                   <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="mx-auto h-16 w-16 text-red-500 icon icon-tabler icons-tabler-outline icon-tabler-heart-search">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 20l-.975 -.966l-6.525 -6.462a5 5 0 1 1 7.5 -6.566a5 5 0 0 1 8.37 5.428" />
                    <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                    <path d="M20.2 20.2l1.8 1.8" />
                   </svg>
                  </div>
                  <p className="mt-4 text-gray-600">You can <a href="/" className="text-blue-500">Continue shopping</a>.</p>
                </div>
              </div>
            </div>
    
          </div>);

  return (
    <div className="container mx-auto space-y-2 px-4">
<div className="mt mt-20 sm:mt-15 md:mt-10 lg:mt-8">
<h2 className="text-xl font-bold text-gray-700 mb-4 text-center">Your Wishlist</h2>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-18">
  {items.map((item) => (
    <Card key={item.wishlist_id} className="bg-gray-800 p-4 rounded-lg shadow-md">
    <CardHeader>
      <CardTitle className="text-orange-400 text-center">
          <Link to={`/products/${item.product_id}`} className="hover:underline">
              {item.products.product_title}
          </Link>
      </CardTitle>
      <Badge className="bg-black text-xs text-white">
      {item.products.manufacturers?.manufacturer_title}
      </Badge>
    </CardHeader>
    <CardContent>
      <img
        src={`/products/${item.products.product_img1}`}
        alt={item.products.product_title}
        className="w-full h-32 object-contain rounded-md mb-2"
      />
      <p className="text-gray-300">
        <s className="text-gray-500">{item.products.product_psp_price && `₦${item.products.product_psp_price}`}</s>{" "}
        ₦{item.products.product_price}
      </p>
    </CardContent>
    <CardFooter className='flex item-center justify-between'>
      <Link to={`/products/${item.product_id}`}>
        <Button variant="outline" className="w-full text-sm hover:bg-orange-400">
          View Details
        </Button>
      </Link>
      <Button
        variant="ghost"
        type="button"
        size="sm"
        className="mt-2 bg-red-500 rounded-full hover:bg-red-600 transition duration-200 text-white p-2"
        onClick={() => handleRemove(item.wishlist_id)} 
        >
          <Trash2 size={16} />
       </Button>      
    </CardFooter>
    </Card>
  ))}
</div>
</div>
    </div>
  );
}
