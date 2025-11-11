import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiGet, apiPut, apiDelete, uploadFile, apiPost } from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Seller } from '@/types';
import { CameraIcon } from 'lucide-react';

const schema = z.object({
    seller_name: z.string().min(1, 'Name is required'),
    seller_email: z.string().email('Invalid email address'),
    shop_address: z.string().optional(),
    shop_city: z.string().optional(),
    shop_country: z.string().optional(),
    business_name: z.string().optional(),
    seller_contact: z.string().optional(),
    cac_no: z.string().optional(),
  });

type FormData = z.infer<typeof schema>;

export function MobileView() {
  const { register, handleSubmit, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
      
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    await changePassword(currentPassword, newPassword);
  };
    
  const handleDeleteAccount = async () => {
    await deleteAccount();
  };
  
    useEffect(() => {
      const fetchSellerData = async () => {
        const email = localStorage.getItem('auth_email');
        if (!email) {
          setLoading(false);
          return;
        }

        try {
          const sellers = await apiGet<any[]>(`/sellers.php?email=${encodeURIComponent(email)}`);
          const sellerData = sellers?.[0];
          if (sellerData) {
            setSeller(sellerData);
            setValue('seller_name', sellerData.seller_name);
            setValue('seller_email', sellerData.seller_email);
            setValue('shop_address', sellerData.shop_address || '');
            setValue('shop_city', sellerData.shop_city || '');
            setValue('shop_country', sellerData.shop_country || '');
            setValue('business_name', sellerData.business_name || '');
            setValue('seller_contact', sellerData.seller_contact || '');
            setValue('cac_no', sellerData.cac_no || '');
          }
        } catch (err) {
          console.error('Error fetching seller data:', err);
      }
        setLoading(false);
      };
  
      fetchSellerData();
    }, [setValue]);
    
    // Update seller Image function
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        setImageFile(event.target.files[0]);
      }
    };

    // Update seller function
    const onSubmit = async (data: FormData) => {
      try {
      // Handle image upload
        let imagePath = seller?.seller_image;
      if (imageFile) {
          imagePath = await uploadFile(imageFile);
      }
  
      // Update seller details
        await apiPut('/sellers.php', {
          seller_email: seller?.seller_email,
          seller_name: data.seller_name,
          shop_address: data.shop_address,
          shop_city: data.shop_city,
          shop_country: data.shop_country,
          business_name: data.business_name,
          seller_contact: data.seller_contact,
          cac_no: data.cac_no,
          seller_image: imagePath,
        });
  
        console.log('Seller data updated successfully');
        // Refresh seller data
        const sellers = await apiGet<any[]>(`/sellers.php?email=${encodeURIComponent(data.seller_email)}`);
        if (sellers?.[0]) setSeller(sellers[0]);
      } catch (err) {
        console.error('Error updating seller data:', err);
      }
    };

    // Change Password function
    const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
      const email = localStorage.getItem('auth_email');
      if (!email || !seller) return;
      
      try {
        // Update password via change_password endpoint (it verifies current password)
        await apiPost('/change_password.php', {
          email,
          role: 'seller',
          current_password: currentPassword,
          new_password: newPassword,
        });
        
        console.log('Password updated successfully');
      } catch (err) {
        console.error('Error updating password:', err);
      }
    };
  
  // Delete Account function
  const deleteAccount = async (): Promise<void> => {
    const email = localStorage.getItem('auth_email');
    if (!email || !seller) return;

    try {
      await apiDelete('/sellers.php', { email });
      console.log('Seller data deleted successfully');
      localStorage.removeItem('auth_email');
      localStorage.removeItem('auth_role');
      window.location.href = '/login';
    } catch (err) {
      console.error('Error deleting seller data:', err);
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
  
    if (!seller) {
      return <div>No seller data found.</div>;
    }

  return (
    <div className="flex items-center justify-center p-4">
    <div className="min-h-screen flex items-center justify-center p-4">
    <div className="font-std mb-10 w-full rounded-2xl p-10 font-normal leading-relaxed shadow-xl">
        <div className='flex flex-col'>
           <Card className='flex md:flex-row mb-5 items-center'>
            <CardHeader className='flex flex-col items-center text-center'>
                <CardTitle>
                <h2 className="mb-5 text-3xl font-bold text-center">Update Profile</h2>                    
                </CardTitle>
            </CardHeader>
            <CardContent className='text-center'>
            <div className="relative flex items-center">            
            <Label htmlFor="seller_image" className='cursor-pointer relative group'>
             <Avatar className="rounded-full w-32 h-32 mx-auto border-4 border-orange-700 mb-4 transition-transform duration-300 hover:scale-105 ring ring-gray-300">
              {seller.seller_image ? (
                <AvatarImage 
                  src={`/${seller.seller_image}`}
                  alt="Profile" />
                ): (
                  <AvatarFallback className="text-3xl">{seller.business_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
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
               id="seller_image" 
               onChange={handleImageChange}
               className='hidden'
               accept="image/*" 
              />             
            </div>
            <Button className='px-4 py-2'>Change Logo</Button> 
            </CardContent>
           </Card>

           <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                 id="seller_name"
                 {...register('seller_name')}
                 placeholder={seller.seller_name}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
            </div>
            <div className="space-y-2">
                <Label>Email</Label>
                <Input
                 id="seller_email"
                 type='email'
                 {...register('seller_email')}
                 placeholder={seller.seller_email}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
            </div>
            <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                 id="business_name"
                 {...register('business_name')}
                 placeholder={seller.business_name}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
            </div>
            <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                 id="seller_contact"
                 {...register('seller_contact')}
                 placeholder={seller.seller_contact}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
            </div>
            <div className="space-y-2">
                <Label>Registered C.A.C NO</Label>
                <Input
                 id="cac_no"
                 placeholder={seller.cac_no}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                 disabled
                />
            </div>
            <div className="space-y-2">
                <Label>Location</Label>
                <Input
                 id="seller_address"
                 {...register('shop_address')}
                 placeholder={seller.shop_address}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
                <Input
                 id="seller_city"
                 {...register('shop_city')}
                 placeholder={seller.shop_city}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
                <Input
                 id="seller_country"
                 {...register('shop_country')}
                 placeholder={seller.shop_country}
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
            <Input className="mt-4" placeholder={seller.seller_contact} />
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
