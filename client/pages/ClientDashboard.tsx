import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockOrders, mockInvoices, mockUsers } from "@/lib/mockData";
import ClientLayout from "@/components/ClientLayout";
import { Button } from "@/components/ui/button";
import { Package, FileText, DollarSign, Clock, ArrowRight, AlertCircle } from "lucide-react";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  // Get client's orders and invoices
  const clientOrders = useMemo(() => {
    return mockOrders.filter((o) => o.userId === currentUser.id);
  }, [currentUser.id]);

  const clientInvoices = useMemo(() => {
    return mockInvoices.filter((i) => i.userId === currentUser.id);
  }, [currentUser.id]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeOrders = clientOrders.filter(
      (o) => !o.status.includes("completed") && !o.status.includes("rejected")
    ).length;

    const totalOrderValue = clientOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    const pendingInvoices = clientInvoices.filter((i) => i.status === "pending").length;
    const amountDue = clientInvoices
      .filter((i) => i.status === "pending")
      .reduce((sum, i) => sum + (i.amount || 0), 0);

    const totalDocuments = clientOrders.reduce(
      (sum, o) => sum + (o.operationFiles?.length || 0),
      0
    );

    const paidInvoices = clientInvoices.filter((i) => i.status === "paid").length;

    return {
      activeOrders,
      totalOrderValue,
      pendingInvoices,
      amountDue,
      totalDocuments,
      paidInvoices,
    };
  }, [clientOrders, clientInvoices]);

  // Get recent activity
  const recentOrders = clientOrders.slice(-3).reverse();
  const recentInvoices = clientInvoices.slice(-3).reverse();

  const getStatusColor = (status: string) => {
    if (status.includes("completed")) return "bg-green-50 text-green-700 border-green-200";
    if (status.includes("rejected")) return "bg-red-50 text-red-700 border-red-200";
    if (status.includes("client")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  };

  const getStatusLabel = (status: string) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getInvoiceStatusColor = (status: string) => {
    if (status === "paid") return "bg-green-100 text-green-800";
    if (status === "overdue") return "bg-red-100 text-red-800";
    if (status === "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-slate-100 text-slate-800";
  };

  return (
    <ClientLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back, {currentUser.firstName}!</h1>
          <p className="text-slate-600 mt-2">Track your orders, invoices, and documents in one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">Active Orders</p>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{stats.activeOrders}</p>
            <p className="text-xs text-blue-700 mt-2">In progress</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-900">Total Spent</p>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-900">${(stats.totalOrderValue / 1000).toFixed(1)}K</p>
            <p className="text-xs text-purple-700 mt-2">All time</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-orange-900">Pending Invoices</p>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-900">{stats.pendingInvoices}</p>
            <p className="text-xs text-orange-700 mt-2">
              ${(stats.amountDue / 1000).toFixed(1)}K due
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-900">Documents</p>
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{stats.totalDocuments}</p>
            <p className="text-xs text-green-700 mt-2">Available to download</p>
          </div>
        </div>

        {/* Alert if invoice overdue */}
        {stats.pendingInvoices > 0 && stats.amountDue > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Payment Due</p>
              <p className="text-sm text-red-700 mt-1">
                You have {stats.pendingInvoices} pending invoice{stats.pendingInvoices !== 1 ? "s" : ""} totaling ${(stats.amountDue / 1000).toFixed(1)}K.{" "}
                <button
                  onClick={() => navigate("/client/invoices")}
                  className="underline font-semibold hover:text-red-800"
                >
                  View invoices
                </button>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
              <Button
                variant="ghost"
                onClick={() => navigate("/client/orders")}
                className="text-primary-600"
              >
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>No orders yet</p>
                <p className="text-sm">Your orders will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => navigate(`/client/orders/${order.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">${order.amount || 0}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Invoices</h2>
              <Button
                variant="ghost"
                onClick={() => navigate("/client/invoices")}
                className="text-primary-600"
              >
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {recentInvoices.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>No invoices yet</p>
                <p className="text-sm">Your invoices will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-6 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{invoice.id}</p>
                        <p className="text-sm text-slate-500">
                          Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Not set"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">${invoice.amount || 0}</p>
                      {invoice.status === "paid" && (
                        <p className="text-xs text-green-600 font-medium">✓ Paid</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate("/client/orders")}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center gap-2"
            >
              <Package className="w-6 h-6" />
              <span>Track Orders</span>
            </Button>
            <Button
              onClick={() => navigate("/client/documents")}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center gap-2"
            >
              <FileText className="w-6 h-6" />
              <span>Download Documents</span>
            </Button>
            <Button
              onClick={() => navigate("/client/profile")}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Account Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
