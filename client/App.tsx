import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminEditUser from "./pages/AdminEditUser";
import AdminInvoices from "./pages/AdminInvoices";
import AdminInvoiceDetail from "./pages/AdminInvoiceDetail";
import AdminStaff from "./pages/AdminStaff";
import AdminStaffDetail from "./pages/AdminStaffDetail";
import AdminEditStaff from "./pages/AdminEditStaff";
import AdminStaffCommission from "./pages/AdminStaffCommission";
import StaffAttendanceDashboard from "./pages/StaffAttendanceDashboard";
import AdminAttendanceDashboard from "./pages/AdminAttendanceDashboard";
import AdminStaffSalary from "./pages/AdminStaffSalary";
import AdminPerformance from "./pages/AdminPerformance";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetail from "./pages/AdminOrderDetail";
import AdminCreateOrder from "./pages/AdminCreateOrder";
import AdminProducts from "./pages/AdminProducts";
import AdminProductDetail from "./pages/AdminProductDetail";
import AdminEditProduct from "./pages/AdminEditProduct";
import AdminOperations from "./pages/AdminOperations";
import AdminOperationDetail from "./pages/AdminOperationDetail";
import AdminWorkflowSettings from "./pages/AdminWorkflowSettings";
import AdminAttendanceReport from "./pages/AdminAttendanceReport";
import AdminSalesReport from "./pages/AdminSalesReport";
import AdminClientRequests from "./pages/AdminClientRequests";
import AdminClientRequestDetail from "./pages/AdminClientRequestDetail";
import StaffDashboard from "./pages/StaffDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component for admin pages
const AdminRoute = ({ element }: { element: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("adminToken");
  return isAuthenticated ? element : <Navigate to="/admin/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={<AdminRoute element={<AdminDashboard />} />}
          />
          <Route
            path="/admin/users/:userId"
            element={<AdminRoute element={<AdminUserDetail />} />}
          />
          <Route
            path="/admin/users/:userId/edit"
            element={<AdminRoute element={<AdminEditUser />} />}
          />
          <Route
            path="/admin/invoices"
            element={<AdminRoute element={<AdminInvoices />} />}
          />
          <Route
            path="/admin/invoices/:invoiceId"
            element={<AdminRoute element={<AdminInvoiceDetail />} />}
          />
          <Route
            path="/admin/orders"
            element={<AdminRoute element={<AdminOrders />} />}
          />
          <Route
            path="/admin/orders/new"
            element={<AdminRoute element={<AdminCreateOrder />} />}
          />
          <Route
            path="/admin/orders/:orderId"
            element={<AdminRoute element={<AdminOrderDetail />} />}
          />
          <Route
            path="/admin/products"
            element={<AdminRoute element={<AdminProducts />} />}
          />
          <Route
            path="/admin/products/new"
            element={<AdminRoute element={<AdminEditProduct />} />}
          />
          <Route
            path="/admin/products/:productId"
            element={<AdminRoute element={<AdminProductDetail />} />}
          />
          <Route
            path="/admin/products/:productId/edit"
            element={<AdminRoute element={<AdminEditProduct />} />}
          />
          <Route
            path="/admin/operations"
            element={<AdminRoute element={<AdminOperations />} />}
          />
          <Route
            path="/admin/operations/new"
            element={<AdminRoute element={<AdminCreateOrder />} />}
          />
          <Route
            path="/admin/operations/:orderId"
            element={<AdminRoute element={<AdminOperationDetail />} />}
          />
          <Route
            path="/admin/operations/settings/workflow"
            element={<AdminRoute element={<AdminWorkflowSettings />} />}
          />
          <Route
            path="/admin/client-requests"
            element={<AdminRoute element={<AdminClientRequests />} />}
          />
          <Route
            path="/admin/client-requests/:requestId"
            element={<AdminRoute element={<AdminClientRequestDetail />} />}
          />
          <Route
            path="/admin/performance"
            element={<AdminRoute element={<AdminPerformance />} />}
          />
          <Route
            path="/admin/staff"
            element={<AdminRoute element={<AdminStaff />} />}
          />
          <Route
            path="/admin/staff/new"
            element={<AdminRoute element={<AdminEditStaff />} />}
          />
          <Route
            path="/admin/staff/:staffId/commission"
            element={<AdminRoute element={<AdminStaffCommission />} />}
          />
          <Route
            path="/admin/staff/:staffId/salary"
            element={<AdminRoute element={<AdminStaffSalary />} />}
          />
          <Route
            path="/admin/staff/:staffId/edit"
            element={<AdminRoute element={<AdminEditStaff />} />}
          />
          <Route
            path="/admin/staff/:staffId"
            element={<AdminRoute element={<AdminStaffDetail />} />}
          />
          <Route
            path="/admin/attendance"
            element={<AdminRoute element={<AdminAttendanceDashboard />} />}
          />
          <Route
            path="/admin/attendance/report"
            element={<AdminRoute element={<AdminAttendanceReport />} />}
          />
          <Route
            path="/staff/attendance"
            element={<AdminRoute element={<StaffAttendanceDashboard />} />}
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
