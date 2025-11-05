import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
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
import { mockOrders, Order, OrderStatus } from "@/lib/mockData";
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

  const getUserName = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown";
  };

  const getStaffName = (staffId?: string) => {
    if (!staffId) return "Unassigned";
    const staff = mockStaff.find((s) => s.id === staffId);
    return staff ? `${staff.firstName} ${staff.lastName}` : "Unknown";
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
    filteredOrders = filteredOrders.filter((order) => order.status === statusFilter);
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

  return (
    <AdminLayout>
      <div className="flex-1 overflow-auto bg-slate-100">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Orders</h1>
            <p className="text-slate-600">Manage and track customer orders through workflow</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
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
                    Order #
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Service
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const config = statusConfig[order.status];
                    let assignedStaff = "None";
                    if (
                      order.status === "pending_sales_review" ||
                      order.status === "rejected_by_sales"
                    ) {
                      assignedStaff = getStaffName(order.assignedToSalesId);
                    } else if (
                      order.status === "pending_operation" ||
                      order.status === "rejected_by_operation"
                    ) {
                      assignedStaff = getStaffName(order.assignedToOperationId);
                    } else if (
                      order.status === "pending_operation_manager_review" ||
                      order.status === "rejected_by_operation_manager" ||
                      order.status === "shipping_preparation"
                    ) {
                      assignedStaff = getStaffName(order.assignedToManagerId);
                    } else if (order.status === "awaiting_client_acceptance") {
                      assignedStaff = getStaffName(order.assignedToSalesId);
                    }

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-slate-200 hover:bg-slate-50 transition"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {getUserName(order.userId)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {order.serviceType}
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
                        <td className="px-6 py-4 text-sm text-slate-600">{assignedStaff}</td>
                        <td className="px-6 py-4 text-center">
                          <Link to={`/admin/orders/${order.id}`}>
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
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
          <div className="mt-4 text-sm text-slate-600">
            Showing {filteredOrders.length} of {mockOrders.length} orders
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
