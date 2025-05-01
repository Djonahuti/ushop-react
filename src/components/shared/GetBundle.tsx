import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
//import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ShoppingCart } from 'lucide-react';
//import { Label } from '../ui/label';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';

interface BundleProduct {
  product_id: number;
  original_price: number;
  discounted_price: number;
  products: {
    product_title: string;
    product_img1: string;
    manufacturer_id: number;
    p_cat_id: number;
    cat_id: number;
  };
}

interface Bundle {
  bundle_id: number;
  bundle_title: string;
  bundle_description: string;
  total_price: number;
  products: BundleProduct[];
}

interface GetBundleProps {
  selectedManufacturer: number | null;
  selectedPCat: number | null;
  selectedCat: number | null;
}

export default function GetBundle({selectedManufacturer, selectedPCat, selectedCat}: GetBundleProps) {
  const [bundles, setBundles] = useState<Bundle[]>([]);

  useEffect(() => {
    const fetchBundles = async () => {
      const { data: bundlesData } = await supabase.from('bundles').select('*');
      const bundleList = [];

      for (const bundle of bundlesData || []) {
        const { data: items } = await supabase
          .from('bundle_products')
          .select(`*, products(*)`)
          .eq('bundle_id', bundle.bundle_id);

        bundleList.push({ ...bundle, products: items || [] });
      }

      setBundles(bundleList);
    };

    fetchBundles();
  }, []);

  // Filter bundles based on selected filters
  const filteredBundles = bundles.filter(bundle => {
    return bundle.products.some(product => {
      const matchesManufacturer = selectedManufacturer ? product.products.manufacturer_id === selectedManufacturer : true;
      const matchesPCat = selectedPCat ? product.products.p_cat_id === selectedPCat : true;
      const matchesCat = selectedCat ? product.products.cat_id === selectedCat : true;

      return matchesManufacturer && matchesPCat && matchesCat;
    });
  });  

  const handleAddToCart = async (bundle: Bundle) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: customer } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_email', user.email)
      .single();

    if (customer) {
      // Add each product in the bundle to the cart
      for (const product of bundle.products) {
        await supabase.from('cart').insert({
          customer_id: customer.customer_id,
          product_id: product.product_id,
          qty: 1, // Default quantity
          p_price: product.discounted_price,
          size: 'default', // You can modify this based on your requirements
        });
      }
    }
  };  

  const getDiscount = (originalPrice: number, discountedPrice: number) => {
    if (!originalPrice) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };  

  return (
    <div className="container mx-auto px-4 py-12 sm:py-12 md:py-5 xl:py-5">
    <h2 className="text-2xl font-bold mb-6 text-center">Bundle Deals</h2>
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {filteredBundles.map((bundle) => (
            <div key={bundle.bundle_id} className="mb-8 rounded-lg shadow-md overflow-hidden border">
                {bundle.products.length > 1 ? (
                    <Carousel
                        className="w-full"
                        opts={{
                            align: "start",
                        }}
                    >
                        <CarouselContent>
                            {bundle.products.map((item: BundleProduct) => (
                                 <CarouselItem key={item.product_id} className="pl-4 md:basis-1/2 lg:basis-1/2">
                                    <div className="p-1">
                                        <div className="shadow-md hover:shadow-lg transition-shadow myBox">
                                            <div>
                                                <div className="relative w-full aspect-square">
                                                    <img
                                                        src={`/products/${item.products.product_img1}`}
                                                        alt={item.products.product_title}
                                                        className="absolute inset-0 w-full h-full object-contain rounded-t-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <Link to={`/products/${item.product_id}`} className="text-xs font-semibold leading-tight line-clamp-2 text-orange-500">
                                                    {item.products.product_title}
                                                </Link>
                                                <div className="flex justify-between items-center text-[12px] gap-1 mt-1 text-muted-foreground relative space-x-3">
                                                    <p className="text-red-500 line-through left-2">
                                                      ₦{item.original_price.toFixed(2)}
                                                    </p>
                                                    <Badge className="font-bold rounded-md p-1 text-center right-2">
                                                      ₦{item.discounted_price.toFixed(2)}
                                                    </Badge>                                                    
                                                </div>
                                                <div className="text-xs">
                                                    You save <span className='text-green-500'>{getDiscount(item.original_price, item.discounted_price)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2" />
                        <CarouselNext className="right-4 top-1/2 -translate-y-1/2" />
                    </Carousel>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {bundle.products.map((item: BundleProduct) => (
                            <Card key={item.product_id} className="border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="relative w-full aspect-square">
                                        <img
                                            src={`/products/${item.products.product_img1}`}
                                            alt={item.products.product_title}
                                            className="absolute inset-0 w-full h-full object-contain rounded-t-lg"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="text-sm font-semibold text-gray-800 line-clamp-2">
                                        {item.products.product_title}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-gray-500 line-through">
                                        ₦{item.original_price.toFixed(2)}
                                    </CardDescription>
                                    <p className="text-lg font-bold text-red-500">
                                        ₦{item.discounted_price.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-green-500">
                                        You save {getDiscount(item.original_price, item.discounted_price)}%
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                <div className='mt-2 mb-3 flex items-center justify-center'>
                    <Button className="w-full sm:w-auto" onClick={() => handleAddToCart(bundle)}>
                        {/* Add to Cart icon */}
                        <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                </div>
            </div>
        ))}
    </div>
</div>
  );
}
