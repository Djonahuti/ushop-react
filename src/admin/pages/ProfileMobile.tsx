import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiGet, apiPost, apiPut, uploadFile } from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Admin } from '@/types';
import { CameraIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  admin_name: z.string().min(1, 'Name is required'),
  admin_email: z.string().email('Invalid email address'),
  admin_country: z.string().optional(),
  admin_job: z.string().optional(),
  admin_contact: z.string().optional(),
  admin_about: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ProfileMobile() {
  const { register, handleSubmit, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [saving, setSaving] = useState(false);

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
    
    // Update Admin Image function: upload immediately after selecting a file
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        setImageFile(event.target.files[0]);
      }
    };

    // Update Admin function
    const onSubmit = async (data: FormData) => {
      setSaving(true);
      let imagePath = admin?.admin_image;
      if (imageFile) {
        const uploaded = await uploadFile(imageFile);
        if (!uploaded) {
          setSaving(false);
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
        window.location.reload();
      } catch (error) {
        console.error('Error updating admin data:', error);
      }
      setSaving(false);
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
            <Label htmlFor="admin_image" className='cursor-pointer relative group'>
             <Avatar className="rounded-full w-32 h-32 mx-auto border-4 border-orange-700 mb-4 transition-transform duration-300 hover:scale-105 ring ring-gray-300">
              {admin.admin_image ? (
                <AvatarImage 
                  src={`/${admin.admin_image}`}
                  alt="Profile" />
                ): (
                  <AvatarFallback className='text-3xl'>{admin.admin_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                )}
              </Avatar>

              {/* Camera icon overlay */}
              <div className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow-md group-hover:scale-110 transition">
                <CameraIcon  className='w-5 h-5 text-orange-700'/>
              </div>                       
            </Label>

            {/* Hidden file input */}
            {/* File input for profile image */}
            <Input
               type='file' 
               id="admin_image" 
               onChange={handleImageChange}
               accept="image/*" 
            />             
            </div>
            </CardContent>
           </Card>

           <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                 id="admin_name"
                 {...register('admin_name')}
                 placeholder={admin.admin_name}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
                <Label htmlFor="admin_image">Change Image</Label>
                <Input
                  id="admin_image"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                />
            </div>
            <div className="space-y-2">
                <Label>Email</Label>
                <Input
                 id="admin_email"
                 type='email'
                 {...register('admin_email')}
                 placeholder={admin.admin_email}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
            </div>
            <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                 id="admin_contact"
                 {...register('admin_contact')}
                 placeholder={admin.admin_contact}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
            </div>
            <div className="space-y-2">
                 <Label>Job Title</Label>
                 <Input
                 id="admin_job"
                 {...register('admin_job')}  
                 placeholder={admin.admin_job}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
            </div>
            <div className="space-y-2">
                 <Label>About</Label>
                 <Textarea
                 id="admin_about"
                 {...register('admin_about')}  
                 placeholder={admin.admin_about}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
            </div>
            <div className="space-y-2">
                 <Label>Location</Label>
                 <Input
                 id="admin_country"
                 {...register('admin_country')}  
                 placeholder={admin.admin_country}
                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
                />
            </div>

            <div className='flex justify-end space-x-4'>
                <Button type="submit" className="col-span-2" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Saving...</span>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
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
            <Input className="mt-4" placeholder={admin.admin_contact} />
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
