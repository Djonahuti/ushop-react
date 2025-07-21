import { createContext, useContext, useEffect, useState } from "react"
import supabase from "@/lib/supabaseClient"

export const AuthContext = createContext<any>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get current user session
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    getUser()

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)

      // Only run on sign-in or sign-up
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const user = session.user;
        // Check if user is from Google
        const isGoogle = user.app_metadata?.provider === 'google';
        if (isGoogle) {
          // Check if user already exists in customers table
          const { data: existingCustomer, error: customerError } = await supabase
            .from('customers')
            .select('customer_email')
            .eq('customer_email', user.email)
            .single();
          if (!existingCustomer && !customerError) {
            // Insert new customer
            await supabase.from('customers').insert([
              {
                customer_email: user.email,
                customer_name: user.user_metadata?.full_name || user.email,
                provider: 'google',
                provider_id: user.id,
              },
            ]);
          }
        }
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
