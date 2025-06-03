import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from "@/lib/supabaseClient";
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
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('sellers')
            .select('*')
            .eq('seller_email', user.email)
            .single();
  
          if (error) {
            console.error('Error fetching seller data:', error.message);
          } else {
            setSeller(data);
            // Set form values
            setValue('seller_name', data.seller_name);
            setValue('seller_email', data.seller_email);
            setValue('shop_address', data.shop_address);
            setValue('shop_city', data.shop_city);
            setValue('shop_country', data.shop_country);
            setValue('business_name', data.business_name);
            setValue('seller_contact', data.seller_contact);
            setValue('cac_no', data.cac_no);
          }
        } else if (userError) {
        console.error('Error getting user:', userError.message);
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
      // Handle image upload
      let imagePath = seller?.seller_image; // Keep the existing image if no new image is uploaded
      if (imageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media') // Replace with your storage bucket name
          .upload(`sellers/${imageFile.name}`, imageFile);
  
        if (uploadError) {
          console.error('Error uploading image:', uploadError.message);
          return;
        }
        imagePath = uploadData.path; // Get the uploaded image path
      }
  
      // Update seller details
      const { error } = await supabase
        .from('sellers')
        .update({
          seller_name: data.seller_name,
          seller_email: data.seller_email,
          shop_address: data.shop_address,
          shop_city: data.shop_city,
          shop_country: data.shop_country,
          business_name: data.business_name,
          seller_contact: data.seller_contact,
          cac_no: data.cac_no,
          seller_image: imagePath,
        })
        .eq('seller_email', seller?.seller_email);
  
      if (error) {
        console.error('Error updating seller data:', error.message);
      } else {
        console.log('seller data updated successfully');
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
    // For demonstration, we'll just remove the seller record from the 'sellers' table.
    // WARNING: This does NOT delete the user from Supabase Auth!
    const { error } = await supabase
      .from('sellers')
      .delete()
      .eq('seller_email', user.email);

    if (error) {
      console.error('Error deleting seller data:', error.message);
    } else {
      console.log('seller data deleted successfully');
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
             src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${seller.seller_image}`} 
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