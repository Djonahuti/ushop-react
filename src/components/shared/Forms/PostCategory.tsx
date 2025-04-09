import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import supabase from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
  cat_title: z.string().min(1, 'Category title is required'),
  cat_top: z.boolean().optional(),
  cat_image: z.instanceof(File).optional(), // Ensure cat_image is a File instance
});

type FormData = z.infer<typeof schema>;

const PostCategoryForm: React.FC = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImageFile(event.target.files[0]);
      setValue('cat_image', event.target.files[0]); // Set the file in the form
    }
  };

  const onSubmit = async (data: FormData) => {
    // Handle image upload
    let imagePath = null;
    if (imageFile) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media') // Replace with your actual bucket name
        .upload(`categories/${imageFile.name}`, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError.message);
        return;
      }
      imagePath = uploadData.path; // Get the uploaded image path
    }

    // Insert category data into the database
    const { error } = await supabase
      .from('categories')
      .insert({
        cat_title: data.cat_title,
        cat_top: data.cat_top,
        cat_image: imagePath,
      });

    if (error) {
      console.error('Error adding category:', error.message);
    } else {
      console.log('Category added successfully');
      // Optionally, reset the form or show a success message
    }
  };

  return (
    <Card className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Category</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="cat_title">Category Title</Label>
          <Input
            id="cat_title"
            {...register('cat_title')}
            placeholder="Enter category title"
          />
          {errors.cat_title && <span className="text-red-500">{errors.cat_title.message}</span>}
        </div>
        <div>
          <Label htmlFor="cat_top">Is Top Category?</Label>
          <Input
            id="cat_top"
            type="checkbox"
            {...register('cat_top')}
          />
        </div>
        <div>
          <Label htmlFor="cat_image">Category Image</Label>
          <Input
            id="cat_image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {errors.cat_image && <span className="text-red-500">{errors.cat_image.message}</span>}
        </div>
        <Button type="submit">Add Category</Button>
      </form>
    </Card>
  );
};

export default PostCategoryForm;