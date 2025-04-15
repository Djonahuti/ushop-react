import ProductCard from "@/components/shared/ProductCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/AuthContext"
import supabase from "@/lib/supabaseClient"
import { Category, Manufacturer, Product, ProductCategory } from "@/types"
import { FilterIcon, Search } from "lucide-react"
import { useEffect, useState } from "react"


const Home = () => {
  //const [loading, setLoading] = useState(true);
  //const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [pCategories, setPCategories] = useState<ProductCategory[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [selectedManufacturer, setSelectedManufacturer] = useState<number | null>(null);
    const [selectedPCat, setSelectedPCat] = useState<number | null>(null);
    const [selectedCat, setSelectedCat] = useState<number | null>(null);    

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
    return (
    <>

    {/* Banner Section */}
    <div className="space-y-1">

      <div className="flex items-center gap-4">
      </div>

    <div className="bg-[#222F3D] h-10 flex items-center text-white text-sm pl-4">
        <div
          className="flex items-center gap-1 border border-transparent p-2 hover:border-white cursor-pointer"
          onClick={() => {
          setSelectedManufacturer(null)
          setSelectedCat(null)
          setSelectedPCat(null)
          setSearch('')
        }}
        >
        <Button
          variant="ghost"
        >
          <FilterIcon size={24} />
        </Button>
            <p className="font-bold">All</p>
        </div>

        <ul className="flex items-center">
    {/* Category Filter */}          
            <li className="border border-transparent p-2 hover:border-white">
              <Select onValueChange={(value) => setSelectedCat(Number(value))}>
                <SelectTrigger className="w-[150px] mt-1 bg-white text-black">
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
            </li>

    {/* Brand Filter */}            
            <li className="border border-transparent p-2 hover:border-white">
              <Select onValueChange={(value) => setSelectedManufacturer(Number(value))}>
                <SelectTrigger className="w-[150px] mt-1 bg-white text-black">
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
            </li>

    {/* Product Category Filter */}            
            <li className="border border-transparent p-2 hover:border-white">
              <Select onValueChange={(value) => setSelectedPCat(Number(value))}>
                <SelectTrigger className="w-[150px] mt-1 bg-white text-black">
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
            </li>
        </ul>
        <div className="flex-grow max-w-xl relative">
          <Input 
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button className="absolute right-2 top-1/2 -translate-y-1/2" variant="ghost">
            <Search size={20} />
          </Button>
        </div>
    </div>
    <section className="bg-pink-500 text-white text-center py-10">
      <h2 className="text-4xl font-bold">UP TO 80% OFF</h2>
      <p className="mt-2">Sale Ends: Mar 27, 07:59 (GMT+1)</p>
    </section>

    <section className="p-5">
      <div><ProductCard products={filteredProducts} /></div>
      </section>
    
    </div>
      <div>
        {user ? (
          <h1>Welcome {user.email}</h1>
        ) : (
          <p>Please login</p>
        )}
      </div>
    </>
    )
}

export default Home

