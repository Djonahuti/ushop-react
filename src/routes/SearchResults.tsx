import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import supabase from "@/lib/supabaseClient";
import { Product } from "@/types";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query") || "";

  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    const fetchAndFilter = async () => {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          manufacturers(manufacturer_title),
          product_categories(p_cat_title),
          categories(cat_title)
        `);

      if (data) {
        const lower = query.toLowerCase();
        const filtered = data.filter((product) =>
          product.product_title?.toLowerCase().includes(lower) ||
          product.product_keywords?.toLowerCase().includes(lower) ||
          product.product_label?.toLowerCase().includes(lower) ||
          product.manufacturers?.manufacturer_title?.toLowerCase().includes(lower) ||
          product.categories?.cat_title?.toLowerCase().includes(lower) ||
          product.product_categories?.p_cat_title?.toLowerCase().includes(lower)
        );
        setResults(filtered);
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
