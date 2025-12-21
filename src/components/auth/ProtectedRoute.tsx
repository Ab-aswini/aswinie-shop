import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'vendor' | 'user';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = "/auth" 
}: ProtectedRouteProps) {
  const { user, loading, role, isAdmin, isVendor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Not authenticated
    if (!user) {
      navigate(redirectTo, { replace: true });
      return;
    }

    // Check role requirements
    if (requiredRole) {
      let hasAccess = false;
      
      switch (requiredRole) {
        case 'admin':
          hasAccess = isAdmin;
          break;
        case 'vendor':
          hasAccess = isVendor;
          break;
        case 'user':
          hasAccess = !!role; // Any authenticated user with a role
          break;
      }

      if (!hasAccess) {
        // Redirect to appropriate page based on their actual role
        if (isAdmin) {
          navigate('/admin', { replace: true });
        } else if (isVendor) {
          navigate('/vendor/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    }
  }, [user, loading, role, requiredRole, navigate, redirectTo, isAdmin, isVendor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Role check
  if (requiredRole) {
    let hasAccess = false;
    
    switch (requiredRole) {
      case 'admin':
        hasAccess = isAdmin;
        break;
      case 'vendor':
        hasAccess = isVendor;
        break;
      case 'user':
        hasAccess = !!role;
        break;
    }

    if (!hasAccess) {
      return null;
    }
  }

  return <>{children}</>;
}
