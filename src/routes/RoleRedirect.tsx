import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

export default function RoleRedirect() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkUserRole = async () => {
      console.log('RoleRedirect: user object:', user);
      
      // Wait a bit for the user object to be available
      if (!user) {
        console.log('RoleRedirect: No user found, waiting...');
        setTimeout(() => {
          if (!user) {
            console.log('RoleRedirect: Still no user after delay, redirecting to login');
            navigate('/login');
          }
        }, 1000);
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
      }
    };

    // Only run when user is available and not loading
    if (!loading && user) {
      checkUserRole();
    } else if (!loading && !user) {
      console.log('RoleRedirect: No user and not loading, redirecting to login');
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center my-nav">
          <img
            src="/logo/ushop-small.svg"
            alt="logo"
            className="animate-bounce"
          />
        </div>
    );
  }

  return null; // This component only handles redirects
}
