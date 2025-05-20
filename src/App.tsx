import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import ProtectedRoute from "./components/auth/ProtectedRoute";


const queryClient = new QueryClient();

const App = () => {
  // Retrieve the user's role from localStorage or authentication state
  const userRole = localStorage.getItem("userRole") as
    | "technician"
    | "admin"
    | "super-admin"
    | undefined;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root path ("/") to "/auth" */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />

            {/* Technician Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["technician"]} />
              }
            >
              <Route
                path="/technician"
                element={
                  <Layout userRole="technician">
                    <TechnicianDashboard />
                  </Layout>
                }
              />
              <Route
                path="/technician-analytics"
                element={
                  <Layout userRole="technician">
                    <TechnicianAnalytics />
                  </Layout>
                }
              />
            </Route>

            {/* Admin Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["admin", "super-admin"]} />
              }
            >
              <Route
                path="/dashboard"
                element={
                  <Layout userRole={userRole || "admin"}>
                    <Dashboard />
                  </Layout>
                }
              />
              <Route
                path="/customers"
                element={
                  <Layout userRole={userRole || "admin"}>
                    <Customers />
                  </Layout>
                }
              />
              <Route
                path="/jobs"
                element={
                  <Layout userRole={userRole || "admin"}>
                    <Jobs />
                  </Layout>
                }
              />
              <Route
                path="/inventory"
                element={
                  <Layout userRole={userRole || "admin"}>
                    <Inventory />
                  </Layout>
                }
              />
              <Route
                path="/invoices"
                element={
                  <Layout userRole={userRole || "admin"}>
                    <Invoices />
                  </Layout>
                }
              />
              <Route
                path="/messages"
                element={
                  <Layout userRole={userRole || "admin"}>
                    <Messages />
                  </Layout>
                }
              />
              <Route
                path="/user-management"
                element={
                  <Layout userRole={userRole || "admin"}>
                    <UserManagement />
                  </Layout>
                }
              />
            </Route>

            {/* Super-Admin Only Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["super-admin"]} />
              }
            >
              <Route
                path="/accounting"
                element={
                  <Layout userRole="super-admin">
                    <Accounting />
                  </Layout>
                }
              />
            </Route>

            {/* Settings Page (Accessible to all authenticated users) */}
            <Route
              path="/settings"
              element={
                <Layout userRole={userRole || "admin"}>
                  <div className="p-6">Settings Coming Soon</div>
                </Layout>
              }
            />

            {/* Catch-all Route for 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;