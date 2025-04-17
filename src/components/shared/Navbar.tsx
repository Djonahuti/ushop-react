import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Heart, LogOut, Search, Send, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import supabase from "@/lib/supabaseClient";
import useCustomerData from "@/hooks/hooks";
import { Product } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Navbar = () => {
  const { customer } = useCustomerData();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Product[]>([])
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: customer, error } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_email', user.email)
        .single();

      if (error || !customer) return;

      const { count: cCount } = await supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customer.customer_id);

      const { count: wCount } = await supabase
        .from('wishlist')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customer.customer_id);
  
      setWishlistCount(wCount || 0);
      setCartCount(cCount || 0);
    };
  
    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          manufacturers(manufacturer_title),
          product_categories(p_cat_title),
          categories(cat_title)
        `);
      if (!error && data) setAllProducts(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredSuggestions([]);
      return;
    }
    const filtered = allProducts.filter((product) => {
      const query = search.toLowerCase();
      return (
        product.product_title?.toLowerCase().includes(query) ||
        product.product_keywords?.toLowerCase().includes(query) ||
        product.product_label?.toLowerCase().includes(query) ||
        product.manufacturers?.manufacturer_title?.toLowerCase().includes(query) ||
        product.categories?.cat_title?.toLowerCase().includes(query) ||
        product.product_categories?.p_cat_title?.toLowerCase().includes(query)
      );
    });
    setFilteredSuggestions(filtered);
  }, [search, allProducts]);  

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/search?query=${encodeURIComponent(search.trim())}`);
    }
  };
  
  const handleSuggestionClick = (product: Product) => {
    navigate(`/search?query=${encodeURIComponent(product.product_title)}`);
    setSearch(product.product_title);
    setFilteredSuggestions([]);
  };  

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }  

  return (
    <nav className="my-nav shadow-md px-4 py-3 flex items-center justify-between sticky top-0 z-50">
    <Link to="/" className="w-24 h-10 mt-2">
      <img
        src="/src/assets/ushop.svg"
        alt="logo"
        width={170}
        height={40}
      />
    </Link>
      {/* Search Bar */}
      <div className="relative w-full max-w-xl">
        <input
          type="text"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
         className="absolute right-2 top-1/2 -translate-y-1/2" 
         variant="ghost"
         onClick={handleSearch}
        >
          <Search size={20} />
        </Button>

        {filteredSuggestions.length > 0 && (
          <ul className="my-nav absolute z-50 mt-1 w-full border rounded shadow max-h-60 overflow-y-auto">
            {filteredSuggestions.slice(0, 5).map((product) => (
              <li
                key={product.product_id}
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(product)}
              >
                <div className="flex justify-between items-center space-x-2 pb-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                     src={`/products/${product.product_img1}`} 
                     alt={product.product_title} 
                     className="w-10 h-10" 
                    />
                  </Avatar>
                <p className="text-right text-base font-medium">{product.product_title}</p>
                </div>
              </li>
            ))}
          </ul>
        )}        
      </div>

      <div className="flex items-center space-x-4">
        {/* User Profile */}
        <Link to="/overview" className="rounded-full">
        <Avatar className="h-10 w-10 rounded-full">
        {customer && customer.customer_image ? (
          <AvatarImage
            src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${customer.customer_image}`}
            alt={customer.customer_name}
            className="w-10 h-10 rounded-full border-gray-300"
          />
        ) : (
          <AvatarFallback className="rounded-full">CN</AvatarFallback> // Placeholder for no image
        )}
        </Avatar>
        </Link>        
      {customer && (
        <>
        <Link
         to="/wishlist" 
         className="flex items-center space-x-1 relative">
          <Heart size={23} />
          <span className="bg-red-500 text-white rounded-full px-2 text-xs">{wishlistCount}</span>
        </Link>
        <Link
         to="/cart"
         className="flex items-center space-x-1 relative" 
         >
          <ShoppingCart size={23} />
          <span className="bg-green-500 text-white rounded-full px-2 text-xs">{cartCount}</span>
        </Link>
        <Link to="/contact">
          <Send size={23} />
        </Link>
        </>
    )}

        <button
           onClick={handleLogout}
           className="flex space-x-0 w-full text-left cursor-pointer"
        >
            <LogOut size={24} />
        </button>
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;