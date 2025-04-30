
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ShoppingCart } from 'lucide-react';
import { Label } from '../ui/label';

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

  return (
    <div className="container mx-auto px-4 py-12 sm:py-12 md:py-5 xl:py-5 justify-items-center">
        <h2 className="text-2xl font-bold mb-2 text-center">Bundle Deals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 justify-items-center">
      {filteredBundles.map(bundle => (
        <Card key={bundle.bundle_id} className="w-[280px] rounded-lg shadow-md overflow-hidden border">
          <div className="flex flex-col items-center space-y-0.5 p-0.5">
            <Label className="text-base">{bundle.bundle_title}</Label>
              {bundle.products.length > 1 && (
                <Badge variant="secondary" className="text-[10px] px-2 py-1 bg-[#F05F42] text-white">Buy {bundle.products.length} Items</Badge>
              )}            
              <div className="text-green-700 font-bold text-sm">
                Total: ₦{bundle.total_price.toFixed(2)}
              </div>
          </div>

          <CardContent className="grid grid-cols-2 gap-2 p-2 pt-0 pb-0">
          {bundle.products.map((item: BundleProduct) => (
                <div key={item.product_id} className="flex flex-col">
                  {/* Product Image */}
                  <div className="w-full h-24 bg-gray-100 rounded-md overflow-hidden mb-1 mt-0">
                    <img
                      src={`/products/${item.products.product_img1}`}
                      alt={item.products.product_title}
                      className="object-contain w-full h-full"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <p className="text-xs font-medium truncate-2-lines">{item.products.product_title}</p>

                    <div className="mt-1">
                      <p className="text-red-600 font-bold text-xs">
                        ₦{item.discounted_price.toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-[10px] line-through">
                        ₦{item.original_price.toFixed(2)}
                      </p>

                      {/* Discount % */}
                      {item.original_price && (
                        <Badge variant="destructive" className="mt-1 text-[10px] px-1 py-0.5">
                          -{Math.round(((item.original_price - item.discounted_price) / item.original_price) * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
                <div className='items-center justify-center'>
                  <Button className="w-full" onClick={() => handleAddToCart(bundle)}>
                    {/* Add to Cart icon */}
                    <ShoppingCart className="h-2 w-2" /> Add to Cart
                  </Button>
                </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </div>
  );
}
