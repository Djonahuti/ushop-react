import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiGet, apiPost, apiPut, uploadFile } from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Customer } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const getEnumValues = async (enumType: string): Promise<string[]> => {
  try {
    return await apiGet<string[]>(`/enum_values.php?enum=${encodeURIComponent(enumType)}`) || [];
  } catch (error) {
    console.error(`Error fetching ${enumType}:`, error);
    return [];
  }
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

export function DesktopEdit() {
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
    const fetchCustomerData = async () => {
      const email = localStorage.getItem('auth_email');
      if (!email) { setLoading(false); return; }
      
      try {
        const customers = await apiGet<Customer[]>(`/customers.php?email=${encodeURIComponent(email)}`);
        const data = customers?.[0];
        
        if (!data) {
          setLoading(false);
          return;
        }
        
          setCustomer(data);
          setValue('customer_name', data.customer_name);
          setValue('customer_email', data.customer_email);
          setValue('customer_country', data.customer_country);
          setValue('state', data.state);
          setValue('customer_city', data.customer_city);
          setValue('customer_contact', data.customer_contact);
          setValue('customer_address', data.customer_address);
      } catch (error) {
        console.error('Error fetching customer data:', error);
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
    let imagePath = customer?.customer_image;
    if (imageFile) {
      const uploaded = await uploadFile(imageFile);
      if (!uploaded) {
        console.error('Error uploading image');
        return;
      }
      imagePath = uploaded;
    }

    try {
      await apiPut('/customers.php', {
        customer_email: customer?.customer_email,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_country: data.customer_country,
        state: data.state,
        customer_city: data.customer_city,
        customer_contact: data.customer_contact,
        customer_address: data.customer_address,
        customer_image: imagePath,
      });
      console.log('Customer data updated successfully');
    } catch (error) {
      console.error('Error updating customer data:', error);
    }
  };

  // Change Password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const email = localStorage.getItem('auth_email');
    if (!email) return;
    
    try {
      await apiPost('/change_password.php', {
        email,
        current_password: currentPassword,
        new_password: newPassword,
        role: 'customer',
      });
      console.log('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

// Delete Account function
  const deleteAccount = async (): Promise<void> => {
    const email = localStorage.getItem('auth_email');
    if (!email) return;

    try {
      await fetch(`${window.location.origin}/api/customers.php?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
      localStorage.removeItem('auth_email');
      localStorage.removeItem('auth_role');
      console.log('Customer data deleted successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting customer data:', error);
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
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Profile Section */}
    <Card>
      <CardHeader>
        <CardTitle>{customer.customer_name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Avatar className="w-24 h-24">
          {customer.customer_image ? (
          <AvatarImage 
              src={`/${customer.customer_image}`}
              alt="Profile" />
      ): (
        <Avatar className="w-24 h-24" />
      )}
        </Avatar>
        <div className="mt-2">
        <Label>{customer.customer_email}</Label>
        </div>
      </CardContent>
    </Card>
  
    <form onSubmit={handleSubmit(onSubmit)}>
    {/* Account Details */}
    <Card>
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
          <Label className='flex flex-col items-center text-center'>Location</Label>
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
          />
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
  )
}
