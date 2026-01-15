import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import OnboardingClient from "./pages/OnboardingClient";
import OnboardingPro from "./pages/OnboardingPro";
import NotFound from "./pages/NotFound";

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
import AdminLogin from "./pages/admin/AdminLogin";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Splash & Auth */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding/client" element={<OnboardingClient />} />
          <Route path="/onboarding/pro" element={<OnboardingPro />} />

          {/* Client Routes */}
          <Route path="/client/home" element={<ClientHome />} />
          <Route path="/client/service" element={<ClientService />} />
          <Route path="/client/schedule" element={<ClientSchedule />} />
          <Route path="/client/matching" element={<ClientMatching />} />
          <Route path="/client/offer" element={<ClientOffer />} />
          <Route path="/client/checkout" element={<ClientCheckout />} />
          <Route path="/client/order-tracking" element={<ClientOrderTracking />} />
          <Route path="/client/rating" element={<ClientRating />} />
          <Route path="/client/orders" element={<ClientOrders />} />
          <Route path="/client/orders/:id" element={<ClientOrderDetail />} />
          <Route path="/client/profile" element={<ClientProfile />} />
          <Route path="/client/support" element={<ClientSupport />} />
          <Route path="/client/cancel/:id" element={<ClientCancel />} />
          <Route path="/client/location" element={<ClientLocation />} />
          <Route path="/client/subscription" element={<ClientSubscription />} />
          <Route path="/client/referral" element={<ClientReferral />} />

          {/* Pro Routes */}
          <Route path="/pro/home" element={<ProHome />} />
          <Route path="/pro/order/:id" element={<ProOrderDetail />} />
          <Route path="/pro/agenda" element={<ProAgenda />} />
          <Route path="/pro/earnings" element={<ProEarnings />} />
          <Route path="/pro/ranking" element={<ProRanking />} />
          <Route path="/pro/profile" element={<ProProfile />} />
          <Route path="/pro/verification" element={<ProVerification />} />
          <Route path="/pro/plan" element={<ProPlan />} />
          <Route path="/pro/withdraw" element={<ProWithdraw />} />
          <Route path="/pro/support" element={<ProSupport />} />
          <Route path="/pro/quality" element={<ProQuality />} />
          <Route path="/pro/availability" element={<ProAvailability />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/pros" element={<AdminPros />} />
          <Route path="/admin/pros/:id" element={<AdminProDetail />} />
          <Route path="/admin/clients" element={<AdminClients />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="/admin/support/:id" element={<AdminSupportDetail />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
