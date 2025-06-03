import ProductCard from "@/components/shared/ProductCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import supabase from "@/lib/supabaseClient"
import { Category, Manufacturer, Product, ProductCategory } from "@/types"
import { FilterIcon, Search } from "lucide-react"
import { useEffect, useState } from "react"


const Home = () => {
    const [loading, setLoading] = useState(true);
  //const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pCategories, setPCategories] = useState<ProductCategory[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [selectedManufacturer, setSelectedManufacturer] = useState<number | null>(null);
    const [selectedPCat, setSelectedPCat] = useState<number | null>(null);
    const [selectedCat, setSelectedCat] = useState<number | null>(null);   
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
      const targetDate = new Date("2025-12-24T23:59:00+01:00");
      const targetString = `${targetDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
      })}, ${targetDate.getHours().toString().padStart(2, "0")}:${targetDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      
      const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
      
        if (distance <= 0) {
          setTimeLeft("Sale Ended");
          return;
        }
      
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
        setTimeLeft(
          `${targetString} — ${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      };
    
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }, []);

    const [error, setError] = useState<string | null>(null);

//Add search + filter logic:  
const filteredProducts = products.filter((product) => {
  const titleMatch = product.product_title.toLowerCase().includes(search.toLowerCase());
  const keywordMatch = product.product_keywords?.toLowerCase().includes(search.toLowerCase());
  const manufacturerMatch = product.manufacturers?.manufacturer_title?.toLowerCase().includes(search.toLowerCase());
  const pCatMatch = product.product_categories?.p_cat_title?.toLowerCase().includes(search.toLowerCase());
  const catMatch = product.categories?.cat_title?.toLowerCase().includes(search.toLowerCase());

  const matchesSearch = titleMatch || keywordMatch || manufacturerMatch || pCatMatch || catMatch;

  const matchesFilter =
    (!selectedManufacturer || product.manufacturer_id === selectedManufacturer) &&
    (!selectedPCat || product.p_cat_id === selectedPCat) &&
    (!selectedCat || product.cat_id === selectedCat);

  return matchesSearch && matchesFilter;
});    

    useEffect(() => {
      const fetchProducts = async () => {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            manufacturers(manufacturer_title),
            product_categories(p_cat_title),
            categories(cat_title)
          `)
          .order('product_id', { ascending: false });

        if (error) {
          setError('Failed to fetch products');
          console.error(error);
        } else {
          setProducts(data || []);
        }

        //Final load complete
        setLoading(false);
      };
      fetchProducts();
    }, []);

    // Fetch and display Categories
    useEffect(() => {
      const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*');

        if (error) {
          setError('Failed to fetch categories');
          console.error(error);
        } else {
          setCategories(data || []);
        }

        //Final load complete
        setLoading(false);        
      };

      fetchCategories();
    }, []);

    // Fetch and display Manufacturers
    useEffect(() => {
      const fetchManufacturers = async () => {
        const { data, error } = await supabase.from('manufacturers').select('*');

        if (error) {
          setError('Failed to fetch manufacturers');
          console.error(error);
        } else {
          setManufacturers(data || []);
        }

        //Final load complete
        setLoading(false);        
      };

      fetchManufacturers();
    }, []);

    // Fetch and display Product Categories
    useEffect(() => {
      const fetchPCategories = async () => {
        const { data, error } = await supabase.from('product_categories').select('*');

        if (error) {
          setError('Failed to fetch product categories');
          console.error(error);
        } else {
          setPCategories(data || []);
        }

        //Final load complete
        setLoading(false);        
      };

      fetchPCategories();
    }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

    if (loading){
      return(
        <div className="fixed inset-0 z-50 flex items-center justify-center my-nav">
          <img
            src="/logo/ushop-small.svg"
            alt="logo"
            className="animate-bounce"
          />
        </div>      
      )
    }
    return (
    <>

    {/* Banner Section */}
    <div className="space-y-1">

      <div className="flex items-center gap-4">
      </div>

    <div className="sticky top-16 z-40 w-full bg-[#232F3E] text-white text-sm px-4 py-2 overflow-x-auto whitespace-nowrap flex items-center gap-4 shadow-md">
        <div
          className="flex items-center gap-1 cursor-pointer hover:underline"
          onClick={() => {
          setSelectedManufacturer(null)
          setSelectedCat(null)
          setSelectedPCat(null)
          setSearch('')
        }}
        >
        <Button
          variant="ghost"
          className="text-white hover:bg-[#37475A] px-2 py-1"
        >
          <FilterIcon size={24} />
        </Button>
            <p className="font-bold">All</p>
        </div>


    {/* Category Filter */}          
            <div className="flex items-center gap-1">
              <span>Filter by:</span>
              <Select onValueChange={(value) => setSelectedCat(Number(value))}>
                <SelectTrigger className="w-[150px] h-8 bg-[#37475A] border-none text-white hover:bg-[#485769]">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.cat_id} value={String(cat.cat_id)}>
                      {cat.cat_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>              
            </div>

    {/* Brand Filter */}            
            <div className="flex items-center gap-1">
            <span>Brands:</span>
              <Select onValueChange={(value) => setSelectedManufacturer(Number(value))}>
                <SelectTrigger className="w-[150px] h-8 bg-[#37475A] border-none text-white hover:bg-[#485769]">
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map((man) => (
                    <SelectItem key={man.manufacturer_id} value={String(man.manufacturer_id)}>
                      {man.manufacturer_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>              
            </div>

    {/* Product Category Filter */}            
            <div className="flex items-center gap-1">
            <span>Categories:</span>
              <Select onValueChange={(value) => setSelectedPCat(Number(value))}>
                <SelectTrigger className="w-[150px] h-8 bg-[#37475A] border-none text-white hover:bg-[#485769]">
                  <SelectValue placeholder="Select Subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {pCategories.map((pCat) => (
                    <SelectItem key={pCat.p_cat_id} value={String(pCat.p_cat_id)}>
                      {pCat.p_cat_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>              
            </div>

    {/* Search Input */}
        <div className="ml-auto relative w-[200px]">
          <Input 
            type="text"
            className="w-full h-8 pl-3 pr-10 rounded bg-white text-black placeholder:text-gray-500 text-sm"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
           className="absolute right-0 top-0 h-8 px-2 text-black" 
           variant="ghost"
          >
            <Search size={20} />
          </Button>
        </div>
    </div>
    
    {/* Banner Info */}    
    <section className="bg-orange-100 border-l-4 border-orange-500 shadow-md rounded text-gray-400 text-center py py-3 sm:py-7 md:py-8 lg:py-10 mt mt-16 sm:mt-12 md:mt-0 lg:mt-0">
      <div>
        <h2 className="md:text-4xl text-2xl md:font-bold font-medium">UP TO 80% OFF</h2>
        <p className="md:mt-2 mt-1">Sale Ends In: {timeLeft} (GMT+1)</p>
      </div>
    </section>    

    <section className="p-1">      
      <div><ProductCard products={filteredProducts} /></div>
      </section>      
    
    </div>
    </>
    )
}

export default Home

