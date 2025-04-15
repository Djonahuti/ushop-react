import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Heart, Search, Send, ShoppingCart, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import supabase from "@/lib/supabaseClient";
import Logout from "./Logout";
import useCustomerData from "@/hooks/hooks";
import { Product } from "@/types";

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

  return (
    <nav className="nav-bg shadow-md px-4 py-3 flex items-center justify-between">
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
          <ul className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
            {filteredSuggestions.slice(0, 5).map((product) => (
              <li
                key={product.product_id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(product)}
              >
                {product.product_title}
              </li>
            ))}
          </ul>
        )}        
      </div>

      <div className="flex items-center space-x-4">
      {customer && (
        <>
        <Link to="/wishlist">
          <Heart size={18} />
          <span className="bg-red-500 text-white rounded-full px-2 text-xs">{wishlistCount}</span>
        </Link>
        <Link to="/cart">
          <ShoppingCart size={18} />
          <span className="bg-green-500 text-white rounded-full px-2 text-xs">{cartCount}</span>
        </Link>
        <Link to="/contact">
          <Send size={18} />
        </Link>
        </>
    )}
        {/* User Profile */}
        <Link to="/overview" className="rounded-full">
        {customer && customer.customer_image ? (
          <img
            src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${customer.customer_image}`}
            alt={customer.customer_name}
            className="w-10 h-10 rounded-full border-gray-300"
          />
        ) : (
          <User size={24} /> // Placeholder for no image
        )}
        </Link>
        <Logout />
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;