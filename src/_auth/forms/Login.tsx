import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import supabase from "@/lib/supabaseClient"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
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
  
  const onSubmit = async (data: FormData) => {
    setIsPending(true); // Show loader
    const { error } = await supabase.auth.signInWithPassword({
      email: data.customer_email,
      password: data.customer_pass,
    });

    if (error) {
      console.error('Error logging in:', error.message);
    } else {
      console.log('Login successful');
      toast.success('Login Successful')

      // Check if the user is an admin
      const { error: userError } = await supabase
        .from('admins')
        .select('*')
        .eq('admin_email', data.customer_email)
        .single();

      if (!userError) {
        // Redirect to admin dashboard
        navigate('/admin-dashboard');
      } else {
        // If no admin found, check if it's a customer
        const { error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_email', data.customer_email)
          .single();
        if (!customerError) {
          //Redirect to customer dashboard
          navigate('/overview');
        } else {
          // If no customer found, check if it's a seller
          const { error: sellerError } = await supabase
            .from('sellers')
            .select('*')
            .eq('seller_email', data.customer_email)
            .single();

          if (!sellerError) {
            // Redirect to seller dashboard
            navigate('/seller-dashboard');
          } else {
            console.error('Error finding user:', customerError.message);
            toast.error('Error finding user')
          }
        }

      }
    }
    setIsPending(false); // Hide loader
  };
    
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
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/overview`,
                      }
                     });
                  }}
                >
                  Login with Google
                </Button>
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
  