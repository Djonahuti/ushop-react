import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import supabase from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const getEnumValues = async (enumType: string): Promise<string[]> => {
  const { data, error } = await supabase.rpc('get_enum_values', { enum_name: enumType });
  if (error) {
    console.error(`Error fetching ${enumType}:`, error.message);
    return [];
  }
  return data || [];
};


const schema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  customer_email: z.string().email('Invalid email address'),
  customer_pass: z.string().min(6, 'Password must be at least 6 characters long'),
  customer_country: z.string().optional(),
  state: z.string().optional(),
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
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchEnums = async () => {
      const [countryEnum, stateEnum, cityEnum] = await Promise.all([
        getEnumValues('country'),
        getEnumValues('states'),
        getEnumValues('cities'),
      ]);
      setCountries(countryEnum);
      setStates(stateEnum);
      setCities(cityEnum);
    };
    fetchEnums();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsPending(true); // Show loader
      // Step 1: Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.customer_email,
        password: data.customer_pass,
      });

      if (authError) {
        console.error('Error signing up:', authError.message);
        setIsPending(false);
        return;
      }
      const user = authData?.user;
  
      // Step 2: Store additional customer information in the customers table
      const { error: dbError } = await supabase
        .from('customers')
        .insert([
          {
            customer_email: data.customer_email,
            customer_name: data.customer_name,
            customer_country: data.customer_country,
            state: data.state,
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

        <div className="flex flex-col items-center text-center space-y-2">
          <Label>Location</Label>
        <div className="grid grid-col-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 justify-items-center space-y-2">
          {/* Country Dropdown */}          

          <Select
            onValueChange={(value) => setValue("customer_country", value)}
            defaultValue={watch("customer_country")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* State Dropdown */} 

          <Select
            onValueChange={(value) => setValue("state", value)}
            defaultValue={watch("state")}
          >
            <SelectTrigger>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>  
            
          {/* City Dropdown */}    

          <Select
            onValueChange={(value) => setValue("customer_city", value)}
            defaultValue={watch("customer_city")}
          >
            <SelectTrigger>
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>                       
        </div>
        </div>
        {/* <div className="grid gap-2">
        </div> */}
          
        {/* <div className="grid gap-2">
        </div> */}
        <div className="grid gap-2">
          <Label htmlFor="customer_address">Address</Label>
          <Input
            id="customer_address"
            {...register('customer_address')}
            placeholder="Enter your address"
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
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/role-redirect`,
              }
            });
          }}
        >
          Sign Up with Google
        </Button>            
          </div>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Login
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
