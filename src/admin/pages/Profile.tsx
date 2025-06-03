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
import { Textarea } from "@/components/ui/textarea";
import { Admin } from "@/types";

const schema = z.object({
  admin_name: z.string().min(1, 'Name is required'),
  admin_email: z.string().email('Invalid email address'),
  admin_country: z.string().optional(),
  admin_job: z.string().optional(),
  admin_contact: z.string().optional(),
  admin_about: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const Profile: React.FC = () => {
  const { register, handleSubmit, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [admin, setAdmin] = useState<Admin | null>(null);
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
      const fetchAdminData = async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('admin_email', user.email)
            .single();
  
          if (error) {
            console.error('Error fetching admin data:', error.message);
          } else {
            setAdmin(data);
            // Set form values
            setValue('admin_name', data.admin_name);
            setValue('admin_email', data.admin_email);
            setValue('admin_country', data.admin_country);
            setValue('admin_job', data.admin_job);
            setValue('admin_contact', data.admin_contact);
            setValue('admin_about', data.admin_about);
          }
        } else if (userError) {
        console.error('Error getting user:', userError.message);
      }
        setLoading(false);
      };
  
      fetchAdminData();
    }, [setValue]);
    
    // Update Admin Image function
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        setImageFile(event.target.files[0]);
      }
    };

    // Update Admin function
    const onSubmit = async (data: FormData) => {
      // Handle image upload
      let imagePath = admin?.admin_image; // Keep the existing image if no new image is uploaded
      if (imageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media') // Replace with your storage bucket name
          .upload(`admins/${imageFile.name}`, imageFile);
  
        if (uploadError) {
          console.error('Error uploading image:', uploadError.message);
          return;
        }
        imagePath = uploadData.path; // Get the uploaded image path
      }
  
      // Update admin details
      const { error } = await supabase
        .from('admins')
        .update({
          admin_name: data.admin_name,
          admin_email: data.admin_email,
          admin_country: data.admin_country,
          admin_job: data.admin_job,
          admin_contact: data.admin_contact,
          admin_about: data.admin_about,
          admin_image: imagePath,
        })
        .eq('admin_email', admin?.admin_email);
  
      if (error) {
        console.error('Error updating admin data:', error.message);
      } else {
        console.log('Admin data updated successfully');
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
    // For demonstration, we'll just remove the admin record from the 'admins' table.
    // WARNING: This does NOT delete the user from Supabase Auth!
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('admin_email', user.email);

    if (error) {
      console.error('Error deleting admin data:', error.message);
    } else {
      console.log('Admin data deleted successfully');
      // Optionally, sign out the user
      await supabase.auth.signOut();
      // Optionally, redirect the user or show a success message
    }
  };
  
    if (loading){
      return(
        <div className="fixed inset-0 z-50 flex items-center justify-center my-nav">
          <img
            src="/src/assets/ushop-small.svg"
            alt="logo"
            className="animate-bounce"
          />
        </div>      
      )
    }
  
    if (!admin) {
      return <div>No admin data found.</div>;
    }

  return (
    <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Profile Section */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>{admin.admin_name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Avatar className="w-24 h-24">
            {admin.admin_image ? (
            <AvatarImage
             src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${admin.admin_image}`} 
             alt="Profile" />
        ): (
          <Avatar className="w-24 h-24" />
        )}
          </Avatar>
          <hr className="my-4 w-full" />
          <div className="space-y-2">
          <Label>I am a {admin.admin_job}</Label>
          <p className="text-accent-foreground text-xs">{admin.admin_about}</p>
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
            id="admin_name"
            {...register('admin_name')} 
            placeholder={admin.admin_name} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
            id="admin_email"
            type="email"
            {...register('admin_email')}  
            placeholder={admin.admin_email} />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
            id="admin_contact"
            {...register('admin_contact')}  
            placeholder={admin.admin_contact} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Job Title</Label>
            <Input
            id="admin_job"
            {...register('admin_job')}  
            placeholder={admin.admin_job} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>About</Label>
            <Textarea
            id="admin_about"  
            placeholder="Start Writing" />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Location</Label>
            <Input
            id="admin_country"
            {...register('admin_country')}  
            placeholder={admin.admin_country} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="admin_image">Change Image</Label>
            <Input
              id="admin_image"
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
          <Input className="mt-4" placeholder={admin.admin_contact} />
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
  )
}

export default Profile;