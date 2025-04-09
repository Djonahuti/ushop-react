import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
//import { cn } from '@/lib/utils';

const AuthForm = ({ type }: { type: 'login' | 'signup' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [customerImage, setCustomerImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCustomerImage(e.target.files[0]);
  }
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (type === 'signup') {
        await signup(email, password, customerName, phone, address, city, country, customerImage);
      } else {
        await login(email, password);
      }
      navigate('/'); // Redirect after authentication
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{type === 'signup' ? 'Sign Up' : 'Login'}</CardTitle>
            <CardDescription>
              {type === 'signup' ? 'Enter your Details to create an account' : 'Enter your email below to login to your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
              {type === 'signup' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Upload Profile Picture</Label>
                  <Input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone NO</Label>
                  <Input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08012345678"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Home Address</Label>
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="NO 1, Otigba street ikeja"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lagos"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Nigeria"
                    required
                  />
                </div>
              </>
              )}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input id="password" type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <Button type="submit" className="w-full">
                {type === 'signup' ? 'Sign Up' : 'Login'}
                </Button>
                <Button variant="outline" className="w-full">
                  {type === 'signup' ? 'Sign Up with Google' : 'Login with Google'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                {type === 'signup' ? 'Already have an account?' : 'Don&apos;t have an account?'}{" "}
                <a href={type === 'signup' ? '/login' : '/signup'} className="underline underline-offset-4">
                  {type === 'signup' ? 'Login' : 'Sign Up'}
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
};

export default AuthForm;
