import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Globe,
  Users,
  LogOut,
  Menu,
  X,
  Users2,
  FileText,
  TrendingUp,
  ShoppingCart,
  Package,
  Zap,
  Clock,
  Activity,
  BarChart3,
  Wallet,
  Building2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode, useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { mockUsers, mockStaff } from "@/lib/mockData";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(
    location.pathname.startsWith("/admin/companies") ? "companies" : null,
  );
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<"users" | "staff">("users");
  const [searchQuery, setSearchQuery] = useState("");

  // Load users from both mockUsers and localStorage
  const allUsers = useMemo(() => {
    const userMap = new Map();
    mockUsers.forEach(user => userMap.set(user.id, user));

    // Merge with localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('user_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          // Only add if userData has a valid id
          if (userData.id && userData.id !== 'undefined') {
            userMap.set(userData.id, userData);
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
    }
    return Array.from(userMap.values()).filter(u => u.id && u.id !== 'undefined');
  }, []);

  // Load staff from both mockStaff and localStorage
  const allStaff = useMemo(() => {
    const staffMap = new Map();
    mockStaff.forEach(staff => staffMap.set(staff.id, staff));

    // Merge with localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('staff_')) {
        try {
          const staffData = JSON.parse(localStorage.getItem(key) || '{}');
          staffMap.set(staffData.id, staffData);
        } catch (e) {
          console.error('Error parsing staff from localStorage:', e);
        }
      }
    }
    return Array.from(staffMap.values());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg">Domaino</span>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded transition"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          <Link
            to="/admin/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/dashboard")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Users className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Users</span>}
          </Link>
          <Link
            to="/admin/invoices"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/invoices") || isActive("/admin/invoices")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <FileText className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Invoices</span>}
          </Link>
          <Link
            to="/admin/orders"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/orders") ||
              location.pathname.startsWith("/admin/orders/")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Orders</span>}
          </Link>
          <Link
            to="/admin/operations"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/operations") ||
              location.pathname.startsWith("/admin/operations/")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Zap className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Operations</span>}
          </Link>
          <Link
            to="/admin/operations/settings/workflow"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/operations/settings/workflow")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Clock className="w-5 h-5" />
            {sidebarOpen && (
              <span className="font-medium text-sm">Workflow Settings</span>
            )}
          </Link>
          <Link
            to="/admin/attendance"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/attendance")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Activity className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Attendance</span>}
          </Link>
          <div className="space-y-1">
            <button
              onClick={() =>
                setExpandedMenu(
                  expandedMenu === "companies" ? null : "companies",
                )
              }
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive("/admin/companies") ||
                isActive("/admin/companies/for-sale") ||
                isActive("/admin/companies/need-renewal") ||
                location.pathname.startsWith("/admin/companies/")
                  ? "bg-primary-600 text-white"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              <Building2 className="w-5 h-5" />
              {sidebarOpen && (
                <>
                  <span className="font-medium flex-1 text-left">
                    Companies
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedMenu === "companies" ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>

            {sidebarOpen && expandedMenu === "companies" && (
              <div className="space-y-1 ml-4">
                <Link
                  to="/admin/companies"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                    isActive("/admin/companies")
                      ? "bg-primary-600 text-white"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  Registered Companies
                </Link>
                <Link
                  to="/admin/companies/need-renewal"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                    isActive("/admin/companies/need-renewal")
                      ? "bg-red-600 text-white"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Need Renewal
                </Link>
                <Link
                  to="/admin/companies/for-sale"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                    isActive("/admin/companies/for-sale")
                      ? "bg-primary-600 text-white"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  Companies for Sale
                </Link>
              </div>
            )}
          </div>
          <Link
            to="/admin/sales/report"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/sales/report")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Sales Report</span>}
          </Link>
          <Link
            to="/admin/commission-payroll"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/commission-payroll")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Wallet className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Commission</span>}
          </Link>
          <Link
            to="/admin/products"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/products") ||
              location.pathname.startsWith("/admin/products/")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Package className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Items/Products</span>}
          </Link>
          <Link
            to="/admin/accounting"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/accounting") ||
              location.pathname.startsWith("/admin/accounting/") ||
              isActive("/admin/expenses")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Wallet className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Accounting</span>}
          </Link>
          <Link
            to="/admin/uk-company-setup"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/uk-company-setup") ||
              location.pathname.startsWith("/admin/uk-company-setup/")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-5 h-5" />
            {sidebarOpen && (
              <span className="font-medium">UK Company Setup</span>
            )}
          </Link>
          <Link
            to="/admin/staff"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/staff")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Users2 className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Staff</span>}
          </Link>
          <Link
            to="/admin/performance"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive("/admin/performance")
                ? "bg-primary-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Performance</span>}
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-800">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start gap-3"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between relative">
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* View Dashboard Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDashboardDropdown(!showDashboardDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg text-primary-700 font-medium transition"
              >
                <Eye className="w-4 h-4" />
                View Dashboard
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {showDashboardDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  {/* Tabs */}
                  <div className="flex border-b border-slate-200">
                    <button
                      onClick={() => {
                        setDashboardTab("users");
                        setSearchQuery("");
                      }}
                      className={`flex-1 px-4 py-3 font-medium text-sm transition ${
                        dashboardTab === "users"
                          ? "text-primary-600 border-b-2 border-primary-600"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      👥 Users ({allUsers.length})
                    </button>
                    <button
                      onClick={() => {
                        setDashboardTab("staff");
                        setSearchQuery("");
                      }}
                      className={`flex-1 px-4 py-3 font-medium text-sm transition ${
                        dashboardTab === "staff"
                          ? "text-primary-600 border-b-2 border-primary-600"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      👨‍💼 Staff ({allStaff.length})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="px-4 py-3 border-b border-slate-200">
                    <input
                      type="text"
                      placeholder={
                        dashboardTab === "users"
                          ? "Search users..."
                          : "Search staff..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>

                  {/* List */}
                  <div className="max-h-96 overflow-y-auto">
                    {dashboardTab === "users"
                      ? allUsers
                          .filter(
                            (user) =>
                              `${user.firstName} ${user.lastName}`
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                              user.email
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()),
                          )
                          .map((user) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                navigate(`/admin/view-user/${user.id}`);
                                setShowDashboardDropdown(false);
                                setSearchQuery("");
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 transition"
                            >
                              <p className="font-medium text-slate-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-slate-600">
                                {user.email}
                              </p>
                            </button>
                          ))
                      : allStaff
                          .filter(
                            (staff) =>
                              `${staff.firstName} ${staff.lastName}`
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                              (staff.department || "")
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()),
                          )
                          .map((staff) => (
                            <button
                              key={staff.id}
                              onClick={() => {
                                navigate(`/admin/view-staff/${staff.id}`);
                                setShowDashboardDropdown(false);
                                setSearchQuery("");
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 transition"
                            >
                              <p className="font-medium text-slate-900">
                                {staff.firstName} {staff.lastName}
                              </p>
                              <p className="text-xs text-slate-600">
                                {staff.department || "Staff"}
                              </p>
                            </button>
                          ))}

                    {/* Empty State */}
                    {((dashboardTab === "users" &&
                      mockUsers.filter(
                        (user) =>
                          `${user.firstName} ${user.lastName}`
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          user.email
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      ).length === 0) ||
                      (dashboardTab === "staff" &&
                        mockStaff.filter(
                          (staff) =>
                            `${staff.firstName} ${staff.lastName}`
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            (staff.department || "")
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                        ).length === 0)) && (
                      <div className="px-4 py-6 text-center text-slate-500 text-sm">
                        No {dashboardTab === "users" ? "users" : "staff"} found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right text-sm">
              <p className="text-slate-900 font-medium">Admin User</p>
              <p className="text-slate-600">admin@domaino.com</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
