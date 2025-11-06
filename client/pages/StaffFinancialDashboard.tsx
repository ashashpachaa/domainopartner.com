import { useMemo } from "react";
import { DollarSign, TrendingUp, Award, AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { mockOrders, mockInvoices, mockStaff, mockUsers } from "@/lib/mockData";

export default function StaffFinancialDashboard() {
  // Get staff ID from localStorage (set during admin login)
  const staffId = localStorage.getItem("staffId") || "S001";

  // Commission tier structure
  const commissionTiers = {
    tier1: { min: 1, max: 10, fixedAmount: 1000 },
    tier2: { min: 11, max: 20, fixedAmount: 3000 },
    tier3: { min: 21, max: 50, fixedAmount: 5000 },
    tier4: { min: 51, max: Infinity, fixedAmount: 7500 },
  };

  // Calculate current staff's financial metrics
  const financialMetrics = useMemo(() => {
    const staff = mockStaff.find((s) => s.id === staffId);
    if (!staff) {
      return {
        staffName: "Unknown",
        baseSalary: 0,
        currency: "USD",
        paidOrderCount: 0,
        appliedTier: "N/A",
        baseCommission: 0,
        performanceScore: 0,
        performanceBonus: 0,
        totalCommission: 0,
        rejectionFees: 0,
        deductedSalary: 0,
        netSalary: 0,
        pendingInvoices: [],
        pendingCommission: 0,
      };
    }

    // Count paid orders
    const paidOrders = mockOrders.filter((order) => {
      const invoice = mockInvoices.find((inv) => inv.userId === order.userId);
      return order.assignedToSalesId === staffId && invoice?.status === "paid";
    });
    const paidOrderCount = paidOrders.length;

    // Calculate commission tier
    let baseCommission = 0;
    let appliedTier = "Tier 4 (51+)";

    if (paidOrderCount <= 10) {
      baseCommission = paidOrderCount * commissionTiers.tier1.fixedAmount;
      appliedTier = "Tier 1 (1-10)";
    } else if (paidOrderCount <= 20) {
      baseCommission = paidOrderCount * commissionTiers.tier2.fixedAmount;
      appliedTier = "Tier 2 (11-20)";
    } else if (paidOrderCount <= 50) {
      baseCommission = paidOrderCount * commissionTiers.tier3.fixedAmount;
      appliedTier = "Tier 3 (21-50)";
    } else {
      baseCommission = paidOrderCount * commissionTiers.tier4.fixedAmount;
      appliedTier = "Tier 4 (51+)";
    }

    // Calculate performance score
    let performanceScore = 100;
    const rejectedOrders = mockOrders.filter(
      (o) =>
        o.assignedToSalesId === staffId && 
        (o.status.includes("rejected") || o.rejectionReasons.length > 0)
    );
    performanceScore -= rejectedOrders.length * 10;

    const completedOrders = mockOrders.filter((o) => {
      return o.assignedToSalesId === staffId && o.status === "completed";
    });
    performanceScore += Math.min(completedOrders.length * 10, 100 - performanceScore);
    performanceScore = Math.max(0, Math.min(100, performanceScore));

    // Calculate performance bonus
    const performanceBonus = (baseCommission * (performanceScore / 100)) * 0.1;

    // Calculate deductions
    const rejectionFees = rejectedOrders.length * 500; // $500 per rejection
    const baseSalary = 5000; // Default base salary
    const deductedSalary = rejectionFees;
    const netSalary = baseSalary - deductedSalary;

    // Get pending invoices (unpaid invoices from client orders)
    const pendingInvoices = mockInvoices.filter((inv) => {
      const order = mockOrders.find((o) => o.userId === inv.userId);
      return order?.assignedToSalesId === staffId && inv.status === "pending";
    });

    const pendingCommission = pendingInvoices.length > 0 ? baseCommission * 0.5 : 0;

    return {
      staffName: `${staff.firstName} ${staff.lastName}`,
      baseSalary,
      currency: "USD",
      paidOrderCount,
      appliedTier,
      baseCommission: Math.round(baseCommission),
      performanceScore,
      performanceBonus: Math.round(performanceBonus),
      totalCommission: Math.round(baseCommission + performanceBonus),
      rejectionFees,
      rejectedOrderCount: rejectedOrders.length,
      deductedSalary,
      netSalary,
      pendingInvoices,
      pendingCommission: Math.round(pendingCommission),
    };
  }, [staffId]);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome, {financialMetrics.staffName}!
          </h1>
          <p className="text-slate-600">Your financial summary and pending payments</p>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Base Salary */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase">Base Salary</h3>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${(financialMetrics.baseSalary / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-slate-600 mt-2">Monthly base</p>
          </div>

          {/* Commission */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase">Commission</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${(financialMetrics.totalCommission / 1000).toFixed(1)}K
            </p>
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>Base: ${(financialMetrics.baseCommission / 1000).toFixed(1)}K</span>
              <span>+Bonus: ${(financialMetrics.performanceBonus / 1000).toFixed(1)}K</span>
            </div>
          </div>

          {/* Performance Score */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase">Performance</h3>
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  backgroundColor:
                    financialMetrics.performanceScore >= 80
                      ? "#dcfce7"
                      : financialMetrics.performanceScore >= 60
                      ? "#fef3c7"
                      : "#fee2e2",
                  color:
                    financialMetrics.performanceScore >= 80
                      ? "#166534"
                      : financialMetrics.performanceScore >= 60
                      ? "#92400e"
                      : "#991b1b",
                }}
              >
                {financialMetrics.performanceScore}
              </div>
              <div className="text-sm">
                <p className="text-slate-700">Points</p>
                <p className="text-xs text-slate-600 mt-1">
                  {financialMetrics.performanceScore >= 80
                    ? "Excellent"
                    : financialMetrics.performanceScore >= 60
                    ? "Good"
                    : "Needs improvement"}
                </p>
              </div>
            </div>
          </div>

          {/* Deducted Salary */}
          <div className="bg-white rounded-lg p-6 border border-red-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase">Deductions</h3>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">
              -${(financialMetrics.deductedSalary / 1000).toFixed(1)}K
            </p>
            <div className="text-xs text-slate-600 mt-2">
              <p>{financialMetrics.rejectedOrderCount} rejections × $500</p>
            </div>
          </div>

          {/* Net Salary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase">Net Salary</h3>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700">
              ${(financialMetrics.netSalary / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-slate-600 mt-2">Base - Deductions</p>
          </div>

          {/* Pending Payment */}
          <div className="bg-white rounded-lg p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase">Pending Payment</h3>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-amber-600">
              ${(financialMetrics.pendingCommission / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {financialMetrics.pendingInvoices.length} pending invoice(s)
            </p>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Commission Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Paid Orders</span>
              <span className="text-lg font-bold text-slate-900">{financialMetrics.paidOrderCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Applied Tier</span>
              <span className="text-lg font-bold text-blue-600">{financialMetrics.appliedTier}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-slate-700">Base Commission</span>
              <span className="text-lg font-bold text-blue-600">
                ${(financialMetrics.baseCommission / 1000).toFixed(1)}K
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-sm font-medium text-slate-700">Performance Bonus (+{financialMetrics.performanceScore}%)</span>
              <span className="text-lg font-bold text-purple-600">
                +${(financialMetrics.performanceBonus / 1000).toFixed(1)}K
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-bold text-slate-900">Total Commission</span>
              <span className="text-xl font-bold text-green-600">
                ${(financialMetrics.totalCommission / 1000).toFixed(1)}K
              </span>
            </div>
          </div>
        </div>

        {/* Pending Invoices */}
        {financialMetrics.pendingInvoices.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Pending Client Invoices ({financialMetrics.pendingInvoices.length})
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Total pending: ${financialMetrics.pendingInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Invoice</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Client</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Due Date</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Days Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {financialMetrics.pendingInvoices.map((invoice) => {
                    const dueDate = new Date(invoice.dueDate);
                    const today = new Date();
                    const daysOverdue = Math.max(
                      0,
                      Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                    );
                    const user = mockUsers?.find((u) => u.id === invoice.userId);

                    return (
                      <tr key={invoice.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {user?.companyName || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-900">
                          ${(invoice.amount / 1000).toFixed(1)}K
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {dueDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {daysOverdue > 0 ? (
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                              {daysOverdue} days
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                              Due soon
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {financialMetrics.pendingInvoices.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-green-900 font-semibold">No pending invoices</p>
            <p className="text-sm text-green-700 mt-1">All your client invoices have been paid!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
