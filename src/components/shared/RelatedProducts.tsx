import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

type Product = {
  product_id: number;
  product_title: string;
  product_price: number;
product_psp_price: number | null;
  product_img1: string | null;
  manufacturer_id: number | null;
  p_cat_id: number | null;
  manufacturers: {
    manufacturer_title: string;
  } | null;
};

interface RelatedProductsProps {
  currentProductId: number;
  manufacturer_id?: number | null;
  p_cat_id?: number | null;
}

export default function RelatedProducts({
  currentProductId,
  manufacturer_id,
  p_cat_id,
}: RelatedProductsProps) {
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
        let query = supabase
          .from('products')
          .select('*, manufacturers(manufacturer_title)')
          .limit(4);
      
        // Apply manufacturer or product category filter
        if (manufacturer_id && p_cat_id) {
          query = query.or(`manufacturer_id.eq.${manufacturer_id},p_cat_id.eq.${p_cat_id}`);
        } else if (manufacturer_id) {
          query = query.eq('manufacturer_id', manufacturer_id);
        } else if (p_cat_id) {
          query = query.eq('p_cat_id', p_cat_id);
        }
      
        // Exclude current product
        query = query.not('product_id', 'eq', currentProductId);
      
        const { data, error } = await query;
      
        if (error) {
          console.error('Error fetching related products:', error.message);
        }
      
        if (data) setRelated(data);
        setLoading(false);
      };

    if (manufacturer_id || p_cat_id) {
      fetchRelated();
    }
  }, [manufacturer_id, p_cat_id, currentProductId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    );
  }

  if (related.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {related.map((product) => (
          <Card key={product.product_id} className="bg-gray-800 p-4 rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-orange-400 text-center">
                <Link to={`/products/${product.product_id}`} className="hover:underline">
                    {product.product_title}
                </Link>
            </CardTitle>
            <Badge className="bg-black text-xs text-white">
            {product.manufacturers?.manufacturer_title}
            </Badge>
          </CardHeader>
          <CardContent>
            <img
              src={`/products/${product.product_img1}`}
              alt={product.product_title}
              className="w-full h-32 object-contain rounded-md mb-2"
            />
            <p className="text-gray-300">
              <s className="text-gray-500">{product.product_psp_price && `₦${product.product_psp_price}`}</s>{" "}
              ₦{product.product_price}
            </p>
          </CardContent>
          <CardFooter>
          <Link to={`/products/${product.product_id}`}>
              <Button variant="outline" className="w-full text-sm hover:bg-orange-400">
                View Details
              </Button>
            </Link>
          </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
