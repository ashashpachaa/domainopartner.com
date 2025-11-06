import { useState, useMemo } from "react";
import { Download, TrendingUp, DollarSign, Award, AlertCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { mockOrders, mockInvoices, mockStaff, mockUsers } from "@/lib/mockData";

export default function AdminCommissionPayroll() {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [staffSearch, setStaffSearch] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");

  // Commission tier structure
  const commissionTiers = {
    tier1: { min: 1, max: 10, fixedAmount: 1000 },
    tier2: { min: 11, max: 20, fixedAmount: 3000 },
    tier3: { min: 21, max: 50, fixedAmount: 5000 },
    tier4: { min: 51, max: Infinity, fixedAmount: 7500 },
  };

  // Calculate staff metrics including commission and performance bonus
  const staffMetrics = useMemo(() => {
    return mockStaff
      .filter((staff) => staff.role === "sales")
      .map((staff) => {
        // Count paid orders for this staff
        const paidOrders = mockOrders.filter((order) => {
          const invoice = mockInvoices.find((inv) => inv.userId === order.userId);
          return order.assignedToSalesId === staff.id && invoice?.status === "paid";
        });

        const paidOrderCount = paidOrders.length;

        // Calculate commission based on tier
        let commissionAmount = 0;
        let appliedTier = "Tier 4 (51+)";

        if (paidOrderCount <= 10) {
          commissionAmount = paidOrderCount * commissionTiers.tier1.fixedAmount;
          appliedTier = "Tier 1 (1-10)";
        } else if (paidOrderCount <= 20) {
          commissionAmount = paidOrderCount * commissionTiers.tier2.fixedAmount;
          appliedTier = "Tier 2 (11-20)";
        } else if (paidOrderCount <= 50) {
          commissionAmount = paidOrderCount * commissionTiers.tier3.fixedAmount;
          appliedTier = "Tier 3 (21-50)";
        } else {
          commissionAmount = paidOrderCount * commissionTiers.tier4.fixedAmount;
          appliedTier = "Tier 4 (51+)";
        }

        // Calculate performance bonus (max 100 points)
        let performanceScore = 100; // Start at max

        // Count rejected orders (-10 points each)
        const rejectedOrders = mockOrders.filter(
          (o) =>
            o.assignedToSalesId === staff.id && 
            (o.status.includes("rejected") || o.rejectionReasons.length > 0)
        );
        performanceScore -= rejectedOrders.length * 10;

        // Count early completions (+10 points each)
        const earlyCompletions = mockOrders.filter((o) => {
          if (o.assignedToSalesId !== staff.id) return false;
          // Check if order is completed and was completed early (simplified logic)
          return o.status === "completed";
        });
        performanceScore += Math.min(earlyCompletions.length * 10, 100 - performanceScore);

        // Cap performance score at 100 and floor at 0
        performanceScore = Math.max(0, Math.min(100, performanceScore));

        // Calculate performance bonus (10% of base commission per 10 points)
        const performanceBonus = (commissionAmount * (performanceScore / 100)) * 0.1;

        const totalCommission = commissionAmount + performanceBonus;

        // Count pending invoices
        const pendingInvoices = mockInvoices.filter((inv) => {
          const order = mockOrders.find((o) => o.userId === inv.userId);
          return order?.assignedToSalesId === staff.id && inv.status === "pending";
        });

        return {
          staffId: staff.id,
          staffName: `${staff.firstName} ${staff.lastName}`,
          role: staff.role,
          currency: "USD", // Default currency
          paidOrderCount,
          rejectedOrderCount: rejectedOrders.length,
          earlyCompletions: earlyCompletions.length,
          appliedTier,
          baseCommission: commissionAmount,
          performanceScore,
          performanceBonus: Math.round(performanceBonus),
          totalCommission: Math.round(totalCommission),
          pendingInvoices: pendingInvoices.length,
        };
      });
  }, []);

  const selectedStaffMetrics = selectedStaffId
    ? staffMetrics.find((m) => m.staffId === selectedStaffId)
    : null;

  const filteredStaffMetrics = staffMetrics.filter((metric) => {
    const matchesSearch = !staffSearch ||
      metric.staffName.toLowerCase().includes(staffSearch.toLowerCase());

    const matchesTier = !tierFilter || metric.appliedTier === tierFilter;

    return matchesSearch && matchesTier;
  });

  const globalMetrics = {
    totalStaff: filteredStaffMetrics.length,
    totalCommission: filteredStaffMetrics.reduce((sum, m) => sum + m.totalCommission, 0),
    avgCommission:
      filteredStaffMetrics.length > 0
        ? Math.round(filteredStaffMetrics.reduce((sum, m) => sum + m.totalCommission, 0) / filteredStaffMetrics.length)
        : 0,
    totalPerformanceBonus: filteredStaffMetrics.reduce((sum, m) => sum + m.performanceBonus, 0),
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-blue-600" />
            Commission & Payroll
          </h1>
          <p className="text-slate-600">
            Tier-based commission calculations with performance bonuses
          </p>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Total Commission</p>
                <p className="text-3xl font-bold text-slate-900">
                  ${(globalMetrics.totalCommission / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-slate-500 mt-2">{staffMetrics.length} sales staff</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Avg Commission</p>
                <p className="text-3xl font-bold text-slate-900">${globalMetrics.avgCommission}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Performance Bonus</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${(globalMetrics.totalPerformanceBonus / 1000).toFixed(1)}K
                </p>
              </div>
              <Award className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Commission Structure</p>
                <p className="text-sm font-bold text-slate-900 mt-2">Tier-Based</p>
                <p className="text-xs text-slate-500">1-10: $1K | 11-20: $3K | 21-50: $5K | 51+: $7.5K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Tiers Explanation */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Commission Tier Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-bold text-blue-900">Tier 1</p>
              <p className="text-xs text-blue-800 mt-1">Orders 1–10</p>
              <p className="text-lg font-bold text-blue-600 mt-2">$1,000</p>
              <p className="text-xs text-blue-700 mt-1">per paid order</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-bold text-green-900">Tier 2</p>
              <p className="text-xs text-green-800 mt-1">Orders 11–20</p>
              <p className="text-lg font-bold text-green-600 mt-2">$3,000</p>
              <p className="text-xs text-green-700 mt-1">per paid order</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-bold text-purple-900">Tier 3</p>
              <p className="text-xs text-purple-800 mt-1">Orders 21–50</p>
              <p className="text-lg font-bold text-purple-600 mt-2">$5,000</p>
              <p className="text-xs text-purple-700 mt-1">per paid order</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm font-bold text-orange-900">Tier 4</p>
              <p className="text-xs text-orange-800 mt-1">Orders 51+</p>
              <p className="text-lg font-bold text-orange-600 mt-2">$7,500</p>
              <p className="text-xs text-orange-700 mt-1">per paid order</p>
            </div>
          </div>
        </div>

        {/* Performance Bonus Explanation */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Performance Bonus Calculation</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-green-600 text-white">
                  +10
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-green-900">Early Completion Bonus</p>
                <p className="text-xs text-green-700">+10 points for each order completed before deadline</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-red-600 text-white">
                  -10
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-red-900">Rejection Penalty</p>
                <p className="text-xs text-red-700">-10 points for each rejected order review</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white">
                  MAX
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900">Maximum Performance Score</p>
                <p className="text-xs text-blue-700">100 points max (affects commission by 10% per 100 points)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Staff</label>
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Search by staff name..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Commission Tier</label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white"
              >
                <option value="">All Tiers</option>
                <option value="Tier 1 (1-10)">Tier 1 (1-10)</option>
                <option value="Tier 2 (11-20)">Tier 2 (11-20)</option>
                <option value="Tier 3 (21-50)">Tier 3 (21-50)</option>
                <option value="Tier 4 (51+)">Tier 4 (51+)</option>
              </select>
            </div>

            {(staffSearch || tierFilter) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStaffSearch("");
                    setTierFilter("");
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Per-Staff Commission Details */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Sales Staff Commission Breakdown
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Staff Name</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Paid Orders</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Tier Applied</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Base Commission</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Performance</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Bonus</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staffMetrics.map((metric) => (
                  <tr key={metric.staffId} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{metric.staffName}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                        {metric.paidOrderCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{metric.appliedTier}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      ${(metric.baseCommission / 1000).toFixed(1)}K
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor:
                              metric.performanceScore >= 80
                                ? "#dcfce7"
                                : metric.performanceScore >= 60
                                ? "#fef3c7"
                                : "#fee2e2",
                            color:
                              metric.performanceScore >= 80
                                ? "#166534"
                                : metric.performanceScore >= 60
                                ? "#92400e"
                                : "#991b1b",
                          }}
                        >
                          {metric.performanceScore}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-purple-600">
                      ${(metric.performanceBonus / 1000).toFixed(1)}K
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-lg text-slate-900">
                      ${(metric.totalCommission / 1000).toFixed(1)}K
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {staffMetrics.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-600">No sales staff found</p>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="mt-8 flex justify-end">
          <Button
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            onClick={() => {
              const csv = [
                ["Commission & Payroll Report", "Generated: " + new Date().toLocaleDateString()],
                [""],
                [
                  "Staff Name",
                  "Paid Orders",
                  "Tier Applied",
                  "Base Commission",
                  "Performance Score",
                  "Performance Bonus",
                  "Total Commission",
                ],
                ...staffMetrics.map((m) => [
                  m.staffName,
                  m.paidOrderCount,
                  m.appliedTier,
                  `$${m.baseCommission}`,
                  m.performanceScore,
                  `$${m.performanceBonus}`,
                  `$${m.totalCommission}`,
                ]),
              ]
                .map((r) => r.join(","))
                .join("\n");

              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `commission_payroll_${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
            }}
          >
            <Download className="w-4 h-4" />
            Export Commission Report
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
