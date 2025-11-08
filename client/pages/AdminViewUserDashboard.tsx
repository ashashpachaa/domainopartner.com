import AdminLayout from "@/components/AdminLayout";
import { mockUsers, mockOrders } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MapIn, Building2 } from "lucide-react";
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminViewUserDashboard() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Load user from localStorage first, then fallback to mockUsers
  const user = useMemo(() => {
    // First check localStorage for updated version
    const localStorageUser = localStorage.getItem(`user_${userId}`);
    if (localStorageUser) {
      try {
        return JSON.parse(localStorageUser);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }

    // Fallback to mockUsers
    return mockUsers.find((u) => u.id === userId);
  }, [userId]);

  if (!user) {
    return (
      <AdminLayout>
        <div className="max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <p className="text-slate-600">User not found</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const userOrders = mockOrders.filter((o) => o.userId === userId);

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
          <p className="text-blue-100 mt-2">Admin View - Customer Account</p>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-xs text-slate-600 uppercase">Email</p>
                  <p className="text-slate-900 font-medium">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-600 uppercase">Phone</p>
                    <p className="text-slate-900 font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
              {user.whatsappNumber && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-600 uppercase">WhatsApp</p>
                    <p className="text-slate-900 font-medium">{user.whatsappNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Company Details</h3>
            <div className="space-y-4">
              {user.companyName && (
                <div>
                  <p className="text-xs text-slate-600 uppercase">Company Name</p>
                  <p className="text-slate-900 font-medium">{user.companyName}</p>
                </div>
              )}
              {user.country && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-600 uppercase">Country</p>
                    <p className="text-slate-900 font-medium">{user.country}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-600 uppercase">Account Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 mt-1">
                  {user.status || "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Summary */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Orders Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-blue-600 uppercase font-semibold">Total Orders</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">{userOrders.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-green-600 uppercase font-semibold">Completed</p>
              <p className="text-2xl font-bold text-green-700 mt-2">
                {userOrders.filter((o) => o.status === "completed").length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-xs text-yellow-600 uppercase font-semibold">Pending</p>
              <p className="text-2xl font-bold text-yellow-700 mt-2">
                {userOrders.filter((o) => o.status.includes("pending")).length}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-xs text-purple-600 uppercase font-semibold">Total Spent</p>
              <p className="text-2xl font-bold text-purple-700 mt-2">
                ${userOrders.reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Orders List */}
          {userOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Order ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Service Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {userOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{order.id}</td>
                      <td className="px-4 py-3 text-slate-600">{order.serviceType}</td>
                      <td className="px-4 py-3 font-medium">${order.amount}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status.includes("pending")
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {order.status.replace(/_/g, " ").charAt(0).toUpperCase() + order.status.replace(/_/g, " ").slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{order.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-600 py-8">No orders found for this user</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
