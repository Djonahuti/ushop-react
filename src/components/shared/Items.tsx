import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AlertCircle, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { useEffect, useState } from "react";
import { IconArrowsMinimize, IconShoppingBagPlus, IconTruck } from "@tabler/icons-react";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";


type Props = {
  items: Product[];
  itemsPerPage?: number;
  onSelectedUpdate?: (products: Product[]) => void;
  showPopup?: boolean;
  setShowPopup?: (value: boolean) => void;  
}

export default function Items({ items, itemsPerPage = 10, onSelectedUpdate, showPopup, setShowPopup, } : Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  
  // Calculate page count
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (setShowPopup) setShowPopup(showPopup ?? false);
  }, [showPopup, setShowPopup]);   

  const handleAddToChoices = async (product: Product) => {
    if (selectedProducts.some(p => p.product_id === product.product_id)) {
      return toast.error("This product is already selected.");
    }
    if (selectedProducts.length >= 3) {
      return toast.error("Maximum of 3 items allowed.");
    }
  
    const updated = [...selectedProducts, product];
    setSelectedProducts(updated);
    if (onSelectedUpdate) onSelectedUpdate(updated);
  
    if (updated.length < 3) {
      toast.error("Minimum of 3 items required.");
    } else { 
      // exactly 3 → calculate total & show popup
      const total = updated.reduce((sum, p) => sum + p.product_price * 0.7, 0);
      setTotalPrice(total);
      if (setShowPopup) setShowPopup(true);

      await saveToChoices(updated); // Save to choices and choice_products tables
    }
  };

  const handleRemoveFromPopup = (productId: number) => {
    const updated = selectedProducts.filter(p => p.product_id !== productId);
    setSelectedProducts(updated);
    if (onSelectedUpdate) onSelectedUpdate(updated);    
  
    if (updated.length === 3) {
      const total = updated.reduce((sum, p) => sum + p.product_price * 0.7, 0);
      setTotalPrice(total);
    } else {
      setTotalPrice(0);
    }
  };  
  
  const saveToChoices = async (products: Product[]) => {
    const email = localStorage.getItem('auth_email');
    if (!email) return;
    
    const customers = await apiGet<Array<{ customer_id: number }>>(`/customers.php?email=${encodeURIComponent(email)}`);
    const customer = customers?.[0];
    if (!customer) return;
  
    // 30% off → 0.7× price
    const discountedPrices = products.map(p => p.product_price * 0.7);
    const bundleTotal = discountedPrices.reduce((sum, d) => sum + d, 0);
  
    // create bundle
    const choice = await apiPost<any>('/choices.php', {
      customer_id: customer.customer_id,
      choice_title: `Bundle of ${products.length}`,
      choice_description: null,
      total_price: bundleTotal,
    });
  
    if (!choice || !choice.choice_id) {
      console.error("Failed to create choice");
      return;
    }
  
    // link each product
    await Promise.all(products.map((p, i) =>
      apiPost('/choice_products.php', {
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
    const email = localStorage.getItem('auth_email');
    if (!email) return;

    const customers = await apiGet<Array<{ customer_id: number }>>(`/customers.php?email=${encodeURIComponent(email)}`);
    const customer = customers?.[0];

    if (customer) {
      for (const product of products) {
        await apiPost('/cart.php', {
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
    if (setShowPopup) setShowPopup(false);
    setSelectedProducts([]);
    if (onSelectedUpdate) onSelectedUpdate([]);    
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
  <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
    <div className="myBox p-6 rounded-lg shadow-lg max-w-sm w-full relative">
      <h3 className="text-lg font-bold mb-4">Choice Cart</h3>

      {/* list selected */}
      {selectedProducts.map(p => (
        <div key={p.product_id} className="flex items-center mb-2">
          <img src={`/products/${p.product_img1}`} className="w-12 h-12 object-cover rounded mr-3" />
          <span className="flex-1 text-sm">{p.product_title}</span>
          <button
            onClick={() => handleRemoveFromPopup(p.product_id)}
            className="text-red-500 hover:scale-120 text-xs"
          ><Trash2 /></button>
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
          <Button onClick={handleViewCart} className="bg-[#F4623A] text-white">
            View
          </Button>
        )}
        <Button variant="outline" onClick={handleContinueShopping}>
          Continue Shopping
        </Button>
        <button
          onClick={() => setShowPopup?.(false)}
          className="absolute top-2 right-2 text-red-400 hover:text-red-600"
        ><IconArrowsMinimize stroke={2} /></button>
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
        <div key={item.product_id} className="flex flex-col rounded-md overflow-hidden shadow-sm bg-gray-600">
          <div className="relative">
            <AspectRatio ratio={1 / 1.25} className="myBox">
              <img
                src={`/products/${item.product_img1}`}
                alt={item.product_title}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] px-2 py-0.5 mb-1 bg-[#F4623A] text-white">Choice</Badge>
            <Badge className="absolute top-2 right-2 text-[9px] text-muted-foreground"><IconTruck stroke={2} />Free Shipping</Badge>
            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-2 right-2 h-7 w-7 rounded-full my-nav backdrop-blur-sm hover:text-[#F05F42] hover:scale-120 transition-transform duration-200 ease-in-out"
              onClick={() => handleAddToChoices(item)}
            >
              <IconShoppingBagPlus stroke={2} className="w-3.5 h-3.5" />
            </Button>
            <Badge className="absolute bottom-2 left-2 text-sm font-bold">
              ₦{item.product_price.toLocaleString()}
            </Badge>            
          </div>

          <div className="px-2 pt-0 pb-0">
            <Link to={`/products/${item.product_id}`} className="text-xs font-semibold leading-tight line-clamp-2 text-orange-500">{item.product_title}</Link>
            <div className="flex justify-between items-center text-[12px] gap-1 mt-1 text-muted-foreground relative space-x-3">
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={`${
                      index < item.rating ? "text-yellow-400" : "text-gray-200"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <Separator orientation="vertical" className="h-5" />
              <span className="right-2 font-bold">{item.sold_count || 0} sold</span>
            </div>
          </div>
        </div>
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
