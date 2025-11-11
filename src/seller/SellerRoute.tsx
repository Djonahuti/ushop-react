
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '@/lib/api';

export default function SellerRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const email = localStorage.getItem('auth_email');
      const role = localStorage.getItem('auth_role');
      
      if (!email || role !== 'seller') {
        navigate('/login');
        return;
      }

      try {
        const sellers = await apiGet<any[]>(`/sellers.php?email=${encodeURIComponent(email)}`);
        if (!sellers || sellers.length === 0) {
          navigate('/');
        } else {
          setChecking(false);
        }
      } catch (error) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  if (checking) return <div>Loading...</div>;
  return <>{children}</>;
}