import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  TrendingDown,
  Zap,
  XCircle,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  mockStaffCommissions,
  mockStaffCommissionHistory,
  mockStaff,
  mockStaffSalaries,
  mockStaffPerformances,
  StaffCommission,
  StaffCommissionHistory,
} from "@/lib/mockData";

// Mock: In real app, get staffId from auth context
const CURRENT_STAFF_ID = "S003";

export default function StaffDashboard() {
  const staff = mockStaff.find((s) => s.id === CURRENT_STAFF_ID);
  const commission = mockStaffCommissions.find(
    (c) => c.staffId === CURRENT_STAFF_ID
  );
  const commissionHistory = mockStaffCommissionHistory.filter(
    (h) => h.staffId === CURRENT_STAFF_ID
  );
  const salary = mockStaffSalaries.find((s) => s.staffId === CURRENT_STAFF_ID);
  const performance = mockStaffPerformances.find(
    (p) => p.staffId === CURRENT_STAFF_ID
  );

  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "paid">(
    "all"
  );

  const filteredHistory = useMemo(() => {
    let filtered = commissionHistory;

    if (filterStatus !== "all") {
      filtered = filtered.filter((h) => h.status === filterStatus);
    }

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return b.totalCommission - a.totalCommission;
      }
    });

    return filtered;
  }, [commissionHistory, filterStatus, sortBy]);

  if (!staff || !commission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="gap-2 text-slate-600">
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-slate-600">
              Commission data not available
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentTier = () => {
    const totalOrders = commissionHistory.length;
    return commission.tiers.find(
      (t) =>
        totalOrders >= t.orderCountMin && totalOrders <= t.orderCountMax
    );
  };

  const currentTier = getCurrentTier();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Commission Dashboard
            </h1>
            <p className="text-slate-600 mt-2">
              Welcome, {staff.firstName} {staff.lastName}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {/* Commission Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Earned */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Earned
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {commission.currency}{" "}
                  {commission.totalEarned.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Paid Amount */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Paid Amount
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {commission.currency}{" "}
                  {commission.paidAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {((commission.paidAmount / commission.totalEarned) * 100).toFixed(
                    1
                  )}
                  %
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Amount */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Pending Amount
                </p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {commission.currency}{" "}
                  {commission.pendingAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {((commission.pendingAmount / commission.totalEarned) * 100).toFixed(
                    1
                  )}
                  %
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Current Tier */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Current Tier
                </p>
                <p className="text-2xl font-bold text-primary-600 mt-2">
                  {currentTier?.description || "Not Qualified"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {commissionHistory.length} orders completed
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Commission Structure */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Commission Structure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commission.tiers.map((tier) => (
              <div
                key={tier.id}
                className={`p-4 rounded-lg border-2 transition ${
                  currentTier?.id === tier.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {tier.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {tier.orderCountMin} - {tier.orderCountMax} orders
                    </p>
                  </div>
                  {currentTier?.id === tier.id && (
                    <span className="px-2 py-1 text-xs font-semibold bg-primary-600 text-white rounded">
                      Active
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">{tier.percentageRate}%</span> of invoice amount
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">+{commission.currency} {tier.fixedAmount}</span> fixed amount
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commission History */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Commission History
            </h2>
            <div className="flex gap-3 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "all" | "pending" | "paid"
                  )
                }
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary-600"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary-600"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Order Count
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Invoice Amount
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Commission Breakdown
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">
                    Total Commission
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-600">
                      No commission history found
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {record.invoiceId}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(record.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                          {record.orderCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {record.currency} {record.invoiceAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <div className="space-y-1">
                          <p>
                            {record.commissionPercentage.toFixed(2)}{" "}
                            ({record.appliedTier.percentageRate}%)
                          </p>
                          <p>
                            +{record.currency}{" "}
                            {record.commissionFixed.toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {record.currency}{" "}
                        {record.totalCommission.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {record.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
            Showing {filteredHistory.length} of {commissionHistory.length}{" "}
            commission records
          </div>
        </div>

        {/* Salary Information */}
        {salary && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Salary Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-semibold text-green-600 uppercase mb-1">
                  Base Salary
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {salary.currency} {salary.baseSalary.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">Monthly</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs font-semibold text-amber-600 uppercase mb-1">
                  Underperformance Deduction
                </p>
                <p className="text-2xl font-bold text-amber-700">
                  -{salary.currency} {salary.underperformanceDeduction.toLocaleString()}
                </p>
                <p className="text-xs text-amber-600 mt-1">If score {" < "} {salary.underperformanceThreshold}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
                  Next Payment
                </p>
                <p className="text-lg font-bold text-blue-700">
                  {new Date(salary.nextSalaryDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-blue-600 mt-1">Scheduled date</p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Score */}
        {performance && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                Performance Score
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Score */}
                <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
                  <p className="text-xs font-semibold text-primary-600 uppercase mb-2">
                    Current Score
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-4xl font-bold text-primary-900">
                      {performance.currentScore}
                    </p>
                    <p className="text-sm text-primary-600">/100</p>
                  </div>
                  {performance.currentScore < 60 && (
                    <p className="text-xs text-red-600 mt-2 font-semibold">
                      ⚠️ Below threshold - Salary deduction active
                    </p>
                  )}
                </div>

                {/* Early Completions */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-600 uppercase mb-2">
                    Early Completions
                  </p>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <p className="text-3xl font-bold text-green-900">
                      {performance.earlyCompletions}
                    </p>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    +{performance.earlyCompletions * 10} points earned
                  </p>
                </div>

                {/* Rejections */}
                <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                  <p className="text-xs font-semibold text-red-600 uppercase mb-2">
                    Rejections
                  </p>
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <p className="text-3xl font-bold text-red-900">
                      {performance.rejections}
                    </p>
                  </div>
                  <p className="text-xs text-red-700 mt-2">
                    -{performance.rejections * 10} points deducted
                  </p>
                </div>
              </div>

              {/* Performance History */}
              {performance.performanceHistory.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Recent Activity
                  </h3>
                  <div className="space-y-2">
                    {performance.performanceHistory
                      .slice(0, 5)
                      .map((record) => (
                        <div
                          key={record.id}
                          className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          {record.type === "early_completion" ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm text-slate-900">
                              {record.description}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(record.createdAt).toLocaleDateString()}
                              {" • "}
                              <span
                                className={
                                  record.pointsChange >= 0
                                    ? "text-green-600 font-semibold"
                                    : "text-red-600 font-semibold"
                                }
                              >
                                {record.pointsChange > 0 ? "+" : ""}
                                {record.pointsChange} pts
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-4">
            How Commission Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-800 mb-2">
                <span className="font-semibold">Tier-Based System:</span> Your commission rate improves as you complete more orders.
              </p>
            </div>
            <div>
              <p className="text-blue-800">
                <span className="font-semibold">Commission Calculation:</span> (Invoice Amount × Percentage Rate) + Fixed Amount per tier.
              </p>
            </div>
            <div>
              <p className="text-blue-800 mb-2">
                <span className="font-semibold">Payment Status:</span> Paid commissions have been transferred to your account.
              </p>
            </div>
            <div>
              <p className="text-blue-800">
                <span className="font-semibold">Pending Commissions:</span> Awaiting confirmation and payment processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
