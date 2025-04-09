import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
//import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Product } from '@/types';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '../ui/pagination';

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
      alert('You must be logged in to add to cart.');
      return;
    }
  
    await supabase.from('cart').insert({
      ip_add: user.email, // or store customer_id if available
      product_id: product.product_id,
      qty: 1,
      p_price: product.product_price,
      size: 'Default',
    });
  
    alert('Added to cart!');
  };

  // Add to Cart Wishlist
  const handleAddWishlist = async (product: Product) => {
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      alert('You must be logged in to add to wishlist.');
      return;
    }
  
    // First, get customer_id from customers table
    const { data: customer, error } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_email', user.email)
      .single();
  
    if (error || !customer) {
      alert('Customer not found.');
      return;
    }
  
    // Insert into wishlist
    const { error: insertError } = await supabase.from('wishlist').insert({
      customer_id: customer.customer_id,
      product_id: product.product_id, // assuming `product` is in scope
    });
  
    if (insertError) {
      alert('Failed to add to wishlist.');
      console.error(insertError);
    } else {
      alert('Added to wishlist!');
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

    <div className="container mx-auto px-4 py-8">
      {paginatedProducts.length === 0 ? (
          <div className="p-4 text-center text-red-500 flex items-center justify-center gap-2">
              <AlertCircle className="h-10 w-10" />
              <p className="text-red-500">No products found</p>
          </div>
      ) :(
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <Card key={product.product_id} className="w-full max-w-xs shadow-lg rounded-xl p-4">
                <div className="relative">
                <ImageSlider images={[product.product_img1, product.product_img2, product.product_img3].filter(Boolean)} />
                  <div></div>{product.manufacturers?.manufacturer_title && (
                          <span  className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                            {product.manufacturers.manufacturer_title}
                          </span>
                      )}
                </div>
                <CardContent className="mt-4 text-center">
                      <Link to={`/products/${product.product_id}`} className="text-lg font-semibold ushop-primary hover:underline">
                        {product.product_title}
                      </Link>
                      <div className="relative flex justify-between items-center mt-2">
                        <p className="bg-green-700 text-white text-xs px-2 py-1 rounded">{product.product_label}</p>
                        <p className="text-lg font-bold">₦{product.product_price}</p>
                      </div>
                  <div className="flex justify-center gap-4 mt-3">
                    <Button variant="ghost" className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition" onClick={() => handleAddWishlist(product)}>
                      {/* Add to Wishlist icon */}
                      <Heart className="h-5 w-5 text-gray-600" />
                    </Button>
                    <Button variant="ghost" className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition" onClick={() => handleAddToCart(product)}>
                    {/* Add to Cart icon */}
                      <ShoppingCart className="h-5 w-5 text-gray-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
        ))}
          </div>

          {/* Pagination */}
          <Pagination className="mt-8 justify-center">
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
    <div className="w-full h-60 overflow-hidden rounded-md">
      <img
        src={`/products/${images[currentIndex]}`}
        alt="Product"
        className="w-full h-full object-contain transition-opacity duration-500"
      />
    </div>
  );
};
