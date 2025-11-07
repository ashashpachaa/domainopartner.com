import { useState, useMemo } from "react";
import { mockExpenses, mockOrders, mockStaffSalaries } from "@/lib/mockData";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function AdminProfitLoss() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Calculate monthly P&L data
  const pnlData = useMemo(() => {
    const months: Record<number, any> = {};

    for (let m = 1; m <= 12; m++) {
      const monthRevenue = mockOrders
        .filter((o) => o.status === "completed")
        .reduce((sum) => sum + o.amount, 0) / 12; // Simplified: distribute evenly

      const monthExpenses = mockExpenses
        .filter((e) => new Date(e.date).getMonth() + 1 === m)
        .reduce((sum, e) => sum + e.amount, 0);

      const monthPayroll = mockStaffSalaries.reduce((sum, s) => sum + s.baseSalary, 0) / 12;

      const cogs = monthRevenue * 0.3; // 30% COGS
      const grossProfit = monthRevenue - cogs;
      const operatingExpenses = monthExpenses - monthPayroll;
      const operatingIncome = grossProfit - operatingExpenses;
      const interestExpense = operatingIncome > 0 ? operatingIncome * 0.05 : 0;
      const taxExpense = Math.max(0, (operatingIncome - interestExpense) * 0.21);
      const netProfit = operatingIncome - interestExpense - taxExpense;

      months[m] = {
        month: m,
        revenue: monthRevenue,
        cogs,
        grossProfit,
        operatingExpenses,
        payrollCosts: monthPayroll,
        otherExpenses: operatingExpenses - monthPayroll,
        operatingIncome,
        interestExpense,
        taxExpense,
        netProfit,
        profitMargin: monthRevenue > 0 ? ((netProfit / monthRevenue) * 100).toFixed(2) : 0,
      };
    }

    return months;
  }, []);

  const selectedMonthData = pnlData[selectedMonth];

  const annualSummary = useMemo(() => {
    const totalRevenue = Object.values(pnlData).reduce((sum: number, m: any) => sum + m.revenue, 0);
    const totalCogs = Object.values(pnlData).reduce((sum: number, m: any) => sum + m.cogs, 0);
    const totalOperatingExpenses = Object.values(pnlData).reduce(
      (sum: number, m: any) => sum + m.operatingExpenses,
      0
    );
    const totalInterest = Object.values(pnlData).reduce(
      (sum: number, m: any) => sum + m.interestExpense,
      0
    );
    const totalTax = Object.values(pnlData).reduce(
      (sum: number, m: any) => sum + m.taxExpense,
      0
    );
    const totalNetProfit = Object.values(pnlData).reduce(
      (sum: number, m: any) => sum + m.netProfit,
      0
    );

    return {
      totalRevenue,
      totalCogs,
      totalOperatingExpenses,
      totalInterest,
      totalTax,
      totalNetProfit,
      profitMargin: totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100).toFixed(2) : 0,
    };
  }, [pnlData]);

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleString("default", { month: "long" });
  };

  const downloadPDF = () => {
    const content = `
PROFIT & LOSS STATEMENT
${getMonthName(selectedMonth)} ${selectedYear}

REVENUE
  Total Sales Revenue: $${selectedMonthData.revenue.toLocaleString()}

COST OF GOODS SOLD
  Cost of Goods Sold: $${selectedMonthData.cogs.toLocaleString()}
  GROSS PROFIT: $${selectedMonthData.grossProfit.toLocaleString()}

OPERATING EXPENSES
  Payroll Costs: $${selectedMonthData.payrollCosts.toLocaleString()}
  Other Operating Expenses: $${selectedMonthData.otherExpenses.toLocaleString()}
  Total Operating Expenses: $${selectedMonthData.operatingExpenses.toLocaleString()}
  OPERATING INCOME: $${selectedMonthData.operatingIncome.toLocaleString()}

OTHER INCOME/EXPENSE
  Interest Expense: $${selectedMonthData.interestExpense.toLocaleString()}
  Income Before Taxes: $${(selectedMonthData.operatingIncome - selectedMonthData.interestExpense).toLocaleString()}

TAXES
  Income Tax Expense: $${selectedMonthData.taxExpense.toLocaleString()}

NET PROFIT: $${selectedMonthData.netProfit.toLocaleString()}
Profit Margin: ${selectedMonthData.profitMargin}%
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PL_${getMonthName(selectedMonth)}_${selectedYear}.txt`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Profit & Loss Statement</h1>
            <p className="text-slate-600 mt-2">Detailed income and expense analysis</p>
          </div>
          <Button onClick={downloadPDF} className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        {/* Period Selection */}
        <div className="flex gap-4">
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

        {/* Monthly P&L Statement */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">
              {getMonthName(selectedMonth)} {selectedYear}
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
            {/* Revenue Section */}
            <div className="p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-lg">REVENUE</h3>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between text-slate-600">
                  <span>Total Sales Revenue</span>
                  <span>${selectedMonthData.revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* COGS Section */}
            <div className="p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-lg">COST OF GOODS SOLD</h3>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between text-slate-600">
                  <span>Cost of Goods Sold (30% of revenue)</span>
                  <span>-${selectedMonthData.cogs.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-lg pt-2 border-t border-slate-200">
                <span>GROSS PROFIT</span>
                <span className="text-green-600">${selectedMonthData.grossProfit.toLocaleString()}</span>
              </div>
            </div>

            {/* Operating Expenses Section */}
            <div className="p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-lg">OPERATING EXPENSES</h3>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between text-slate-600">
                  <span>Payroll & Benefits</span>
                  <span>-${selectedMonthData.payrollCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Other Operating Expenses</span>
                  <span>-${selectedMonthData.otherExpenses.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-lg pt-2 border-t border-slate-200">
                <span>TOTAL OPERATING EXPENSES</span>
                <span>-${selectedMonthData.operatingExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-lg pt-2">
                <span>OPERATING INCOME</span>
                <span className="text-blue-600">${selectedMonthData.operatingIncome.toLocaleString()}</span>
              </div>
            </div>

            {/* Other Income/Expense Section */}
            <div className="p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-lg">OTHER INCOME / EXPENSE</h3>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between text-slate-600">
                  <span>Interest Expense</span>
                  <span>-${selectedMonthData.interestExpense.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-lg pt-2 border-t border-slate-200">
                <span>INCOME BEFORE TAXES</span>
                <span>${(selectedMonthData.operatingIncome - selectedMonthData.interestExpense).toLocaleString()}</span>
              </div>
            </div>

            {/* Tax Section */}
            <div className="p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-lg">TAXES</h3>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between text-slate-600">
                  <span>Income Tax Expense (21%)</span>
                  <span>-${selectedMonthData.taxExpense.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Profit Section */}
            <div className={`p-6 space-y-3 ${
              selectedMonthData.netProfit >= 0
                ? "bg-green-50 border-t border-green-200"
                : "bg-red-50 border-t border-red-200"
            }`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-2xl font-bold ${
                  selectedMonthData.netProfit >= 0
                    ? "text-green-900"
                    : "text-red-900"
                }`}>
                  NET PROFIT / LOSS
                </h3>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${
                    selectedMonthData.netProfit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    ${selectedMonthData.netProfit.toLocaleString()}
                  </p>
                  <p className={`text-sm mt-1 ${
                    selectedMonthData.netProfit >= 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}>
                    Profit Margin: {selectedMonthData.profitMargin}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Annual Summary */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Annual Summary {selectedYear}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-slate-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ${annualSummary.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total COGS</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                -${annualSummary.totalCogs.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Operating Expenses</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                -${annualSummary.totalOperatingExpenses.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Interest Expense</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                -${annualSummary.totalInterest.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total Tax</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                -${annualSummary.totalTax.toLocaleString()}
              </p>
            </div>
            <div className={`rounded-lg border-2 p-4 ${
              annualSummary.totalNetProfit >= 0
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
              <p className={`text-sm font-medium ${
                annualSummary.totalNetProfit >= 0
                  ? "text-green-700"
                  : "text-red-700"
              }`}>
                Annual Net Profit
              </p>
              <p className={`text-2xl font-bold mt-2 ${
                annualSummary.totalNetProfit >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                ${annualSummary.totalNetProfit.toLocaleString()}
              </p>
              <p className={`text-xs mt-1 ${
                annualSummary.totalNetProfit >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                Margin: {annualSummary.profitMargin}%
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Monthly Trend</h2>
          <div className="space-y-2">
            {Object.values(pnlData).map((month: any) => (
              <div key={month.month} className="flex items-center gap-4">
                <div className="w-24">
                  <p className="text-sm font-medium text-slate-600">{getMonthName(month.month)}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 h-8">
                    {month.netProfit >= 0 ? (
                      <>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <div className="bg-green-200 h-6 rounded" style={{ width: `${Math.min(
                            (month.netProfit / Math.max(...Object.values(pnlData).map((m: any) => m.netProfit))) * 300,
                            300
                          )}px` }} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <div className="bg-red-200 h-6 rounded" style={{ width: `${Math.min(
                            Math.abs(month.netProfit) / Math.max(...Object.values(pnlData).map((m: any) => Math.abs(m.netProfit))) * 300,
                            300
                          )}px` }} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-32 text-right">
                  <p className={`text-sm font-bold ${month.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${month.netProfit.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
