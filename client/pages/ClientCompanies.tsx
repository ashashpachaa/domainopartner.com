import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ClientLayout from "@/components/ClientLayout";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";
import {
  getRegisteredCompaniesByUser,
  RegisteredCompany,
} from "@/hooks/useCompanyDetails";
import { mockOrders } from "@/lib/mockData";

export default function ClientCompanies() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const [sortBy, setSortBy] = useState<"date" | "status" | "name">("date");

  const companies = useMemo(() => {
    return getRegisteredCompaniesByUser(currentUser.id || "");
  }, [currentUser.id]);

  const sortedCompanies = useMemo(() => {
    const sorted = [...companies];
    if (sortBy === "date") {
      sorted.sort(
        (a, b) =>
          new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime(),
      );
    } else if (sortBy === "name") {
      sorted.sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else if (sortBy === "status") {
      sorted.sort((a, b) => a.status.localeCompare(b.status));
    }
    return sorted;
  }, [companies, sortBy]);

  const stats = useMemo(() => {
    return {
      total: companies.length,
      active: companies.filter((c) => c.status === "active").length,
      upcomingRenewal: companies.filter((c) => {
        const renewalDate = new Date(c.nextRenewalDate);
        const today = new Date();
        const daysUntilRenewal = Math.floor(
          (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        return daysUntilRenewal <= 90 && daysUntilRenewal > 0;
      }).length,
    };
  }, [companies]);

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

  return (
    <ClientLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            My Registered Companies
          </h1>
          <p className="text-slate-600 mt-2">
            Track all companies you've formed through our service
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-600 uppercase">
              Total Companies
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-600 uppercase">
              Active
            </p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.active}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-600 uppercase">
              Renewal in 90 Days
            </p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {stats.upcomingRenewal}
            </p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="mb-6 flex gap-2">
          <label className="text-sm font-medium text-slate-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "date" | "status" | "name")
            }
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="date">Registration Date</option>
            <option value="name">Company Name</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Companies List */}
        {sortedCompanies.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium">
              No registered companies yet
            </p>
            <p className="text-slate-500 mt-2">
              Create your first company through our order form to see it appear
              here
            </p>
            <Button
              onClick={() => navigate("/client/orders/new")}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create New Order
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCompanies.map((company) => {
              const daysUntilRenewal = daysUntilDate(company.nextRenewalDate);
              const daysUntilAccounts = daysUntilDate(
                company.nextAccountsFilingDate,
              );
              const isRenewalSoon =
                daysUntilRenewal <= 90 && daysUntilRenewal > 0;
              const isAccountsSoon =
                daysUntilAccounts <= 90 && daysUntilAccounts > 0;

              return (
                <div
                  key={company.id}
                  className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-slate-900">
                          {company.companyName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            company.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {company.status.charAt(0).toUpperCase() +
                            company.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        Company No: {company.companyNumber}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                        Incorporated
                      </p>
                      <p className="font-medium text-slate-900">
                        {formatDate(company.incorporationDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                        Next Renewal
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {formatDate(company.nextRenewalDate)}
                        </p>
                        {isRenewalSoon && (
                          <AlertCircle
                            className="w-4 h-4 text-orange-600"
                            title={`${daysUntilRenewal} days remaining`}
                          />
                        )}
                      </div>
                      {isRenewalSoon && (
                        <p className="text-xs text-orange-600 mt-1">
                          {daysUntilRenewal} days left
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                        Accounts Due
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {formatDate(company.nextAccountsFilingDate)}
                        </p>
                        {isAccountsSoon && (
                          <AlertCircle
                            className="w-4 h-4 text-orange-600"
                            title={`${daysUntilAccounts} days remaining`}
                          />
                        )}
                      </div>
                      {isAccountsSoon && (
                        <p className="text-xs text-orange-600 mt-1">
                          {daysUntilAccounts} days left
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                        Data Retrieved
                      </p>
                      <p className="font-medium text-slate-900">
                        {formatDate(company.fetchedAt)}
                      </p>
                    </div>
                  </div>

                  {company.registeredOffice && (
                    <div className="mb-4 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                        Registered Office
                      </p>
                      <p className="text-sm text-slate-700">
                        {company.registeredOffice}
                      </p>
                    </div>
                  )}

                  {/* Documents Section */}
                  {(() => {
                    const linkedOrder = mockOrders.find(
                      (o) => o.id === company.orderId,
                    );
                    const documents = linkedOrder?.operationFiles || [];
                    return documents.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-600 uppercase font-semibold mb-2">
                          Documents
                        </p>
                        <div className="space-y-2">
                          {documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <FileText className="w-4 h-4 text-slate-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate">
                                    {doc.fileName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {doc.stage}
                                  </p>
                                </div>
                              </div>
                              {doc.fileUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-auto"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <Button
                      onClick={() =>
                        navigate(
                          `/client/orders?company=${company.companyNumber}`,
                        )
                      }
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Order
                    </Button>
                    {isRenewalSoon && (
                      <div className="ml-auto flex items-center gap-2 text-orange-600 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        Renewal Due Soon
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
