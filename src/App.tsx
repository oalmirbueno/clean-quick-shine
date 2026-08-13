import { lazy, Suspense } from "react";
import { useViewportHeight } from "@/hooks/useViewportHeight";
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
import { InstallBanner } from "@/components/ui/InstallBanner";
import { MobilePwaGate } from "@/components/MobilePwaGate";
import { PersistentBottomNav } from "@/components/ui/BottomNav";

// Code splitting por rota: cada perfil (cliente/diarista/admin) baixa só o
// próprio código; gráficos e mapas ficam em chunks separados sob demanda.
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const ConfirmEmail = lazy(() => import("./pages/ConfirmEmail"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Support = lazy(() => import("./pages/Support"));
const AccountDeletion = lazy(() => import("./pages/AccountDeletion"));
const ClientHome = lazy(() => import("./pages/client/ClientHome"));
const ClientService = lazy(() => import("./pages/client/ClientService"));
const ClientSchedule = lazy(() => import("./pages/client/ClientSchedule"));
const ClientMatching = lazy(() => import("./pages/client/ClientMatching"));
const ClientOffer = lazy(() => import("./pages/client/ClientOffer"));
const ClientCheckout = lazy(() => import("./pages/client/ClientCheckout"));
const ClientOrderTracking = lazy(() => import("./pages/client/ClientOrderTracking"));
const ClientRating = lazy(() => import("./pages/client/ClientRating"));
const ClientOrders = lazy(() => import("./pages/client/ClientOrders"));
const ClientOrderDetail = lazy(() => import("./pages/client/ClientOrderDetail"));
const ClientProfile = lazy(() => import("./pages/client/ClientProfile"));
const ClientSupport = lazy(() => import("./pages/client/ClientSupport"));
const ClientCancel = lazy(() => import("./pages/client/ClientCancel"));
const ClientLocation = lazy(() => import("./pages/client/ClientLocation"));
const ClientSubscription = lazy(() => import("./pages/client/ClientSubscription"));
const ClientReferral = lazy(() => import("./pages/client/ClientReferral"));
const ClientDemo = lazy(() => import("./pages/client/ClientDemo"));
const ProHome = lazy(() => import("./pages/pro/ProHome"));
const ProOrderDetail = lazy(() => import("./pages/pro/ProOrderDetail"));
const OrderChatPage = lazy(() => import("./pages/OrderChatPage"));
const ProAgenda = lazy(() => import("./pages/pro/ProAgenda"));
const ProEarnings = lazy(() => import("./pages/pro/ProEarnings"));
const ProRanking = lazy(() => import("./pages/pro/ProRanking"));
const ProProfile = lazy(() => import("./pages/pro/ProProfile"));
const ProVerification = lazy(() => import("./pages/pro/ProVerification"));
const ProPlan = lazy(() => import("./pages/pro/ProPlan"));
const ProWithdraw = lazy(() => import("./pages/pro/ProWithdraw"));
const ProSupport = lazy(() => import("./pages/pro/ProSupport"));
const ProQuality = lazy(() => import("./pages/pro/ProQuality"));
const ProAvailability = lazy(() => import("./pages/pro/ProAvailability"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminPros = lazy(() => import("./pages/admin/AdminPros"));
const AdminProDetail = lazy(() => import("./pages/admin/AdminProDetail"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const AdminClientDetail = lazy(() => import("./pages/admin/AdminClientDetail"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminSupportDetail = lazy(() => import("./pages/admin/AdminSupportDetail"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminZones = lazy(() => import("./pages/admin/AdminZones"));
const AdminRisk = lazy(() => import("./pages/admin/AdminRisk"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminFunnel = lazy(() => import("./pages/admin/AdminFunnel"));
const AdminCohorts = lazy(() => import("./pages/admin/AdminCohorts"));
const AdminMatchingDebug = lazy(() => import("./pages/admin/AdminMatchingDebug"));
const AdminQuotes = lazy(() => import("./pages/admin/AdminQuotes"));
const AdminDocuments = lazy(() => import("./pages/admin/AdminDocuments"));
const AdminVerifications = lazy(() => import("./pages/admin/AdminVerifications"));
const AdminWithdrawals = lazy(() => import("./pages/admin/AdminWithdrawals"));
const AdminWithdrawalDetail = lazy(() => import("./pages/admin/AdminWithdrawalDetail"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminNotificationLogs = lazy(() => import("./pages/admin/AdminNotificationLogs"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminMap = lazy(() => import("./pages/admin/AdminMap"));
const CompanyOnboarding = lazy(() => import("./pages/company/CompanyOnboarding"));
const CompanyRequestQuote = lazy(() => import("./pages/company/CompanyRequestQuote"));
const ComponentShowcase = lazy(() => import("./pages/dev/ComponentShowcase"));
const ProjectDocumentation = lazy(() => import("./pages/dev/ProjectDocumentation"));
const Install = lazy(() => import("./pages/Install"));
const AppSettings = lazy(() => import("./pages/AppSettings"));
const Offline = lazy(() => import("./pages/Offline"));
const HelpDocs = lazy(() => import("./pages/HelpDocs"));

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";

// Client Pages

// Pro Pages

// Admin Pages

// Company Pages

// Dev Pages

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 15,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

const RouteFallback = () => (
  <div className="h-full flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label="Carregando" />
  </div>
);

const App = () => {
  useViewportHeight();

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
              <InstallBanner />
              <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Splash & Auth */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<MobilePwaGate><Login /></MobilePwaGate>} />
                <Route path="/register" element={<MobilePwaGate><Register /></MobilePwaGate>} />
                <Route path="/forgot-password" element={<MobilePwaGate><ForgotPassword /></MobilePwaGate>} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/onboarding" element={<MobilePwaGate><Onboarding /></MobilePwaGate>} />
                <Route path="/onboarding/client" element={<Navigate to="/register" replace />} />
                <Route path="/onboarding/pro" element={<Navigate to="/register" replace />} />
                <Route path="/confirm-email" element={<ConfirmEmail />} />
                <Route path="/terms" element={<TermsOfUse />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/support" element={<Support />} />
                <Route path="/account-deletion" element={<AccountDeletion />} />

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
                {import.meta.env.DEV && (
                  <Route path="/client/demo" element={<ClientDemo />} />
                )}

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

                {/* Shared: order chat (client & pro) */}
                <Route path="/chat/order/:id" element={<ProtectedRoute><OrderChatPage /></ProtectedRoute>} />



                {/* Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/login" element={<Navigate to="/login" replace />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/orders/:id" element={<ProtectedRoute requiredRole="admin"><AdminOrderDetail /></ProtectedRoute>} />
                <Route path="/admin/pros" element={<ProtectedRoute requiredRole="admin"><AdminPros /></ProtectedRoute>} />
                <Route path="/admin/pros/:id" element={<ProtectedRoute requiredRole="admin"><AdminProDetail /></ProtectedRoute>} />
                <Route path="/admin/clients" element={<ProtectedRoute requiredRole="admin"><AdminClients /></ProtectedRoute>} />
                <Route path="/admin/clients/:id" element={<ProtectedRoute requiredRole="admin"><AdminClientDetail /></ProtectedRoute>} />
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
                <Route path="/admin/verifications" element={<ProtectedRoute requiredRole="admin"><AdminVerifications /></ProtectedRoute>} />
                <Route path="/admin/withdrawals" element={<ProtectedRoute requiredRole="admin"><AdminWithdrawals /></ProtectedRoute>} />
                <Route path="/admin/withdrawals/:id" element={<ProtectedRoute requiredRole="admin"><AdminWithdrawalDetail /></ProtectedRoute>} />
                <Route path="/admin/services" element={<ProtectedRoute requiredRole="admin"><AdminServices /></ProtectedRoute>} />
                <Route path="/admin/notifications" element={<ProtectedRoute requiredRole="admin"><AdminNotifications /></ProtectedRoute>} />
                <Route path="/admin/notification-logs" element={<ProtectedRoute requiredRole="admin"><AdminNotificationLogs /></ProtectedRoute>} />
                <Route path="/admin/audit" element={<ProtectedRoute requiredRole="admin"><AdminAuditLog /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/map" element={<ProtectedRoute requiredRole="admin"><AdminMap /></ProtectedRoute>} />

                {/* Company Routes */}
                <Route path="/company/onboarding" element={<CompanyOnboarding />} />
                <Route path="/company/request-quote" element={<CompanyRequestQuote />} />

                {/* Dev Routes — apenas em desenvolvimento (removidas do build de produção) */}
                {import.meta.env.DEV && (
                  <>
                    <Route path="/dev/components" element={<ComponentShowcase />} />
                    <Route path="/dev/documentation" element={<ProjectDocumentation />} />
                  </>
                )}

                {/* Install & Settings Routes */}
                <Route path="/install" element={<Install />} />
                <Route path="/settings" element={<AppSettings />} />
                <Route path="/help" element={<HelpDocs />} />
                <Route path="/offline" element={<Offline />} />
                <Route path="/access-denied" element={<AccessDenied />} />

                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              <PersistentBottomNav />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
