
// Supabase client utility for API interactions

export const SUPABASE_URL = 'https://nhmrdnczfxomarpncyot.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obXJkbmN6ZnhvbWFycG5jeW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MjkxMDAsImV4cCI6MjA2MzQwNTEwMH0.-dSIBlkOHATZ6IXr_dQZIY6GEI98UeoP7JJHyFH1880';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
}

// Login a user with email and password
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || error.error || 'Login failed');
  }

  return response.json();
}

// Register a new user
export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || error.error || 'Registration failed');
  }

  // After successful registration, login the user
  return loginUser(email, password);
}

// Create a function to generate headers with authentication token
export function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`
  };
}

// Helper to update user password
export async function updateUserPassword(token: string, password: string): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || error.error || 'Password update failed');
  }
}
