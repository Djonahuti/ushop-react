import { createContext, useContext, useEffect, useState } from "react"
// Simplified AuthContext without Supabase; reads from localStorage set by login API

export const AuthContext = createContext<any>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('auth_email');
    const role = localStorage.getItem('auth_role');
    setUser(email ? { email, role } : null);
      setLoading(false);
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
