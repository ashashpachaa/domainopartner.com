import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { mockStaff, mockOrders } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Calendar, Building2, Clock } from "lucide-react";
import { useMemo } from "react";

export default function AdminViewStaffDashboard() {
  const { staffId } = useParams();
  const navigate = useNavigate();

  // Load staff from localStorage first, then fallback to mockStaff
  const staff = useMemo(() => {
    const localStorageStaff = localStorage.getItem(`staff_${staffId}`);
    if (localStorageStaff) {
      try {
        return JSON.parse(localStorageStaff);
      } catch (e) {
        console.error('Error parsing staff from localStorage:', e);
      }
    }
    return mockStaff.find((s) => s.id === staffId);
  }, [staffId]);

  if (!staff) {
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
            <p className="text-slate-600">Staff member not found</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Get orders assigned to this staff member
  const assignedOrders = mockOrders.filter(
    (o) =>
      o.assignedToSalesId === staffId ||
      o.assignedToOperationId === staffId ||
      o.assignedToManagerId === staffId
  );

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
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold">{staff.firstName} {staff.lastName}</h1>
          <p className="text-purple-100 mt-2">{staff.department || "Staff"} - Admin View</p>
        </div>

        {/* Staff Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-xs text-slate-600 uppercase">Email</p>
                  <p className="text-slate-900 font-medium">{staff.email}</p>
                </div>
              </div>
              {staff.phone && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-600 uppercase">Phone</p>
                    <p className="text-slate-900 font-medium">{staff.phone}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-600 uppercase">Department</p>
                <p className="text-slate-900 font-medium">{staff.department || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Employment Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-xs text-slate-600 uppercase">Join Date</p>
                  <p className="text-slate-900 font-medium">
                    {staff.joinDate
                      ? new Date(staff.joinDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 mt-1">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Work Assignment Summary */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Work Assignment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-blue-600 uppercase font-semibold">Total Assigned</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">{assignedOrders.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-green-600 uppercase font-semibold">Completed</p>
              <p className="text-2xl font-bold text-green-700 mt-2">
                {assignedOrders.filter((o) => o.status === "completed").length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-xs text-yellow-600 uppercase font-semibold">In Progress</p>
              <p className="text-2xl font-bold text-yellow-700 mt-2">
                {assignedOrders.filter((o) => !o.status.includes("completed")).length}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-xs text-purple-600 uppercase font-semibold">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-700 mt-2">
                ${assignedOrders.reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Assigned Orders */}
          {assignedOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Order ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Client</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Service Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {assignedOrders.map((order) => {
                    let role = "";
                    if (order.assignedToSalesId === staffId) role = "Sales";
                    else if (order.assignedToOperationId === staffId)
                      role = "Operation";
                    else if (order.assignedToManagerId === staffId)
                      role = "Manager";

                    return (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{order.id}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {order.userId || "N/A"}
                        </td>
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
                            {order.status
                              .replace(/_/g, " ")
                              .charAt(0)
                              .toUpperCase() +
                              order.status.replace(/_/g, " ").slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{role}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-600 py-8">
              No orders assigned to this staff member
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
