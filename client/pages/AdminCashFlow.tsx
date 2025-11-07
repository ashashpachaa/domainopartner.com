import { useMemo } from "react";
import { mockOrders, mockExpenses, mockStaffSalaries } from "@/lib/mockData";
import AdminLayout from "@/components/AdminLayout";
import { Download, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCashFlow() {
  const cashFlowData = useMemo(() => {
    // Operating Activities
    const netIncome =
      mockOrders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + o.amount, 0) -
      mockExpenses.reduce((sum, e) => sum + e.amount, 0);

    const depreciationAmortization = 5000;
    const changesInWorkingCapital =
      mockOrders
        .filter((o) => o.status === "awaiting_client_acceptance")
        .reduce((sum, o) => sum + o.amount, 0) -
      mockExpenses
        .filter((e) => e.status === "pending" || e.status === "overdue")
        .reduce((sum, e) => sum + e.amount, 0);

    const operatingCashFlow =
      netIncome + depreciationAmortization + changesInWorkingCapital;

    // Investing Activities
    const capitalExpenditures = 15000;
    const otherInvestments = 5000;
    const investingCashFlow = -(capitalExpenditures + otherInvestments);

    // Financing Activities
    const debtRepayment = 10000;
    const equityRaised = 0;
    const dividendsPaid = 5000;
    const financingCashFlow = equityRaised - debtRepayment - dividendsPaid;

    // Summary
    const netCashChange =
      operatingCashFlow + investingCashFlow + financingCashFlow;
    const beginningCashBalance = 100000;
    const endingCashBalance = beginningCashBalance + netCashChange;

    return {
      operating: {
        netIncome,
        depreciationAmortization,
        changesInWorkingCapital,
        total: operatingCashFlow,
      },
      investing: {
        capitalExpenditures,
        otherInvestments,
        total: investingCashFlow,
      },
      financing: {
        debtRepayment,
        equityRaised,
        dividendsPaid,
        total: financingCashFlow,
      },
      netCashChange,
      beginningCashBalance,
      endingCashBalance,
    };
  }, []);

  const downloadPDF = () => {
    const content = `
STATEMENT OF CASH FLOWS
For the Year Ended ${new Date().getFullYear()}

OPERATING ACTIVITIES
  Net Income: $${cashFlowData.operating.netIncome.toLocaleString()}
  Adjustments to reconcile net income to cash flow:
    Depreciation & Amortization: $${cashFlowData.operating.depreciationAmortization.toLocaleString()}
    Changes in Working Capital: $${cashFlowData.operating.changesInWorkingCapital.toLocaleString()}
  Net Cash from Operating Activities: $${cashFlowData.operating.total.toLocaleString()}

INVESTING ACTIVITIES
  Capital Expenditures: -$${cashFlowData.investing.capitalExpenditures.toLocaleString()}
  Other Investments: -$${cashFlowData.investing.otherInvestments.toLocaleString()}
  Net Cash used in Investing Activities: $${cashFlowData.investing.total.toLocaleString()}

FINANCING ACTIVITIES
  Debt Repayment: -$${cashFlowData.financing.debtRepayment.toLocaleString()}
  Equity Raised: $${cashFlowData.financing.equityRaised.toLocaleString()}
  Dividends Paid: -$${cashFlowData.financing.dividendsPaid.toLocaleString()}
  Net Cash used in Financing Activities: $${cashFlowData.financing.total.toLocaleString()}

NET CHANGE IN CASH: $${cashFlowData.netCashChange.toLocaleString()}
BEGINNING CASH BALANCE: $${cashFlowData.beginningCashBalance.toLocaleString()}
ENDING CASH BALANCE: $${cashFlowData.endingCashBalance.toLocaleString()}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cash_flow_${new Date().getFullYear()}.txt`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Cash Flow Statement
            </h1>
            <p className="text-slate-600 mt-2">
              Monitoring cash movements and liquidity
            </p>
          </div>
          <Button
            onClick={downloadPDF}
            className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
            <p className="text-green-700 text-sm font-medium">
              Beginning Cash Balance
            </p>
            <p className="text-3xl font-bold text-green-900 mt-2">
              ${cashFlowData.beginningCashBalance.toLocaleString()}
            </p>
          </div>

          <div
            className={`bg-gradient-to-br ${
              cashFlowData.netCashChange >= 0
                ? "from-blue-50 to-cyan-50 border-blue-200"
                : "from-red-50 to-pink-50 border-red-200"
            } rounded-lg border p-6`}
          >
            <p
              className={`text-sm font-medium ${
                cashFlowData.netCashChange >= 0
                  ? "text-blue-700"
                  : "text-red-700"
              }`}
            >
              Net Change in Cash
            </p>
            <p
              className={`text-3xl font-bold mt-2 ${
                cashFlowData.netCashChange >= 0
                  ? "text-blue-900"
                  : "text-red-900"
              }`}
            >
              ${cashFlowData.netCashChange.toLocaleString()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-6">
            <p className="text-purple-700 text-sm font-medium">
              Ending Cash Balance
            </p>
            <p className="text-3xl font-bold text-purple-900 mt-2">
              ${cashFlowData.endingCashBalance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Cash Flow Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Operating Activities */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-green-50 border-b border-green-200 p-6">
              <h2 className="text-lg font-bold text-green-900">
                OPERATING ACTIVITIES
              </h2>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Net Income</span>
                <span>
                  ${cashFlowData.operating.netIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Depreciation & Amortization</span>
                <span>
                  +$
                  {cashFlowData.operating.depreciationAmortization.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Changes in Working Capital</span>
                <span>
                  +$
                  {cashFlowData.operating.changesInWorkingCapital.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900">
                <span>Operating Cash Flow</span>
                <span className="text-green-600">
                  ${cashFlowData.operating.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Investing Activities */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-blue-50 border-b border-blue-200 p-6">
              <h2 className="text-lg font-bold text-blue-900">
                INVESTING ACTIVITIES
              </h2>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Capital Expenditures</span>
                <span>
                  -$
                  {cashFlowData.investing.capitalExpenditures.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Other Investments</span>
                <span>
                  -${cashFlowData.investing.otherInvestments.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900">
                <span>Investing Cash Flow</span>
                <span className="text-red-600">
                  ${cashFlowData.investing.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Financing Activities */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-purple-50 border-b border-purple-200 p-6">
              <h2 className="text-lg font-bold text-purple-900">
                FINANCING ACTIVITIES
              </h2>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Debt Repayment</span>
                <span>
                  -${cashFlowData.financing.debtRepayment.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Equity Raised</span>
                <span>
                  +${cashFlowData.financing.equityRaised.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Dividends Paid</span>
                <span>
                  -${cashFlowData.financing.dividendsPaid.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900">
                <span>Financing Cash Flow</span>
                <span className="text-red-600">
                  ${cashFlowData.financing.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Position Analysis */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Cash Position Analysis
          </h2>

          <div className="space-y-6">
            {/* Cash Flow Waterfall */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4">
                Cash Flow Waterfall
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <p className="text-sm font-medium text-slate-600">
                      Beginning Cash
                    </p>
                  </div>
                  <div className="flex-1 bg-slate-300 h-8 rounded flex items-center px-3">
                    <p className="text-sm font-bold text-slate-900">
                      ${cashFlowData.beginningCashBalance.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <p className="text-sm font-medium text-green-600">
                      + Operating
                    </p>
                  </div>
                  <div className="flex-1 bg-green-300 h-8 rounded flex items-center px-3">
                    <p className="text-sm font-bold text-green-900">
                      ${cashFlowData.operating.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <p className="text-sm font-medium text-red-600">
                      - Investing
                    </p>
                  </div>
                  <div className="flex-1 bg-red-300 h-8 rounded flex items-center px-3">
                    <p className="text-sm font-bold text-red-900">
                      ${Math.abs(cashFlowData.investing.total).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <p className="text-sm font-medium text-red-600">
                      - Financing
                    </p>
                  </div>
                  <div className="flex-1 bg-red-300 h-8 rounded flex items-center px-3">
                    <p className="text-sm font-bold text-red-900">
                      ${Math.abs(cashFlowData.financing.total).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-slate-300">
                  <div className="w-32">
                    <p className="text-sm font-bold text-slate-900">
                      Ending Cash
                    </p>
                  </div>
                  <div className="flex-1 bg-slate-600 h-8 rounded flex items-center px-3">
                    <p className="text-sm font-bold text-white">
                      ${cashFlowData.endingCashBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-slate-600 text-sm">
                  Operating Cash Flow Ratio
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {(
                    (cashFlowData.operating.total /
                      mockOrders
                        .filter((o) => o.status === "completed")
                        .reduce((sum, o) => sum + o.amount, 0)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-slate-600 text-sm">Free Cash Flow</p>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    cashFlowData.operating.total +
                      cashFlowData.investing.total >=
                    0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  $
                  {(
                    cashFlowData.operating.total + cashFlowData.investing.total
                  ).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-slate-600 text-sm">Cash Position Change</p>
                <p
                  className={`text-2xl font-bold mt-2 flex items-center gap-2 ${
                    cashFlowData.netCashChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {cashFlowData.netCashChange >= 0 ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5" />
                  )}
                  ${Math.abs(cashFlowData.netCashChange).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
