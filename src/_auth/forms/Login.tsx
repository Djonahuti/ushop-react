import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiPost } from "@/lib/api"
import { loadGoogleScript, initGoogleSignIn, renderGoogleButton } from "@/lib/google"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const schema = z.object({
  customer_email: z.string().email('Invalid email address'),
  customer_pass: z.string().min(6, 'Password must be at least 6 characters long'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      const res = await apiPost<{ success?: boolean; role?: 'admin' | 'customer' | 'seller'; email?: string; name?: string; error?: string }>(
        '/login.php',
        { email: data.customer_email, password: data.customer_pass }
      );
      console.log('Login response:', res); // Debug log
      if (!res) {
        toast.error('Invalid email or password');
        return;
      }
      // Check if response indicates success (either success: true or has role/email)
      if (res.success === false || res.error) {
        toast.error(res.error || 'Invalid email or password');
        return;
      }
      if (!res.role || !res.email) {
        toast.error('Invalid response from server');
        return;
      }
      localStorage.setItem('auth_email', res.email);
      localStorage.setItem('auth_role', res.role);
      toast.success('Login Successful');
      if (res.role === 'admin') navigate('/admin-dashboard');
      else if (res.role === 'seller') navigate('/seller-dashboard');
      else navigate('/overview');
    } catch (e: any) {
      console.error('Login failed', e?.message || e);
      toast.error('Invalid email or password');
    } finally {
      setIsPending(false);
    }
  };
  
  // Google Sign-In
  useEffect(() => {
    (async () => {
      try {
        await loadGoogleScript();
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
        if (!clientId) {
          console.warn('VITE_GOOGLE_CLIENT_ID not set; Google sign-in disabled.');
          return;
        }
        initGoogleSignIn(clientId, async (credential: string) => {
          const res = await apiPost<{ success?: boolean; role?: string; email?: string; name?: string; error?: string }>(
            '/google_login.php',
            { id_token: credential }
          );
          if (!res || res.success === false || !res.email || !res.role) {
            toast.error(res?.error || 'Google sign-in failed');
            return;
          }
          localStorage.setItem('auth_email', res.email);
          localStorage.setItem('auth_role', res.role!);
          toast.success('Login Successful');
          if (res.role === 'admin') navigate('/admin-dashboard');
          else if (res.role === 'seller') navigate('/seller-dashboard');
          else navigate('/overview');
        });
        // Render button when available
        if (!renderGoogleButton(googleButtonRef.current)) {
          console.warn('Failed to render Google sign-in button.');
        }
      } catch {
        // ignore script load errors here; user can still use email/password
      }
    })();
  }, [navigate]);
    
      return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome Back</CardTitle>
              <CardDescription>Enter your email and password to login</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    {...register('customer_email')}
                    placeholder="Enter your email"
                  />
                  {errors.customer_email && <span>{errors.customer_email.message}</span>}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                  <Label htmlFor="customer_pass">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                  </div>
                  <Input
                    id="customer_pass"
                    type="password"
                    {...register('customer_pass')}
                    placeholder="Enter your password"
                  />
                  {errors.customer_pass && <span>{errors.customer_pass.message}</span>}
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
                <div className="mt-2 flex justify-center">
                  <div ref={googleButtonRef} id="google-signin-btn-login" />
                </div>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </form>              
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
            By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
            and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      );
  }
  