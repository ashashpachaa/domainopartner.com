import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Mail, Phone, MapPin, Calendar, Shield, DollarSign, Plus, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { mockStaff, rolePermissions, roleLabels, mockStaffCommissions, mockStaffSalaries, mockStaffPerformances } from "@/lib/mockData";

const roleDescriptions: Record<string, string> = {
  super_admin:
    "Full access to all features including user management, staff management, and system configurations",
  admin:
    "Administrative access with ability to manage users, staff, orders, and view reports",
  operation_manager:
    "Oversee all operations and sales activities with complete visibility and order management",
  operation:
    "Create and manage orders, upload documents, change order status for assigned items",
  sales:
    "Create orders for clients, view client invoices, payments, and track order status",
  accounting:
    "View and manage invoices, payments, and billing information",
};

const permissionDescriptions: Record<string, string> = {
  manage_users: "Add, edit, and delete user accounts",
  manage_staff: "Add, edit, and delete staff members",
  manage_orders: "Full order management capabilities",
  manage_invoices: "Invoice creation and management",
  view_reports: "Access to system reports and analytics",
  manage_permissions: "Modify role and permission settings",
  add_orders: "Create new orders",
  edit_orders: "Modify existing orders",
  delete_orders: "Delete orders",
  view_all_data: "View all company data without restrictions",
  view_operations: "View all operations data",
  view_sales: "View all sales data",
  view_all_orders: "View all orders in the system",
  upload_documents: "Upload and manage order documents",
  create_orders: "Create new orders",
  edit_assigned_orders: "Edit orders assigned to you",
  change_order_status: "Modify order status",
  view_assigned_orders: "View your assigned orders",
  view_client_orders: "View client orders",
  view_client_invoices: "View client invoices",
  view_client_payments: "View client payment information",
  track_orders: "Track order progress",
  view_invoices: "View invoice details",
  view_payments: "View payment information",
  manage_billing: "Manage billing and payments",
};

export default function AdminStaffDetail() {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();

  // Load staff from localStorage first, then fallback to mockStaff
  const member = useMemo(() => {
    // First check localStorage for updated version
    const localStorageStaff = localStorage.getItem(`staff_${staffId}`);
    if (localStorageStaff) {
      try {
        return JSON.parse(localStorageStaff);
      } catch (e) {
        console.error('Error parsing staff from localStorage:', e);
      }
    }

    // Fallback to mockStaff
    return mockStaff.find((s) => s.id === staffId);
  }, []);

  if (!member) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Staff member not found</p>
          <Link to="/admin/staff">
            <Button>Back to Staff</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const permissions = rolePermissions[member.role] || [];
  const roleColor = {
    super_admin: "from-red-500 to-red-600",
    admin: "from-purple-500 to-purple-600",
    operation_manager: "from-blue-500 to-blue-600",
    operation: "from-green-500 to-green-600",
    sales: "from-orange-500 to-orange-600",
    accounting: "from-cyan-500 to-cyan-600",
  }[member.role] || "from-slate-500 to-slate-600";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/admin/staff">
          <Button
            variant="ghost"
            className="gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Staff
          </Button>
        </Link>

        {/* Header Card */}
        <div className={`bg-gradient-to-r ${roleColor} rounded-lg p-8 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {member.firstName} {member.lastName}
              </h1>
              <p className="text-white/90 text-lg">{member.department}</p>
            </div>
            <Link to={`/admin/staff/${member.id}/edit`}>
              <Button className="bg-white text-slate-900 hover:bg-slate-100 gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">
                  Staff ID
                </p>
                <p className="text-lg font-mono font-semibold text-slate-900">
                  {member.id}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">
                    Email
                  </p>
                  <p className="text-sm text-slate-900">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">
                    Phone
                  </p>
                  <p className="text-sm text-slate-900">{member.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">
                    Joined
                  </p>
                  <p className="text-sm text-slate-900">
                    {new Date(member.joinDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                  Status
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    member.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {member.status.charAt(0).toUpperCase() +
                    member.status.slice(1)}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                  Last Login
                </p>
                <p className="text-sm text-slate-900">
                  {new Date(member.lastLogin).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Role & Permissions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-slate-900">
                  {roleLabels[member.role]}
                </h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {roleDescriptions[member.role]}
              </p>
            </div>

            {/* Permissions Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Assigned Permissions
              </h2>

              {permissions.length === 0 ? (
                <p className="text-slate-600">No permissions assigned</p>
              ) : (
                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <div
                      key={permission}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <h3 className="font-semibold text-slate-900 capitalize">
                        {permission.replace(/_/g, " ")}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {permissionDescriptions[permission] ||
                          "Permission description"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Total Permissions:</span>{" "}
                  {permissions.length}
                </p>
              </div>
            </div>

            {/* Workflow Permissions Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Workflow Permissions
              </h2>

              {!member.workflowPermissions || member.workflowPermissions.length === 0 ? (
                <p className="text-slate-600">No workflow permissions assigned</p>
              ) : (
                <div className="space-y-3">
                  {member.workflowPermissions.map((permission) => (
                    <div
                      key={permission.stage}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        permission.canAccess
                          ? "bg-green-50 border-green-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {permission.label}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {permission.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {permission.canAccess ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                              Assigned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                              <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                              Not Assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Assigned Stages:</span>{" "}
                  {member.workflowPermissions?.filter((p) => p.canAccess).length || 0} of {member.workflowPermissions?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-green-600" />
              Commission Configuration
            </h2>
            <Link to={`/admin/staff/${member.id}/commission`}>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white gap-2">
                <Edit2 className="w-4 h-4" />
                Configure Commission
              </Button>
            </Link>
          </div>

          {mockStaffCommissions.find((c) => c.staffId === member.id) ? (
            <div className="space-y-4">
              {mockStaffCommissions
                .filter((c) => c.staffId === member.id)
                .map((commission) => (
                  <div key={commission.staffId}>
                    <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-semibold text-slate-600 mb-2">
                        Currency
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {commission.currency}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs font-semibold text-green-600 uppercase mb-1">
                          Total Earned
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          {commission.currency}{" "}
                          {commission.totalEarned.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
                          Paid
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                          {commission.currency}{" "}
                          {commission.paidAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs font-semibold text-amber-600 uppercase mb-1">
                          Pending
                        </p>
                        <p className="text-2xl font-bold text-amber-700">
                          {commission.currency}{" "}
                          {commission.pendingAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">
                        Commission Tiers
                      </h3>
                      <div className="space-y-2">
                        {commission.tiers.map((tier) => (
                          <div
                            key={tier.id}
                            className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-slate-900">
                                {tier.description}
                              </h4>
                              <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
                                {tier.orderCountMin}-{tier.orderCountMax} orders
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-600">Percentage Rate</p>
                                <p className="font-semibold text-slate-900">
                                  {tier.percentageRate}%
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-600">Fixed Amount</p>
                                <p className="font-semibold text-slate-900">
                                  {commission.currency}{" "}
                                  {tier.fixedAmount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-900 mb-4">
                No commission configuration found for this staff member.
              </p>
              <Link to={`/admin/staff/${member.id}/commission`}>
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Create Commission Configuration
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Salary Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-green-600" />
              Salary Management
            </h2>
            <Link to={`/admin/staff/${member.id}/salary`}>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white gap-2">
                <Edit2 className="w-4 h-4" />
                Configure Salary
              </Button>
            </Link>
          </div>
          {mockStaffSalaries.find((s) => s.staffId === member.id) ? (
            <div className="grid grid-cols-1 gap-4">
              {mockStaffSalaries.filter((s) => s.staffId === member.id).map((sal) => (
                <div key={sal.staffId}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs font-semibold text-green-600 uppercase mb-1">Base Salary</p>
                      <p className="text-2xl font-bold text-green-700">{sal.currency} {sal.baseSalary.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs font-semibold text-red-600 uppercase mb-1">Underperformance Deduction</p>
                      <p className="text-2xl font-bold text-red-700">-{sal.currency} {sal.underperformanceDeduction.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-xs font-semibold text-orange-600 uppercase mb-1">Rejection Fee Deducted</p>
                      <p className="text-2xl font-bold text-orange-700">-{sal.currency} {sal.totalRejectionFees.toLocaleString()}</p>
                      <p className="text-xs text-orange-600 mt-2">({sal.rejectionFee.toLocaleString()} per rejection)</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Next Payment</p>
                      <p className="text-lg font-bold text-blue-700">{new Date(sal.nextSalaryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-900 mb-4">
                No salary configuration found for this staff member.
              </p>
              <Link to={`/admin/staff/${member.id}/salary`}>
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Create Salary Configuration
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Performance Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              Performance Score
            </h2>
            <Link to="/admin/performance">
              <Button variant="outline" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                View All
              </Button>
            </Link>
          </div>
          {mockStaffPerformances.filter((p) => p.staffId === member.id).map((perf) => (
            <div key={perf.staffId} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <p className="text-xs font-semibold text-primary-600 uppercase mb-1">Current Score</p>
                <p className="text-3xl font-bold text-primary-700">{perf.currentScore}/100</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-semibold text-green-600 uppercase mb-1">Early Completions</p>
                <p className="text-3xl font-bold text-green-700">{perf.earlyCompletions}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs font-semibold text-red-600 uppercase mb-1">Rejections</p>
                <p className="text-3xl font-bold text-red-700">{perf.rejections}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
