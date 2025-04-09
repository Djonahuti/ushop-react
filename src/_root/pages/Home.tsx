import ProductCard from "@/components/shared/ProductCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
        <div className="flex items-center gap-1 border border-transparent p-2 hover:border-white">
        <Button
          variant="ghost"
        >
          <FilterIcon size={24} />
        </Button>
            <p className="font-bold">All</p>
        </div>

        <ul className="flex items-center">
            <li className="border border-transparent p-2 hover:border-white">Today's Deals</li>
            <li className="border border-transparent p-2 hover:border-white">Customer Service</li>
            <li className="border border-transparent p-2 hover:border-white">Registry</li>
            <li className="border border-transparent p-2 hover:border-white">Gift Cards</li>
            <li className="border border-transparent p-2 hover:border-white">Sell</li>
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

{/* Filter By Section */}
<section className="p-4">
  <h3 className="text-accent-foreground font-bold mb-4">Filter By</h3>
  <div className="grid grid-cols-5 md:grid-cols-9 gap-4">
    {categories.map((cat) => (
    <div key={cat.cat_id}
    className={`myBox p-4 rounded-lg shadow-md justify-items-center cursor-pointer ${selectedCat === cat.cat_id ? 'border-2 border-pink-500' : ''}`}
    onClick={() => setSelectedCat(cat.cat_id === selectedCat ? null : cat.cat_id)} 
    title={cat.cat_title}
    >
    <img
     src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${cat.cat_image}`} 
     alt={cat.cat_title}
     className="rounded-lg h-12 w-12" />
    </div>
    ))}
  </div>
</section>

    {/* Manufacturers Section */}
    <section className="p-4">
      <h3 className="text-accent-foreground font-bold mb-4">Brands</h3>
      <div className="grid grid-cols-5 md:grid-cols-9 gap-4">
        {manufacturers.map((manufacturer) => (
        <div key={manufacturer.manufacturer_id}
        className={`myBox p-4 rounded-lg shadow-md justify-items-center cursor-pointer ${selectedManufacturer === manufacturer.manufacturer_id ? 'border-2 border-pink-500' : ''}`}
        onClick={() => setSelectedManufacturer(manufacturer.manufacturer_id === selectedManufacturer ? null : manufacturer.manufacturer_id)} 
        title={manufacturer.manufacturer_title}
        >
        <img
         src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${manufacturer.manufacturer_image}`} 
         alt={manufacturer.manufacturer_title}
         className="rounded-lg h-12 w-12" />
        </div>
        ))}
      </div>
    </section>

    {/* Categories Section */}
    <section className="p-4">
      <h3 className="text-accent-foreground font-bold mb-4">Categories</h3>
      <div className="grid grid-cols-5 md:grid-cols-9 gap-4">
        {pCategories.map((pCat) => (
        <div key={pCat.p_cat_id}
        className={`myBox p-4 rounded-lg shadow-md justify-items-center cursor-pointer ${selectedPCat === pCat.p_cat_id ? 'border-2 border-pink-500' : ''}`}
        onClick={() => setSelectedPCat(pCat.p_cat_id === selectedPCat ? null : pCat.p_cat_id)} 
        title={pCat.p_cat_title}>
        <img
         src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${pCat.p_cat_image}`} 
         alt={pCat.p_cat_title} 
         className="rounded-lg h-12 w-12" />
        </div>
        ))}
      </div>
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

