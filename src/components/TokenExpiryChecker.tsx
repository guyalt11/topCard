import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const TokenExpiryChecker = () => {
  const location = useLocation();
  const { checkAndRefreshToken } = useAuth();

  useEffect(() => {
    // Check and refresh token on every navigation
    checkAndRefreshToken();
  }, [location, checkAndRefreshToken]);

  return null;
};

export default TokenExpiryChecker;
