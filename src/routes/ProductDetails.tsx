'use client'; // only needed for Next.js App Router

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // remove if you're using Next.js
import supabase from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RelatedProducts from '@/components/shared/RelatedProducts';
import { Product } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function ProductDetails() {
  const { productId } = useParams(); // for React Router
  // const router = useRouter(); const { productId } = router.query // for Next.js

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          manufacturers(manufacturer_title),
          categories(cat_title),
          product_categories(p_cat_title)
        `)
        .eq('product_id', productId)
        .single();

      if (error) {
        console.error('Error loading product:', error.message);
      } else {
        setProduct(data);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  if (!product) return <div className="p-6 text-center">Loading product...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
            <ImageSlider images={[product.product_img1, product.product_img2, product.product_img3].filter(Boolean)} />

            {/* Product Features */}
        {product.product_features && (
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity:</label>
            <Input type="number" defaultValue={1} className="w-20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bundle Quantity (Optional):</label>
            <Input type="number" defaultValue={0} className="w-20" />
          </div>
        </div>

        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Size:</label>
            <Input type="text" defaultValue="Small" className="w-24" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bundle Size (Optional):</label>
            <Input type="text" defaultValue="Small" className="w-24" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            onClick={async () => {
              const { error } = await supabase.from('cart').insert({
                product_id: product.product_id,
                qty: 1,
                p_price: product.product_price.toString(),
                ip_add: window.location.hostname, // or get via server
              });
              if (!error) alert('Added to cart!');
            }} 
            className="bg-red-500 hover:bg-red-600">Add to Cart</Button>
          <Button
            onClick={async () => {
              const { error } = await supabase.from('wishlist').insert({
                customer_id: 1, // replace with actual logged-in user
                product_id: product.product_id,
              });
              if (!error) alert('Added to wishlist!');
          }} 
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
