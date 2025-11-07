import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockOrders, mockStaff, mockUsers, mockInvoices, mockStaffSalaries, mockStaffPerformances, mockStaffBonuses } from "@/lib/mockData";
import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  Upload,
  AlertTriangle,
  Users,
  ListTodo,
  Briefcase,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const currentUserStr = localStorage.getItem("currentUser");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  if (!currentUser) {
    navigate("/signin");
    return null;
  }

  // Find staff record to get role
  const currentStaff = mockStaff.find((s) => s.id === currentUser.id || s.email === currentUser.email);
  if (!currentStaff) {
    return (
      <AdminLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Staff member not found</h1>
          <p className="text-slate-600 mt-2">Your account is not linked to a staff record. Please contact admin.</p>
        </div>
      </AdminLayout>
    );
  }

  const role = currentStaff.role;

  if (role === "sales") {
    return <SalesDashboard staff={currentStaff} />;
  } else if (role === "operation") {
    return <OperationDashboard staff={currentStaff} />;
  } else if (role === "operation_manager") {
    return <ManagerDashboard staff={currentStaff} />;
  } else {
    return (
      <AdminLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <p className="text-slate-600 mt-2">Role: {role}</p>
        </div>
      </AdminLayout>
    );
  }
}

// ============================================================================
// SALES DASHBOARD
// ============================================================================
function SalesDashboard({ staff }: { staff: any }) {
  const navigate = useNavigate();
  const [searchClient, setSearchClient] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Get orders assigned to this sales person
  const assignedOrders = useMemo(() => {
    let orders = mockOrders.filter((o) => o.assignedToSalesId === staff.id);

    // Load from localStorage
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith("order_")) {
          const orderData = localStorage.getItem(key);
          if (orderData) {
            const order = JSON.parse(orderData);
            if (order.assignedToSalesId === staff.id && !orders.some((o) => o.id === order.id)) {
              orders.push(order);
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load orders from localStorage:", e);
    }

    // Filter by status
    if (filterStatus !== "all") {
      orders = orders.filter((o) => {
        if (filterStatus === "pending") return o.status.includes("pending");
        if (filterStatus === "completed") return o.status.includes("completed");
        if (filterStatus === "review") return o.status === "awaiting_client_acceptance";
        return true;
      });
    }

    // Search by client name
    if (searchClient) {
      const searchLower = searchClient.toLowerCase();
      orders = orders.filter((o) => {
        const client = mockUsers.find((u) => u.id === o.userId);
        if (!client) return false;
        return `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchLower);
      });
    }

    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [staff.id, filterStatus, searchClient]);

  const currentMonthBonus = useMemo(() => {
    const today = new Date();
    return mockStaffBonuses.find(
      (b) =>
        b.staffId === staff.id &&
        b.month === today.getMonth() + 1 &&
        b.year === today.getFullYear()
    );
  }, [staff.id]);

  const stats = useMemo(() => {
    return {
      total: assignedOrders.length,
      pending: assignedOrders.filter((o) => o.status.includes("pending")).length,
      awaitingReview: assignedOrders.filter((o) => o.status === "awaiting_client_acceptance").length,
      completed: assignedOrders.filter((o) => o.status.includes("completed")).length,
      revenue: assignedOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
    };
  }, [assignedOrders]);

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sales Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, {staff.firstName} {staff.lastName}</p>
          </div>
          <Button onClick={() => navigate("/admin/operations/new")} className="bg-blue-600 hover:bg-blue-700">
            <Zap className="w-4 h-4 mr-2" /> Create New Order
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Briefcase} label="Total Orders" value={stats.total} color="blue" />
          <StatCard icon={Clock} label="Pending" value={stats.pending} color="yellow" />
          <StatCard icon={Eye} label="Awaiting Review" value={stats.awaitingReview} color="purple" />
          <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="green" />
          <StatCard icon={DollarSign} label="Revenue" value={`$${(stats.revenue / 1000).toFixed(1)}K`} color="emerald" />
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Your Client Orders</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search client name..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                className="border-slate-300"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Processing</option>
                <option value="review">Awaiting Client Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Service</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assignedOrders.map((order) => {
                  const client = mockUsers.find((u) => u.id === order.userId);
                  const statusColor =
                    order.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "awaiting_client_acceptance"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800";
                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-sm text-slate-900">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-slate-900">{client ? `${client.firstName} ${client.lastName}` : "Unknown"}</td>
                      <td className="px-6 py-4 text-slate-600">{order.serviceType}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {order.currency} {order.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/operations/${order.id}`)}
                          className="text-blue-600 border-blue-200"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {assignedOrders.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No orders found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// ============================================================================
// OPERATIONS DASHBOARD
// ============================================================================
function OperationDashboard({ staff }: { staff: any }) {
  const navigate = useNavigate();

  // Get orders in operation stage assigned to this staff
  const operationQueue = useMemo(() => {
    return mockOrders
      .filter((o) => o.assignedToOperationId === staff.id && o.status === "pending_operation")
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [staff.id]);

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return mockOrders
      .filter((o) => o.assignedToOperationId === staff.id && o.status.includes("completed") && o.createdAt.startsWith(today))
      .length;
  }, [staff.id]);

  return (
    <AdminLayout>
      <div className="p-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Operations Dashboard</h1>
          <p className="text-slate-600 mt-1">Process orders and prepare documents for manager review</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <StatCard icon={ListTodo} label="In Queue" value={operationQueue.length} color="blue" />
          <StatCard icon={Zap} label="Completed Today" value={completedToday} color="green" />
          <StatCard icon={AlertCircle} label="Your Role" value="Operation" color="purple" />
        </div>

        {/* Processing Queue */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">🔄 Your Processing Queue</h2>
            <p className="text-slate-600 text-sm mt-1">Complete company data and upload required documents before requesting manager review</p>
          </div>

          <div className="divide-y divide-slate-200">
            {operationQueue.map((order) => {
              const client = mockUsers.find((u) => u.id === order.userId);
              const documentsUploaded = order.operationFiles?.filter((f) => f.stage === "operation").length || 0;
              const isCompanyDataComplete = order.companyInfo && order.companyInfo.companyName;
              const canRequestReview = isCompanyDataComplete && documentsUploaded > 0;

              return (
                <div key={order.id} className="p-6 hover:bg-slate-50 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{order.orderNumber}</h3>
                      <p className="text-slate-600 text-sm">
                        Client: {client ? `${client.firstName} ${client.lastName}` : "Unknown"} • {order.serviceType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">${order.amount?.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">USD</p>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
                    <div className="flex items-center gap-3">
                      {isCompanyDataComplete ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={isCompanyDataComplete ? "text-green-700" : "text-red-700"}>
                        ✓ Company Information Complete
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {documentsUploaded > 0 ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={documentsUploaded > 0 ? "text-green-700" : "text-red-700"}>
                        ✓ Documents Uploaded ({documentsUploaded})
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/operations/${order.id}`)}
                      className="text-blue-600 border-blue-200"
                    >
                      <FileText className="w-4 h-4 mr-2" /> View & Fill Form
                    </Button>
                    <Button
                      disabled={!canRequestReview}
                      size="sm"
                      className={`${canRequestReview ? "bg-green-600 hover:bg-green-700" : "bg-slate-300 cursor-not-allowed"}`}
                      onClick={() => {
                        toast.success("Review request sent to manager!");
                        // Here you would update order status to pending_operation_manager_review
                      }}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" /> Request Manager Review
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {operationQueue.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30 text-green-600" />
              <p className="text-lg">No orders in your queue 🎉</p>
              <p className="text-sm">All caught up! Check back later for new orders.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// ============================================================================
// MANAGER DASHBOARD
// ============================================================================
function ManagerDashboard({ staff }: { staff: any }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"review" | "shipping" | "team">("review");

  // Get orders awaiting manager review
  const reviewQueue = useMemo(() => {
    return mockOrders
      .filter((o) => o.assignedToManagerId === staff.id && o.status === "pending_operation_manager_review")
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [staff.id]);

  // Get orders awaiting shipping (after client approval)
  const shippingQueue = useMemo(() => {
    return mockOrders
      .filter(
        (o) =>
          o.assignedToManagerId === staff.id &&
          (o.status === "shipping_preparation" ||
            o.status === "pending_apostille" ||
            o.status === "pending_poa" ||
            o.status === "pending_financial_report"),
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [staff.id]);

  // Get team stats
  const teamStats = useMemo(() => {
    const operationStaff = mockStaff.filter((s) => s.role === "operation");
    return {
      teamSize: operationStaff.length,
      reviewPending: reviewQueue.length,
      shippingPending: shippingQueue.length,
    };
  }, [reviewQueue, shippingQueue]);

  return (
    <AdminLayout>
      <div className="p-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manager Dashboard</h1>
          <p className="text-slate-600 mt-1">Review operations, manage shipping, and oversee team performance</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <StatCard icon={ListTodo} label="Awaiting Review" value={teamStats.reviewPending} color="blue" />
          <StatCard icon={Upload} label="Shipping Queue" value={teamStats.shippingPending} color="orange" />
          <StatCard icon={Users} label="Team Size" value={teamStats.teamSize} color="purple" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("review")}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === "review"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            📋 Review Queue
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === "shipping"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            📦 Shipping & Documents
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === "team"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            👥 Team Performance
          </button>
        </div>

        {/* Review Queue Tab */}
        {activeTab === "review" && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Operations Review Queue</h2>
              <p className="text-slate-600 text-sm mt-1">Review completed work from operations team</p>
            </div>

            <div className="divide-y divide-slate-200">
              {reviewQueue.map((order) => {
                const client = mockUsers.find((u) => u.id === order.userId);
                const operationStaff = mockStaff.find((s) => s.id === order.assignedToOperationId);

                return (
                  <div key={order.id} className="p-6 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{order.orderNumber}</h3>
                        <p className="text-slate-600 text-sm">
                          From: {operationStaff ? `${operationStaff.firstName} ${operationStaff.lastName}` : "Unknown"} • Client:{" "}
                          {client ? `${client.firstName} ${client.lastName}` : "Unknown"}
                        </p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Awaiting Review
                      </span>
                    </div>

                    {/* Review Form Preview */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Company Name</p>
                          <p className="font-semibold text-slate-900">{order.companyInfo?.companyName || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Company Number</p>
                          <p className="font-semibold text-slate-900">{order.operationReviewForm?.companyNumber || "Not provided"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-600">Documents Uploaded</p>
                          <p className="font-semibold text-slate-900">{order.operationFiles?.length || 0} files</p>
                        </div>
                      </div>
                    </div>

                    {/* Approval Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/operations/${order.id}`)}
                        className="text-blue-600 border-blue-200"
                      >
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          toast.success("Order approved! Sending to client for review...");
                          // Update order status to awaiting_client_acceptance
                        }}
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200"
                        onClick={() => {
                          // Show rejection modal
                          toast.error("Rejection feature coming soon");
                        }}
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {reviewQueue.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30 text-green-600" />
                <p className="text-lg">No pending reviews</p>
                <p className="text-sm">All operations work has been reviewed!</p>
              </div>
            )}
          </div>
        )}

        {/* Shipping Queue Tab */}
        {activeTab === "shipping" && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Shipping & Document Management</h2>
              <p className="text-slate-600 text-sm mt-1">Upload apostille, POA, and shipping documents after client approval</p>
            </div>

            <div className="divide-y divide-slate-200">
              {shippingQueue.map((order) => {
                const client = mockUsers.find((u) => u.id === order.userId);

                return (
                  <div key={order.id} className="p-6 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{order.orderNumber}</h3>
                        <p className="text-slate-600 text-sm">Client: {client ? `${client.firstName} ${client.lastName}` : "Unknown"}</p>
                      </div>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Service Completion Status */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      {order.requiredServices?.hasApostille && (
                        <div className="flex items-center gap-2">
                          {order.completedServices?.apostilleComplete ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                          <span>Apostille</span>
                        </div>
                      )}
                      {order.requiredServices?.hasPOA && (
                        <div className="flex items-center gap-2">
                          {order.completedServices?.poaComplete ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                          <span>Power of Attorney</span>
                        </div>
                      )}
                      {order.requiredServices?.hasShipping && (
                        <div className="flex items-center gap-2">
                          {order.completedServices?.shippingComplete ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                          <span>Shipping</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/operations/${order.id}`)}
                        className="text-blue-600 border-blue-200"
                      >
                        <Upload className="w-4 h-4 mr-2" /> Upload Documents
                      </Button>
                      {order.trackingNumber && (
                        <span className="text-xs bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                          🎯 Tracking: {order.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {shippingQueue.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30 text-green-600" />
                <p className="text-lg">No pending shipments</p>
                <p className="text-sm">All orders have been shipped!</p>
              </div>
            )}
          </div>
        )}

        {/* Team Performance Tab */}
        {activeTab === "team" && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Team Performance</h2>
              <p className="text-slate-600 text-sm mt-1">Monitor operations staff performance</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Staff</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Orders Processed</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Pending Review</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Completed</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mockStaff
                    .filter((s) => s.role === "operation")
                    .map((operationStaff) => {
                      const staffOrders = mockOrders.filter((o) => o.assignedToOperationId === operationStaff.id);
                      const completed = staffOrders.filter((o) => o.status.includes("completed")).length;
                      const pending = staffOrders.filter((o) => o.status === "pending_operation").length;
                      const total = staffOrders.length;
                      const performance = total > 0 ? Math.round((completed / total) * 100) : 0;

                      return (
                        <tr key={operationStaff.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {operationStaff.firstName} {operationStaff.lastName}
                          </td>
                          <td className="px-6 py-4 text-center text-slate-900">{total}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full font-semibold text-xs ${pending > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                              {pending}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-green-600">{completed}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${performance}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-sm text-slate-900">{performance}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon className="w-12 h-12 opacity-20" />
      </div>
    </div>
  );
}
