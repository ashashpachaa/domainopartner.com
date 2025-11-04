import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertCircle,
  Search,
  Download,
  Eye,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  mockInvoices,
  mockUsers,
  Invoice,
  User,
} from "@/lib/mockData";

type FilterStatus = "all" | "draft" | "sent" | "paid" | "overdue" | "cancelled";
type SortBy = "date" | "amount" | "status" | "dueDate";

export default function AdminInvoices() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("all");

  // Get user map for quick lookup
  const userMap = useMemo(() => {
    return mockUsers.reduce(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {} as Record<string, User>
    );
  }, []);

  // Get all unique currencies
  const currencies = useMemo(() => {
    const unique = [...new Set(mockInvoices.map((inv) => inv.currency))];
    return unique.sort();
  }, []);

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = mockInvoices.filter((invoice) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const invoiceMatch =
        invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
        invoice.description.toLowerCase().includes(searchLower);
      const userMatch = userMap[invoice.userId]
        ? userMap[invoice.userId].firstName
            .toLowerCase()
            .includes(searchLower) ||
          userMap[invoice.userId].lastName
            .toLowerCase()
            .includes(searchLower) ||
          userMap[invoice.userId].companyName
            .toLowerCase()
            .includes(searchLower)
        : false;

      // Status filter
      const statusMatch =
        filterStatus === "all" || invoice.status === filterStatus;

      // Date range filter
      const issueDate = new Date(invoice.issueDate);
      const startMatch =
        !dateRangeStart || issueDate >= new Date(dateRangeStart);
      const endMatch =
        !dateRangeEnd ||
        issueDate <= new Date(new Date(dateRangeEnd).getTime() + 86400000);

      // Currency filter
      const currencyMatch =
        selectedCurrency === "all" || invoice.currency === selectedCurrency;

      return (
        (invoiceMatch || userMatch) &&
        statusMatch &&
        startMatch &&
        endMatch &&
        currencyMatch
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.issueDate).getTime();
          bValue = new Date(b.issueDate).getTime();
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "dueDate":
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [
    searchTerm,
    filterStatus,
    sortBy,
    sortOrder,
    dateRangeStart,
    dateRangeEnd,
    selectedCurrency,
    userMap,
  ]);

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const all = mockInvoices;
    const paid = all.filter((inv) => inv.status === "paid");
    const pending = all.filter((inv) => inv.status === "sent");
    const overdue = all.filter((inv) => inv.status === "overdue");

    // Calculate totals by converting to USD equivalent (simplified - in real app would use exchange rates)
    const calculateTotal = (invoices: Invoice[]) => {
      return invoices.reduce((sum, inv) => sum + inv.amount, 0);
    };

    return {
      totalInvoices: all.length,
      totalAmount: calculateTotal(all),
      paidAmount: calculateTotal(paid),
      pendingAmount: calculateTotal(pending),
      overdueAmount: calculateTotal(overdue),
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
    };
  }, []);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      paid: "bg-green-100 text-green-800 border-green-300",
      sent: "bg-blue-100 text-blue-800 border-blue-300",
      draft: "bg-slate-100 text-slate-800 border-slate-300",
      overdue: "bg-red-100 text-red-800 border-red-300",
      cancelled: "bg-slate-100 text-slate-800 border-slate-300",
    };
    return colors[status] || "bg-slate-100 text-slate-800 border-slate-300";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "sent":
        return <ArrowUpRight className="w-4 h-4" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      case "draft":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
            <p className="text-slate-600 mt-1">
              Complete financial overview and invoice management
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Invoices */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Invoices
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {metrics.totalInvoices}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Paid */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Paid ({metrics.paidCount})
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {metrics.paidAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {(
                    (metrics.paidCount / metrics.totalInvoices) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <ArrowDownLeft className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Pending ({metrics.pendingCount})
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {metrics.pendingAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {(
                    (metrics.pendingCount / metrics.totalInvoices) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Overdue ({metrics.overdueCount})
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {metrics.overdueAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Requires attention
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice number, description, or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Currency Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Currency
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              >
                <option value="all">All Currencies</option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Start */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 text-sm"
                >
                  <option value="date">Issue Date</option>
                  <option value="dueDate">Due Date</option>
                  <option value="amount">Amount</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm ||
            filterStatus !== "all" ||
            dateRangeStart ||
            dateRangeEnd ||
            selectedCurrency !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setDateRangeStart("");
                setDateRangeEnd("");
                setSelectedCurrency("all");
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Invoice Number
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAndSortedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-slate-600">No invoices found</p>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedInvoices.map((invoice) => {
                    const user = userMap[invoice.userId];
                    return (
                      <tr key={invoice.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">
                            {invoice.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {user
                                ? `${user.firstName} ${user.lastName}`
                                : "Unknown User"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user?.companyName}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">
                            {invoice.currency}{" "}
                            {invoice.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            to={`/admin/invoices/${invoice.id}`}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 transition"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-medium">View</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Results Summary */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
            Showing {filteredAndSortedInvoices.length} of {mockInvoices.length}{" "}
            invoices
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
