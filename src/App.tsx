import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UpdatePrompt } from "@/components/ui/UpdatePrompt";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import InstallScreen from "@/pages/InstallScreen";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import OnboardingClient from "./pages/OnboardingClient";
import OnboardingPro from "./pages/OnboardingPro";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import ConfirmEmail from "./pages/ConfirmEmail";

// Client Pages
import ClientHome from "./pages/client/ClientHome";
import ClientService from "./pages/client/ClientService";
import ClientSchedule from "./pages/client/ClientSchedule";
import ClientMatching from "./pages/client/ClientMatching";
import ClientOffer from "./pages/client/ClientOffer";
import ClientCheckout from "./pages/client/ClientCheckout";
import ClientOrderTracking from "./pages/client/ClientOrderTracking";
import ClientRating from "./pages/client/ClientRating";
import ClientOrders from "./pages/client/ClientOrders";
import ClientOrderDetail from "./pages/client/ClientOrderDetail";
import ClientProfile from "./pages/client/ClientProfile";
import ClientSupport from "./pages/client/ClientSupport";
import ClientCancel from "./pages/client/ClientCancel";
import ClientLocation from "./pages/client/ClientLocation";
import ClientSubscription from "./pages/client/ClientSubscription";
import ClientReferral from "./pages/client/ClientReferral";

// Pro Pages
import ProHome from "./pages/pro/ProHome";
import ProOrderDetail from "./pages/pro/ProOrderDetail";
import ProAgenda from "./pages/pro/ProAgenda";
import ProEarnings from "./pages/pro/ProEarnings";
import ProRanking from "./pages/pro/ProRanking";
import ProProfile from "./pages/pro/ProProfile";
import ProVerification from "./pages/pro/ProVerification";
import ProPlan from "./pages/pro/ProPlan";
import ProWithdraw from "./pages/pro/ProWithdraw";
import ProSupport from "./pages/pro/ProSupport";
import ProQuality from "./pages/pro/ProQuality";
import ProAvailability from "./pages/pro/ProAvailability";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminPros from "./pages/admin/AdminPros";
import AdminProDetail from "./pages/admin/AdminProDetail";
import AdminClients from "./pages/admin/AdminClients";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminSupportDetail from "./pages/admin/AdminSupportDetail";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminZones from "./pages/admin/AdminZones";
import AdminRisk from "./pages/admin/AdminRisk";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminFunnel from "./pages/admin/AdminFunnel";
import AdminCohorts from "./pages/admin/AdminCohorts";
import AdminMatchingDebug from "./pages/admin/AdminMatchingDebug";
import AdminQuotes from "./pages/admin/AdminQuotes";
import AdminDocuments from "./pages/admin/AdminDocuments";

// Company Pages
import CompanyOnboarding from "./pages/company/CompanyOnboarding";
import CompanyRequestQuote from "./pages/company/CompanyRequestQuote";

// Dev Pages
import ComponentShowcase from "./pages/dev/ComponentShowcase";
import ProjectDocumentation from "./pages/dev/ProjectDocumentation";
import Install from "./pages/Install";
import AppSettings from "./pages/AppSettings";
import Offline from "./pages/Offline";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

const App = () => {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsInstalled(standalone);
  }, []);

  // Still detecting
  if (isInstalled === null) return null;

  // NOT installed → show install screen only
  if (!isInstalled) {
    return (
      <ThemeProvider>
        <InstallScreen />
      </ThemeProvider>
    );
  }

  // INSTALLED → normal app, no install prompts
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineBanner />
            <UpdatePrompt />
            <BrowserRouter>
              <Routes>
                {/* Splash & Auth */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/onboarding/client" element={<OnboardingClient />} />
                <Route path="/onboarding/pro" element={<OnboardingPro />} />
                <Route path="/confirm-email" element={<ConfirmEmail />} />

                {/* Client Routes */}
                <Route path="/client/home" element={<ProtectedRoute requiredRole="client"><ClientHome /></ProtectedRoute>} />
                <Route path="/client/service" element={<ProtectedRoute requiredRole="client"><ClientService /></ProtectedRoute>} />
                <Route path="/client/schedule" element={<ProtectedRoute requiredRole="client"><ClientSchedule /></ProtectedRoute>} />
                <Route path="/client/matching" element={<ProtectedRoute requiredRole="client"><ClientMatching /></ProtectedRoute>} />
                <Route path="/client/offer" element={<ProtectedRoute requiredRole="client"><ClientOffer /></ProtectedRoute>} />
                <Route path="/client/checkout" element={<ProtectedRoute requiredRole="client"><ClientCheckout /></ProtectedRoute>} />
                <Route path="/client/order-tracking" element={<ProtectedRoute requiredRole="client"><ClientOrderTracking /></ProtectedRoute>} />
                <Route path="/client/rating" element={<ProtectedRoute requiredRole="client"><ClientRating /></ProtectedRoute>} />
                <Route path="/client/orders" element={<ProtectedRoute requiredRole="client"><ClientOrders /></ProtectedRoute>} />
                <Route path="/client/orders/:id" element={<ProtectedRoute requiredRole="client"><ClientOrderDetail /></ProtectedRoute>} />
                <Route path="/client/profile" element={<ProtectedRoute requiredRole="client"><ClientProfile /></ProtectedRoute>} />
                <Route path="/client/support" element={<ProtectedRoute requiredRole="client"><ClientSupport /></ProtectedRoute>} />
                <Route path="/client/cancel/:id" element={<ProtectedRoute requiredRole="client"><ClientCancel /></ProtectedRoute>} />
                <Route path="/client/location" element={<ProtectedRoute requiredRole="client"><ClientLocation /></ProtectedRoute>} />
                <Route path="/client/subscription" element={<ProtectedRoute requiredRole="client"><ClientSubscription /></ProtectedRoute>} />
                <Route path="/client/referral" element={<ProtectedRoute requiredRole="client"><ClientReferral /></ProtectedRoute>} />

                {/* Pro Routes */}
                <Route path="/pro/home" element={<ProtectedRoute requiredRole="pro"><ProHome /></ProtectedRoute>} />
                <Route path="/pro/order/:id" element={<ProtectedRoute requiredRole="pro"><ProOrderDetail /></ProtectedRoute>} />
                <Route path="/pro/agenda" element={<ProtectedRoute requiredRole="pro"><ProAgenda /></ProtectedRoute>} />
                <Route path="/pro/earnings" element={<ProtectedRoute requiredRole="pro"><ProEarnings /></ProtectedRoute>} />
                <Route path="/pro/ranking" element={<ProtectedRoute requiredRole="pro"><ProRanking /></ProtectedRoute>} />
                <Route path="/pro/profile" element={<ProtectedRoute requiredRole="pro"><ProProfile /></ProtectedRoute>} />
                <Route path="/pro/verification" element={<ProtectedRoute requiredRole="pro"><ProVerification /></ProtectedRoute>} />
                <Route path="/pro/plan" element={<ProtectedRoute requiredRole="pro"><ProPlan /></ProtectedRoute>} />
                <Route path="/pro/withdraw" element={<ProtectedRoute requiredRole="pro"><ProWithdraw /></ProtectedRoute>} />
                <Route path="/pro/support" element={<ProtectedRoute requiredRole="pro"><ProSupport /></ProtectedRoute>} />
                <Route path="/pro/quality" element={<ProtectedRoute requiredRole="pro"><ProQuality /></ProtectedRoute>} />
                <Route path="/pro/availability" element={<ProtectedRoute requiredRole="pro"><ProAvailability /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<Navigate to="/login" replace />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/orders/:id" element={<ProtectedRoute requiredRole="admin"><AdminOrderDetail /></ProtectedRoute>} />
                <Route path="/admin/pros" element={<ProtectedRoute requiredRole="admin"><AdminPros /></ProtectedRoute>} />
                <Route path="/admin/pros/:id" element={<ProtectedRoute requiredRole="admin"><AdminProDetail /></ProtectedRoute>} />
                <Route path="/admin/clients" element={<ProtectedRoute requiredRole="admin"><AdminClients /></ProtectedRoute>} />
                <Route path="/admin/coupons" element={<ProtectedRoute requiredRole="admin"><AdminCoupons /></ProtectedRoute>} />
                <Route path="/admin/support" element={<ProtectedRoute requiredRole="admin"><AdminSupport /></ProtectedRoute>} />
                <Route path="/admin/support/:id" element={<ProtectedRoute requiredRole="admin"><AdminSupportDetail /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
                <Route path="/admin/zones" element={<ProtectedRoute requiredRole="admin"><AdminZones /></ProtectedRoute>} />
                <Route path="/admin/risk" element={<ProtectedRoute requiredRole="admin"><AdminRisk /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
                <Route path="/admin/funnel" element={<ProtectedRoute requiredRole="admin"><AdminFunnel /></ProtectedRoute>} />
                <Route path="/admin/cohorts" element={<ProtectedRoute requiredRole="admin"><AdminCohorts /></ProtectedRoute>} />
                <Route path="/admin/matching-debug" element={<ProtectedRoute requiredRole="admin"><AdminMatchingDebug /></ProtectedRoute>} />
                <Route path="/admin/quotes" element={<ProtectedRoute requiredRole="admin"><AdminQuotes /></ProtectedRoute>} />
                <Route path="/admin/documents" element={<ProtectedRoute requiredRole="admin"><AdminDocuments /></ProtectedRoute>} />

                {/* Company Routes */}
                <Route path="/company/onboarding" element={<CompanyOnboarding />} />
                <Route path="/company/request-quote" element={<CompanyRequestQuote />} />

                {/* Dev Routes */}
                <Route path="/dev/components" element={<ComponentShowcase />} />
                <Route path="/dev/documentation" element={<ProjectDocumentation />} />

                {/* Install & Settings Routes */}
                <Route path="/install" element={<Install />} />
                <Route path="/settings" element={<AppSettings />} />
                <Route path="/offline" element={<Offline />} />
                <Route path="/access-denied" element={<AccessDenied />} />

                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
