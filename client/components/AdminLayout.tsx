import { Link, useNavigate, useLocation } from "react-router-dom";
import { Globe, Users, LogOut, Menu, X, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
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
