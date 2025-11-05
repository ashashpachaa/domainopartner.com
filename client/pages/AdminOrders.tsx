import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockOrders, Order, OrderStatus, mockProducts } from "@/lib/mockData";
import { mockUsers } from "@/lib/mockData";
import { mockStaff } from "@/lib/mockData";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  new: {
    label: "New",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: <Clock className="w-4 h-4" />,
  },
  pending_sales_review: {
    label: "Pending Sales Review",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    icon: <Clock className="w-4 h-4" />,
  },
  rejected_by_sales: {
    label: "Rejected by Sales",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: <XCircle className="w-4 h-4" />,
  },
  pending_operation: {
    label: "Pending Operation",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: <Clock className="w-4 h-4" />,
  },
  rejected_by_operation: {
    label: "Rejected by Operation",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: <XCircle className="w-4 h-4" />,
  },
  pending_operation_manager_review: {
    label: "Pending Manager Review",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    icon: <Clock className="w-4 h-4" />,
  },
  rejected_by_operation_manager: {
    label: "Rejected by Manager",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: <XCircle className="w-4 h-4" />,
  },
  awaiting_client_acceptance: {
    label: "Awaiting Client Acceptance",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  rejected_by_client: {
    label: "Rejected by Client",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: <XCircle className="w-4 h-4" />,
  },
  shipping_preparation: {
    label: "Shipping Preparation",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    icon: <Clock className="w-4 h-4" />,
  },
  completed: {
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-50",
    icon: <CheckCircle className="w-4 h-4" />,
  },
};

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown";
  };

  const getStaffName = (staffId?: string) => {
    if (!staffId) return "Unassigned";
    const staff = mockStaff.find((s) => s.id === staffId);
    return staff ? `${staff.firstName} ${staff.lastName}` : "Unknown";
  };

  const parseDurationDays = (duration: string): number => {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 5;
  };

  const calculateExpectedCompletion = (order: Order): { date: Date; daysRemaining: number } => {
    if (order.productId) {
      const product = mockProducts.find((p) => p.id === order.productId);
      if (product) {
        const durationDays = parseDurationDays(product.duration);
        const createdDate = new Date(order.createdAt);
        const expectedDate = new Date(createdDate);
        expectedDate.setDate(expectedDate.getDate() + durationDays);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expectedDate.setHours(0, 0, 0, 0);

        const daysRemaining = Math.ceil(
          (expectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        return { date: expectedDate, daysRemaining };
      }
    }

    const createdDate = new Date(order.createdAt);
    const expectedDate = new Date(createdDate);
    expectedDate.setDate(expectedDate.getDate() + 5);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expectedDate.setHours(0, 0, 0, 0);

    const daysRemaining = Math.ceil(
      (expectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return { date: expectedDate, daysRemaining };
  };

  let filteredOrders = mockOrders;

  if (searchQuery) {
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getUserName(order.userId)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }

  if (statusFilter !== "all") {
    if (statusFilter === "overdue") {
      filteredOrders = filteredOrders.filter((order) => {
        if (order.status === "completed") return false;
        const { daysRemaining } = calculateExpectedCompletion(order);
        return daysRemaining < 0;
      });
    } else {
      filteredOrders = filteredOrders.filter((order) => order.status === statusFilter);
    }
  }

  if (startDate) {
    const start = new Date(startDate);
    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.createdAt) >= start
    );
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.createdAt) <= end
    );
  }

  if (sortBy === "recent") {
    filteredOrders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sortBy === "oldest") {
    filteredOrders.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } else if (sortBy === "amount_high") {
    filteredOrders.sort((a, b) => b.amount - a.amount);
  } else if (sortBy === "amount_low") {
    filteredOrders.sort((a, b) => a.amount - b.amount);
  }

  // Calculate summary statistics
  const totalOrders = mockOrders.length;
  const completedOrders = mockOrders.filter((o) => o.status === "completed").length;
  const pendingOrders = mockOrders.filter(
    (o) =>
      o.status !== "completed" &&
      !o.status.startsWith("rejected")
  ).length;
  const overdueOrders = mockOrders.filter((order) => {
    if (order.status === "completed") return false;
    const { daysRemaining } = calculateExpectedCompletion(order);
    return daysRemaining < 0;
  }).length;
  const totalRevenue = mockOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <AdminLayout>
      <div className="flex-1 overflow-auto bg-slate-100">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Orders Management</h1>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-500 text-sm font-medium mb-2">Total Orders</p>
              <p className="text-3xl font-bold text-slate-900">{totalOrders}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-500 text-sm font-medium mb-2">Paid/Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedOrders}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-500 text-sm font-medium mb-2">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-500 text-sm font-medium mb-2">Overdue</p>
              <p className="text-3xl font-bold text-red-600">{overdueOrders}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-500 text-sm font-medium mb-2">Refunded</p>
              <p className="text-3xl font-bold text-slate-900">0</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-500 text-sm font-medium mb-2">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalRevenue.toLocaleString()} USD
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by order ID, customer name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="pending_sales_review">Pending Sales Review</SelectItem>
                  <SelectItem value="rejected_by_sales">Rejected by Sales</SelectItem>
                  <SelectItem value="pending_operation">Pending Operation</SelectItem>
                  <SelectItem value="rejected_by_operation">Rejected by Operation</SelectItem>
                  <SelectItem value="pending_operation_manager_review">
                    Pending Manager Review
                  </SelectItem>
                  <SelectItem value="rejected_by_operation_manager">
                    Rejected by Manager
                  </SelectItem>
                  <SelectItem value="awaiting_client_acceptance">
                    Awaiting Client Acceptance
                  </SelectItem>
                  <SelectItem value="rejected_by_client">Rejected by Client</SelectItem>
                  <SelectItem value="shipping_preparation">Shipping Preparation</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Countries Filter */}
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="se">Sweden</SelectItem>
                </SelectContent>
              </Select>

              {/* Start Date */}
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="mm/dd/yyyy"
              />

              {/* End Date */}
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="mm/dd/yyyy"
              />

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount_high">Amount: High to Low</SelectItem>
                  <SelectItem value="amount_low">Amount: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Company
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Date
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.flatMap((order) => {
                    const config = statusConfig[order.status];
                    const client = mockUsers.find((u) => u.id === order.userId);
                    const isExpanded = expandedRows.has(order.id);
                    const { date: expectedDate, daysRemaining } =
                      calculateExpectedCompletion(order);
                    const isCompleted = order.status === "completed";
                    const isOverdue = !isCompleted && daysRemaining < 0;
                    const isOnTrack = !isCompleted && daysRemaining >= 0;

                    return [
                      <tr
                        key={order.id}
                        className="border-b border-slate-200 hover:bg-slate-50 transition"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleRowExpanded(order.id)}
                              className="p-1 hover:bg-slate-200 rounded transition"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                            {order.orderNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div>
                            <p className="font-medium text-slate-900">
                              {client ? `${client.firstName} ${client.lastName}` : "Unknown"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {client ? client.email : ""}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {client ? client.companyName : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 text-right">
                          {order.amount.toLocaleString()} {order.currency}
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
                          >
                            {config.icon}
                            {config.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link to={`/admin/orders/${order.id}`}>
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>,
                      isExpanded && (
                        <tr key={`${order.id}-expand`} className="bg-slate-50 border-b border-slate-200">
                          <td colSpan={7} className="px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <label className="text-xs text-slate-500 font-semibold block mb-2">
                                  Estimated Completion
                                </label>
                                <p className="text-lg font-bold text-slate-900">
                                  {expectedDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>

                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <label className="text-xs text-slate-500 font-semibold block mb-2">
                                  Product Duration
                                </label>
                                {order.productId ? (
                                  (() => {
                                    const product = mockProducts.find(
                                      (p) => p.id === order.productId
                                    );
                                    return (
                                      <p className="text-lg font-bold text-slate-900">
                                        {product ? product.duration : "N/A"}
                                      </p>
                                    );
                                  })()
                                ) : (
                                  <p className="text-lg font-bold text-slate-900">5 days</p>
                                )}
                              </div>

                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <label className="text-xs text-slate-500 font-semibold block mb-2">
                                  Status
                                </label>
                                {isCompleted && (
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                    <CheckCircle className="w-4 h-4" />
                                    Completed
                                  </div>
                                )}
                                {isOnTrack && (
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                    <Clock className="w-4 h-4" />
                                    {daysRemaining === 0
                                      ? "Due Today"
                                      : `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} left`}
                                  </div>
                                )}
                                {isOverdue && (
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                                    <AlertCircle className="w-4 h-4" />
                                    {Math.abs(daysRemaining)} day
                                    {Math.abs(daysRemaining) !== 1 ? "s" : ""} overdue
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ),
                    ];
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 text-sm text-slate-600">
            Showing {filteredOrders.length} of {mockOrders.length} orders
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
