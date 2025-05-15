import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect, useLocation } from "wouter";
import React, { useEffect, useState } from "react";

export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = true,
}: {
  path: string;
  component: React.ComponentType;
  adminOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Set a timeout for authentication check
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timer);
  }, []);

  // Check authentication status once it's no longer loading
  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  return (
    <Route path={path}>
      {() => {
        // Still loading and timeout not reached
        if (isLoading && !timeoutReached) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-gray-600">Verifying authentication...</p>
            </div>
          );
        }

        // Loading timeout reached, but still not authenticated
        if (isLoading && timeoutReached) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <p className="text-amber-600 mb-4">Authentication is taking longer than expected.</p>
              <button 
                onClick={() => setLocation("/auth")}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Go to Login
              </button>
            </div>
          );
        }

        // Authentication check complete, but not authenticated
        if (authChecked && !user) {
          return <Redirect to="/auth" />;
        }

        // Authenticated, but not admin (when adminOnly is true)
        if (adminOnly && user && !user.isAdmin) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <p className="text-red-600 mb-4">You need admin privileges to access this page.</p>
              <button 
                onClick={() => setLocation("/")}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Return to Home
              </button>
            </div>
          );
        }

        // Authenticated and has appropriate permissions
        return <Component />;
      }}
    </Route>
  );
}
