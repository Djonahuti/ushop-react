import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import supabase from '@/lib/supabaseClient';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Customer } from '@/types';
import { CameraIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const getEnumValues = async (enumType: string): Promise<string[]> => {
  const { data, error } = await supabase.rpc('get_enum_values', { enum_name: enumType });
  if (error) {
    console.error(`Error fetching ${enumType}:`, error.message);
    return [];
  }
  return data || [];
};


const schema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  customer_email: z.string().email('Invalid email address'),
  customer_country: z.string().optional(),
  state: z.string().optional(),
  customer_city: z.string().optional(),
  customer_contact: z.string().optional(),
  customer_address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function MobileEdit() {
  const { register, handleSubmit, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [countries, setCountries] = useState<string[]>([]);
  const [statesList, setStatesList] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchEnums = async () => {
      const [countryEnum, stateEnum, cityEnum] = await Promise.all([
        getEnumValues('country'),
        getEnumValues('states'),
        getEnumValues('cities'),
      ]);
      setCountries(countryEnum);
      setStatesList(stateEnum);
      setCities(cityEnum);
    };
    fetchEnums();
  }, []);

  useEffect(() => {
    register("customer_country");
    register("state");
    register("customer_city");
  }, [register]);
  

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
          setValue('state', data.state);
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

  // Update Customer Image function: upload immediately after selecting a file
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      if (!customer) return;
      // Upload image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media') // Replace with your storage bucket name
        .upload(`customers/${file.name}`, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading image:', uploadError.message);
        return;
      }
      const imagePath = uploadData.path;
      // Update customer_image in DB
      const { error: updateError } = await supabase
        .from('customers')
        .update({ customer_image: imagePath })
        .eq('customer_email', customer.customer_email);
      if (updateError) {
        console.error('Error updating customer image:', updateError.message);
      } else {
        setCustomer({ ...customer, customer_image: imagePath });
        console.log('Profile image updated successfully');
      }
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
        state: data.state,
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
    const { data: { user } } = await supabase.auth.getUser();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '', // Get the current user's email
      password: currentPassword,
    });
  
    if (signInError) {
      console.error('Current password is incorrect:', signInError.message);
      return;
    }
  
    // If sign in is successful, update the password
    const { error: updateError } = await supabase.auth.updateUser({
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user:', userError?.message);
      return;
    }

    // You need to implement a secure backend function to delete a user.
    // For demonstration, we'll just remove the customer record from the 'customers' table.
    // WARNING: This does NOT delete the user from Supabase Auth!
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('customer_email', user.email);

    if (error) {
      console.error('Error deleting customer data:', error.message);
    } else {
      console.log('Customer data deleted successfully');
      // Optionally, sign out the user
      await supabase.auth.signOut();
      // Optionally, redirect the user or show a success message
    }
  };

    if (loading){
      return(
        <div className="fixed inset-0 z-50 flex items-center justify-center my-nav">
          <img
            src="/logo/ushop-small.svg"
            alt="logo"
            className="animate-bounce"
          />
        </div>      
      )
    }

  if (!customer) {
    return <div>No customer data found.</div>;
  }  

  return (
    <div className="flex items-center justify-center p-4">
    <div className="min-h-screen flex items-center justify-center p-4">
    <div className="font-std mb-10 w-full rounded-2xl p-10 font-normal leading-relaxed shadow-xl">
        <div className='flex flex-col'>
           <Card className='flex md:flex-row items-center mb-5'>
            <CardHeader className='flex flex-col items-center text-center'>
                <CardTitle>
                <h2 className="mb-5 text-3xl font-bold text-center">Update Profile</h2>                    
                </CardTitle>
            </CardHeader>
            <CardContent className='text-center'>
            <div className="relative flex items-center">            
            <Label htmlFor="customer_image" className='cursor-pointer relative group'>
             <Avatar className="rounded-full w-32 h-32 mx-auto border-4 border-orange-700 mb-4 transition-transform duration-300 hover:scale-105 ring ring-gray-300">
              {customer.customer_image ? (
                <AvatarImage 
                  src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${customer.customer_image}`}
                  alt="Profile" />
                ): (
                  <AvatarFallback className='text-3xl'>{customer.customer_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                )}
              </Avatar>

              {/* Camera icon overlay */}
              <div className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow-md group-hover:scale-110 transition">
                <CameraIcon  className='w-5 h-5 text-orange-700'/>
              </div>                       
            </Label>

            {/* Hidden file input */}
            <Input
               type='file' 
               id="customer_image" 
               onChange={handleImageChange}
               className='hidden'
               accept="image/*" 
            />             
            </div>
            </CardContent>
           </Card>

           <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                 id="customer_name"
                 {...register('customer_name')}
                 placeholder={customer.customer_name}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
            </div>
            <div className="space-y-2">
                <Label>Email</Label>
                <Input
                 id="customer_email"
                 type='email'
                 {...register('customer_email')}
                 placeholder={customer.customer_email}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
            </div>
            <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                 id="customer_contact"
                 {...register('customer_contact')}
                 placeholder={customer.customer_contact}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <Label>Location</Label>
              <div className="grid grid-col-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 justify-items-center space-y-2">
                {/* Country Dropdown */}          

                <Select
                  onValueChange={(value) => setValue("customer_country", value)}
                  defaultValue={customer.customer_country}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* State Dropdown */} 

                <Select
                  onValueChange={(value) => setValue("state", value)}
                  defaultValue={customer.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {statesList.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>  
                  
                {/* City Dropdown */}    

                <Select
                  onValueChange={(value) => setValue("customer_city", value)}
                  defaultValue={customer.customer_city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>                       
              </div>                
              <Input
               id="customer_address"
               {...register('customer_address')}
               placeholder={customer.customer_address}
               className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
              />
            </div>
            <div className='flex justify-end space-x-4'>
                <Button type="submit" className="col-span-2">Save Changes</Button>
            </div>
           </form>

        {/* Change Password */}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Label>Update Password</Label>
            <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required 
                placeholder="Current Password" 
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
              />
            <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
                placeholder="New Password"
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'             
              />
            <Input
             type="password" 
             placeholder="Confirm Password"
             className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'          
            />
            <Button type="submit" className="col-span-3">Save</Button>
          </form>
  
        {/* Two-Factor Authentication */}
            <div className='py-4 space-y-4'>
            <Label>Two-Factor Authentication</Label>
            <div>
            <p className="text-sm mb-2">Enable two-factor authentication for added security.</p>
            <Input className="mt-4" placeholder={customer.customer_contact} />
            </div>
            </div>

        {/* Delete Account */}
        <div className='mt-5'>
            <Label>Delete Account</Label>
          <div>
            <p className="text-sm mb-2">Deleting your account is permanent and cannot be undone.</p>
            <Button 
            variant="destructive"
            onClick={handleDeleteAccount}
            >I understand, delete my account</Button>
          </div>
          </div>           
        </div>
    </div>
    </div>
  
  </div>
  )
}
