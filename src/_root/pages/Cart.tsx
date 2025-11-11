import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiGet, apiPost } from '@/lib/api';
import { cn } from '@/lib/utils';
import { CartItem } from '@/types';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Cart({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  type BundleProduct = {
    choice_product_id: number;
    discounted_price: number;
    products: { product_title: string; product_img1: string };
  };

  type BundleItem = {
    choice_id: number;
    total_price: number;
    choice_products: BundleProduct[];
  };

  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);

  useEffect(() => {
    async function fetchBundles() {
      const email = localStorage.getItem('auth_email');
      if (!email) return;
      const customers = await apiGet<any[]>(`/customers.php?email=${encodeURIComponent(email)}`);
      const customer = customers?.[0];
      if (!customer) return;

      const choices = await apiGet<any[]>(`/choices.php?customer_id=${customer.customer_id}`);
      const bundles: BundleItem[] = [];
      for (const choice of choices || []) {
        const products = await apiGet<any[]>(`/choice_products.php?choice_id=${choice.choice_id}`);
        const mapped = await Promise.all(
          (products || []).map(async (cp) => {
            const p = await apiGet<any>(`/product.php?product_id=${cp.product_id}`);
            return {
              choice_product_id: cp.choice_product_id,
              discounted_price: cp.discounted_price,
              products: { product_title: p?.product_title, product_img1: p?.product_img1 },
            } as BundleProduct;
          })
        );
        bundles.push({
          choice_id: choice.choice_id,
          total_price: choice.total_price,
          choice_products: mapped,
        });
      }
      setBundleItems(bundles);
    }
  
    fetchBundles();
  }, []);

  // Handle total sum of cart
  const total = items.reduce((sum, item) => sum + (Number(item.p_price) * item.qty), 0);

  const handleRemove = async (cart_id: number) => {
    await fetch(`${window.location.origin}/api/cart.php?cart_id=${cart_id}`, { method: 'DELETE' });
    setItems(items.filter(item => item.cart_id !== cart_id));
  };
  
  const handleQtyChange = async (cart_id: number, qty: number) => {
    await apiPost('/cart_update.php', { cart_id, qty });
    setItems(prev => prev.map(item => item.cart_id === cart_id ? { ...item, qty } : item));
  };


  useEffect(() => {
    const fetchCart = async () => {
      const email = localStorage.getItem('auth_email');
      if (!email) { setLoading(false); return; }
      const customers = await apiGet<any[]>(`/customers.php?email=${encodeURIComponent(email)}`);
      const customer = customers?.[0];
      if (!customer) { setLoading(false); return; }

      const data = await apiGet<any[]>(`/cart.php?customer_id=${customer.customer_id}`);
      const enriched: CartItem[] = [];
      for (const item of data || []) {
        const p = await apiGet<any>(`/product.php?product_id=${item.product_id}`);
        enriched.push({
          ...item,
          products: {
            product_title: p?.product_title,
            product_img1: p?.product_img1,
            product_price: p?.product_price,
          },
        });
      }
      setItems(enriched);
      setLoading(false);
    };

    fetchCart();
  }, []);

  const handleCheckoutBundle = (bundle: {
    choice_id: number;
    total_price: number;
    choice_products: {
      choice_product_id: number;
      discounted_price: number;
      products: { product_title: string; product_img1: string };
    }[];
  }) => {
    // send the entire bundle payload into location.state
    navigate('/checkout', {
      state: {
        isBundle: true,
        choiceId: bundle.choice_id,
        items: bundle.choice_products.map(cp => ({
          product_title: cp.products.product_title,
          product_img1: cp.products.product_img1,
          p_price: cp.discounted_price,
          qty: 1,            // assume qty=1 per choice_product
        })),
        total: bundle.total_price,
      }
    });
  };
  

  if (loading) return <div>Loading cart...</div>;
  if (items.length === 0) return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <div className={cn("flex flex-col gap-6", className)} {...props}>
              <div className="justify text-center">
                <h1 className="mb-4 text-4xl font-semibold text-red-500">Empty Cart</h1>
                <p className="mb-4 text-lg text-gray-600">Your Cart is Empty</p>
                <div className="animate-bounce">
                  <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="mx-auto h-16 w-16 text-red-500 icon icon-tabler icons-tabler-outline icon-tabler-basket-search">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M17 10l-2 -6" />
                    <path d="M7 10l2 -6" />
                    <path d="M11 20h-3.756a3 3 0 0 1 -2.965 -2.544l-1.255 -7.152a2 2 0 0 1 1.977 -2.304h13.999a2 2 0 0 1 1.977 2.304l-.215 1.227" />
                    <path d="M13.483 12.658a2 2 0 1 0 -2.162 3.224" />
                    <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                    <path d="M20.2 20.2l1.8 1.8" />
                  </svg>
                </div>
                <p className="mt-4 text-gray-600">You can <a href="/" className="text-blue-500">Continue shopping</a>.</p>
              </div>
            </div>
          </div>
  
        </div>);

  return (
    <>
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Your Cart</h2>
      {items.map((item) => (
        <div key={item.cart_id} className="border p-2 rounded flex items-center gap-4">
          <img src={`/products/${item.products.product_img1}`} className="w-20 h-20 object-cover" />
          <div>
            <h3 className="font-semibold">{item.products.product_title}</h3>
            <p>Qty: {item.qty}</p>
            <p>Size: {item.size}</p>
            <p>Price: ₦{Number(item.p_price).toFixed(2)}</p>
            <Button
              variant="ghost"
              type="button"
              size="sm"
              className="mt-2 bg-red-500 rounded-full hover:bg-red-600 transition duration-200 text-white"
              onClick={() => handleRemove(item.cart_id)}
            >
              <Trash2 size={16} />
            </Button>
            <Input
              type="number"
              value={item.qty}
              min={1}
              onChange={(e) => handleQtyChange(item.cart_id, Number(e.target.value))}
              className="w-16 border p-1 rounded"
            />

            <div className="text-right font-bold text-lg">
              Total: ₦{total.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
      <Button onClick={() => navigate('/checkout')} className="mt-4">
        Proceed to Checkout
      </Button>
    </div>

    {bundleItems.length > 0 && (
  <div className="mt-8 p-4 border-t mb-10">
    <h2 className="text-xl font-bold mb-4">Your Bundles</h2>

    {bundleItems.map(bundle => (
      <div key={bundle.choice_id} className="mb-6">
        {bundle.choice_products.map((cp: {
          choice_product_id: number;
          discounted_price: number;
          products: { product_title: string; product_img1: string };
        }) => (
          <div key={cp.choice_product_id} className="flex items-center gap-4 mb-2">
        <img src={`/products/${cp.products.product_img1}`} className="w-16 h-16 object-cover rounded" />
        <div>
          <p className="font-medium">{cp.products.product_title}</p>
          <p className="text-sm">₦{cp.discounted_price.toFixed(2)}</p>
        </div>
          </div>
        ))}

        <div className="text-right font-bold">Bundle Total: ₦{(bundle.total_price as number).toFixed(2)}</div>
        <Button
          variant="default"
          className="mt-2"
          onClick={() => handleCheckoutBundle(bundle)}
        >
          Checkout Bundle
        </Button>
      </div>
    ))}
  </div>
)}

    </>
  );
}
