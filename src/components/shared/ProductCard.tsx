import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
//import { Card, CardContent } from '@/components/ui/card';
//import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Product } from '@/types';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { AspectRatio } from '../ui/aspect-ratio';

type Props = {
  products: Product[];
  itemsPerPage?: number;
};

export default function ProductCard({ products, itemsPerPage = 8 }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate page count
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Add to Cart functionality
  const handleAddToCart = async (product: Product) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to add to cart.');
      return;
    }
  
    // Fetch customer_id
    const { data: customer, error } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_email', user.email)
      .single();
  
    if (error || !customer) {
      toast.error('Customer not found.');
      return;
    }
  
    await supabase.from('cart').insert({
      customer_id: customer.customer_id,
      product_id: product.product_id,
      qty: 1,
      p_price: product.product_price,
      size: 'Default',
    });
  
    toast.success('Added to cart!');
  };

  // Add to Cart Wishlist
  const handleAddWishlist = async (product: Product) => {
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      toast.error('You must be logged in to add to wishlist.');
      return;
    }
  
    // First, get customer_id from customers table
    const { data: customer, error } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_email', user.email)
      .single();
  
    if (error || !customer) {
      toast.error('Customer not found.');
      return;
    }
  
    // Insert into wishlist
    const { error: insertError } = await supabase.from('wishlist').insert({
      customer_id: customer.customer_id,
      product_id: product.product_id, // assuming `product` is in scope
    });
  
    if (insertError) {
      toast.error('Failed to add to wishlist.');
      console.error(insertError);
    } else {
      toast.success('Added to wishlist!');
    }
  };


  if (!products.length) {
    return(
      <div className="p-4 text-center text-red-500 flex items-center justify-center gap-2">
          <AlertCircle className="h-10 w-10" />
          <p className="text-red-500">No products found</p>
      </div>
    );
  }

  return (

    <div className="container mx-auto px-4 py-8 justify-items-center">
      {paginatedProducts.length === 0 ? (
          <div className="p-4 text-center text-red-500 flex items-center justify-center gap-2">
              <AlertCircle className="h-10 w-10" />
              <p className="text-red-500">No products found</p>
          </div>
      ) :(
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {paginatedProducts.map((product) => (
              <div key={product.product_id} className="flex flex-col rounded-md overflow-hidden shadow-sm myBox">
                <div className="relative">
                <ImageSlider images={[product.product_img1, product.product_img2, product.product_img3].filter(Boolean)} />
                  <div></div>{product.manufacturers?.manufacturer_title && (
                          <span  className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                            {product.manufacturers.manufacturer_title}
                          </span>
                      )}
                      <>
                        <Badge className="bg-green-700 text-white absolute bottom-1 left-2 text-xs">{product.product_label}</Badge>
                        <Badge className="text-sm font-bold absolute bottom-1 right-2">₦{product.product_price}</Badge>
                      </>
                </div>
                <div className="mt-1 text-center">
                      <Link to={`/products/${product.product_id}`} className="text-sm font-semibold text-orange-500 hover:text-orange-700 transition-colors duration-200">
                        {product.product_title}
                      </Link>

                  <div className="flex justify-center gap-4 mt-1 mb-1">
                    <Button size="icon" variant="outline" className="p-2 rounded-full my-nav backdrop-blur-sm hover:text-[#F05F42] hover:scale-120 transition-transform duration-200 ease-in-out" onClick={() => handleAddWishlist(product)}>
                      {/* Add to Wishlist icon */}
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="outline" className="p-2 rounded-full my-nav backdrop-blur-sm hover:text-[#F05F42] hover:scale-120 transition-transform duration-200 ease-in-out" onClick={() => handleAddToCart(product)}>
                    {/* Add to Cart icon */}
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
        ))}
          </div>

          {/* Pagination */}
          <Pagination className="mt-8 justify-center pb-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <Button
                    variant={currentPage === index + 1 ? "default" : "ghost"}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>              
        </>
      )}

    </div>
  );
};

const ImageSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images]);

  return (
    <AspectRatio ratio={1 / 1.25}>
      <img
        src={`/products/${images[currentIndex]}`}
        alt="Product"
        className="w-full h-full object-contain transition-opacity duration-500"
      />
    </AspectRatio>
  );
};
