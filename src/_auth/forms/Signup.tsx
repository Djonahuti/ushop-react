import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import supabase from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const schema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  customer_email: z.string().email('Invalid email address'),
  customer_pass: z.string().min(6, 'Password must be at least 6 characters long'),
  customer_country: z.string().optional(),
  customer_city: z.string().optional(),
  customer_contact: z.string().optional(),
  customer_address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;


export function RegisterForm({
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
      // Step 1: Sign up the user in Supabase Auth
      const { user, error: authError } = await supabase.auth.signUp({
        email: data.customer_email,
        password: data.customer_pass,
      });
  
      if (authError) {
        console.error('Error signing up:', authError.message);
        setIsPending(false);
        return;
      }
  
      // Step 2: Store additional customer information in the customers table
      const { error: dbError } = await supabase
        .from('customers')
        .insert([
          {
            customer_email: data.customer_email,
            customer_name: data.customer_name,
            customer_country: data.customer_country,
            customer_city: data.customer_city,
            customer_contact: data.customer_contact,
            customer_address: data.customer_address,
            provider: 'supabase', // Optional: specify the provider
            provider_id: user?.id, // Store the Supabase user ID
          },
        ]);
  
        setIsPending(false); // Hide loader
  
      if (dbError) {
        console.error('Error storing customer information:', dbError.message);
      } else {
        console.log('Customer information stored successfully');
        navigate('/');
      }
    };
  
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your Details to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-6">
          <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="customer_name">Full Name</Label>
          <Input
            id="customer_name"
            {...register('customer_name')}
            placeholder="Enter your name"
          />
          {errors.customer_name && <span className="text-red-500 text-sm mb-2">{errors.customer_name.message}</span>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customer_email">Email</Label>
          <Input
            id="customer_email"
            type="email"
            {...register('customer_email')}
            placeholder="Enter your email"
          />
          {errors.customer_email && <span className="text-red-500 text-sm mb-2">{errors.customer_email.message}</span>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customer_country">Country</Label>
          <Input
            id="customer_country"
            {...register('customer_country')}
            placeholder="Enter your country"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customer_city">City</Label>
          <Input
            id="customer_city"
            {...register('customer_city')}
            placeholder="Enter your city"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customer_contact">Contact Number</Label>
          <Input
            id="customer_contact"
            {...register('customer_contact')}
            placeholder="Enter your contact number"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customer_address">Address</Label>
          <Input
            id="customer_address"
            {...register('customer_address')}
            placeholder="Enter your address"
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="customer_pass">Password</Label>
          </div>
          <Input
            id="customer_pass"
            type="password"
            {...register('customer_pass')}
            placeholder="Enter your password"
          />
          {errors.customer_pass && <span className="text-red-500 text-sm mb-2">{errors.customer_pass.message}</span>}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Sign Up"
          )}
        </Button>
        <Button variant="outline" className="w-full">
          Sign Up with Google
        </Button>            
          </div>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="underline underline-offset-4">
            Login
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
