import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import { SectionVisibilityProvider } from '@/lib/SectionVisibilityContext';
import { Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import Series from '@/pages/Series';
import Feed from '@/pages/Feed';
import Watch from '@/pages/Watch';
import Campaigns from '@/pages/Campaigns';
import CampaignDetail from '@/pages/CampaignDetail';
import Checkout from '@/pages/Checkout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ContentManager from '@/pages/admin/ContentManager';
import AdApproval from '@/pages/admin/AdApproval';
import UserFinance from '@/pages/admin/UserFinance';
import AdvertiserDashboard from '@/pages/advertiser/AdvertiserDashboard';
import AdManager from '@/pages/advertiser/AdManager';
import LicensorDashboard from '@/pages/licensor/LicensorDashboard';
import LicensorRevenue from '@/pages/licensor/LicensorRevenue';
import Account from '@/pages/Account';
import UsersAdmin from '@/pages/admin/Users';
import Coupons from '@/pages/admin/Coupons';
import AdminSectionVisibility from '@/pages/admin/SectionVisibility';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<SectionVisibilityProvider user={user}><AppShell /></SectionVisibilityProvider>}>
        {/* Open sections — who may see each one is set in the admin Section Access screen */}
        <Route path="/" element={<Home />} />
        <Route path="/series" element={<Series />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />

        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
        </Route>

        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} allowedRoles={["advertiser", "admin"]} />}>
          <Route path="/advertiser" element={<AdvertiserDashboard />} />
          <Route path="/advertiser/ads" element={<AdManager />} />
        </Route>
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} allowedRoles={["licensor", "admin"]} />}>
          <Route path="/licensor" element={<LicensorDashboard />} />
          <Route path="/licensor/revenue" element={<LicensorRevenue />} />
        </Route>
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/content" element={<ContentManager />} />
          <Route path="/admin/ads" element={<AdApproval />} />
          <Route path="/admin/finance" element={<UserFinance />} />
          <Route path="/admin/users" element={<UsersAdmin />} />
          <Route path="/admin/coupons" element={<Coupons />} />
          <Route path="/admin/section-visibility" element={<AdminSectionVisibility />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App