import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, signInWithGoogle, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Handle redirection after successful registration
  useEffect(() => {
    if (isAuthenticated && isSubmitting) {
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    }
  }, [isAuthenticated, isSubmitting, navigate]);

  // Show loading state while checking initial auth
  if (isLoading && !isSubmitting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show register form if already authenticated
  if (isAuthenticated && !isSubmitting) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || !confirmPassword) {
      toast({
        title: "Invalid input",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await register({ email: trimmedEmail, password });

      if (success) {
        toast({
          title: "Registration successful",
          description: `Welcome, ${trimmedEmail}! Please check your email to confirm your account.`,
        });
      } else {
        setIsSubmitting(false);
        toast({
          title: "Registration failed",
          description: "Unable to create account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setIsSubmitting(false);
      toast({
        title: "Registration error",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const success = await signInWithGoogle();

      if (!success) {
        setIsSubmitting(false);
        toast({
          title: "Google sign-in failed",
          description: "Unable to sign in with Google. Please try again.",
          variant: "destructive",
        });
      }
      // If successful, the OAuth flow will redirect the user
    } catch (error) {
      console.error('Google sign-in error:', error);
      setIsSubmitting(false);
      toast({
        title: "Google sign-in error",
        description: "An error occurred during Google sign-in. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="email"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="new-password"
                placeholder="Enter your password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="new-password"
                placeholder="Confirm your password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="underline" tabIndex={isSubmitting ? -1 : 0}>
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
