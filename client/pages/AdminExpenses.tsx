import { useState, useMemo } from "react";
import { mockExpenses, mockVendors, Expense } from "@/lib/mockData";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ExpenseFormData {
  category: string;
  description: string;
  amount: string;
  vendor: string;
  date: string;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  paymentMethod: string;
  reference: string;
  notes: string;
}

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

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "paid" | "overdue">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "vendor">("date");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: "office_supplies",
    description: "",
    amount: "",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "pending",
    paymentMethod: "",
    reference: "",
    notes: "",
  });

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.description.toLowerCase().includes(search) ||
          e.vendor?.toLowerCase().includes(search) ||
          e.reference?.toLowerCase().includes(search)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((e) => e.status === filterStatus);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((e) => e.category === filterCategory);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount;
        case "vendor":
          return (a.vendor || "").localeCompare(b.vendor || "");
        case "date":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return sorted;
  }, [expenses, searchTerm, filterStatus, filterCategory, sortBy]);

  const stats = useMemo(() => {
    return {
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      paidAmount: expenses.filter((e) => e.status === "paid").reduce((sum, e) => sum + e.amount, 0),
      pendingAmount: expenses
        .filter((e) => e.status === "pending")
        .reduce((sum, e) => sum + e.amount, 0),
      overdueAmount: expenses
        .filter((e) => e.status === "overdue")
        .reduce((sum, e) => sum + e.amount, 0),
      totalCount: expenses.length,
      paidCount: expenses.filter((e) => e.status === "paid").length,
      pendingCount: expenses.filter((e) => e.status === "pending").length,
      overdueCount: expenses.filter((e) => e.status === "overdue").length,
    };
  }, [expenses]);

  const handleAddExpense = () => {
    if (!formData.description || !formData.amount) {
      toast.error("Please fill in required fields");
      return;
    }

    const newExpense: Expense = {
      id: editingId || `EXP${Date.now()}`,
      category: formData.category as any,
      description: formData.description,
      amount: parseFloat(formData.amount),
      currency: "USD",
      vendor: formData.vendor || undefined,
      date: formData.date,
      dueDate: formData.dueDate || undefined,
      status: formData.status,
      paymentMethod: formData.paymentMethod || undefined,
      reference: formData.reference || undefined,
      notes: formData.notes || undefined,
      createdBy: "S001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      setExpenses(expenses.map((e) => (e.id === editingId ? newExpense : e)));
      toast.success("Expense updated successfully");
      setEditingId(null);
    } else {
      setExpenses([newExpense, ...expenses]);
      toast.success("Expense added successfully");
    }

    setShowForm(false);
    setFormData({
      category: "office_supplies",
      description: "",
      amount: "",
      vendor: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      status: "pending",
      paymentMethod: "",
      reference: "",
      notes: "",
    });
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      vendor: expense.vendor || "",
      date: expense.date,
      dueDate: expense.dueDate || "",
      status: expense.status,
      paymentMethod: expense.paymentMethod || "",
      reference: expense.reference || "",
      notes: expense.notes || "",
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
    toast.success("Expense deleted");
  };

  const handleStatusChange = (id: string, newStatus: "pending" | "paid" | "overdue") => {
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    toast.success(`Expense marked as ${newStatus}`);
  };

  const downloadCSV = () => {
    const headers = ["ID", "Date", "Category", "Description", "Vendor", "Amount", "Status"];
    const rows = filteredAndSortedExpenses.map((e) => [
      e.id,
      e.date,
      e.category,
      e.description,
      e.vendor || "-",
      e.amount,
      e.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace(/_/g, " ").toUpperCase();
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Expenses Management</h1>
            <p className="text-slate-600 mt-2">Track and manage all business expenses</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setShowForm(!showForm);
              setFormData({
                category: "office_supplies",
                description: "",
                amount: "",
                vendor: "",
                date: new Date().toISOString().split("T")[0],
                dueDate: "",
                status: "pending",
                paymentMethod: "",
                reference: "",
                notes: "",
              });
            }}
            className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancel" : "Add Expense"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  ${stats.totalExpenses.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stats.totalCount} transactions</p>
              </div>
              <DollarSign className="w-12 h-12 text-primary-100" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Paid</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ${stats.paidAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stats.paidCount} paid</p>
              </div>
              <Check className="w-12 h-12 text-green-100" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  ${stats.pendingAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stats.pendingCount} pending</p>
              </div>
              <AlertCircle className="w-12 h-12 text-yellow-100" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  ${stats.overdueAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stats.overdueCount} overdue</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-100" />
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? "Edit Expense" : "Add New Expense"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Vendor</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Vendor name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Method
                </label>
                <input
                  type="text"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  placeholder="e.g., Credit Card, Bank Transfer"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Expense description"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleAddExpense} className="bg-primary-600 hover:bg-primary-700">
                {editingId ? "Update Expense" : "Add Expense"}
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Filters</h2>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setFilterCategory("all");
              }}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search expenses..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="date">Latest Date</option>
                <option value="amount">Highest Amount</option>
                <option value="vendor">Vendor Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <Button
            onClick={downloadCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                  Vendor
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAndSortedExpenses.length > 0 ? (
                filteredAndSortedExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getCategoryLabel(expense.category)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{expense.vendor || "-"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                      ${expense.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={expense.status}
                        onChange={(e) =>
                          handleStatusChange(expense.id, e.target.value as any)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${getStatusColor(
                          expense.status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No expenses found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg border border-primary-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Expense Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-600 text-sm">Showing</p>
              <p className="text-2xl font-bold text-primary-600">{filteredAndSortedExpenses.length}</p>
              <p className="text-xs text-slate-500">of {expenses.length} expenses</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Filtered Total</p>
              <p className="text-2xl font-bold text-primary-600">
                ${filteredAndSortedExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Avg Amount</p>
              <p className="text-2xl font-bold text-primary-600">
                ${
                  filteredAndSortedExpenses.length > 0
                    ? Math.round(
                        filteredAndSortedExpenses.reduce((sum, e) => sum + e.amount, 0) /
                          filteredAndSortedExpenses.length
                      )
                    : 0
                }
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Largest Expense</p>
              <p className="text-2xl font-bold text-primary-600">
                ${
                  filteredAndSortedExpenses.length > 0
                    ? Math.max(...filteredAndSortedExpenses.map((e) => e.amount))
                    : 0
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
