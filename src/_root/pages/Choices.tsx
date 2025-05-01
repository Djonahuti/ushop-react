import Items from "@/components/shared/Items"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import supabase from "@/lib/supabaseClient"
import { Category, Manufacturer, Product, ProductCategory } from "@/types"
import { IconGiftFilled } from "@tabler/icons-react"
import { CheckCircle, Edit, FilterIcon, ShoppingCart, Search, Ticket } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"


const Choices = () => {
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
    const selectedProductsRef = useRef<Product[]>([]);
    const [showPopup, setShowPopup] = useState(false);    
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const handleSelectedProductsUpdate = (products: Product[]) => {
      selectedProductsRef.current = products;
      setSelectedCount(products.length);
    };    

    const [selectedCount, setSelectedCount] = useState(0);
    const progress = Math.min((selectedCount / 3) * 100, 100);
    const qualifies = selectedCount === 3;    

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
            src="/src/assets/ushop.svg"
            alt="logo"
            className="w-[250px] h-[70px] animate-pulse"
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

{/* Free Shipping Banner Progress */}
<div className="sticky top-30 z-40 w-full flex items-center justify-between px-4 py-2 mt-0 mb-2 bg-orange-100 border-l-4 border-orange-500 shadow-md rounded">
  <div className="flex items-center space-x-2">
    <CheckCircle className={`w-5 h-5 ${qualifies ? 'text-green-600' : 'text-gray-400'}`} />
    <p className="text-sm font-medium text-gray-800">
      {qualifies
        ? "You have selected 3 items which qualifies you for free shipping"
        : "You must select 3 items to qualify for free shipping"}
    </p>
  </div>

  <Button
    className="text-white bg-[#F4623A] hover:bg-[#e4572e] h-8 px-4"
    onClick={() => setShowPopup(true)}
  >
    View
  </Button>

  {/* Progress Bar */}
  <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-200">
    <div
      className="h-full bg-[#F4623A] transition-all duration-500 ease-in-out"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>


    <section className="p-1">
      <div><Items
       items={filteredProducts}
       onSelectedUpdate={handleSelectedProductsUpdate}
       showPopup={showPopup}
       setShowPopup={setShowPopup}        
      /></div>      
      </section>

      {/* Sticky Side Tools */}
      <div className="fixed top-1/3 right-2 z-50 flex flex-col items-center space-y-2 my-nav">
        <button className="p-2 rounded shadow hover:bg-orange-100 hover:text-gray-700">
          <Ticket />
        </button>
        <button
         className="p-2 rounded shadow hover:bg-orange-100 hover:text-gray-700"
          onClick={() => navigate('/cart')}
        >
          <ShoppingCart />
        </button>
        <button
         className="p-2 rounded shadow hover:bg-orange-100 hover:text-gray-700"
          onClick={() => navigate('/bundle')}
        >
          <IconGiftFilled />
        </button>
        <button
         className="p-2 rounded shadow hover:bg-orange-100 hover:text-gray-700"
          onClick={() => navigate('/contact')}
        >
          <Edit />
        </button>
      </div>

    
    </div>
    </>
    )
}

export default Choices

