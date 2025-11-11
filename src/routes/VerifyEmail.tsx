import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const code = searchParams.get('code');
      const email = searchParams.get('email');

      if (!code || !email) {
        setStatus('error');
        setMessage('Invalid verification link. Missing code or email.');
        return;
      }

      try {
        const result = await apiGet<{ verified: boolean; message: string }>(
          `/verify_email.php?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`
        );

        if (result?.verified) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result?.message || 'Verification failed. Please try again.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error?.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email address...'}
            {status === 'success' && 'Verification complete!'}
            {status === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
              <p className="text-center text-muted-foreground">Please wait...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-center text-green-600">{message}</p>
              <p className="text-center text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Login
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-center text-red-600">{message}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
                <Button onClick={() => navigate('/signup')}>
                  Sign Up Again
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

