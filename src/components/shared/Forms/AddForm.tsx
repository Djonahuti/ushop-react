import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PlusCircleIcon } from "lucide-react";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from "sonner";
import { apiPost, uploadFile } from "@/lib/api";

// Validation schemas
const categorySchema = z.object({
  cat_title: z.string().min(1, 'Category title is required'),
  cat_top: z.boolean().optional(),
  cat_image: z.instanceof(File).optional(),
});

const manufacturerSchema = z.object({
  manufacturer_title: z.string().min(1, 'Manufacturer title is required'),
  manufacturer_top: z.boolean().optional(),
  manufacturer_image: z.instanceof(File).optional(),
});

const productCategorySchema = z.object({
  p_cat_title: z.string().min(1, 'Product category title is required'),
  p_cat_top: z.boolean().optional(),
  p_cat_image: z.instanceof(File).optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type ManufacturerFormData = z.infer<typeof manufacturerSchema>;
type ProductCategoryFormData = z.infer<typeof productCategorySchema>;

const AddForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'category' | 'manufacturer' | 'productCategory'>('category');
  //Is Pending state for each form
  const [isPendingCategory, setIsPendingCategory] = useState(false);
  const [isPendingManufacturer, setIsPendingManufacturer] = useState(false);
  const [isPendingProductCategory, setIsPendingProductCategory] = useState(false);

  // Category form
  const { register: registerCategory, handleSubmit: handleSubmitCategory, setValue: setValueCategory } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  // Manufacturer form
  const { register: registerManufacturer, handleSubmit: handleSubmitManufacturer, setValue: setValueManufacturer } = useForm<ManufacturerFormData>({
    resolver: zodResolver(manufacturerSchema),
  });

  // Product Category form
  const { register: registerProductCategory, handleSubmit: handleSubmitProductCategory, setValue: setValueProductCategory } = useForm<ProductCategoryFormData>({
    resolver: zodResolver(productCategorySchema),
  });

  const handleCategorySubmit = async (data: CategoryFormData) => {
    setIsPendingCategory(true);
    try {
    // Handle category image upload and insertion logic
      let imagePath = null;
      if (data.cat_image) {
        imagePath = await uploadFile(data.cat_image);
      }

      await apiPost('/categories.php', {
        cat_title: data.cat_title,
        cat_top: data.cat_top,
        cat_image: imagePath,
      });
      toast.success('Category added successfully');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error adding Category:', error.message);
        toast.error('Error adding Category');
      } else {
        console.error('Error adding Category:', error);
        toast.error('Error adding Category');
      }
      toast.error('Failed to add category');
    } finally {
      setIsPendingCategory(false);
    }
  };

  const handleManufacturerSubmit = async (data: ManufacturerFormData) => {
    setIsPendingManufacturer(true);
    try {
    // Handle manufacturer image upload and insertion logic
      let imagePath = null;
      if (data.manufacturer_image) {
        imagePath = await uploadFile(data.manufacturer_image);
      }

      await apiPost('/manufacturers.php', {
        manufacturer_title: data.manufacturer_title,
        manufacturer_top: data.manufacturer_top,
        manufacturer_image: imagePath,
      });
      toast.success('Manufacturer added successfully');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error adding manufacturer:', error.message);
      } else {
        console.error('Error adding manufacturer:', error);
      }
      toast.error('Failed to add manufacturer');
    } finally {
      setIsPendingManufacturer(false);
    }
  };

  const handleProductCategorySubmit = async (data: ProductCategoryFormData) => {
    setIsPendingProductCategory(true);
    try {
    // Handle product category image upload and insertion logic
      let imagePath = null;
      if (data.p_cat_image) {
        imagePath = await uploadFile(data.p_cat_image);
      }

      await apiPost('/product_categories.php', {
        p_cat_title: data.p_cat_title,
        p_cat_top: data.p_cat_top,
        p_cat_image: imagePath,
      });
      toast.success('Product category added successfully');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error adding Product Category:', error.message);
      } else {
        console.error('Error adding Product Category:', error);
      }
      toast.error('Failed to add product category');
    } finally {
      setIsPendingProductCategory(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-center">
        <CardTitle className="flex items-center justify-center w-full gap-2"><PlusCircleIcon />Quick Create</CardTitle>
      </CardHeader>
      <CardContent>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'category' | 'manufacturer' | 'productCategory')}>
        <div className="flex justify-center items-center">
        <TabsList className="mb-4">
          <TabsTrigger value="category">Add Category</TabsTrigger>
          <TabsTrigger value="manufacturer">Add Manufacturer</TabsTrigger>
          <TabsTrigger value="productCategory">Add Product Category</TabsTrigger>
        </TabsList>
        </div>

          {activeTab === 'category' && (
            <form onSubmit={handleSubmitCategory(handleCategorySubmit)} className="space-y-4 p-6 shadow rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="cat_title">Category Title</Label>
                <Input id="cat_title" {...registerCategory('cat_title')} placeholder="Enter category title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat_top">Is Top Category?</Label>
                <Input id="cat_top" type="checkbox" {...registerCategory('cat_top')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat_image">Category Image</Label>
                <Input
                 id="cat_image" 
                 type="file" 
                 accept="image/*" 
                 onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setValueCategory('cat_image', e.target.files[0]);
                  }
                 }} 
                />
              </div>
              <Button type="submit" disabled={isPendingCategory}>
                {isPendingCategory ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                {isPendingCategory ? 'Adding...' : 'Add Category'}
              </Button>
            </form>
          )}
          {activeTab === 'manufacturer' && (
            <form onSubmit={handleSubmitManufacturer(handleManufacturerSubmit)} className="space-y-4 p-6 shadow rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="manufacturer_title">Manufacturer Title</Label>
                <Input id="manufacturer_title" {...registerManufacturer('manufacturer_title')} placeholder="Enter manufacturer title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer_top">Is Top Manufacturer?</Label>
                <Input id="manufacturer_top" type="checkbox" {...registerManufacturer('manufacturer_top')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer_image">Manufacturer Image</Label>
                <Input
                 id="manufacturer_image" 
                 type="file" 
                 accept="image/*" 
                 onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setValueManufacturer('manufacturer_image', e.target.files[0]);
                  }
                 }} 
                />
              </div>
              <Button type="submit" disabled={isPendingManufacturer}>
                {isPendingManufacturer ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                {isPendingManufacturer ? 'Adding...' : 'Add Manufacturer'}
              </Button>
            </form>
          )}
          {activeTab === 'productCategory' && (
            <form onSubmit={handleSubmitProductCategory(handleProductCategorySubmit)} className="space-y-4 p-6 shadow rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="p_cat_title">Product Category Title</Label>
                <Input id="p_cat_title" {...registerProductCategory('p_cat_title')} placeholder="Enter product category title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p_cat_top">Is Top Product Category?</Label>
                <Input id="p_cat_top" type="checkbox" {...registerProductCategory('p_cat_top')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p_cat_image">Product Category Image</Label>
                <Input
                 id="p_cat_image" 
                 type="file" 
                 accept="image/*" 
                 onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setValueProductCategory('p_cat_image', e.target.files[0]);
                  }
                 }} 
                />
              </div>
              <Button type="submit" disabled={isPendingProductCategory}>
                {isPendingProductCategory ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                {isPendingProductCategory ? 'Adding...' : 'Add Product Category'}
              </Button>
            </form>
          )}
      </Tabs>
      </CardContent>
    </Card>
  );
};

export default AddForm;
