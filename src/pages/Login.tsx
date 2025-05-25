import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import Cookies from 'js-cookie';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, logout } = useAuth();
  const cleanupDone = useRef(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clean up auth state when component mounts
  useEffect(() => {
    const cleanupAuth = async () => {
      if (cleanupDone.current) return;
      
      console.log('Cleaning up auth state...');
      try {
        // Clear all auth-related cookies
        Cookies.remove('currentUser');
        Cookies.remove('authToken');
        Cookies.remove('tokenExpiry');
        
        // Only logout if we're actually authenticated
        if (isAuthenticated) {
          await logout();
        }
        
        cleanupDone.current = true;
      } catch (error) {
        console.error('Error during auth cleanup:', error);
      }
    };

    cleanupAuth();
  }, [isAuthenticated, logout]);

  // Handle redirection after successful login
  useEffect(() => {
    if (isAuthenticated && isSubmitting) {
      console.log('User authenticated, redirecting...');
      // Use setTimeout to ensure state updates are processed
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

  // Don't show login form if already authenticated
  if (isAuthenticated && !isSubmitting) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      toast({
        title: "Invalid input",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await login({ email: trimmedEmail, password });
      
      if (success) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${trimmedEmail}!`,
        });
      } else {
        setIsSubmitting(false);
        toast({
          title: "Login failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsSubmitting(false);
      toast({
        title: "Login error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
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
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm">
            Don't have an account?{' '}
            {/* <Link to="/register" className="underline" tabIndex=\{isSubmitting ? -1 : 0}>
              Register
            </Link> */}
            <button
              onClick={() =>
                toast({
                  title: "Manual registration not permitted at the moment",
                  description: "Contact guyalt11@gmail.com for registration ",
                  variant: "destructive",
                })
              }
              className="underline text-sm"
              disabled={isSubmitting}
            >
              Register
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
