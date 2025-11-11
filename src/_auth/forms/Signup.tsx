import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { apiPost } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

// Static list of African countries (text field in DB, not enum)
const africanCountries = [
  "Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi","Cabo Verde","Cameroon","Central African Republic","Chad",
  "Comoros","Congo (Republic)","Congo (Democratic Republic)","Côte d’Ivoire","Djibouti","Egypt","Equatorial Guinea","Eritrea",
  "Eswatini","Ethiopia","Gabon","Gambia","Ghana","Guinea","Guinea-Bissau","Kenya","Lesotho","Liberia","Libya","Madagascar",
  "Malawi","Mali","Mauritania","Mauritius","Morocco","Mozambique","Namibia","Niger","Nigeria","Rwanda","São Tomé and Príncipe",
  "Senegal","Seychelles","Sierra Leone","Somalia","South Africa","South Sudan","Sudan","Tanzania","Togo","Tunisia","Uganda",
  "Zambia","Zimbabwe","Western Sahara"
];

// Nigerian states (from db.sql enum list)
const nigeriaStates = [
  "Abuja","Abia State","Adamawa State","Akwa-Ibom State","Anambra State","Bauchi State","Benue State","Bornu State",
  "Cross River State","Delta State","Edo State","Enugu State","Imo State","Jigawa State","Kaduna State","Lagos State",
  "Niger State","Ogun State","Platue State","Rivers State","Kastina State","Osun State","Oyo State","Sokoto State",
  "Taraba State","Kogi State","Ekiti State","Kano State","Bayelsa State"
];

// Cities by state (sample comprehensive mapping; extend as needed)
const citiesByState: Record<string, string[]> = {
  "Abuja": ["Abaji","Bwari","Gwagwalada","Kuje","Kwali","Abuja Municipal"],
  "Abia State": ["Aba","Umuahia","Ohafia","Arochukwu","Isuikwuato","Bende"],
  "Adamawa State": ["Yola","Mubi","Numan","Jimeta","Ganye","Michika"],
  "Akwa-Ibom State": ["Uyo","Eket","Ikot Ekpene","Oron","Abak","Etinan"],
  "Anambra State": ["Awka","Onitsha","Nnewi","Ekwulobia","Otuocha","Ihiala"],
  "Bauchi State": ["Bauchi","Azare","Misau","Jama'are","Katagum","Darazo"],
  "Benue State": ["Makurdi","Gboko","Otukpo","Katsina-Ala","Vandeikya","Oju"],
  "Bornu State": ["Maiduguri","Biu","Monguno","Ngala","Damasak","Dikwa"],
  "Cross River State": ["Calabar","Ikom","Ogoja","Ugep","Obudu","Akamkpa"],
  "Delta State": ["Asaba","Warri","Sapele","Ughelli","Agbor","Oleh"],
  "Edo State": ["Benin City","Ekpoma","Auchi","Uromi","Igueben","Igarra"],
  "Enugu State": ["Enugu","Nsukka","Awgu","Oji River","Udi","Ezeagu"],
  "Imo State": ["Owerri","Okigwe","Orlu","Oguta","Mbaise","Ngor Okpala"],
  "Jigawa State": ["Dutse","Hadejia","Gumel","Kazaure","Birnin Kudu","Ringim"],
  "Kaduna State": ["Kaduna","Zaria","Kafanchan","Kagarko","Soba","Saminaka"],
  "Lagos State": ["Ikeja","Lagos Island","Ikorodu","Epe","Badagry","Surulere","Lekki","Ajah","Yaba"],
  "Niger State": ["Minna","Bida","Suleja","Kontagora","New Bussa","Mokwa"],
  "Ogun State": ["Abeokuta","Ijebu Ode","Sagamu","Ota","Ilaro","Ayetoro"],
  "Platue State": ["Jos","Barkin Ladi","Pankshin","Langtang","Shendam","Mangu"],
  "Rivers State": ["Port Harcourt","Bonny","Omoku","Ahoada","Degema","Bori"],
  "Kastina State": ["Katsina","Daura","Funtua","Malumfashi","Dutsin-Ma","Kankia"],
  "Osun State": ["Osogbo","Ile-Ife","Ilesa","Iwo","Ikirun","Ejigbo"],
  "Oyo State": ["Ibadan","Ogbomoso","Oyo","Iseyin","Saki","Eruwa"],
  "Sokoto State": ["Sokoto","Wamako","Binji","Illela","Tambuwal","Gwadabawa"],
  "Taraba State": ["Jalingo","Wukari","Sardauna (Gembu)","Bali","Takum","Ibi"],
  "Kogi State": ["Lokoja","Okene","Kabba","Idah","Ankpa","Ajaokuta"],
  "Ekiti State": ["Ado Ekiti","Ikere-Ekiti","Ikole","Ise/Orun","Ido Osi","Oye-Ekiti"],
  "Kano State": ["Kano","Wudil","Bichi","Gaya","Rano","Kura"],
  "Bayelsa State": ["Yenagoa","Ogbia","Brass","Sagbama","Ekeremor","Nembe"],
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

  // Initialize selects: countries are static, states from constant, cities depend on selected state
  useEffect(() => {
    setCountries(africanCountries);
    setStates(nigeriaStates);
  }, []);

  const selectedState = watch("state");
  useEffect(() => {
    const nextCities = selectedState ? (citiesByState[selectedState] || []) : [];
    setCities(nextCities);
    // reset city if state changes
    setValue("customer_city", undefined as any);
  }, [selectedState, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      await apiPost('/register_customer.php', {
        ...data,
      });
      localStorage.setItem('auth_email', data.customer_email);
      localStorage.setItem('auth_role', 'customer');
      toast.success('Account created successfully');
      navigate('/overview');
    } catch (error: any) {
      console.error('Error storing customer information:', error?.message || error);
      toast.error(error?.message || 'Failed to register');
    } finally {
      setIsPending(false);
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
