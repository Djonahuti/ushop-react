// src/components/AdminRoute.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabaseClient';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login'); // Redirect to login if not authenticated
      } else {
        // Check if the user is an admin
        const { data: adminData, error } = await supabase
          .from('admins')
          .select('*')
          .eq('admin_email', user.email)
          .single();

        if (error || !adminData) {
          navigate('/'); // Redirect to home if not an admin
        } else {
          setChecking(false); // User is an admin, allow access
        }
      }
    };
    checkAuth();
  }, [navigate]);

  if (checking) return <div>Loading...</div>;
  return <>{children}</>;
}