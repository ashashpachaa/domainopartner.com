import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Building2, Search, Download, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { getRegisteredCompanies, RegisteredCompany } from "@/hooks/useCompanyDetails";
import { mockUsers, mockOrders } from "@/lib/mockData";

export default function AdminCompanies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "dissolved">("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "renewal">("date");

  const companies = useMemo(() => {
    return getRegisteredCompanies();
  }, []);

  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.companyNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || company.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, filterStatus]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "date") {
      list.sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime());
    } else if (sortBy === "name") {
      list.sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else if (sortBy === "renewal") {
      list.sort((a, b) => new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime());
    }
    return list;
  }, [filtered, sortBy]);

  const stats = useMemo(() => {
    return {
      total: companies.length,
      active: companies.filter((c) => c.status === "active").length,
      upcomingRenewal: companies.filter((c) => {
        const renewalDate = new Date(c.nextRenewalDate);
        const today = new Date();
        const daysUntilRenewal = Math.floor(
          (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilRenewal <= 90 && daysUntilRenewal > 0;
      }).length,
    };
  }, [companies]);

  const getUserName = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const daysUntilDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const exportToCSV = () => {
    const headers = [
      "Company Name",
      "Company Number",
      "User",
      "Status",
      "Incorporated",
      "Next Renewal",
      "Accounts Due",
      "Data Retrieved",
    ];

    const rows = sorted.map((company) => [
      company.companyName,
      company.companyNumber,
      getUserName(company.userId),
      company.status,
      formatDate(company.incorporationDate),
      formatDate(company.nextRenewalDate),
      formatDate(company.nextAccountsFilingDate),
      formatDate(company.fetchedAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registered-companies-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            Registered Companies Registry
          </h1>
          <p className="text-slate-600">
            Monitor all companies registered through the platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-600 uppercase">Total Companies</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-600 uppercase">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-600 uppercase">Renewal Due (90 days)</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.upcomingRenewal}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by company name or number..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "dissolved")}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="dissolved">Dissolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "name" | "renewal")}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="date">Registration Date</option>
                <option value="name">Company Name</option>
                <option value="renewal">Renewal Date</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={exportToCSV} className="bg-slate-600 hover:bg-slate-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Companies Table */}
        {sorted.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium">No registered companies found</p>
            <p className="text-slate-500 mt-2">Companies will appear here once orders are completed</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Company Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Company No</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Incorporated</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Next Renewal</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Accounts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sorted.map((company) => {
                    const daysUntilRenewal = daysUntilDate(company.nextRenewalDate);
                    const isRenewalSoon = daysUntilRenewal <= 90 && daysUntilRenewal > 0;

                    return (
                      <tr key={company.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{company.companyName}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{company.companyNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{getUserName(company.userId)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              company.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {company.status === "active" && <CheckCircle2 className="w-3 h-3" />}
                            {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatDate(company.incorporationDate)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">{formatDate(company.nextRenewalDate)}</span>
                            {isRenewalSoon && (
                              <AlertCircle
                                className="w-4 h-4 text-orange-600"
                                title={`${daysUntilRenewal} days remaining`}
                              />
                            )}
                          </div>
                          {isRenewalSoon && <p className="text-xs text-orange-600 mt-1">{daysUntilRenewal}d</p>}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(company.nextAccountsFilingDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-slate-600">
          Showing {sorted.length} of {companies.length} companies
        </div>
      </div>
    </AdminLayout>
  );
}
