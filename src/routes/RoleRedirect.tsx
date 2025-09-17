import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function RoleRedirect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Check if user is an admin
        const { data: admin, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('admin_email', user.email)
          .single();

        if (admin && !adminError) {
          navigate('/admin-dashboard');
          return;
        }

        // Check if user is a seller
        const { data: seller, error: sellerError } = await supabase
          .from('sellers')
          .select('*')
          .eq('seller_email', user.email)
          .single();

        if (seller && !sellerError) {
          navigate('/seller-dashboard');
          return;
        }

        // Check if user is a customer
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_email', user.email)
          .single();

        if (customer && !customerError) {
          navigate('/overview');
          return;
        }

        // If user doesn't exist in any table, redirect to signup
        console.log('User not found in any role table, redirecting to signup');
        navigate('/signup');
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Checking your role...</p>
        </div>
      </div>
    );
  }

  return null; // This component only handles redirects
}
