'use client'; // only needed for Next.js App Router

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // remove if you're using Next.js
import { apiGet, apiPost } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RelatedProducts from '@/components/shared/RelatedProducts';
import { Product } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';


export default function ProductDetails() {
  const { productId } = useParams(); // for React Router
  // const router = useRouter(); const { productId } = router.query // for Next.js

  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('M');

  // Add to Cart functionality
  const handleAddToCart = async (product: Product) => {
    const email = localStorage.getItem('auth_email');
    if (!email) {
      toast.error('You must be logged in to add to cart.');
      return;
    }
  
    const customers = await apiGet<Array<{ customer_id: number }>>(`/customers.php?email=${encodeURIComponent(email)}`);
    const customer = customers?.[0];
  
    if (!customer) {
      toast.error('Customer not found.');
      return;
    }
  
    await apiPost('/cart.php', {
      customer_id: customer.customer_id,
      product_id: product.product_id,
      qty,
      p_price: product.product_price,
      size,
      ip_add: window.location.hostname,
    });
  
    toast.success('Added to cart!');
  };

  // Add to Cart Wishlist
  const handleAddWishlist = async (product: Product) => {
    const email = localStorage.getItem('auth_email');
  
    if (!email) {
      toast.error('You must be logged in to add to wishlist.');
      return;
    }
  
    const customers = await apiGet<Array<{ customer_id: number }>>(`/customers.php?email=${encodeURIComponent(email)}`);
    const customer = customers?.[0];
  
    if (!customer) {
      toast.error('Customer not found.');
      return;
    }
  
    const result = await apiPost('/wishlist.php', {
      customer_id: customer.customer_id,
      product_id: product.product_id,
    });
  
    if (!result) {
      toast.error('Failed to add to wishlist.');
    } else {
      toast.success('Added to wishlist!');
    }
  };  

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const productData = await apiGet<Product>(`/products.php?product_id=${productId}`);
        if (!productData) return;
        
        // Normalize product_features into a string[] without mutating productData type directly
        const rawFeatures: unknown = (productData as any).product_features;
        let normalizedFeatures: string[] = [];
        if (Array.isArray(rawFeatures)) {
          normalizedFeatures = rawFeatures as string[];
        } else if (typeof rawFeatures === 'string') {
          try {
            const parsed = JSON.parse(rawFeatures);
            normalizedFeatures = Array.isArray(parsed) ? (parsed as string[]) : [];
          } catch {
            normalizedFeatures = rawFeatures
              .replace(/[{}]/g, '')
              .split(',')
              .map(f => f.trim().replace(/^"|"$/g, ''))
              .filter(f => f);
          }
        }
        
        const [manufacturers, categories, productCategories] = await Promise.all([
          apiGet<Array<{ manufacturer_id: number; manufacturer_title: string }>>('/manufacturers.php'),
          apiGet<Array<{ cat_id: number; cat_title: string }>>('/categories.php'),
          apiGet<Array<{ p_cat_id: number; p_cat_title: string }>>('/product_categories.php'),
        ]);
        
        const enriched: Product = {
          ...productData,
          product_features: normalizedFeatures,
          manufacturers: manufacturers?.find(m => m.manufacturer_id === productData.manufacturer_id)
            ? { manufacturer_title: manufacturers.find(m => m.manufacturer_id === productData.manufacturer_id)!.manufacturer_title }
            : null,
          categories: categories?.find(c => c.cat_id === productData.cat_id)
            ? { cat_title: categories.find(c => c.cat_id === productData.cat_id)!.cat_title }
            : null,
          product_categories: productCategories?.find(pc => pc.p_cat_id === productData.p_cat_id)
            ? { p_cat_title: productCategories.find(pc => pc.p_cat_id === productData.p_cat_id)!.p_cat_title }
            : null,
        };
        
        setProduct(enriched);
      } catch (error) {
        console.error('Error loading product:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  if (!product) return <div className="p-6 text-center">Loading product...</div>;

  return (
    <div className="container mx-auto px-4 py-8 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
            <ImageSlider images={[product.product_img1, product.product_img2, product.product_img3].filter(Boolean)} />

            {/* Product Features */}
        {product.product_features && Array.isArray(product.product_features) && product.product_features.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800">Features:</h2>
            <ScrollArea className="h-42 rounded-md border p-4">
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
              {product.product_features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            </ScrollArea>
          </div>
        )}
      </div>

        {/* Product Details */}
        <div className="space-y-4">
        <h1 className="text-3xl font-bold">{product.product_title}</h1>
        
        {/* Price */}
          <h2 className="text-2xl font-bold text-gray-500">
            <s className="text-red-600">{product.product_psp_price && `₦${product.product_psp_price}`}</s> ₦{product.product_price}
          </h2>

          <p className="text-lg text-gray-500">Product Category: <span className="ushop-primary font-bold">{product.product_categories?.p_cat_title || 'N/A'}</span></p>
          {product.product_label && <Badge className="bg-green-700 text-white">{product.product_label}</Badge>}

          <p className="text-gray-600 mt-2">{product.product_desc}</p>

          {/* Product Video */}
          {product.product_video && (
          <div>
            <h2 className="text-md font-bold text-gray-700">Product Video</h2>
            <iframe
              className="w-full h-56 rounded-lg shadow-md"
              src={product.product_video}
              title="Product Video"
              allowFullScreen
            ></iframe>
          </div>
          )}

          {/* Quantity & Size Selection */}
        <div className="flex space-x-4">
          <div className='space-y-2'>
            <Label className="block text-sm font-medium text-gray-700">Quantity:</Label>
            <Input
             type="number" 
             min={1}
             value={qty}
             onChange={e => setQty(Number(e.target.value))} 
             className="w-20" 
            />
          </div>
          <div className='space-y-2'>
            <Label className="block text-sm font-medium text-gray-700">Size:</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger className="w-22">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XXL">XXL</SelectItem>
                <SelectItem value="XL">XL</SelectItem>
                <SelectItem value="L">L</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="Small">Small</SelectItem>
                <SelectItem value="XS">XS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            onClick={() => handleAddToCart(product)} 
            className="bg-red-500 hover:bg-red-600">Add to Cart</Button>
          <Button
            onClick={() => handleAddWishlist(product)}  
            className="bg-gray-700 hover:bg-gray-800">Add to Wishlist</Button>
        </div>
        </div>
      </div>

      {product && (
        <RelatedProducts
          currentProductId={product.product_id}
          manufacturer_id={product.manufacturer_id}
          p_cat_id={product.p_cat_id}
        />
      )}
    </div>
  );
}


const ImageSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="relative w-full max-w-md">
      <img
       src={images[currentIndex]} 
       alt="Product Image" 
       className="w-full h-100 object-contain rounded-lg shadow-md transition-opacity duration-500" />
    </div>
  );
};
