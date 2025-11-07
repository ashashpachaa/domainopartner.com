import { useMemo } from "react";
import { mockOrders, mockExpenses, mockStaffSalaries } from "@/lib/mockData";
import AdminLayout from "@/components/AdminLayout";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminBalanceSheet() {
  const balanceSheetData = useMemo(() => {
    // Assets
    const cashBalance =
      mockOrders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + o.amount, 0) -
      mockExpenses.reduce((sum, e) => sum + e.amount, 0);

    const accountsReceivable = mockOrders
      .filter((o) => o.status === "awaiting_client_acceptance")
      .reduce((sum, o) => sum + o.amount, 0);

    const inventory = 50000; // Fixed value for demo
    const equipment = 75000;
    const otherAssets = 25000;

    const totalAssets =
      cashBalance + accountsReceivable + inventory + equipment + otherAssets;

    // Liabilities
    const accountsPayable = mockExpenses
      .filter((e) => e.status === "pending" || e.status === "overdue")
      .reduce((sum, e) => sum + e.amount, 0);

    const shortTermDebt = 50000;
    const longTermDebt = 100000;
    const otherLiabilities = 30000;

    const totalLiabilities =
      accountsPayable + shortTermDebt + longTermDebt + otherLiabilities;

    // Equity
    const commonStock = 300000;
    const retainedEarnings = totalAssets - totalLiabilities - commonStock;
    const otherEquity = 0;

    const totalEquity = commonStock + retainedEarnings + otherEquity;

    return {
      assets: {
        cash: Math.max(0, cashBalance),
        accountsReceivable,
        inventory,
        equipment,
        other: otherAssets,
        total: totalAssets,
      },
      liabilities: {
        accountsPayable,
        shortTermDebt,
        longTermDebt,
        other: otherLiabilities,
        total: totalLiabilities,
      },
      equity: {
        commonStock,
        retainedEarnings,
        other: otherEquity,
        total: totalEquity,
      },
    };
  }, []);

  const downloadPDF = () => {
    const content = `
BALANCE SHEET
As of ${new Date().toLocaleDateString()}

ASSETS
Current Assets:
  Cash and Cash Equivalents: $${balanceSheetData.assets.cash.toLocaleString()}
  Accounts Receivable: $${balanceSheetData.assets.accountsReceivable.toLocaleString()}
  Inventory: $${balanceSheetData.assets.inventory.toLocaleString()}
  Total Current Assets: $${(balanceSheetData.assets.cash + balanceSheetData.assets.accountsReceivable + balanceSheetData.assets.inventory).toLocaleString()}

Fixed Assets:
  Equipment: $${balanceSheetData.assets.equipment.toLocaleString()}
  Other Assets: $${balanceSheetData.assets.other.toLocaleString()}
  Total Fixed Assets: $${(balanceSheetData.assets.equipment + balanceSheetData.assets.other).toLocaleString()}

TOTAL ASSETS: $${balanceSheetData.assets.total.toLocaleString()}

LIABILITIES AND EQUITY
Current Liabilities:
  Accounts Payable: $${balanceSheetData.liabilities.accountsPayable.toLocaleString()}
  Short-Term Debt: $${balanceSheetData.liabilities.shortTermDebt.toLocaleString()}
  Other Current Liabilities: $${balanceSheetData.liabilities.other.toLocaleString()}
  Total Current Liabilities: $${(balanceSheetData.liabilities.accountsPayable + balanceSheetData.liabilities.shortTermDebt + balanceSheetData.liabilities.other).toLocaleString()}

Long-Term Liabilities:
  Long-Term Debt: $${balanceSheetData.liabilities.longTermDebt.toLocaleString()}
  Total Long-Term Liabilities: $${balanceSheetData.liabilities.longTermDebt.toLocaleString()}

TOTAL LIABILITIES: $${balanceSheetData.liabilities.total.toLocaleString()}

Stockholders' Equity:
  Common Stock: $${balanceSheetData.equity.commonStock.toLocaleString()}
  Retained Earnings: $${balanceSheetData.equity.retainedEarnings.toLocaleString()}
  Total Stockholders' Equity: $${balanceSheetData.equity.total.toLocaleString()}

TOTAL LIABILITIES AND EQUITY: $${(balanceSheetData.liabilities.total + balanceSheetData.equity.total).toLocaleString()}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `balance_sheet_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Balance Sheet</h1>
            <p className="text-slate-600 mt-2">
              Assets, Liabilities & Equity as of{" "}
              {new Date().toLocaleDateString()}
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

        {/* Balance Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assets */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-blue-50 border-b border-blue-200 p-6">
              <h2 className="text-xl font-bold text-blue-900">ASSETS</h2>
            </div>

            <div className="divide-y divide-slate-200">
              {/* Current Assets */}
              <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-3">
                  Current Assets
                </h3>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Cash & Equivalents</span>
                    <span>
                      ${balanceSheetData.assets.cash.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Accounts Receivable</span>
                    <span>
                      $
                      {balanceSheetData.assets.accountsReceivable.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Inventory</span>
                    <span>
                      ${balanceSheetData.assets.inventory.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-slate-900 mt-3 pt-3 border-t border-slate-200">
                  <span>Total Current</span>
                  <span>
                    $
                    {(
                      balanceSheetData.assets.cash +
                      balanceSheetData.assets.accountsReceivable +
                      balanceSheetData.assets.inventory
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Fixed Assets */}
              <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-3">Fixed Assets</h3>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Equipment</span>
                    <span>
                      ${balanceSheetData.assets.equipment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Other Assets</span>
                    <span>
                      ${balanceSheetData.assets.other.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-slate-900 mt-3 pt-3 border-t border-slate-200">
                  <span>Total Fixed</span>
                  <span>
                    $
                    {(
                      balanceSheetData.assets.equipment +
                      balanceSheetData.assets.other
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Total Assets */}
              <div className="p-6 bg-blue-50 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-blue-900">
                    TOTAL ASSETS
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">
                    ${balanceSheetData.assets.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Liabilities */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-red-50 border-b border-red-200 p-6">
              <h2 className="text-xl font-bold text-red-900">LIABILITIES</h2>
            </div>

            <div className="divide-y divide-slate-200">
              {/* Current Liabilities */}
              <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-3">
                  Current Liabilities
                </h3>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Accounts Payable</span>
                    <span>
                      $
                      {balanceSheetData.liabilities.accountsPayable.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Short-Term Debt</span>
                    <span>
                      $
                      {balanceSheetData.liabilities.shortTermDebt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Other Current Liab.</span>
                    <span>
                      ${balanceSheetData.liabilities.other.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-slate-900 mt-3 pt-3 border-t border-slate-200">
                  <span>Total Current</span>
                  <span>
                    $
                    {(
                      balanceSheetData.liabilities.accountsPayable +
                      balanceSheetData.liabilities.shortTermDebt +
                      balanceSheetData.liabilities.other
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Long-Term Liabilities */}
              <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-3">
                  Long-Term Liabilities
                </h3>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Long-Term Debt</span>
                    <span>
                      $
                      {balanceSheetData.liabilities.longTermDebt.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Liabilities */}
              <div className="p-6 bg-red-50 border-t border-red-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-red-900">
                    TOTAL LIABILITIES
                  </h3>
                  <p className="text-2xl font-bold text-red-600">
                    ${balanceSheetData.liabilities.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Equity */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-green-50 border-b border-green-200 p-6">
              <h2 className="text-xl font-bold text-green-900">
                STOCKHOLDERS' EQUITY
              </h2>
            </div>

            <div className="divide-y divide-slate-200">
              {/* Equity Details */}
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Common Stock</span>
                    <span>
                      ${balanceSheetData.equity.commonStock.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Retained Earnings</span>
                    <span>
                      $
                      {balanceSheetData.equity.retainedEarnings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Equity */}
              <div className="p-6 bg-green-50 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-green-900">
                    TOTAL EQUITY
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    ${balanceSheetData.equity.total.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Verification */}
              <div className="p-6 bg-slate-50">
                <div className="space-y-2 text-sm">
                  <p className="text-slate-600">
                    Liabilities + Equity: $
                    {(
                      balanceSheetData.liabilities.total +
                      balanceSheetData.equity.total
                    ).toLocaleString()}
                  </p>
                  <p
                    className={`font-bold ${
                      Math.abs(
                        balanceSheetData.assets.total -
                          (balanceSheetData.liabilities.total +
                            balanceSheetData.equity.total),
                      ) < 1
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Math.abs(
                      balanceSheetData.assets.total -
                        (balanceSheetData.liabilities.total +
                          balanceSheetData.equity.total),
                    ) < 1
                      ? "✓ Balanced"
                      : "⚠ Not Balanced"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Ratios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Current Ratio</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {(
                (balanceSheetData.assets.cash +
                  balanceSheetData.assets.accountsReceivable +
                  balanceSheetData.assets.inventory) /
                (balanceSheetData.liabilities.accountsPayable +
                  balanceSheetData.liabilities.shortTermDebt +
                  balanceSheetData.liabilities.other)
              ).toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Liquidity position</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Debt-to-Equity</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {(
                balanceSheetData.liabilities.total /
                balanceSheetData.equity.total
              ).toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Leverage ratio</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Equity Ratio</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {(
                (balanceSheetData.equity.total /
                  balanceSheetData.assets.total) *
                100
              ).toFixed(1)}
              %
            </p>
            <p className="text-xs text-slate-500 mt-1">Ownership stake</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
