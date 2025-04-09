import React, { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import supabase from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Pencil } from 'lucide-react';

// Validation schema
const schema = z.object({
  product_title: z.string().min(1, 'Product title is required'),
  product_price: z.coerce.number().min(0, 'Product price must be a positive number'),
  product_desc: z.string().optional(),
  product_keywords: z.string().optional(),
  product_label: z.string().optional(),
  status: z.string().optional(),
  product_psp_price: z.coerce.number().optional(),
  product_features: z.array(z.string()).optional(),
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

const EditProduct: React.FC<{ productId: number }> = ({ productId }) => {
  const { register, handleSubmit, control, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'product_features',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [product, setProduct] = useState<FormData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const { data: categoriesData } = await supabase.from('categories').select('*');
      setCategories(categoriesData);

      // Fetch manufacturers
      const { data: manufacturersData } = await supabase.from('manufacturers').select('*');
      setManufacturers(manufacturersData);

      // Fetch product categories
      const { data: productCategoriesData } = await supabase.from('product_categories').select('*');
      setProductCategories(productCategoriesData);

      // Fetch product details
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (productData) {
        setProduct(productData);
        // Set form values
        setValue('product_title', productData.product_title);
        setValue('product_price', productData.product_price);
        setValue('product_desc', productData.product_desc);
        setValue('product_keywords', productData.product_keywords);
        setValue('product_label', productData.product_label);
        setValue('status', productData.status);
        setValue('product_psp_price', productData.product_psp_price);
        setValue('product_url', productData.product_url);
        productData.product_features.forEach((feature: string) => append(feature));
        setValue('cat_id', productData.cat_id);
        setValue('manufacturer_id', productData.manufacturer_id);
        setValue('p_cat_id', productData.p_cat_id);
      }
    };

    fetchData();
  }, [productId, append, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
        const formData = {
            ...data,
            product_img1: data.product_img1?.[0]?.name || null,
            product_img2: data.product_img2?.[0]?.name || null,
            product_img3: data.product_img3?.[0]?.name || null,
            product_video: data.product_video?.[0]?.name || null,
          };

          const { error } = await supabase
            .from('products')
            .update(formData)
            .eq('product_id', productId);
      
          if (error) {
            console.error('Error updating product:', error.message);
            toast.error('Failed to update product');
          } else {
            toast.success('Product updated successfully');
          }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred.');
    }
  };

  if (!product) {
    return <div className="space-y-2">Loading...</div>; // Show a loading state while fetching data
  }

  return (
    <Card className="p-6">
        <CardHeader className="flex items-center gap-2 self-center font-medium">
            <CardTitle className="flex items-center justify-center"><Pencil />Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product_title">Product Title</Label>
          <Input id="product_title" {...register('product_title')} placeholder="Enter product title" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product_psp_price">Product Old Price</Label>
          <Input id="product_psp_price" type="number" {...register('product_psp_price')} placeholder="Enter product PSP price" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product_price">Product Price</Label>
          <Input id="product_price" type="number" {...register('product_price')} placeholder="Enter product price" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product_desc">Product Description</Label>
          <Input id="product_desc" {...register('product_desc')} placeholder="Enter product description" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product_keywords">Product Keywords</Label>
          <Input id="product_keywords" {...register('product_keywords')} placeholder="Enter product keywords" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product_label">Product Label</Label>
          <Input id="product_label" {...register('product_label')} placeholder="Enter product label" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Input id="status" {...register('status')} placeholder="Enter product status" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product_url">Product URL</Label>
          <Input id="product_url" {...register('product_url')} placeholder="Enter product URL" />
        </div>
        <div  className="space-y-2">
          <Label htmlFor="product_img1">Product First Image</Label>
            <img 
                src={`/products/${product.product_img1}`}
                alt="Product Image 1"
                className="w-full h-60 object-contain mb-2" 
            />
          <Input
            id="product_img1"
            type="file"
            accept="image/*"
            {...register('product_img1')}
          />
        </div>
        <div  className="space-y-2">
          <Label htmlFor="product_img2">Product Second Image</Label>
            <img 
                src={`/products/${product.product_img2}`}
                alt="Product Image 2"
                className="w-full h-60 object-contain mb-2" 
            />
          <Input
            id="product_img2"
            type="file"
            accept="image/*"
            {...register('product_img2')}
          />
        </div>
        <div  className="space-y-2">
          <Label htmlFor="product_img3">Product Third Image</Label>
          <img 
            src={`/products/${product.product_img3}`}
            alt="Product Image 3"
            className="w-full h-60 object-contain mb-2"
          />
          <Input
            id="product_img3"
            type="file"
            accept="image/*"
            {...register('product_img3')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product_video">Product Video</Label>
          <Input 
            id="product_video"
            type='file'
            accept="video/*"
            {...register('product_video')} />
        </div>
        <div className="space-y-2">
          <Label>Product Features</Label>
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

        
        {/* Category, Manufacturer, and Parent Category Dropdowns */}
        <div className="grid md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {/* Category Dropdown */}
          <Controller
            control={control}
            name="cat_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.cat_id} value={category.cat_id.toString()}>
                      {category.cat_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        
          {/* Manufacturer Dropdown */}
          <Controller
            control={control}
            name="manufacturer_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map((manufacturer) => (
                    <SelectItem key={manufacturer.manufacturer_id} value={manufacturer.manufacturer_id.toString()}>
                      {manufacturer.manufacturer_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Parent Category Dropdown */}
          <Controller
            control={control}
            name="p_cat_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product category" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((productCategory) => (
                    <SelectItem key={productCategory.p_cat_id} value={productCategory.p_cat_id.toString()}>
                      {productCategory.p_cat_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <Button type="submit">Update Product</Button>
      </form>
      </CardContent>
    </Card>
  );
};

export default EditProduct;