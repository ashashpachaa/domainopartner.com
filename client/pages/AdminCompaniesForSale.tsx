import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Search,
  Download,
  TrendingUp,
  Eye,
  MessageSquare,
  GripVertical,
  Plus,
} from "lucide-react";
import { mockCompaniesForSale, CompanyForSale } from "@/lib/mockData";
import { toast } from "sonner";

type CountryTab = "all" | "UK" | "USA" | "Sweden";

export default function AdminCompaniesForSale() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "dormant" | "liquidation"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "price" | "interest">(
    "date",
  );
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryTab>("all");

  const companies = useMemo(() => {
    return mockCompaniesForSale;
  }, []);

  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.companyNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        company.businessType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || company.registrationStatus === filterStatus;
      const matchesCountry =
        selectedCountry === "all" ||
        (selectedCountry === "UK" && company.country === "United Kingdom") ||
        (selectedCountry === "USA" && company.country === "United States") ||
        (selectedCountry === "Sweden" && company.country === "Sweden");
      return matchesSearch && matchesStatus && matchesCountry;
    });
  }, [companies, searchTerm, filterStatus, selectedCountry]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "date") {
      list.sort(
        (a, b) =>
          new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime(),
      );
    } else if (sortBy === "name") {
      list.sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else if (sortBy === "price") {
      list.sort((a, b) => b.askingPrice - a.askingPrice);
    } else if (sortBy === "interest") {
      list.sort((a, b) => b.inquiries - a.inquiries);
    }
    return list;
  }, [filtered, sortBy]);

  const stats = useMemo(() => {
    const totalCompanies = companies.length;
    const totalValue = companies.reduce((sum, c) => sum + c.askingPrice, 0);
    const totalViews = companies.reduce((sum, c) => sum + c.views, 0);
    const totalInquiries = companies.reduce((sum, c) => sum + c.inquiries, 0);

    return {
      totalCompanies,
      totalValue,
      avgPrice: Math.round(totalValue / totalCompanies),
      totalViews,
      totalInquiries,
    };
  }, [companies]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedCompanies(checked ? companies.map((c) => c.id) : []);
  };

  const handleSelectCompany = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCompanies([...selectedCompanies, id]);
    } else {
      setSelectedCompanies(selectedCompanies.filter((cid) => cid !== id));
    }
  };

  const handleExportCSV = () => {
    const csv = [
      [
        "Company Name",
        "Company Number",
        "Country",
        "Business Type",
        "Registration Status",
        "Asking Price",
        "Currency",
        "Views",
        "Inquiries",
        "Listed Date",
      ],
      ...sorted.map((c) => [
        c.companyName,
        c.companyNumber,
        c.country,
        c.businessType,
        c.registrationStatus,
        c.askingPrice,
        c.currency,
        c.views,
        c.inquiries,
        c.listedAt,
      ]),
    ]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `companies-for-sale-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Companies exported as CSV");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-50 text-green-700 border-green-200",
      dormant: "bg-yellow-50 text-yellow-700 border-yellow-200",
      liquidation: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Companies for Sale
            </h1>
            <p className="text-slate-600 mt-1">
              Browse and manage companies available for acquisition
            </p>
          </div>
          <Button className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            List New Company
          </Button>
        </div>

        {/* Country Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {(["all", "UK", "USA", "Sweden"] as CountryTab[]).map((country) => (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                selectedCountry === country
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {country === "all"
                ? "All Countries"
                : country === "UK"
                  ? "🇬🇧 United Kingdom"
                  : country === "USA"
                    ? "🇺🇸 United States"
                    : "🇸🇪 Sweden"}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Companies
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {stats.totalCompanies}
                </p>
              </div>
              <Building2 className="w-10 h-10 text-primary-100 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  £{(stats.totalValue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Avg Price</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  ��{stats.avgPrice.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {stats.totalViews}
                </p>
              </div>
              <Eye className="w-10 h-10 text-blue-100 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Inquiries
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {stats.totalInquiries}
                </p>
              </div>
              <MessageSquare className="w-10 h-10 text-green-100 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Company name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="dormant">Dormant</option>
                <option value="liquidation">Liquidation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="date">Recently Listed</option>
                <option value="name">Company Name</option>
                <option value="price">Price (High to Low)</option>
                <option value="interest">Inquiries</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Companies Table - UK View */}
        {selectedCountry === "UK" && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                    Company Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                    Company Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                    Incorporation Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                    Next Confirmation Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                    First Accounts Made Up To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                    Auth Code
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sorted.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {company.companyName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {company.companyNumber}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(company.incorporationDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(company.nextConfirmationDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(company.firstAccountsMadeUpTo).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
                        {company.authCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toast.info(`Viewing ${company.companyName}`)
                          }
                          className="text-primary-600 hover:text-primary-700"
                        >
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            toast.success(`Initiated sale process for ${company.companyName}`)
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Sell
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sorted.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No companies found</p>
                <p className="text-slate-500 text-sm mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        )}

        {/* Companies Table - Other Countries View */}
        {selectedCountry !== "UK" && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedCompanies.length === filtered.length &&
                        filtered.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">
                    Business Type
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">
                    Asking Price
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">
                    Interest
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">
                    Views
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">
                    Listed
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sorted.map((company) => (
                  <tr
                    key={company.id}
                    className={`hover:bg-slate-50 transition ${selectedCompanies.includes(company.id) ? "bg-blue-50" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.id)}
                        onChange={(e) =>
                          handleSelectCompany(company.id, e.target.checked)
                        }
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {company.companyName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {company.companyNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {company.businessType}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">
                      {company.currency} {company.askingPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(company.registrationStatus)}`}
                      >
                        {company.registrationStatus.charAt(0).toUpperCase() +
                          company.registrationStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">
                        {company.inquiries}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-700 flex items-center justify-center gap-1">
                      <Eye className="w-4 h-4 text-slate-400" />
                      {company.views}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600">
                      {new Date(company.listedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toast.info(`Viewing details for ${company.companyName}`)
                        }
                        className="text-primary-600 hover:text-primary-700"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sorted.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No companies found</p>
                <p className="text-slate-500 text-sm mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {sorted.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {companies.length}
            </span>{" "}
            companies
            {selectedCompanies.length > 0 && (
              <>
                {" "}
                •{" "}
                <span className="font-semibold text-slate-900">
                  {selectedCompanies.length}
                </span>{" "}
                selected
              </>
            )}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
