import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import supabase from '@/lib/supabaseClient';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Customer } from '@/types';

const schema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  customer_email: z.string().email('Invalid email address'),
  customer_country: z.string().optional(),
  customer_city: z.string().optional(),
  customer_contact: z.string().optional(),
  customer_address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CustomerProfile: React.FC = () => {
  const { register, handleSubmit, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
    
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    await changePassword(currentPassword, newPassword);
  };
  
  const handleDeleteAccount = async () => {
    await deleteAccount();
  };

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    // Fetch customer data from Supabase
    const fetchCustomerData = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_email', user.email)
          .single();

        if (error) {
          console.error('Error fetching customer data:', error.message);
        } else {
          setCustomer(data);
          // Set form values
          setValue('customer_name', data.customer_name);
          setValue('customer_email', data.customer_email);
          setValue('customer_country', data.customer_country);
          setValue('customer_city', data.customer_city);
          setValue('customer_contact', data.customer_contact);
          setValue('customer_address', data.customer_address);
        }
      } else if (userError) {
        console.error('Error getting user:', userError.message);
      }
      setLoading(false);
    };

    fetchCustomerData();
  }, [setValue]);

  // Update Customer Image function
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImageFile(event.target.files[0]);
    }
  };

  // Update Customer function
  const onSubmit = async (data: FormData) => {
    // Handle image upload let imagePath = customer?.customer_image || ''
    let imagePath = customer?.customer_image; // Keep the existing image if no new image is uploaded
    if (imageFile) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media') // Replace with your storage bucket name
        .upload(`customers/${imageFile.name}`, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError.message);
        return;
      }
      imagePath = uploadData.path; // Get the uploaded image path
    }

    // Update customer details
    const { error } = await supabase
      .from('customers')
      .update({
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_country: data.customer_country,
        customer_city: data.customer_city,
        customer_contact: data.customer_contact,
        customer_address: data.customer_address,
        customer_image: imagePath,
      })
      .eq('customer_email', customer?.customer_email);

    if (error) {
      console.error('Error updating customer data:', error.message);
    } else {
      console.log('Customer data updated successfully');
      // Optionally, show a success message or redirect
    }
  };

  // Change Password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    // Sign in with the current password to verify it
    const { error: signInError } = await supabase.auth.signIn({
      email: supabase.auth.user()?.email || '', // Get the current user's email
      password: currentPassword,
    });
  
    if (signInError) {
      console.error('Current password is incorrect:', signInError.message);
      return;
    }
  
    // If sign in is successful, update the password
    const { error: updateError } = await supabase.auth.update({
      password: newPassword,
    });
  
    if (updateError) {
      console.error('Error updating password:', updateError.message);
    } else {
      console.log('Password updated successfully');
    }
  };

// Delete Account function
  const deleteAccount = async (): Promise<void> => {
    const { error } = await supabase.auth.delete();
  
    if (error) {
      console.error('Error deleting account:', error.message);
    } else {
      console.log('Account deleted successfully');
      // Optionally, redirect the user or show a success message
    }
  };

    if (loading){
      return(
        <div className="fixed inset-0 z-50 flex items-center justify-center my-nav">
          <img
            src="/src/assets/ushop.svg"
            alt="logo"
            className="w-[250px] h-[70px] animate-pulse"
          />
        </div>      
      )
    }

  if (!customer) {
    return <div>No customer data found.</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Profile Section */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>{customer.customer_name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Avatar className="w-24 h-24">
            {customer.customer_image ? (
            <AvatarImage 
                src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${customer.customer_image}`}
                alt="Profile" />
        ): (
          <Avatar className="w-24 h-24" />
        )}
          </Avatar>
          <div className="space-y-2">
          <Label>{customer.customer_email}</Label>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
      {/* Account Details */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
            id="customer_name"
            {...register('customer_name')} 
            placeholder={customer.customer_name} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
            id="customer_email"
            type="email"
            {...register('customer_email')} 
            placeholder={customer.customer_email} />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
            id="customer_contact"
            {...register('customer_contact')} 
            placeholder={customer.customer_contact} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Location</Label>
            <Input
              id="customer_address"
              {...register('customer_address')}
              placeholder={customer.customer_address}
            />
            <Input
              id="customer_city"
              {...register('customer_city')}
              placeholder={customer.customer_city}
            />
            <Input
            id="customer_country"
            {...register('customer_country')} 
            placeholder={customer.customer_country} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="customer_image">Change Image</Label>
            <Input
              id="customer_image"
              type="file"
              onChange={handleImageChange}
            />
          </div>
          <Button type="submit" className="col-span-2">Save Changes</Button>
        </CardContent>
      </Card>
      </form>

      {/* Change Password */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required 
              placeholder="Current Password" 
            />
          <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required 
              placeholder="New Password" 
            />
          <Input type="password" placeholder="Confirm Password" />
          <Button type="submit" className="col-span-3">Save</Button>
        </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">Enable two-factor authentication for added security.</p>
          <Input className="mt-4" placeholder={customer.customer_contact} />
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">Deleting your account is permanent and cannot be undone.</p>
          <Button 
          variant="destructive"
          onClick={handleDeleteAccount}
          >I understand, delete my account</Button>
        </CardContent>
      </Card>
    </div>
        </div>
        </div>
    </div>
  );
};

export default CustomerProfile;