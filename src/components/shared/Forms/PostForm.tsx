import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiGet, apiPost, uploadFile } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, PackagePlus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Category, Manufacturer, ProductCategory } from '@/types';

const schema = z.object({
  product_title: z.string().min(1, 'Title is required'),
  product_price: z.coerce.number().min(0, 'Price must be a positive number'),
  product_desc: z.string().optional(),
  product_keywords: z.string().optional(),
  product_label: z.string().optional(),
  status: z.string().optional(),
  product_psp_price: z.coerce.number().optional(),
  product_features: z.array(z.string()).optional(),
  item_qty: z.coerce.number().min(0, 'Quantity must be a positive number'),
  product_url: z.string().optional(),
  product_img1: z.any().optional(),
  product_img2: z.any().optional(),
  product_img3: z.any().optional(),
  product_video: z.any().optional(),
  cat_id: z.coerce.number().optional(),
  manufacturer_id: z.coerce.number().optional(),
  p_cat_id: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

const PostForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, control} = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [isPending, setIsPending] = useState(false);
  
    const { fields, append, remove } = useFieldArray({
      control,
      name: 'product_features', // Name of the field array
    });

  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await apiGet<Category[]>('/categories.php');
        const manufacturersData = await apiGet<Manufacturer[]>('/manufacturers.php');
        const productCategoriesData = await apiGet<ProductCategory[]>('/product_categories.php');

        setCategories(categoriesData || []);
        setManufacturers(manufacturersData || []);
        setProductCategories(productCategoriesData || []);
      } catch (error) {
        console.error('Failed to fetch product metadata', error);
        toast.error('Failed to load product metadata');
      }
    };

    fetchData();
  }, []);
 
  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      const payload: any = {
        product_title: data.product_title,
        product_price: data.product_price,
        product_desc: data.product_desc,
        product_keywords: data.product_keywords,
        product_label: data.product_label,
        status: data.status,
        product_psp_price: data.product_psp_price,
        product_features: data.product_features || [],
        item_qty: data.item_qty,
        product_url: data.product_url,
        cat_id: data.cat_id,
        manufacturer_id: data.manufacturer_id,
        p_cat_id: data.p_cat_id,
      };

      if ((data as any).product_img1?.[0]) payload.product_img1 = await uploadFile((data as any).product_img1[0]);
      if ((data as any).product_img2?.[0]) payload.product_img2 = await uploadFile((data as any).product_img2[0]);
      if ((data as any).product_img3?.[0]) payload.product_img3 = await uploadFile((data as any).product_img3[0]);
      if ((data as any).product_video?.[0]) payload.product_video = await uploadFile((data as any).product_video[0]);

      await apiPost('/products.php', payload);
      toast.success('Product posted successfully!');
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred.');
    }finally {
      setIsPending(false);
    }
  };

  return (
    <div className="p-6">
        <Card>
            <CardHeader className="flex items-center justify-center">
              <CardTitle className="flex items-center justify-center w-full gap-2"><PackagePlus/>Add Product</CardTitle>
            </CardHeader>
            <CardContent>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 shadow rounded-lg">
      <div  className="space-y-2">
        <Label htmlFor="product_title">Product Title</Label>
        <Input
          id="product_title"
          {...register('product_title')}
          placeholder="Enter product title"
        />
        {errors.product_title && <span>{errors.product_title.message}</span>}
      </div>
      <div  className="space-y-2">
        <Label htmlFor="product_psp_price">Old Price</Label>
        <Input
          id="product_psp_price"
          type="number"
          {...register('product_psp_price')}
          placeholder="Enter Old price"
        />
      </div>
      <div  className="space-y-2">
        <Label htmlFor="product_price">Product Price</Label>
        <Input
          id="product_price"
          type="number"
          {...register('product_price')}
          placeholder="Enter product price"
        />
        {errors.product_price && <span>{errors.product_price.message}</span>}
      </div>
      <div  className="space-y-2">
        <Label htmlFor="product_desc">Product Description</Label>
        <Textarea
          id="product_desc"
          {...register('product_desc')}
          placeholder="Enter product description"
        />
      </div>
      <div  className="space-y-2">
        <Label htmlFor="product_features">Product Features</Label>
        {fields.map((item, index) => (
          <div key={item.id} className="flex items-center space-x-2">
            <Input
              {...register(`product_features.${index}`)}
              placeholder="Enter a feature"
            />
            <Button type="button" onClick={() => remove(index)}>Remove</Button>
          </div>
        ))}
        <Button type="button" onClick={() => append('')}>Add Feature</Button>
      </div>
      <div  className="space-y-2">
        <Label htmlFor="item_qty">Item Quantity</Label>
        <Input
          id="item_qty"
          type="number"
          {...register('item_qty')}
          placeholder="Enter item quantity"
        />
        {errors.item_qty && <span>{errors.item_qty.message}</span>}
      </div>      
      <div  className="space-y-2">
        <Label htmlFor="product_url">Product URL</Label>
        <Input
          id="product_url"
          {...register('product_url')}
          placeholder="Enter product URL"
        />
      </div>
      <div  className="space-y-2">
        <Label htmlFor="product_keywords">Product Keywords</Label>
        <Input
          id="product_keywords"
          {...register('product_keywords')}
          placeholder="Enter product keywords"
        />
      </div>
      <div  className="space-y-2">
        <Label htmlFor="product_label">Product Label</Label>
        <Input
          id="product_label"
          {...register('product_label')}
          placeholder="Enter product label"
        />
      </div>
      <div  className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Input
          id="status"
          {...register('status')}
          placeholder="Enter product status"
        />
      </div>
      <div  className="space-y-2">
        <Label htmlFor="product_video">Product Video</Label>
        <Input
          id="product_video"
          type="file"
          accept="video/*"
          {...register('product_video')}
        />
      </div>
      <div  className="space-y-2">
        <Label htmlFor="product_img1">Product First Image</Label>
        <Input
          id="product_img1"
          type="file"
          accept="image/*"
          {...register('product_img1')}
        />
      </div>
      <div  className="space-y-2">
        <Label htmlFor="product_img2">Product Second Image</Label>
        <Input
          id="product_img2"
          type="file"
          accept="image/*"
          {...register('product_img2')}
        />
      </div>
      <div  className="space-y-2">
        <Label htmlFor="product_img3">Product Third Image</Label>
        <Input
          id="product_img3"
          type="file"
          accept="image/*"
          {...register('product_img3')}
        />
      </div>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">

      {/* Category Dropdown */}
      <Controller
          name="cat_id"
          control={control}
          render={({ field }) => (
            <Select onValueChange={(value) => field.onChange(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.cat_id} value={String(cat.cat_id)}>
                    {cat.cat_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>)} 
      />
        {errors.cat_id && <span>{errors.cat_id.message}</span>}

      {/* Manufacturer Dropdown */}
      <Controller
          name="manufacturer_id"
          control={control}
          render={({ field }) => (
            <Select onValueChange={(value) => field.onChange(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a manufacturer" />
              </SelectTrigger>
              <SelectContent>
                {manufacturers.map((man) => (
                  <SelectItem key={man.manufacturer_id} value={String(man.manufacturer_id)}>
                    {man.manufacturer_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>)} 
      />
        {errors.manufacturer_id && <span>{errors.manufacturer_id.message}</span>}

      {/* Parent Category Dropdown */}
      <Controller
        name="p_cat_id"
        control={control}
        render={({ field }) => (
          <Select onValueChange={(value) => field.onChange(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a parent category" />
            </SelectTrigger>
            <SelectContent>
              {productCategories.map((pCat) => (
                <SelectItem key={pCat.p_cat_id} value={String(pCat.p_cat_id)}>
                  {pCat.p_cat_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>)} 
      />
        {errors.p_cat_id && <span>{errors.p_cat_id.message}</span>}

      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
        {isPending ? 'Posting...' : 'Post Product'}
      </Button>
    </form>
            </CardContent>
        </Card>
    </div>
  );
};

export default PostForm;