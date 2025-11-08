import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Globe, Mail, MapPin, Phone } from "lucide-react";
import { useState, useMemo } from "react";
import {
  mockUsers,
  mockOrders,
  mockInvoices,
  mockLoginHistory,
  mockStaff,
  User,
  Order,
  Invoice,
  LoginHistory,
} from "@/lib/mockData";

type TabType = "orders" | "invoices" | "login";

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("orders");

  // Load user from both mockUsers and localStorage
  const allUsers = useMemo(() => {
    const userMap = new Map<string, User>();

    // First add all mock users
    mockUsers.forEach((user) => userMap.set(user.id, user));

    // Then merge with localStorage users (overwrites mock if exists)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("user_")) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || "{}");
          userMap.set(userData.id, userData);
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      }
    }

    return Array.from(userMap.values());
  }, []);

  // Load all staff from both mockStaff and localStorage
  const allStaff = useMemo(() => {
    const staffMap = new Map<string, any>();

    // First add all mock staff
    mockStaff.forEach((staff) => staffMap.set(staff.id, staff));

    // Then merge with localStorage staff (overwrites mock if exists)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("staff_")) {
        try {
          const staffData = JSON.parse(localStorage.getItem(key) || "{}");
          staffMap.set(staffData.id, staffData);
        } catch (e) {
          console.error("Error parsing staff from localStorage:", e);
        }
      }
    }

    return Array.from(staffMap.values());
  }, []);

  const user = allUsers.find((u) => u.id === userId);
  const userOrders = mockOrders.filter((o) => o.userId === userId);
  const userInvoices = mockInvoices.filter((i) => i.userId === userId);
  const userLogins = mockLoginHistory.filter((l) => l.userId === userId);

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">User not found</p>
          <Link to="/admin/dashboard">
            <Button>Back to Users</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
      inactive: "bg-slate-100 text-slate-800",
      completed: "bg-green-100 text-green-800",
      processing: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
      paid: "bg-green-100 text-green-800",
      sent: "bg-blue-100 text-blue-800",
      draft: "bg-slate-100 text-slate-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-slate-100 text-slate-800",
      success: "bg-green-100 text-green-800",
    };
    return statusColors[status] || "bg-slate-100 text-slate-800";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/admin/dashboard">
          <Button
            variant="ghost"
            className="gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Button>
        </Link>

        {/* User Header Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* User Info */}
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-2 mb-6">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    user.status,
                  )}`}
                >
                  {user.status}
                </span>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    user.subscriptionStatus,
                  )}`}
                >
                  {user.subscriptionStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Globe className="w-4 h-4" />
                  <span>{user.companyName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {user.city}, {user.country}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{user.whatsappNumber}</span>
                </div>
                <div className="text-slate-600">
                  <span className="font-medium">Plan:</span>{" "}
                  {user.subscriptionPlan}
                </div>
                <div className="text-slate-600">
                  <span className="font-medium">Website:</span>{" "}
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 truncate"
                  >
                    {user.website}
                  </a>
                </div>
                <div className="text-slate-600">
                  <span className="font-medium">Member Since:</span>{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="text-slate-600">
                  <span className="font-medium">Last Login:</span>{" "}
                  {new Date(user.lastLogin).toLocaleDateString()}
                </div>
                {user.assignedToStaffId &&
                  (() => {
                    const assignedStaff = allStaff.find(
                      (s) => s.id === user.assignedToStaffId,
                    );
                    return (
                      <div className="col-span-1 md:col-span-2">
                        <span className="font-medium text-slate-600">
                          Assigned to:
                        </span>{" "}
                        <span className="text-slate-900 font-semibold">
                          {assignedStaff
                            ? `${assignedStaff.firstName} ${assignedStaff.lastName}`
                            : "Unknown"}
                        </span>
                        {assignedStaff && (
                          <span className="text-slate-500 ml-2">
                            ({assignedStaff.role.replace(/_/g, " ")})
                          </span>
                        )}
                      </div>
                    );
                  })()}
              </div>
            </div>

            {/* Edit Button */}
            <Link to={`/admin/users/${user.id}/edit`}>
              <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white gap-2">
                <Edit2 className="w-4 h-4" />
                Edit User
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 flex">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 px-6 py-4 font-medium transition border-b-2 ${
                activeTab === "orders"
                  ? "border-primary-600 text-primary-600 bg-primary-50"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Orders ({userOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`flex-1 px-6 py-4 font-medium transition border-b-2 ${
                activeTab === "invoices"
                  ? "border-primary-600 text-primary-600 bg-primary-50"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Invoices ({userInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 px-6 py-4 font-medium transition border-b-2 ${
                activeTab === "login"
                  ? "border-primary-600 text-primary-600 bg-primary-50"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Login History ({userLogins.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                {userOrders.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">
                    No orders found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-slate-200 rounded-lg p-4 hover:border-primary-300 transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {order.orderNumber}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {order.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                                {order.serviceType}
                              </span>
                              {order.countries.map((country) => (
                                <span
                                  key={country}
                                  className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded"
                                >
                                  {country}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">
                              {order.currency} {order.amount.toLocaleString()}
                            </p>
                            <span
                              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.status,
                              )}`}
                            >
                              {order.status}
                            </span>
                            <p className="text-xs text-slate-600 mt-2">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <div>
                {userInvoices.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">
                    No invoices found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {userInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="border border-slate-200 rounded-lg p-4 hover:border-primary-300 transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {invoice.invoiceNumber}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {invoice.description}
                            </p>
                            <div className="mt-2 space-y-1 text-sm text-slate-600">
                              <p>
                                <span className="font-medium">Items:</span>{" "}
                                {invoice.items.length}
                              </p>
                              <p>
                                <span className="font-medium">Issued:</span>{" "}
                                {new Date(
                                  invoice.issueDate,
                                ).toLocaleDateString()}
                              </p>
                              <p>
                                <span className="font-medium">Due:</span>{" "}
                                {new Date(invoice.dueDate).toLocaleDateString()}
                              </p>
                              {invoice.paidDate && (
                                <p>
                                  <span className="font-medium">Paid:</span>{" "}
                                  {new Date(
                                    invoice.paidDate,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">
                              {invoice.currency}{" "}
                              {invoice.amount.toLocaleString()}
                            </p>
                            <span
                              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                invoice.status,
                              )}`}
                            >
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Login History Tab */}
            {activeTab === "login" && (
              <div>
                {userLogins.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">
                    No login history
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900">
                            Date & Time
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900">
                            IP Address
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900">
                            Location
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900">
                            Device
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {userLogins.map((login) => (
                          <tr key={login.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              {new Date(login.loginTime).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">
                              {login.ipAddress}
                            </td>
                            <td className="px-4 py-3">{login.location}</td>
                            <td className="px-4 py-3 text-xs max-w-xs truncate">
                              {login.userAgent.substring(0, 50)}...
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                                  login.status,
                                )}`}
                              >
                                {login.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {login.duration
                                ? `${login.duration} min`
                                : "Active"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
