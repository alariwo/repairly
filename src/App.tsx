
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/customers" element={<Layout><Customers /></Layout>} />
          <Route path="/jobs" element={<Layout><Jobs /></Layout>} />
          <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
          <Route path="/invoices" element={<Layout><Invoices /></Layout>} />
          <Route path="/messages" element={<Layout><Messages /></Layout>} />
          <Route path="/technician" element={<Layout><TechnicianDashboard /></Layout>} />
          <Route path="/technician-analytics" element={<Layout><TechnicianAnalytics /></Layout>} />
          <Route path="/settings" element={<Layout><div className="p-6">Settings Coming Soon</div></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
