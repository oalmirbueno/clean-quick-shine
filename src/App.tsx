import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
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

// Pro Pages
import ProHome from "./pages/pro/ProHome";
import ProOrderDetail from "./pages/pro/ProOrderDetail";
import ProAgenda from "./pages/pro/ProAgenda";
import ProEarnings from "./pages/pro/ProEarnings";
import ProRanking from "./pages/pro/ProRanking";
import ProProfile from "./pages/pro/ProProfile";

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

          {/* Pro Routes */}
          <Route path="/pro/home" element={<ProHome />} />
          <Route path="/pro/order/:id" element={<ProOrderDetail />} />
          <Route path="/pro/agenda" element={<ProAgenda />} />
          <Route path="/pro/earnings" element={<ProEarnings />} />
          <Route path="/pro/ranking" element={<ProRanking />} />
          <Route path="/pro/profile" element={<ProProfile />} />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
