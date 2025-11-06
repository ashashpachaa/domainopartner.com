import { useState, useMemo } from "react";
import { Download, TrendingUp, DollarSign, Package, Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { mockOrders, mockInvoices, mockStaff, mockUsers } from "@/lib/mockData";

export default function AdminSalesReport() {
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "year" | "custom">("month");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7));
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [staffSearch, setStaffSearch] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");

  // Calculate monthly sales
  const monthlySales = useMemo(() => {
    const salesByMonth: Record<string, number> = {};
    
    mockOrders.forEach((order) => {
      const month = order.createdAt.substring(0, 7);
      if (!salesByMonth[month]) salesByMonth[month] = 0;
      salesByMonth[month] += order.amount || 0;
    });

    return Object.entries(salesByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({
        month,
        total,
        monthName: new Date(month + "-01").toLocaleString("default", { month: "long", year: "numeric" }),
      }));
  }, []);

  // Calculate date range for filtering
  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (dateRange === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else if (dateRange === "quarter") {
      startDate.setMonth(now.getMonth() - 3);
    } else if (dateRange === "year") {
      startDate.setFullYear(now.getFullYear() - 1);
    } else if (dateRange === "custom") {
      if (customStartDate) startDate = new Date(customStartDate);
      if (customEndDate) endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  // Calculate per-staff metrics
  const staffMetrics = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    const metrics: Record<
      string,
      {
        staffId: string;
        staffName: string;
        department: string;
        ordersCreated: number;
        totalOrderValue: number;
        avgOrderValue: number;
        invoicesIssued: number;
        invoicesPaid: number;
        invoicesPending: number;
        invoicesPaidAmount: number;
        invoicesPendingAmount: number;
      }
    > = {};

    // Process orders by sales staff
    mockOrders.forEach((order) => {
      const salesStaffId = order.assignedToSalesId;
      if (!salesStaffId) return;

      const orderDate = new Date(order.createdAt);
      if (orderDate < startDate || orderDate > endDate) return;

      if (!metrics[salesStaffId]) {
        const staff = mockStaff.find((s) => s.id === salesStaffId);
        metrics[salesStaffId] = {
          staffId: salesStaffId,
          staffName: staff ? `${staff.firstName} ${staff.lastName}` : "Unknown",
          department: staff?.department || "Unknown",
          ordersCreated: 0,
          totalOrderValue: 0,
          avgOrderValue: 0,
          invoicesIssued: 0,
          invoicesPaid: 0,
          invoicesPending: 0,
          invoicesPaidAmount: 0,
          invoicesPendingAmount: 0,
        };
      }

      metrics[salesStaffId].ordersCreated += 1;
      metrics[salesStaffId].totalOrderValue += order.amount || 0;
    });

    // Process invoices
    mockInvoices.forEach((invoice) => {
      const order = mockOrders.find((o) => o.userId === invoice.userId);
      const salesStaffId = order?.assignedToSalesId;

      if (salesStaffId && metrics[salesStaffId]) {
        metrics[salesStaffId].invoicesIssued += 1;

        if (invoice.status === "paid") {
          metrics[salesStaffId].invoicesPaid += 1;
          metrics[salesStaffId].invoicesPaidAmount += invoice.amount || 0;
        } else if (invoice.status === "pending") {
          metrics[salesStaffId].invoicesPending += 1;
          metrics[salesStaffId].invoicesPendingAmount += invoice.amount || 0;
        }
      }
    });

    // Calculate averages
    Object.keys(metrics).forEach((staffId) => {
      const data = metrics[staffId];
      data.avgOrderValue = data.ordersCreated > 0 ? Math.round(data.totalOrderValue / data.ordersCreated) : 0;
    });

    // Filter by staff search and department
    let filtered = Object.values(metrics);
    if (staffSearch) {
      filtered = filtered.filter(
        (s) =>
          s.staffName.toLowerCase().includes(staffSearch.toLowerCase()) ||
          s.department.toLowerCase().includes(staffSearch.toLowerCase())
      );
    }
    if (departmentFilter) {
      filtered = filtered.filter((s) => s.department === departmentFilter);
    }

    return filtered.sort((a, b) => b.totalOrderValue - a.totalOrderValue);
  }, [dateRange, customStartDate, customEndDate, staffSearch, departmentFilter]);

  const globalMetrics = {
    totalSales: mockOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
    totalOrders: mockOrders.length,
    avgOrderValue: mockOrders.length > 0 ? Math.round(mockOrders.reduce((sum, o) => sum + (o.amount || 0), 0) / mockOrders.length) : 0,
    totalInvoices: mockInvoices.length,
    invoicesPaid: mockInvoices.filter((i) => i.status === "paid").length,
    invoicesPending: mockInvoices.filter((i) => i.status === "pending").length,
    paidAmount: mockInvoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + (i.amount || 0), 0),
    pendingAmount: mockInvoices.filter((i) => i.status === "pending").reduce((sum, i) => sum + (i.amount || 0), 0),
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Sales Report
          </h1>
          <p className="text-slate-600">
            Comprehensive sales metrics, order tracking, and invoice management across all staff
          </p>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-slate-900">
                  ${(globalMetrics.totalSales / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-slate-500 mt-2">{globalMetrics.totalOrders} orders</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Avg Order Value</p>
                <p className="text-3xl font-bold text-slate-900">${globalMetrics.avgOrderValue}</p>
              </div>
              <Package className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Invoices Paid</p>
                <p className="text-3xl font-bold text-green-600">${(globalMetrics.paidAmount / 1000).toFixed(1)}K</p>
                <p className="text-xs text-slate-500 mt-2">{globalMetrics.invoicesPaid} invoices</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Invoices Pending</p>
                <p className="text-3xl font-bold text-amber-600">${(globalMetrics.pendingAmount / 1000).toFixed(1)}K</p>
                <p className="text-xs text-slate-500 mt-2">{globalMetrics.invoicesPending} invoices</p>
              </div>
              <AlertCircle className="w-10 h-10 text-amber-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Monthly Sales Trend
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthlySales.map((item) => {
              const maxSales = Math.max(...monthlySales.map((m) => m.total));
              const percentage = (item.total / maxSales) * 100;
              return (
                <div key={item.month} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-900">{item.monthName}</span>
                    <span className="text-sm font-bold text-blue-600">${(item.total / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-Staff Detailed Report */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Sales Staff Performance
            </h2>
            <p className="text-sm text-slate-600 mt-1">Detailed metrics for each sales representative</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Staff Name</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Orders</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Order Total</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Avg Order</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Invoices</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Paid</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Paid Amount</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Pending</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Pending Amount</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Collection Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staffMetrics.map((staff, idx) => {
                  const collectionRate =
                    staff.invoicesIssued > 0
                      ? Math.round((staff.invoicesPaid / staff.invoicesIssued) * 100)
                      : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">{staff.staffName}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {staff.ordersCreated}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        ${(staff.totalOrderValue / 1000).toFixed(1)}K
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700">${staff.avgOrderValue}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-900">
                        {staff.invoicesIssued}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {staff.invoicesPaid}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        ${(staff.invoicesPaidAmount / 1000).toFixed(1)}K
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                          {staff.invoicesPending}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-amber-600">
                        ${(staff.invoicesPendingAmount / 1000).toFixed(1)}K
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                              backgroundColor:
                                collectionRate >= 90
                                  ? "#dcfce7"
                                  : collectionRate >= 70
                                  ? "#fef3c7"
                                  : "#fee2e2",
                              color:
                                collectionRate >= 90
                                  ? "#166534"
                                  : collectionRate >= 70
                                  ? "#92400e"
                                  : "#991b1b",
                            }}
                          >
                            {collectionRate}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {staffMetrics.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-600">No sales data available</p>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="mt-8 flex justify-end gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              const csv = [
                ["Sales Staff Report", "Generated: " + new Date().toLocaleDateString()],
                [""],
                ["Staff Name", "Orders", "Order Total", "Avg Order", "Invoices", "Paid", "Paid Amount", "Pending", "Pending Amount", "Collection Rate"],
                ...staffMetrics.map((s) => [
                  s.staffName,
                  s.ordersCreated,
                  `$${s.totalOrderValue}`,
                  `$${s.avgOrderValue}`,
                  s.invoicesIssued,
                  s.invoicesPaid,
                  `$${s.invoicesPaidAmount}`,
                  s.invoicesPending,
                  `$${s.invoicesPendingAmount}`,
                  `${Math.round((s.invoicesPaid / s.invoicesIssued) * 100)}%`,
                ]),
              ]
                .map((r) => r.join(","))
                .join("\n");

              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `sales_report_${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
            }}
          >
            <Download className="w-4 h-4" />
            Export Staff Report CSV
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            onClick={() => {
              const csv = [
                ["Monthly Sales Report", "Generated: " + new Date().toLocaleDateString()],
                [""],
                ["Month", "Total Sales"],
                ...monthlySales.map((m) => [m.monthName, `$${m.total}`]),
              ]
                .map((r) => r.join(","))
                .join("\n");

              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `monthly_sales_report_${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
            }}
          >
            <Download className="w-4 h-4" />
            Export Monthly Sales CSV
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
