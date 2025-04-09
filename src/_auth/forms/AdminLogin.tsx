import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import supabase from "@/lib/supabaseClient"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const schema = z.object({
  admin_email: z.string().email('Invalid email address'),
  admin_pass: z.string().min(6, 'Password must be at least 6 characters long'),
});

type FormData = z.infer<typeof schema>;

export function AdminLogin({
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
        email: data.admin_email,
        password: data.admin_pass,
      });
  
      if (error) {
        console.error('Error logging in:', error.message);
      } else {
        console.log('Login successful');
        
        // Redirect or perform other actions after successful login
        navigate('/admin-dashboard'); // Redirect to the dashboard or any other page
        setIsPending(false); // Hide loader
      }
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
                  <Label htmlFor="admin_email">Email</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    {...register('admin_email')}
                    placeholder="Enter your email"
                  />
                  {errors.admin_email && <span>{errors.admin_email.message}</span>}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                  <Label htmlFor="admin_pass">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                  </div>
                  <Input
                    id="admin_pass"
                    type="password"
                    {...register('admin_pass')}
                    placeholder="Enter your password"
                  />
                  {errors.admin_pass && <span>{errors.admin_pass.message}</span>}
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
                <Button variant="outline" className="w-full">
                  Login with Google
                </Button>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="underline underline-offset-4">
                    Sign up
                  </a>
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
  