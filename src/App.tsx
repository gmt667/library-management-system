import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import PortalSelectPage from "@/pages/PortalSelectPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import LibrarianLoginPage from "@/pages/LibrarianLoginPage";
import DashboardPage from "@/pages/DashboardPage";
import BooksPage from "@/pages/BooksPage";
import MembersPage from "@/pages/MembersPage";
import TransactionsPage from "@/pages/TransactionsPage";
import AuditLogsPage from "@/pages/AuditLogsPage";
import SettingsPage from "@/pages/SettingsPage";
import FinesPage from "@/pages/FinesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <PortalSelectPage />} />
      <Route path="/admin/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AdminLoginPage />} />
      <Route path="/librarian/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LibrarianLoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/fines" element={<FinesPage />} />
        <Route path="/audit-logs" element={<AdminRoute><AuditLogsPage /></AdminRoute>} />
        <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
