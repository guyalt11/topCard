
import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  // Display toast and redirect
  React.useEffect(() => {
    toast({
      title: "Admin Access Restricted",
      description: "Admin functionality is not available in the current implementation.",
      variant: "destructive",
    });
  }, []);

  return <Navigate to="/" />;
};

export default AdminDashboard;
