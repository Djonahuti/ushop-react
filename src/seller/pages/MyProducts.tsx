import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

type Props = {
  itemsPerPage?: number;
}

export default function MyProducts({ itemsPerPage = 4 }: Props) {
  // State variables
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate page count
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );  

  // Function to delete a product
  const deleteProduct = async (productId: number) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', productId);
  
    if (error) {
      console.error('Error deleting product:', error.message);
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted successfully');
      // Optionally, refresh the product list or redirect
    }
  };

  useEffect(() => {
    const fetchSellerId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('seller_id')
        .eq('seller_email', user.email)
        .single();

      if (sellerError || !sellerData) {
        console.error('Error fetching seller ID:', sellerError?.message);
        return;
      }

      setSellerId(sellerData.seller_id); // Set the seller ID
    };

    fetchSellerId();
  }, []);    

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      if (sellerId === null) return;

      const { data, error } = await supabase
       .from('products')
       .select('*, manufacturers(manufacturer_title), categories(cat_title), product_categories(p_cat_title)')
       .eq('seller_id', sellerId)
       .order('product_id', { ascending: false });

      if (error) {
        setError('Failed to fetch products');
        console.error(error);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="grid gap-4 p-4 md:grid-cols-3 sm:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 flex items-center justify-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="container mx-auto px-4 py-8">
      {paginatedProducts.length === 0 ? (
        <div className="p-4 text-center text-red-500 flex items-center justify-center gap-2">
          <AlertCircle className="h-10 w-10" />
          <p className="text-red-500">No products found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
            <Card key={product.product_id} className="w-full max-w-xs shadow-lg rounded-xl p-4">
              <div className="relative">
              <ImageSlider images={[product.product_img1, product.product_img2, product.product_img3].filter(Boolean)} />
                <div></div><Link to={`/update/${product.product_id}`}>
                        <span  className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                          <Pencil className="w-4 h-4 mr-1" />
                        </span>
                        </Link>
              </div>
              <CardContent className="mt-4 text-center">
                    <Link to={`/update/${product.product_id}`} className="text-lg font-semibold ushop-primary hover:underline">
                      {product.product_title}
                    </Link>
                    <div className="relative flex justify-between items-center mt-2">
                      <p className="bg-green-700 text-white text-xs px-2 py-1 rounded">{product.product_label}</p>
                      <p className="text-lg font-bold">₦{product.product_price}</p>
                    </div>
                <CardFooter className="flex justify-center gap-4 mt-3">
                {product.categories?.cat_title && (
                    <span className='bg-black text-white text-xs px-2 py-1 rounded'>
                        {product.categories.cat_title}
                    </span>
                    )}
                {product.product_categories?.p_cat_title && (
                    <span className='bg-green-800 text-white text-xs px-2 py-1 rounded'>
                        {product.product_categories.p_cat_title}
                    </span>
                    )}
                {product.manufacturers?.manufacturer_title && (
            <span  className="bg-black text-white text-xs px-2 py-1 rounded">
              {product.manufacturers.manufacturer_title}
            </span>
            )}
                </CardFooter>
              </CardContent>

              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                    if(window.confirm('Are you sure you want to delete this product?')) {
                      deleteProduct(product.product_id);
                    }
                }}
                className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200"
              >
                <Trash2 />
              </Button>
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
        </div>
      </div>
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
