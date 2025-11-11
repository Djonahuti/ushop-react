import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet, apiPost, apiPut, uploadFile } from "@/lib/api";
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

export function ProfileDesktop() {
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
        const email = localStorage.getItem('auth_email');
        if (!email) { setLoading(false); return; }

        try {
          const admins = await apiGet<Admin[]>(`/admins.php?email=${encodeURIComponent(email)}`);
          const data = admins?.[0];
          
          if (!data) {
            setLoading(false);
            return;
          }
          
            setAdmin(data);
            setValue('admin_name', data.admin_name);
            setValue('admin_email', data.admin_email);
            setValue('admin_country', data.admin_country);
            setValue('admin_job', data.admin_job);
            setValue('admin_contact', data.admin_contact);
            setValue('admin_about', data.admin_about);
        } catch (error) {
          console.error('Error fetching admin data:', error);
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
      let imagePath = admin?.admin_image;
      if (imageFile) {
        const uploaded = await uploadFile(imageFile);
        if (!uploaded) {
          console.error('Error uploading image');
          return;
        }
        imagePath = uploaded;
      }
  
      try {
        await apiPut('/admins.php', {
          admin_email: admin?.admin_email,
          admin_name: data.admin_name,
          admin_country: data.admin_country,
          admin_job: data.admin_job,
          admin_contact: data.admin_contact,
          admin_about: data.admin_about,
          admin_image: imagePath,
        });
        console.log('Admin data updated successfully');
      } catch (error) {
        console.error('Error updating admin data:', error);
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
          role: 'admin',
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
      await fetch(`${window.location.origin}/api/admins.php?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
      localStorage.removeItem('auth_email');
      localStorage.removeItem('auth_role');
      console.log('Admin data deleted successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting admin data:', error);
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
             src={`/${admin.admin_image}`} 
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
