// Items.tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AlertCircle } from "lucide-react";
import { Product } from "@/types";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { useState } from "react";
import { IconShoppingBagPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import supabase from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";


type Props = {
  items: Product[];
  itemsPerPage?: number;
}

export default function Items({ items, itemsPerPage = 10 } : Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  
  // Calculate page count
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddToChoices = async (product: Product) => {
    if (selectedProducts.some(p => p.product_id === product.product_id)) {
      return toast.error("This product is already selected.");
    }
    if (selectedProducts.length >= 3) {
      return toast.error("Maximum of 3 items allowed.");
    }
  
    const updated = [...selectedProducts, product];
    setSelectedProducts(updated);
  
    if (updated.length < 3) {
      toast.error("Minimum of 3 items required.");
    } else { 
      // exactly 3 → calculate total & show popup
      const total = updated.reduce((sum, p) => sum + p.product_price * 0.7, 0);
      setTotalPrice(total);
      setShowPopup(true);

      await saveToChoices(updated); // Save to choices and choice_products tables
    }
  };

  const handleRemoveFromPopup = (productId: number) => {
    const updated = selectedProducts.filter(p => p.product_id !== productId);
    setSelectedProducts(updated);
  
    if (updated.length === 3) {
      const total = updated.reduce((sum, p) => sum + p.product_price * 0.7, 0);
      setTotalPrice(total);
    } else {
      setTotalPrice(0);
    }
  };  
  
  const saveToChoices = async (products: Product[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: customer } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_email', user.email)
      .single();
    if (!customer) return;
  
    // 30% off → 0.7× price
    const discountedPrices = products.map(p => p.product_price * 0.7);
    const bundleTotal = discountedPrices.reduce((sum, d) => sum + d, 0);
  
    // create bundle
    const { data: choice, error } = await supabase
      .from('choices')
      .insert({
        customer_id: customer.customer_id,
        choice_title:  `Bundle of ${products.length}`,
        choice_description: null,
        total_price: bundleTotal,
      })
      .select('choice_id')
      .single();
  
      if (error) {
        console.error("Failed to create choice:", error);
        return;
      }
  
    // link each product
    await Promise.all(products.map((p, i) =>
      supabase.from('choice_products').insert({
        choice_id: choice.choice_id,
        product_id: p.product_id,
        original_price: p.product_price,
        discounted_price: discountedPrices[i],
      })
    ));
  };
   

  const handleViewCart = async () => {
    // Save products to cart and redirect to cart page
    await saveToCart(selectedProducts);
    navigate('/cart');
  };  

  const saveToCart = async (products: Product[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: customer } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_email', user.email)
      .single();

    if (customer) {
      for (const product of products) {
        await supabase.from('cart').insert({
          customer_id: customer.customer_id,
          product_id: product.product_id,
          qty: 1,
          size: 'default',
          p_price: product.product_price * 0.8, // Use discounted price
        });
      }
    }
  };

  const handleContinueShopping = () => {
    setShowPopup(false);
    setSelectedProducts([]);
  };  

  if (!items.length) {
    return(
      <div className="p-4 text-center text-red-500 flex items-center justify-center gap-2">
          <AlertCircle className="h-10 w-10" />
          <p className="text-red-500">No products found</p>
      </div>
    );
  }  
  
  return (
    <div className="container mx-auto px-4 py-12 sm:py-12 md:py-5 xl:py-5 justify-items-center">
      <h2 className="text-2xl font-bold mb-2 text-center">Choice Deals</h2>
{showPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h3 className="text-lg font-bold mb-4">Your Bundle</h3>

      {/* list selected */}
      {selectedProducts.map(p => (
        <div key={p.product_id} className="flex items-center mb-2">
          <img src={`/products/${p.product_img1}`} className="w-12 h-12 object-cover rounded mr-3" />
          <span className="flex-1 text-sm">{p.product_title}</span>
          <button
            onClick={() => handleRemoveFromPopup(p.product_id)}
            className="text-red-500 hover:underline text-xs"
          >Remove</button>
        </div>
      ))}

      {/* status */}
      {selectedProducts.length < 3 ? (
        <p className="text-red-500 mb-4">Minimum of 3 items required.</p>
      ) : (
        <p className="text-green-600 font-semibold mb-4">
          Total: ₦{totalPrice.toLocaleString()}
        </p>
      )}

      {/* actions */}
      <div className="flex justify-end space-x-2">
        {selectedProducts.length === 3 && (
          <Button onClick={handleViewCart} className="bg-blue-600 text-white">
            View
          </Button>
        )}
        <Button onClick={handleContinueShopping} className="bg-gray-200">
          Continue Shopping
        </Button>
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >&times;</button>
      </div>
    </div>
  </div>
)}

     {paginatedItems.length === 0 ? (
        <div className="p-4 text-center text-red-500 flex items-center justify-center gap-2">
          <AlertCircle className="h-10 w-10" />
          <p className="text-red-500">No products found</p>
        </div>
        ) : (
            <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
            {paginatedItems.map((item) => (
        <Card key={item.product_id} className="flex flex-col rounded-md overflow-hidden shadow-sm">
          <div className="relative">
            <AspectRatio ratio={1 / 1.25}>
              <img
                src={`/products/${item.product_img1}`}
                alt={item.product_title}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-2 right-2 h-7 w-7 rounded-full my-nav backdrop-blur-sm hover:text-[#F05F42] hover:scale-120 transition-transform duration-200 ease-in-out"
              onClick={() => handleAddToChoices(item)}
            >
              <IconShoppingBagPlus stroke={2} className="w-3.5 h-3.5" />
            </Button>
          </div>

          <CardContent className="px-2 pt-0 pb-0">
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 mb-1 bg-[#F4623A] text-white">Choice</Badge>
            <h3 className="text-xs font-semibold leading-tight line-clamp-2">{item.product_title}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Free Shipping</p>
            <div className="flex items-center text-[10px] gap-1 mt-1 text-muted-foreground">
              <span>{item.sold_count || 0} sold</span>
              <Separator orientation="vertical" className="h-3" />
              <span>⭐ 4.1</span>
            </div>
          </CardContent>
          <CardFooter className="px-2 pt-0 pb-0">
            <div className="text-sm font-bold">
              ₦{item.product_price.toLocaleString()}
            </div>
          </CardFooter>
        </Card>
      ))}   
            </div>

          {/* Pagination */}
          <Pagination className="mt-8 justify-center pb-13">
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
            </>)}   

    </div>
  );
};
