import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import CompanyDetailModal from "@/components/CompanyDetailModal";
import { Button } from "@/components/ui/button";
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
  Download,
} from "lucide-react";
import {
  getRegisteredCompanies,
  RegisteredCompany,
} from "@/hooks/useCompanyDetails";
import { useCompanyRenewal } from "@/hooks/useCompanyRenewal";
import { mockUsers } from "@/lib/mockData";
import { toast } from "sonner";

type CountryTab = "all" | "UK" | "USA" | "Canada" | "Sweden";

export default function AdminCompaniesNeedRenewal() {
  const [selectedCountry, setSelectedCountry] = useState<CountryTab>("all");
  const [sortBy, setSortBy] = useState<"urgent" | "renewal" | "accounts">(
    "urgent",
  );
  const [selectedCompany, setSelectedCompany] = useState<RegisteredCompany | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { submitCompanyRenewal, isSubmitting } = useCompanyRenewal();

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
    return Math.floor(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  const checkIfNeedsRenewal = (company: RegisteredCompany) => {
    const daysUntilConfirmation = daysUntilDate(company.nextRenewalDate);
    const daysUntilAccounts = daysUntilDate(company.nextAccountsFilingDate);
    // For demo: show all companies in the first 8 (mock companies)
    // In production, change to: daysUntilConfirmation <= 15 && daysUntilConfirmation > 0
    if (company.id.startsWith("REG")) {
      // Always show registered companies for demo
      return true;
    }
    const confirmationDue = daysUntilConfirmation <= 15 && daysUntilConfirmation > 0;
    const accountsDue = daysUntilAccounts <= 15 && daysUntilAccounts > 0;
    return confirmationDue || accountsDue;
  };

  const getUrgencyDays = (company: RegisteredCompany) => {
    const daysUntilConfirmation = daysUntilDate(company.nextRenewalDate);
    const daysUntilAccounts = daysUntilDate(company.nextAccountsFilingDate);
    return Math.min(daysUntilConfirmation, daysUntilAccounts);
  };

  const companies = useMemo(() => {
    return getRegisteredCompanies();
  }, []);

  const needsRenewal = useMemo(() => {
    return companies.filter((company) => {
      const matches =
        selectedCountry === "all" ||
        (selectedCountry === "UK" && company.country === "United Kingdom") ||
        (selectedCountry === "USA" && company.country === "United States") ||
        (selectedCountry === "Canada" && company.country === "Canada") ||
        (selectedCountry === "Sweden" && company.country === "Sweden");

      return checkIfNeedsRenewal(company) && matches;
    });
  }, [companies, selectedCountry]);

  const sorted = useMemo(() => {
    const list = [...needsRenewal];

    if (sortBy === "urgent") {
      list.sort((a, b) => getUrgencyDays(a) - getUrgencyDays(b));
    } else if (sortBy === "renewal") {
      list.sort(
        (a, b) =>
          new Date(a.nextRenewalDate).getTime() -
          new Date(b.nextRenewalDate).getTime(),
      );
    } else if (sortBy === "accounts") {
      list.sort(
        (a, b) =>
          new Date(a.nextAccountsFilingDate).getTime() -
          new Date(b.nextAccountsFilingDate).getTime(),
      );
    }

    return list;
  }, [needsRenewal, sortBy]);

  const stats = useMemo(() => {
    return {
      total: sorted.length,
      urgent: sorted.filter((c) => getUrgencyDays(c) <= 5).length,
      due30: sorted.filter((c) => getUrgencyDays(c) <= 30).length,
    };
  }, [sorted]);

  const handleMarkRenewed = (companyId: string) => {
    toast.success("Company marked as renewed. Updating records...");
  };

  const handleSendReminder = (companyId: string, companyName: string) => {
    toast.success(`Renewal reminder sent for ${companyName}`);
  };

  const exportToCSV = () => {
    const headers = [
      "Company Name",
      "Country",
      "Company Number",
      "Days Until Renewal",
      "Renewal Date",
      "Accounts Due Date",
      "Auth Code",
      "Status",
      "Contact",
    ];

    const rows = sorted.map((company) => [
      company.companyName,
      company.country,
      company.companyNumber,
      getUrgencyDays(company),
      formatDate(company.nextRenewalDate),
      formatDate(company.nextAccountsFilingDate),
      company.authCode,
      company.status,
      getUserName(company.userId),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `companies-need-renewal-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Companies Needing Renewal
              </h1>
              <p className="text-slate-600">
                Track companies requiring immediate renewal action
              </p>
            </div>
          </div>
        </div>

        {/* Alert Box */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900">
                {stats.total} Companies Need Renewal
              </h3>
              <p className="text-red-800 text-sm mt-1">
                {stats.urgent} companies require renewal within 5 days • {stats.due30}{" "}
                within 30 days
              </p>
            </div>
          </div>
        </div>

        {/* Country Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200 flex-wrap">
          <button
            onClick={() => setSelectedCountry("all")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              selectedCountry === "all"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            🌍 All Countries ({stats.total})
          </button>
          <button
            onClick={() => setSelectedCountry("UK")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              selectedCountry === "UK"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            🇬🇧 United Kingdom
          </button>
          <button
            onClick={() => setSelectedCountry("USA")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              selectedCountry === "USA"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            🇺🇸 United States
          </button>
          <button
            onClick={() => setSelectedCountry("Canada")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              selectedCountry === "Canada"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            🇨🇦 Canada
          </button>
          <button
            onClick={() => setSelectedCountry("Sweden")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              selectedCountry === "Sweden"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            🇸🇪 Sweden
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 uppercase">
                  Urgent (0-5 days)
                </p>
                <p className="text-3xl font-bold text-red-700 mt-2">
                  {stats.urgent}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg border-2 border-orange-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 uppercase">
                  Due (6-15 days)
                </p>
                <p className="text-3xl font-bold text-orange-700 mt-2">
                  {stats.total - stats.urgent}
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 uppercase">
                  Total Need Renewal
                </p>
                <p className="text-3xl font-bold text-blue-700 mt-2">
                  {stats.total}
                </p>
              </div>
              <Building2 className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "urgent" | "renewal" | "accounts",
                  )
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="urgent">Most Urgent First</option>
                <option value="renewal">Renewal Date</option>
                <option value="accounts">Accounts Filing Date</option>
              </select>
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Companies Table */}
        {sorted.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium">
              No companies need renewal
            </p>
            <p className="text-slate-500 mt-2">
              All companies are up to date!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                      Company Name
                    </th>
                    {selectedCountry === "UK" ? (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          Company Number
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          Incorporation Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          Next Confirmation Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          First Accounts Made Up To
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          Auth Code
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          Action
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          Country
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-red-700 uppercase">
                          Days Until Renewal
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          Renewal Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          Accounts Due
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          Auth Code
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase">
                          Action
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sorted.map((company) => {
                    const urgencyDays = getUrgencyDays(company);
                    const isVeryUrgent = urgencyDays <= 5;
                    const isUrgent = urgencyDays <= 15;

                    return (
                      <tr
                        key={company.id}
                        className={`hover:bg-slate-50 ${
                          isVeryUrgent ? "bg-red-50" : isUrgent ? "bg-orange-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">
                            {company.companyName}
                          </p>
                        </td>
                        {selectedCountry === "UK" ? (
                          <>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {company.companyNumber}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatDate(company.incorporationDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatDate(company.nextRenewalDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatDate(company.nextAccountsFilingDate)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                  company.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {company.status.charAt(0).toUpperCase() +
                                  company.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                              {company.authCode}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => {
                                    setSelectedCompany(company);
                                    setShowDetailModal(true);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3"
                                >
                                  View
                                </Button>
                                <Button
                                  onClick={() => {
                                    toast.info("Edit functionality coming soon");
                                  }}
                                  className="bg-slate-600 hover:bg-slate-700 text-white text-xs h-8 px-3"
                                >
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {company.country}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                  isVeryUrgent
                                    ? "bg-red-200 text-red-800"
                                    : isUrgent
                                      ? "bg-orange-200 text-orange-800"
                                      : "bg-yellow-200 text-yellow-800"
                                }`}
                              >
                                {urgencyDays}d
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatDate(company.nextRenewalDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatDate(company.nextAccountsFilingDate)}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                              {company.authCode}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {getUserName(company.userId)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleSendReminder(company.id, company.companyName)
                                  }
                                  className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition"
                                  title="Send reminder email"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                                <Button
                                  onClick={() => handleMarkRenewed(company.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 px-3"
                                >
                                  Renewed
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-slate-600">
          Showing {sorted.length} companies needing renewal
        </div>
      </div>

      {/* Company Detail Modal */}
      {showDetailModal && selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </AdminLayout>
  );
}
