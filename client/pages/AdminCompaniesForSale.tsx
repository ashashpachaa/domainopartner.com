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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

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
  const [showListModal, setShowListModal] = useState(false);
  const [searchCompanyNumber, setSearchCompanyNumber] = useState("");
  const [searchAuthCode, setSearchAuthCode] = useState("");
  const [searchResults, setSearchResults] = useState<CompanyForSale[]>([]);
  const [isLoadingCH, setIsLoadingCH] = useState(false);
  const [fetchedCompanyData, setFetchedCompanyData] = useState<any>(null);
  const [importedCompanies, setImportedCompanies] = useState<CompanyForSale[]>([]);

  const companies = useMemo(() => {
    return [...mockCompaniesForSale, ...importedCompanies];
  }, [importedCompanies]);

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

  const handleSearchCompanies = () => {
    if (!searchCompanyNumber && !searchAuthCode) {
      toast.error("Please enter Company Number or Auth Code");
      return;
    }

    const ukCompanies = companies.filter(
      (c) => c.country === "United Kingdom"
    );
    const results = ukCompanies.filter((company) => {
      const matchesNumber = searchCompanyNumber
        ? company.companyNumber
            .toLowerCase()
            .includes(searchCompanyNumber.toLowerCase())
        : true;
      const matchesAuthCode = searchAuthCode
        ? company.authCode
            .toLowerCase()
            .includes(searchAuthCode.toLowerCase())
        : true;
      return matchesNumber && matchesAuthCode;
    });

    setSearchResults(results);
    if (results.length === 0) {
      toast.info("No companies found matching your search criteria");
    }
  };

  const handleListCompany = (company: CompanyForSale) => {
    toast.success(`${company.companyName} has been listed for sale!`);
    setShowListModal(false);
    setSearchCompanyNumber("");
    setSearchAuthCode("");
    setSearchResults([]);
  };

  const fetchFromCompaniesHouse = async () => {
    if (!searchCompanyNumber.trim()) {
      toast.error("Please enter a Company Number");
      return;
    }

    setIsLoadingCH(true);
    try {
      const response = await fetch(
        `/api/companies-house/details?companyNumber=${encodeURIComponent(
          searchCompanyNumber
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch company data");
      }

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        setFetchedCompanyData(null);
        return;
      }

      setFetchedCompanyData({
        companyName: data.companyName,
        companyNumber: data.companyNumber,
        incorporationDate: data.incorporationDate,
        nextConfirmationDate: data.nextRenewalDate,
        firstAccountsMadeUpTo: data.accounts?.nextFilingDate,
        country: "United Kingdom",
        status: data.status,
        registeredOffice: data.registeredOffice,
        sic: data.sic,
      });
      toast.success("Company data fetched successfully!");
    } catch (error: any) {
      console.error("Error fetching company data:", error);
      toast.error(error.message || "Failed to fetch company data from Companies House");
      setFetchedCompanyData(null);
    } finally {
      setIsLoadingCH(false);
    }
  };

  const handleAcceptImport = () => {
    if (!fetchedCompanyData) {
      toast.error("No company data to import");
      return;
    }

    const newCompany: CompanyForSale = {
      id: `CFS-CH-${Date.now()}`,
      companyName: fetchedCompanyData.companyName,
      companyNumber: fetchedCompanyData.companyNumber,
      incorporationDate: fetchedCompanyData.incorporationDate || new Date().toISOString(),
      nextConfirmationDate: fetchedCompanyData.nextConfirmationDate || new Date().toISOString(),
      firstAccountsMadeUpTo: fetchedCompanyData.firstAccountsMadeUpTo || new Date().toISOString(),
      authCode: `CH-${fetchedCompanyData.companyNumber}`,
      country: "United Kingdom",
      registrationStatus: fetchedCompanyData.status === "active" ? "active" : "dormant",
      businessType: fetchedCompanyData.sic?.[0] || "General Business",
      askingPrice: 0,
      currency: "GBP",
      contact: "",
      contactEmail: "",
      contactPhone: "",
      description: `Imported from Companies House - ${fetchedCompanyData.companyName}`,
      listedAt: new Date().toISOString(),
      views: 0,
      inquiries: 0,
    };

    setImportedCompanies([...importedCompanies, newCompany]);
    toast.success(`${newCompany.companyName} has been imported!`);
    setFetchedCompanyData(null);
    setSearchCompanyNumber("");
    setSearchAuthCode("");
  };

  const handleRejectImport = () => {
    setFetchedCompanyData(null);
    toast.info("Import cancelled");
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
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setShowListModal(true)}
                className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                List Company
              </Button>
            </div>
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
                    Status
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
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                          company.registrationStatus === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : company.registrationStatus === "dormant"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {company.registrationStatus.charAt(0).toUpperCase() +
                          company.registrationStatus.slice(1)}
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

        {/* List Company Modal */}
        <Dialog open={showListModal} onOpenChange={setShowListModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>List Company for Sale</DialogTitle>
              <DialogDescription>
                Search for a UK company by Company Number or Auth Code to list it for sale
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Search Filters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 14234567"
                    value={searchCompanyNumber}
                    onChange={(e) => setSearchCompanyNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Auth Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., AUTH001TVS"
                    value={searchAuthCode}
                    onChange={(e) => setSearchAuthCode(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Lookup from Companies House */}
              <div className="border-t pt-4">
                <h3 className="text-md font-semibold text-slate-900 mb-3">
                  Import from Companies House
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-4">
                    Enter a Company Number to fetch the latest data from Companies House
                  </p>
                  <Button
                    onClick={fetchFromCompaniesHouse}
                    disabled={isLoadingCH || !searchCompanyNumber}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoadingCH ? "Fetching..." : "Lookup from Companies House"}
                  </Button>
                </div>
              </div>

              {/* Fetched Company Preview */}
              {fetchedCompanyData && (
                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold text-slate-900 mb-4">
                    Company Data Preview
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-600 font-medium">Company Name</p>
                        <p className="text-slate-900 font-semibold">
                          {fetchedCompanyData.companyName}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Company Number</p>
                        <p className="text-slate-900 font-mono">
                          {fetchedCompanyData.companyNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Incorporation Date</p>
                        <p className="text-slate-900">
                          {fetchedCompanyData.incorporationDate
                            ? new Date(
                                fetchedCompanyData.incorporationDate
                              ).toLocaleDateString("en-GB")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Status</p>
                        <p className="text-slate-900">
                          {fetchedCompanyData.status || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">
                          Next Confirmation Date
                        </p>
                        <p className="text-slate-900">
                          {fetchedCompanyData.nextConfirmationDate
                            ? new Date(
                                fetchedCompanyData.nextConfirmationDate
                              ).toLocaleDateString("en-GB")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">
                          First Accounts Made Up To
                        </p>
                        <p className="text-slate-900">
                          {fetchedCompanyData.firstAccountsMadeUpTo
                            ? new Date(
                                fetchedCompanyData.firstAccountsMadeUpTo
                              ).toLocaleDateString("en-GB")
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={handleRejectImport}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={handleAcceptImport}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept & Import
                    </Button>
                  </div>
                </div>
              )}

              {/* Search Button */}
              {!fetchedCompanyData && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowListModal(false);
                      setSearchCompanyNumber("");
                      setSearchAuthCode("");
                      setSearchResults([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSearchCompanies}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search Existing Companies
                  </Button>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Search Results ({searchResults.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {searchResults.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {company.companyName}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mt-3">
                            <p>
                              <span className="text-slate-700 font-medium">Company Number:</span> {company.companyNumber}
                            </p>
                            <p>
                              <span className="text-slate-700 font-medium">Auth Code:</span>{" "}
                              <span className="font-mono text-slate-700">
                                {company.authCode}
                              </span>
                            </p>
                            <p>
                              <span className="text-slate-700 font-medium">Incorporation Date:</span>{" "}
                              {new Date(
                                company.incorporationDate
                              ).toLocaleDateString("en-GB")}
                            </p>
                            <p>
                              <span className="text-slate-700 font-medium">Next Confirmation:</span>{" "}
                              {new Date(
                                company.nextConfirmationDate
                              ).toLocaleDateString("en-GB")}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleListCompany(company)}
                          className="bg-green-600 hover:bg-green-700 ml-4 flex-shrink-0"
                        >
                          List Company
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No results message */}
              {searchResults.length === 0 && (searchCompanyNumber || searchAuthCode) && (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No companies found</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
