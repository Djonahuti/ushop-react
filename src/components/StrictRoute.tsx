// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StrictRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('auth_email');
    if (!email) {
        navigate('/login');
      } else {
        setChecking(false);
      }
  }, [navigate]);

  if (checking) return <div>Loading...</div>;
  return <>{children}</>;
}
