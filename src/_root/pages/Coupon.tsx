import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { Coupon } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Coupons() {
  const [error, setError] = useState<string | null>(null);  
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const handleCopy = (coupon_code: string) => {
    navigator.clipboard.writeText(coupon_code).then(() => {
      toast(
        "Coupon code copied!",
        {
          description: `${coupon_code} has been copied to clipboard.`,
          duration: 2000,
        }
      );
    });
  };  

  useEffect(() => {
      const fetchCoupons = async () => {
        try {
          const data = await apiGet<any[]>('/coupons.php');
          // hydrate product and seller
          const results: any[] = [];
          for (const c of data) {
            const p = await apiGet<any>(`/product.php?product_id=${c.product_id}`);
            const s = await apiGet<any[]>(`/sellers.php`);
            const seller = s.find(x => x.seller_id === p?.seller_id);
            results.push({ ...c, products: { ...p, sellers: { business_name: seller?.business_name ?? '' } } });
          }
          setCoupons(results as any);
        } catch (e) {
          setError('Failed to fetch coupons');
        }
      };
      fetchCoupons();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }  

  return (
    <div className="py-10 px-4 md:px-8">
      <h2 className="text-2xl font-semibold mb-6">Mega Coupons</h2>

      <div className="grid grid-cols-1 sm:grid-col-1 xs:grid-col-1 md:grid-cols-2 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.coupon_id}
            className="bg-amber-50 border rounded-lg p-4 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={`/products/${coupon.products.product_img1}`}
                alt={coupon.products.product_title}
                className="w-20 h-20 object-contain rounded"
              />
              <div>
                <h3 className="text-lg font-bold text-red-600">₦{coupon.coupon_price} off</h3>
                <p className="text-sm text-gray-600">Usage left {coupon.coupon_limit}</p>
                <p className="text-xs text-gray-600 mt-1">{coupon.products.sellers.business_name}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="bg-white border font-mono px-2 py-1 rounded text-sm text-gray-600">
                {coupon.coupon_code}
              </span>
              <Button
               className="bg-red-500 hover:bg-red-600 text-white px-4 py-1"
               onClick={() => handleCopy(coupon.coupon_code)}
              >
                Collect
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
