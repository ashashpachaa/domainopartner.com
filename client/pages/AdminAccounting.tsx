import { useState, useMemo } from "react";
import { mockExpenses, mockOrders, mockStaffSalaries, mockBudgets } from "@/lib/mockData";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminAccounting() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calculate revenue from orders
  const revenue = useMemo(() => {
    return mockOrders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.amount, 0);
  }, []);

  // Calculate expenses
  const totalExpenses = useMemo(() => {
    return mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, []);

  // Calculate payroll costs
  const payrollCosts = useMemo(() => {
    return mockStaffSalaries.reduce((sum, s) => sum + s.baseSalary, 0);
  }, []);

  // Calculate budget variance
  const budgetData = useMemo(() => {
    const budgeted = mockBudgets.reduce((sum, b) => sum + b.budgetAmount, 0);
    const actual = mockBudgets.reduce((sum, b) => sum + b.actualAmount, 0);
    return {
      budgeted,
      actual,
      variance: budgeted - actual,
      variancePercent: ((budgeted - actual) / budgeted) * 100,
    };
  }, []);

  // Calculate profit/loss
  const profitLoss = useMemo(() => {
    const gross = revenue - totalExpenses;
    return {
      revenue,
      expenses: totalExpenses,
      payroll: payrollCosts,
      operatingExpenses: totalExpenses - payrollCosts,
      grossProfit: gross,
      netProfit: gross - payrollCosts,
      profitMargin: revenue > 0 ? ((gross / revenue) * 100).toFixed(2) : 0,
    };
  }, [revenue, totalExpenses, payrollCosts]);

  // Expense breakdown by category
  const expensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    mockExpenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    return Object.entries(categories).map(([category, amount]) => ({
      category: category.replace(/_/g, " ").toUpperCase(),
      amount,
      percentage: ((amount / totalExpenses) * 100).toFixed(1),
    }));
  }, [totalExpenses]);

  // Cash flow summary
  const cashFlow = useMemo(() => {
    const paid = mockExpenses.filter((e) => e.status === "paid").reduce((sum, e) => sum + e.amount, 0);
    const pending = mockExpenses.filter((e) => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);
    const overdue = mockExpenses.filter((e) => e.status === "overdue").reduce((sum, e) => sum + e.amount, 0);
    return { paid, pending, overdue, total: paid + pending + overdue };
  }, []);

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleString("default", { month: "long" });
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Accounting Dashboard</h1>
            <p className="text-slate-600 mt-2">View financial overview and manage accounting</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  ${profitLoss.revenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-medium">Total Expenses</p>
                <p className="text-3xl font-bold text-red-900 mt-2">
                  ${profitLoss.expenses.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-200 p-3 rounded-lg">
                <ArrowDownLeft className="w-6 h-6 text-red-700" />
              </div>
            </div>
          </div>

          <div
            className={`bg-gradient-to-br ${
              profitLoss.grossProfit >= 0
                ? "from-blue-50 to-cyan-50 border-blue-200"
                : "from-orange-50 to-red-50 border-orange-200"
            } rounded-lg border p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  profitLoss.grossProfit >= 0
                    ? "text-blue-700"
                    : "text-orange-700"
                }`}>
                  Gross Profit
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  profitLoss.grossProfit >= 0
                    ? "text-blue-900"
                    : "text-orange-900"
                }`}>
                  ${profitLoss.grossProfit.toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${
                  profitLoss.grossProfit >= 0
                    ? "text-blue-600"
                    : "text-orange-600"
                }`}>
                  {profitLoss.profitMargin}% margin
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                profitLoss.grossProfit >= 0
                  ? "bg-blue-200"
                  : "bg-orange-200"
              }`}>
                <TrendingUp className={`w-6 h-6 ${
                  profitLoss.grossProfit >= 0
                    ? "text-blue-700"
                    : "text-orange-700"
                }`} />
              </div>
            </div>
          </div>

          <div
            className={`bg-gradient-to-br ${
              profitLoss.netProfit >= 0
                ? "from-purple-50 to-indigo-50 border-purple-200"
                : "from-red-50 to-pink-50 border-red-200"
            } rounded-lg border p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  profitLoss.netProfit >= 0
                    ? "text-purple-700"
                    : "text-red-700"
                }`}>
                  Net Profit
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  profitLoss.netProfit >= 0
                    ? "text-purple-900"
                    : "text-red-900"
                }`}>
                  ${profitLoss.netProfit.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                profitLoss.netProfit >= 0
                  ? "bg-purple-200"
                  : "bg-red-200"
              }`}>
                <DollarSign className={`w-6 h-6 ${
                  profitLoss.netProfit >= 0
                    ? "text-purple-700"
                    : "text-red-700"
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/expenses">
            <Button className="w-full bg-primary-600 hover:bg-primary-700">
              <DollarSign className="w-4 h-4 mr-2" />
              Manage Expenses
            </Button>
          </Link>
          <Link to="/admin/accounting/profit-loss">
            <Button className="w-full bg-primary-600 hover:bg-primary-700">
              <BarChart className="w-4 h-4 mr-2" />
              Profit & Loss Report
            </Button>
          </Link>
          <Link to="/admin/accounting/vendors">
            <Button className="w-full bg-primary-600 hover:bg-primary-700">
              <FileText className="w-4 h-4 mr-2" />
              Manage Vendors
            </Button>
          </Link>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profit & Loss Summary */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Profit & Loss Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-slate-600">Revenue</span>
                <span className="font-bold text-green-600">${profitLoss.revenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-slate-600">Operating Expenses</span>
                <span className="font-bold text-red-600">-${profitLoss.operatingExpenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-slate-600">Payroll Costs</span>
                <span className="font-bold text-red-600">-${profitLoss.payroll.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-900 font-semibold">Net Profit</span>
                <span className={`text-xl font-bold ${
                  profitLoss.netProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  ${profitLoss.netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Budget vs Actual */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Budget vs Actual</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-slate-600">Total Budget</span>
                <span className="font-bold text-slate-900">${budgetData.budgeted.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-slate-600">Actual Spending</span>
                <span className="font-bold text-slate-900">${budgetData.actual.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-900 font-semibold">Variance (Under/Over)</span>
                <span className={`text-xl font-bold ${
                  budgetData.variance >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {budgetData.variance >= 0 ? "-" : "+"}${Math.abs(budgetData.variance).toLocaleString()}
                  <span className="text-sm ml-2">({budgetData.variancePercent.toFixed(1)}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Categories */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Expense Categories</h2>
            <div className="space-y-3">
              {expensesByCategory.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">{cat.category}</span>
                    <span className="text-sm font-bold text-slate-900">
                      ${cat.amount.toLocaleString()} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${parseFloat(cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cash Flow Status */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Cash Flow Status</h2>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-700 font-medium">Paid</span>
                  <span className="text-2xl font-bold text-green-700">${cashFlow.paid.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-700 font-medium">Pending</span>
                  <span className="text-2xl font-bold text-yellow-700">${cashFlow.pending.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-red-700 font-medium">Overdue</span>
                  <span className="text-2xl font-bold text-red-700">${cashFlow.overdue.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-semibold">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900">Total</span>
                  <span className="text-2xl text-slate-900">${cashFlow.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Reports Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/accounting/balance-sheet">
            <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BarChart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900">Balance Sheet</h3>
              </div>
              <p className="text-sm text-slate-600">View assets, liabilities, and equity</p>
            </div>
          </Link>

          <Link to="/admin/accounting/cash-flow">
            <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-slate-900">Cash Flow</h3>
              </div>
              <p className="text-sm text-slate-600">Monitor cash movement and liquidity</p>
            </div>
          </Link>

          <Link to="/admin/accounting/budget">
            <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-900">Budget Planning</h3>
              </div>
              <p className="text-sm text-slate-600">Track budgets and spending variance</p>
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
