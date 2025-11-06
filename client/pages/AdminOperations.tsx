import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Truck,
  Plus,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockOrders, mockUsers, mockStaff } from "@/lib/mockData";

export default function AdminOperations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "customer" | "stage">("date");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Load all orders (from mockOrders + localStorage)
  const allOrders = useMemo(() => {
    const orders = [...mockOrders];

    // Load orders from localStorage that might have been created by clients
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith("order_")) {
          const orderData = localStorage.getItem(key);
          if (orderData) {
            const order = JSON.parse(orderData);
            // Check if this order is already in mockOrders
            const exists = orders.some(o => o.id === order.id);
            if (!exists) {
              orders.push(order);
            } else {
              // Update with latest from localStorage
              const index = orders.findIndex(o => o.id === order.id);
              orders[index] = order;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load orders from localStorage:", e);
    }

    return orders;
  }, []);

  // Filter orders that are in active workflow (not completed or cancelled)
  const activeOrders = allOrders.filter(
    (order) =>
      order.status !== "completed" &&
      order.status !== "rejected_by_sales" &&
      order.status !== "rejected_by_operation" &&
      order.status !== "rejected_by_operation_manager" &&
      order.status !== "rejected_by_client"
  );

  const filteredOrders = activeOrders.filter((order) => {
    const user = mockUsers.find((u) => u.id === order.userId);
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.companyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = filterStage === "all" || order.status === filterStage;

    let matchesDateRange = true;
    if (startDate) {
      matchesDateRange = new Date(order.createdAt) >= new Date(startDate);
    }
    if (endDate && matchesDateRange) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      matchesDateRange = new Date(order.createdAt) <= endDateTime;
    }

    return matchesSearch && matchesStage && matchesDateRange;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "date") {
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "customer") {
      const userA = mockUsers.find((u) => u.id === a.userId);
      const userB = mockUsers.find((u) => u.id === b.userId);
      return (userA?.firstName || "").localeCompare(userB?.firstName || "");
    }
    return 0;
  });

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: "bg-slate-100 text-slate-800",
      pending_sales_review: "bg-blue-100 text-blue-800",
      pending_operation: "bg-yellow-100 text-yellow-800",
      pending_operation_manager_review: "bg-orange-100 text-orange-800",
      awaiting_client_acceptance: "bg-purple-100 text-purple-800",
      pending_apostille: "bg-indigo-100 text-indigo-800",
      rejected_by_apostille: "bg-red-100 text-red-800",
      pending_poa: "bg-indigo-100 text-indigo-800",
      rejected_by_poa: "bg-red-100 text-red-800",
      pending_financial_report: "bg-indigo-100 text-indigo-800",
      rejected_by_financial_report: "bg-red-100 text-red-800",
      shipping_preparation: "bg-green-100 text-green-800",
      rejected_by_shipping: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-slate-100 text-slate-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      new: "New",
      pending_sales_review: "Sales Review",
      pending_operation: "In Operation",
      pending_operation_manager_review: "Manager Review",
      awaiting_client_acceptance: "Awaiting Client",
      pending_apostille: "Apostille Processing",
      rejected_by_apostille: "Rejected by Apostille",
      pending_poa: "Power of Attorney",
      rejected_by_poa: "Rejected by POA",
      pending_financial_report: "Financial Report",
      rejected_by_financial_report: "Rejected by Financial Report",
      shipping_preparation: "Shipping Prep",
      rejected_by_shipping: "Rejected by Shipping",
    };
    return labels[status] || status;
  };

  const getWorkflowProgress = (status: string) => {
    const stages = [
      "new",
      "pending_sales_review",
      "pending_operation",
      "pending_operation_manager_review",
      "awaiting_client_acceptance",
      "shipping_preparation",
    ];
    return stages.indexOf(status) + 1;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Operations Management
            </h2>
            <p className="text-slate-600">
              Manage order workflow, uploads, apostille, and tracking
            </p>
          </div>
          <Link to="/admin/operations/new">
            <Button className="bg-primary-600 hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Order
            </Button>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by order ID, customer name, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {/* Filter Stage */}
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
            >
              <option value="all">All Stages</option>
              <option value="pending_sales_review">Sales Review</option>
              <option value="pending_operation">In Operation</option>
              <option value="pending_operation_manager_review">
                Manager Review
              </option>
              <option value="awaiting_client_acceptance">Awaiting Client</option>
              <option value="shipping_preparation">Shipping Prep</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
            >
              <option value="date">Newest First</option>
              <option value="customer">Customer Name</option>
              <option value="stage">Workflow Stage</option>
            </select>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-2">
                From Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-2">
                To Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            {(startDate || endDate) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Clear dates
                </button>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600">
            Showing {sortedOrders.length} of {activeOrders.length} active orders
          </p>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Current Stage
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900">
                    Files
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900">
                    Tracking
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600">No active orders found</p>
                    </td>
                  </tr>
                ) : (
                  sortedOrders.map((order) => {
                    const user = mockUsers.find((u) => u.id === order.userId);
                    const progress = getWorkflowProgress(order.status);
                    const hasTracking = !!order.trackingNumber;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50">
                        {/* Order Number */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {order.currency} {order.amount.toLocaleString()}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-slate-600">
                            {user?.companyName}
                          </p>
                        </td>

                        {/* Stage */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </td>

                        {/* Progress */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-600"
                                style={{
                                  width: `${(progress / 6) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-slate-600">
                              {progress}/6
                            </span>
                          </div>
                        </td>

                        {/* Files Uploaded */}
                        <td className="px-6 py-4 text-center">
                          {order.operationFiles && order.operationFiles.length > 0 ? (
                            <div className="flex items-center justify-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-600">
                                {order.operationFiles.length}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </td>

                        {/* Tracking */}
                        <td className="px-6 py-4 text-center">
                          {hasTracking ? (
                            <div className="flex items-center justify-center gap-2">
                              <Truck className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-mono text-green-600">
                                {order.trackingNumber}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs">
                              Not added
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <Link to={`/admin/operations/${order.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-slate-600 text-sm font-medium mb-2">
              Total Active Orders
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {activeOrders.length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-slate-600 text-sm font-medium mb-2">
              Awaiting Client
            </p>
            <p className="text-3xl font-bold text-purple-600">
              {activeOrders.filter(
                (o) => o.status === "awaiting_client_acceptance"
              ).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-slate-600 text-sm font-medium mb-2">
              With Tracking
            </p>
            <p className="text-3xl font-bold text-green-600">
              {activeOrders.filter((o) => !!o.trackingNumber).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-slate-600 text-sm font-medium mb-2">
              Files Uploaded
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {activeOrders.reduce(
                (sum, o) => sum + (o.operationFiles?.length || 0),
                0
              )}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
