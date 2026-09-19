import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Show a clean loading state while verifying JWT token on app load
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-plum animate-spin" />
        <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">
          Verifying Session...
        </p>
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes
  return <Outlet />;
}