import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu, X, LayoutDashboard, Package, FileText, Settings, MessageSquare, Building2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userName = currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : "Client";

  const menuItems = [
    { label: "Dashboard", path: "/client/dashboard", icon: LayoutDashboard },
    { label: "My Orders", path: "/client/orders", icon: Package },
    { label: "Invoices", path: "/client/invoices", icon: FileText },
    { label: "Documents", path: "/client/documents", icon: FileText },
    { label: "Messages", path: "/client/messages", icon: MessageSquare },
    { label: "Profile", path: "/client/profile", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-white border-r border-slate-200 flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-primary-600">ClientHub</h1>
          <p className="text-xs text-slate-500 mt-1">Service Portal</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? "bg-primary-50 text-primary-600 border border-primary-200"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-slate-200 p-4 space-y-4">
          <div className="px-2">
            <p className="text-sm font-medium text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-600 hover:text-slate-900"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
