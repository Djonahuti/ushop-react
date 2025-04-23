
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabaseClient';

export default function SellerRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login'); // Redirect to login if not authenticated
      } else {
        // Check if the user is an seller
        const { data: sellerData, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('seller_email', user.email)
          .single();

        if (error || !sellerData) {
          navigate('/'); // Redirect to home if not an seller
        } else {
          setChecking(false); // User is an seller, allow access
        }
      }
    };
    checkAuth();
  }, [navigate]);

  if (checking) return <div>Loading...</div>;
  return <>{children}</>;
}