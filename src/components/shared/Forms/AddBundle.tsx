// AddBundle.tsx
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Product, Seller } from '@/types';
import { Controller, useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';

const schema = z.object({
    bundle_title: z.string().min(2, 'Title is required'),
    bundle_description: z.string().optional(),
    seller_id: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddBundle() {
    const { register, handleSubmit, control, formState: { errors }, reset, watch} = useForm<FormData>({
        resolver: zodResolver(schema),
    })
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);  

  const selectedSellerId = watch('seller_id');

  useEffect(() => {
    const fetchSellersAndProducts = async () => {
      const { data: sellerData } = await supabase.from('sellers').select('*');
      const { data: productData } = await supabase.from('products').select('*');
      setSellers(sellerData || []);
      setProducts(productData || []);
    };
    fetchSellersAndProducts();
  }, []);

  useEffect(() => {
    // Filter products by selected seller_id
    if (selectedSellerId) {
      const filtered = products.filter(p => p.seller_id === selectedSellerId);
      setFilteredProducts(filtered);
      setSelectedProducts([]); // Reset product selection when seller changes
    }
  }, [selectedSellerId, products]);

  const toggleProduct = (product_id: number) => {
    setSelectedProducts(prev =>
      prev.includes(product_id)
        ? prev.filter(id => id !== product_id)
        : [...prev, product_id]
    );
  };

  const onSubmit = async (data: FormData) => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    setIsSubmitting(true);

    try {
      const includedProducts = filteredProducts.filter(p => selectedProducts.includes(p.product_id));
      const bundlePrice = includedProducts.reduce((sum, p) => sum + (p.product_price / 2), 0);

      const { data: bundle, error } = await supabase.from('bundles').insert([
        {
          seller_id: data.seller_id,
          bundle_title: data.bundle_title,
          bundle_description: data.bundle_description,
          total_price: bundlePrice
        }
      ]).select().single();

      if (error || !bundle) throw new Error("Bundle creation failed");

      const bundleItems = includedProducts.map(p => ({
        bundle_id: bundle.bundle_id,
        product_id: p.product_id,
        original_price: p.product_price,
        discounted_price: p.product_price / 2
      }));

      const { error: insertError } = await supabase.from('bundle_products').insert(bundleItems);
      if (insertError) throw new Error("Failed to attach products");

      toast.success("Bundle created successfully");
      reset();
      setSelectedProducts([]);
      setFilteredProducts([]);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Unexpected error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Bundle</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Seller Select */}
        <div>
          <Label>Seller</Label>
          <Controller
            name="seller_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={(value) => field.onChange(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Seller" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.seller_id} value={String(seller.seller_id)}>
                      {seller.business_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.seller_id && <p className="text-sm text-red-500">{errors.seller_id.message}</p>}
        </div>

        {/* Title */}
        <div>
          <Label>Bundle Title</Label>
          <Input {...register("bundle_title")} placeholder="Enter bundle title" />
          {errors.bundle_title && <p className="text-sm text-red-500">{errors.bundle_title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Input {...register("bundle_description")} placeholder="Optional description" />
        </div>

        {/* Product Selector */}
        {selectedSellerId && (
        <div>
          <Label>Select Products</Label>
          <div className="border rounded p-4 max-h-64 overflow-y-auto space-y-2">
          {filteredProducts.length > 0 ? (
                filteredProducts.map((prod) => (
                  <label key={prod.product_id} className="flex justify-between items-center border p-2 rounded">
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(prod.product_id)}
                        onChange={() => toggleProduct(prod.product_id)}
                      />{' '}
                      {prod.product_title}
                    </div>
                    <span>₦{prod.product_price}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">No products found for this seller.</p>
              )}
          </div>
        </div>
    )}

        {/* Submit */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Bundle'}
        </Button>
      </form>

    </div>
  );
}
