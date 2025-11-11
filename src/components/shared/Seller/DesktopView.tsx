import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet, apiPut, apiDelete, uploadFile, apiPost } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Seller } from "@/types";

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

const DesktopView: React.FC = () => {
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
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Profile Section */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>{seller.seller_name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Avatar className="w-24 h-24">
            {seller.seller_image ? (
            <AvatarImage
             src={`/${seller.seller_image}`} 
             alt="Profile" />
        ): (
          <Avatar className="w-24 h-24" />
        )}
          </Avatar>
          <hr className="my-4 w-full" />
          <div className="space-y-2">
          <Label>{seller.business_name}</Label>
          <Label className="text-accent-foreground text-xs">C.A.C NO: {seller.cac_no}</Label>
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
            id="seller_name"
            {...register('seller_name')} 
            placeholder={seller.seller_name} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
            id="seller_email"
            type="email"
            {...register('seller_email')}  
            placeholder={seller.seller_email} />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
            id="seller_contact"
            {...register('seller_contact')}  
            placeholder={seller.seller_contact} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Company Name</Label>
            <Input
            id="business_name"
            {...register('business_name')}  
            placeholder={seller.business_name} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Registered CAC NO</Label>
            <Input
            id="cac_no"
            {...register('cac_no')}  
            placeholder={seller.cac_no} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Location</Label>
            <Input
            id="shop_address"
            {...register('shop_address')}  
            placeholder={seller.shop_address} />
            <Input
            id="shop_city"
            {...register('shop_city')}  
            placeholder={seller.shop_city} />
            <Input
            id="shop_country"
            {...register('shop_country')}  
            placeholder={seller.shop_country} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="seller_image">Change Image</Label>
            <Input
              id="seller_image"
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
          <Input className="mt-4" placeholder={seller.seller_contact} />
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

export default DesktopView;