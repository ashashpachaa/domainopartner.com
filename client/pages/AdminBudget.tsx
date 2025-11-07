import { useState, useMemo } from "react";
import { mockBudgets } from "@/lib/mockData";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

const EXPENSE_CATEGORIES = [
  "office_supplies",
  "utilities",
  "equipment",
  "rent",
  "marketing",
  "transportation",
  "software",
  "maintenance",
  "vendor",
  "payroll",
  "other",
];

export default function AdminBudget() {
  const [budgets, setBudgets] = useState(mockBudgets);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "office_supplies",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    budgetAmount: "",
    notes: "",
  });

  const stats = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
    const totalActual = budgets.reduce((sum, b) => sum + b.actualAmount, 0);
    const totalVariance = totalBudget - totalActual;

    return {
      totalBudget,
      totalActual,
      totalVariance,
      variancePercent:
        totalBudget > 0
          ? ((totalVariance / totalBudget) * 100).toFixed(1)
          : "0",
      overBudgetCount: budgets.filter((b) => b.actualAmount > b.budgetAmount)
        .length,
      underBudgetCount: budgets.filter((b) => b.actualAmount < b.budgetAmount)
        .length,
    };
  }, [budgets]);

  const handleAddBudget = () => {
    if (!formData.budgetAmount) {
      toast.error("Please fill in required fields");
      return;
    }

    const newBudget = {
      id: editingId || `BUD${Date.now()}`,
      category: formData.category as any,
      month: formData.month,
      year: formData.year,
      budgetAmount: parseFloat(formData.budgetAmount),
      actualAmount: 0,
      currency: "USD",
      notes: formData.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    if (editingId) {
      setBudgets(budgets.map((b) => (b.id === editingId ? newBudget : b)));
      toast.success("Budget updated");
      setEditingId(null);
    } else {
      setBudgets([newBudget, ...budgets]);
      toast.success("Budget created");
    }

    setShowForm(false);
    setFormData({
      category: "office_supplies",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      budgetAmount: "",
      notes: "",
    });
  };

  const handleEdit = (budget: any) => {
    setFormData({
      category: budget.category,
      month: budget.month,
      year: budget.year,
      budgetAmount: budget.budgetAmount.toString(),
      notes: budget.notes || "",
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id));
    toast.success("Budget deleted");
  };

  const getCategoryLabel = (category: string) => {
    return category.replace(/_/g, " ").toUpperCase();
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleString("default", {
      month: "long",
    });
  };

  const getVarianceColor = (budgeted: number, actual: number) => {
    if (actual > budgeted) {
      return "text-red-600";
    } else if (actual < budgeted * 0.8) {
      return "text-green-600";
    }
    return "text-yellow-600";
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Budget Planning
            </h1>
            <p className="text-slate-600 mt-2">
              Track budgets and spending variance
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setShowForm(!showForm);
              setFormData({
                category: "office_supplies",
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                budgetAmount: "",
                notes: "",
              });
            }}
            className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancel" : "New Budget"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Total Budget</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              ${stats.totalBudget.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Actual Spending</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              ${stats.totalActual.toLocaleString()}
            </p>
          </div>

          <div
            className={`${
              stats.totalVariance >= 0
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            } rounded-lg border p-6`}
          >
            <p
              className={`text-sm ${stats.totalVariance >= 0 ? "text-green-700" : "text-red-700"}`}
            >
              Variance
            </p>
            <p
              className={`text-2xl font-bold mt-2 ${
                stats.totalVariance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.totalVariance >= 0 ? "-" : "+"}$
              {Math.abs(stats.totalVariance).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Over Budget</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {stats.overBudgetCount}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Under Budget</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {stats.underBudgetCount}
            </p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? "Edit Budget" : "Create New Budget"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  value={formData.budgetAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, budgetAmount: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Month
                </label>
                <select
                  value={formData.month}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      month: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value={2023}>2023</option>
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Notes (optional)"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button onClick={() => setShowForm(false)} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleAddBudget}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {editingId ? "Update" : "Create"} Budget
              </Button>
            </div>
          </div>
        )}

        {/* Budgets Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                  Period
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">
                  Budget
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">
                  Actual
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">
                  Variance
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">
                  Progress
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {budgets.length > 0 ? (
                budgets.map((budget) => {
                  const variance = budget.budgetAmount - budget.actualAmount;
                  const percentUsed =
                    (budget.actualAmount / budget.budgetAmount) * 100;

                  return (
                    <tr key={budget.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {getCategoryLabel(budget.category)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getMonthName(budget.month)} {budget.year}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                        ${budget.budgetAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                        ${budget.actualAmount.toLocaleString()}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-bold text-right ${getVarianceColor(
                          budget.budgetAmount,
                          budget.actualAmount,
                        )}`}
                      >
                        {variance >= 0 ? "-" : "+"}$
                        {Math.abs(variance).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                percentUsed > 100
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(percentUsed, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600 w-10">
                            {percentUsed.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(budget)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(budget.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No budgets created. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Budget Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Budgets */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              Budget by Category
            </h2>
            <div className="space-y-4">
              {Array.from(
                new Map(
                  budgets.map((b) => [b.category, { budgeted: 0, actual: 0 }]),
                ),
              ).map(([category, _]) => {
                const categoryBudgets = budgets.filter(
                  (b) => b.category === category,
                );
                const totalBudgeted = categoryBudgets.reduce(
                  (sum, b) => sum + b.budgetAmount,
                  0,
                );
                const totalActual = categoryBudgets.reduce(
                  (sum, b) => sum + b.actualAmount,
                  0,
                );

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        {getCategoryLabel(category as string)}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        ${totalBudgeted.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          totalActual > totalBudgeted
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                        style={{
                          width: `${Math.min((totalActual / totalBudgeted) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Variance Summary */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              Performance Summary
            </h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">
                      Under Budget
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.underBudgetCount}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 font-medium">
                      Over Budget
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.overBudgetCount}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-slate-600 text-sm">Overall Variance</p>
                <p
                  className={`text-3xl font-bold mt-2 ${
                    stats.totalVariance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats.totalVariance >= 0 ? "-" : "+"}$
                  {Math.abs(stats.totalVariance).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.variancePercent}% of budget
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
