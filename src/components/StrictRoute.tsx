// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabaseClient';

export default function StrictRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      } else {
        setChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (checking) return <div>Loading...</div>;
  return <>{children}</>;
}
