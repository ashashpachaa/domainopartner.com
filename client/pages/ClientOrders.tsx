import { useState, useMemo } from "react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockOrders } from "@/lib/mockData";
import ClientLayout from "@/components/ClientLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Package } from "lucide-react";

export default function ClientOrders() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  // Get all client's orders (from mockOrders + localStorage)
  const allClientOrders = useMemo(() => {
    const orders = mockOrders.filter((o) => o.userId === currentUser.id);

    // Load orders from localStorage that might have been created by this client
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith("order_")) {
          const orderData = localStorage.getItem(key);
          if (orderData) {
            const order = JSON.parse(orderData);
            if (order.userId === currentUser.id) {
              // Check if this order is already in mockOrders
              const exists = orders.some((o) => o.id === order.id);
              if (!exists) {
                orders.push(order);
              } else {
                // Update with latest from localStorage
                const index = orders.findIndex((o) => o.id === order.id);
                orders[index] = order;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load orders from localStorage:", e);
    }

    return orders;
  }, [currentUser.id]);

  // Filter and sort client orders
  const clientOrders = useMemo(() => {
    let orders = [...allClientOrders];

    // Filter by status
    if (filterStatus !== "all") {
      orders = orders.filter((o) =>
        filterStatus === "completed"
          ? o.status.includes("completed")
          : filterStatus === "rejected"
            ? o.status.includes("rejected")
            : !o.status.includes("completed") && !o.status.includes("rejected"),
      );
    }

    // Search
    if (searchTerm) {
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort
    if (sortBy === "date") {
      orders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else {
      orders.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    }

    return orders;
  }, [allClientOrders, filterStatus, searchTerm, sortBy]);

  const getStatusColor = (status: string) => {
    if (status.includes("completed")) return "bg-green-100 text-green-800";
    if (status.includes("rejected")) return "bg-red-100 text-red-800";
    if (status.includes("client")) return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusLabel = (status: string) => {
    if (status.includes("completed")) return "Completed";
    if (status.includes("rejected")) return "Rejected";
    if (status.includes("client")) return "Awaiting Your Response";
    return "In Progress";
  };

  const getStatusBorder = (status: string) => {
    if (status.includes("completed")) return "border-l-4 border-l-green-500";
    if (status.includes("rejected")) return "border-l-4 border-l-red-500";
    if (status.includes("client")) return "border-l-4 border-l-blue-500";
    return "border-l-4 border-l-yellow-500";
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
            <p className="text-slate-600 mt-2">
              Track the status of all your orders
            </p>
          </div>
          <Button
            onClick={() => navigate("/client/orders/new")}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Order
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by order ID or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
            >
              <option value="all">All Orders</option>
              <option value="active">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
            >
              <option value="date">Newest First</option>
              <option value="amount">Highest Amount</option>
            </select>
          </div>

          {(searchTerm || filterStatus !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear filters
            </button>
          )}

          <p className="text-sm text-slate-600">
            Showing {clientOrders.length} order
            {clientOrders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Orders List */}
        {clientOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium">No orders found</p>
            <p className="text-slate-500 text-sm mt-1">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "You haven't created any orders yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {clientOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition ${getStatusBorder(order.status)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {order.orderNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-3">{order.description}</p>
                    <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                      <div>
                        <p className="font-medium text-slate-900">
                          ${order.amount || 0}
                        </p>
                        <p className="text-xs text-slate-500">Amount</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">Created</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {order.serviceType}
                        </p>
                        <p className="text-xs text-slate-500">Service</p>
                      </div>
                      {order.operationFiles &&
                        order.operationFiles.length > 0 && (
                          <div>
                            <p className="font-medium text-slate-900">
                              {order.operationFiles.length}
                            </p>
                            <p className="text-xs text-slate-500">Documents</p>
                          </div>
                        )}
                      {order.history && order.history.length > 0 && (
                        <div>
                          <p className="font-medium text-slate-900">
                            {new Date(
                              order.history[order.history.length - 1].createdAt,
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500">Last Update</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/client/orders/${order.id}`)}
                    className="bg-primary-600 hover:bg-primary-700 whitespace-nowrap"
                  >
                    View Details <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
