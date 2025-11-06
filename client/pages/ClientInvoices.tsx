import { useState, useMemo } from "react";
import { mockInvoices, mockOrders } from "@/lib/mockData";
import ClientLayout from "@/components/ClientLayout";
import { Button } from "@/components/ui/button";
import { Download, FileText, DollarSign } from "lucide-react";

export default function ClientInvoices() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const clientInvoices = useMemo(() => {
    let invoices = mockInvoices.filter((i) => i.userId === currentUser.id);

    if (filterStatus !== "all") {
      invoices = invoices.filter((i) => i.status === filterStatus);
    }

    return invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser.id, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: clientInvoices.reduce((sum, i) => sum + (i.amount || 0), 0),
      paid: clientInvoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + (i.amount || 0), 0),
      pending: clientInvoices
        .filter((i) => i.status === "pending")
        .reduce((sum, i) => sum + (i.amount || 0), 0),
    };
  }, [clientInvoices]);

  const getStatusColor = (status: string) => {
    if (status === "paid") return "bg-green-100 text-green-800";
    if (status === "overdue") return "bg-red-100 text-red-800";
    if (status === "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-slate-100 text-slate-800";
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-600 mt-2">View and manage your invoices</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
            <p className="text-sm text-slate-600 mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-slate-900">${(stats.total / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <p className="text-sm text-green-700 mb-2">Paid</p>
            <p className="text-3xl font-bold text-green-900">${(stats.paid / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
            <p className="text-sm text-yellow-700 mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-900">${(stats.pending / 1000).toFixed(1)}K</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex gap-2 flex-wrap">
            {(["all", "paid", "pending", "overdue"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices List */}
        {clientInvoices.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium">No invoices found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Invoice ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Issue Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Due Date</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clientInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{invoice.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">${invoice.amount || 0}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = invoice.pdfUrl || "#";
                            link.download = `${invoice.id}.pdf`;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
