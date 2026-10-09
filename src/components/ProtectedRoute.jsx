import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import SuspendedScreen from '@/components/SuspendedScreen';

const ROLE_HOME = {
  viewer: '/',
  advertiser: '/advertiser',
  licensor: '/licensor',
  admin: '/admin',
};

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement, allowedRoles }) {
  const { user, isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth } = useAuth();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    return unauthenticatedElement;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement;
  }

  if (user?.suspended) {
    return <SuspendedScreen />;
  }

  if (allowedRoles) {
    const role = user?.role || 'viewer';
    if (!allowedRoles.includes(role)) {
      return <Navigate to={ROLE_HOME[role] || '/'} replace />;
    }
  }

  return <Outlet />;
}