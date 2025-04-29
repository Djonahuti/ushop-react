// GetBundle.tsx
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ShoppingCart } from 'lucide-react';

interface BundleProduct {
  product_id: number;
  original_price: number;
  discounted_price: number;
  products: {
    product_title: string;
    product_img1: string;
  };
}

interface Bundle {
  bundle_id: number;
  bundle_title: string;
  bundle_description: string;
  total_price: number;
  products: BundleProduct[];
}

export default function GetBundle() {
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
    <div className="p-2 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Bundle Deals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
      {bundles.map(bundle => (
        <Card key={bundle.bundle_id} className="w-[280px] rounded-lg shadow-md overflow-hidden border">
          <CardHeader className="flex flex-col items-start space-y-1 p-3">
            <CardTitle className="text-base">{bundle.bundle_title}</CardTitle>
              {bundle.products.length > 2 && (
                <Badge variant="secondary" className="text-[10px] px-2 py-1">Buy {bundle.products.length} Items</Badge>
              )}            
              <div className="text-green-700 font-bold text-sm">
                Total: ₦{bundle.total_price.toFixed(2)}
              </div>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-2 p-2">
          {bundle.products.map((item: BundleProduct) => (
                <div key={item.product_id} className="flex flex-col">
                  {/* Product Image */}
                  <div className="w-full h-24 bg-gray-100 rounded-md overflow-hidden mb-1">
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
                <div>
                  <Button variant="ghost" className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition" onClick={() => handleAddToCart(bundle)}>
                    {/* Add to Cart icon */}
                    <ShoppingCart className="h-2 w-2 text-gray-600" />
                  </Button>
                </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </div>
  );
}
