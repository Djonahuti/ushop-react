import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import { Product } from "@/types";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query") || "";

  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    const fetchAndFilter = async () => {
      try {
        const [products, manufacturers, categories, productCategories] = await Promise.all([
          apiGet<Product[]>('/products.php'),
          apiGet<Array<{ manufacturer_id: number; manufacturer_title: string }>>('/manufacturers.php'),
          apiGet<Array<{ cat_id: number; cat_title: string }>>('/categories.php'),
          apiGet<Array<{ p_cat_id: number; p_cat_title: string }>>('/product_categories.php'),
        ]);

        const enriched = (products || []).map(p => ({
          ...p,
          manufacturers: manufacturers?.find(m => m.manufacturer_id === p.manufacturer_id)
            ? { manufacturer_title: manufacturers.find(m => m.manufacturer_id === p.manufacturer_id)!.manufacturer_title }
            : null,
          categories: categories?.find(c => c.cat_id === p.cat_id)
            ? { cat_title: categories.find(c => c.cat_id === p.cat_id)!.cat_title }
            : null,
          product_categories: productCategories?.find(pc => pc.p_cat_id === p.p_cat_id)
            ? { p_cat_title: productCategories.find(pc => pc.p_cat_id === p.p_cat_id)!.p_cat_title }
            : null,
        })) as Product[];

        const lower = query.toLowerCase();
        const filtered = enriched.filter((product) =>
          product.product_title?.toLowerCase().includes(lower) ||
          product.product_keywords?.toLowerCase().includes(lower) ||
          product.product_label?.toLowerCase().includes(lower) ||
          product.manufacturers?.manufacturer_title?.toLowerCase().includes(lower) ||
          product.categories?.cat_title?.toLowerCase().includes(lower) ||
          product.product_categories?.p_cat_title?.toLowerCase().includes(lower)
        );
        setResults(filtered);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    fetchAndFilter();
  }, [query]);

  return (
    <div className="container mx-auto space-y-2 px-4">
    <div>
    <h2 className="text-xl font-bold text-gray-700 mb-4">Search Results for: "{query}"</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {results.length > 0 ? (
        <>
          {results.map((product) => (
          <Card key={product.product_id} className="bg-gray-800 p-4 rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-orange-400 text-center">
                <Link to={`/products/${product.product_id}`} className="hover:underline">
                    {product.product_title}
                </Link>
            </CardTitle>
            <Badge className="bg-black text-xs text-white">
            {product.manufacturers?.manufacturer_title}
            </Badge>
          </CardHeader>
          <CardContent>
            <img
              src={`/products/${product.product_img1}`}
              alt={product.product_title}
              className="w-full h-32 object-contain rounded-md mb-2"
            />
            <p className="text-gray-300">
              <s className="text-gray-500">{product.product_psp_price && `₦${product.product_psp_price}`}</s>{" "}
              ₦{product.product_price}
            </p>
          </CardContent>
          <CardFooter>
          <Link to={`/products/${product.product_id}`}>
              <Button variant="outline" className="w-full text-sm hover:bg-orange-400">
                View Details
              </Button>
            </Link>
          </CardFooter>
          </Card>
          ))}
        </>
      ) : (
        <p>No results found.</p>
      )}
    </div>
    </div>
    </div>
  );
};

export default SearchResults;
