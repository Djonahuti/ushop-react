import { createContext, useContext, useEffect, useState } from "react"
import supabase from "@/lib/supabaseClient"
import { toast } from "sonner"

export const AuthContext = createContext<any>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true);

  // Helper to insert Google user into customers table if needed
  const ensureGoogleCustomer = async (user: any) => {
    if (user?.app_metadata?.provider === 'google') {
      const { data: existingCustomer, error: customerError } = await supabase
        .from('customers')
        .select('customer_email')
        .eq('customer_email', user.email)
        .single();
      if (!existingCustomer && !customerError) {
        const { error: insertError } = await supabase.from('customers').insert([
          {
            customer_email: user.email,
            customer_name: user.user_metadata?.full_name || user.email,
            provider: 'google',
            provider_id: user.id,
          },
        ]);
        if (insertError) {
          console.error('Failed to insert Google user into customers:', insertError.message);
          toast.error('Failed to save Google user in customers table: ' + insertError.message);
        } else {
          toast.success('Google account registered!');
        }
      }
    }
  };

  useEffect(() => {
    // Get current user session
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      // Ensure Google customer on initial load
      if (session?.user) {
        await ensureGoogleCustomer(session.user)
      }
      setLoading(false);
    }

    getUser()

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        await ensureGoogleCustomer(session.user)
      }
      setLoading(false);
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
