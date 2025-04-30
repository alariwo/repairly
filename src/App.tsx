import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Jobs from "./pages/Jobs";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Messages from "./pages/Messages";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import TechnicianAnalytics from "./pages/TechnicianAnalytics";
import NotFound from "./pages/NotFound";
import Accounting from "./pages/Accounting";
import UserManagement from "./pages/UserManagement";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root path ("/") to "/auth" */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/customers" element={<Layout><Customers /></Layout>} />
          <Route path="/jobs" element={<Layout><Jobs /></Layout>} />
          <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
          <Route path="/invoices" element={<Layout><Invoices /></Layout>} />
          <Route path="/messages" element={<Layout><Messages /></Layout>} />
          <Route path="/technician" element={<Layout><TechnicianDashboard /></Layout>} />
          <Route path="/technician-analytics" element={<Layout><TechnicianAnalytics /></Layout>} />
          <Route path="/settings" element={<Layout><div className="p-6">Settings Coming Soon</div></Layout>} />
          <Route path="/accounting" element={<Layout><Accounting /></Layout>} />
          <Route path="/user-management" element={<Layout><UserManagement /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;