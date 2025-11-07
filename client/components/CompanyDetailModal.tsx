import { X, User, Phone, Mail, MapPin, Building2, UserCheck } from "lucide-react";
import { RegisteredCompany } from "@/hooks/useCompanyDetails";
import { mockUsers, mockOrders, mockStaff } from "@/lib/mockData";

interface CompanyDetailModalProps {
  company: RegisteredCompany;
  onClose: () => void;
}

export default function CompanyDetailModal({
  company,
  onClose,
}: CompanyDetailModalProps) {
  const owner = mockUsers.find((u) => u.id === company.userId);

  // Find the order linked to this company
  const linkedOrder = mockOrders.find((o) => o.id === company.orderId);

  // Get the sales staff assigned to this company
  const salesStaff = linkedOrder
    ? mockStaff.find((s) => s.id === linkedOrder.assignedToSalesId)
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{company.companyName}</h2>
            <p className="text-blue-100 mt-1">Company Number: {company.companyNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-500 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Company Information Section */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Company Name
                </label>
                <p className="text-slate-900 font-medium">{company.companyName}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Company Number
                </label>
                <p className="text-slate-900 font-medium">{company.companyNumber}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Country
                </label>
                <p className="text-slate-900 font-medium">{company.country}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    company.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {company.status.charAt(0).toUpperCase() +
                    company.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Auth Code
                </label>
                <p className="text-slate-900 font-medium">{company.authCode}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Registered Office
                </label>
                <p className="text-slate-900 font-medium">
                  {company.registeredOffice}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Incorporation Date
                </label>
                <p className="text-slate-900 font-medium">
                  {new Date(company.incorporationDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Next Renewal Date
                </label>
                <p className="text-slate-900 font-medium">
                  {new Date(company.nextRenewalDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Accounts Filing Date
                </label>
                <p className="text-slate-900 font-medium">
                  {new Date(company.nextAccountsFilingDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>
            {company.sicCodes && company.sicCodes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                  SIC Codes
                </label>
                <div className="flex gap-2 flex-wrap">
                  {company.sicCodes.map((code) => (
                    <span
                      key={code}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Company Owner Information */}
          {owner && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Company Owner / Account Manager
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Full Name
                  </label>
                  <p className="text-slate-900 font-medium">
                    {owner.firstName} {owner.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Email Address
                  </label>
                  <a
                    href={`mailto:${owner.email}`}
                    className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                  >
                    <Mail className="w-4 h-4" />
                    {owner.email}
                  </a>
                </div>
                {owner.phone && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Phone
                    </label>
                    <a
                      href={`tel:${owner.phone}`}
                      className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                    >
                      <Phone className="w-4 h-4" />
                      {owner.phone}
                    </a>
                  </div>
                )}
                {owner.whatsappNumber && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      WhatsApp
                    </label>
                    <p className="text-slate-900 font-medium flex items-center gap-1">
                      <Phone className="w-4 h-4 text-green-600" />
                      {owner.whatsappNumber}
                    </p>
                  </div>
                )}
                {owner.companyName && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Company
                    </label>
                    <p className="text-slate-900 font-medium">
                      {owner.companyName}
                    </p>
                  </div>
                )}
                {owner.country && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Country
                    </label>
                    <p className="text-slate-900 font-medium flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {owner.country}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sales Responsible Information */}
          {salesStaff && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                Sales Responsible
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Staff Name
                  </label>
                  <p className="text-slate-900 font-medium">
                    {salesStaff.firstName} {salesStaff.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Department
                  </label>
                  <p className="text-slate-900 font-medium">
                    {salesStaff.department || "Sales"}
                  </p>
                </div>
                {salesStaff.email && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Email
                    </label>
                    <a
                      href={`mailto:${salesStaff.email}`}
                      className="text-green-600 hover:underline font-medium flex items-center gap-1"
                    >
                      <Mail className="w-4 h-4" />
                      {salesStaff.email}
                    </a>
                  </div>
                )}
                {salesStaff.phone && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Phone
                    </label>
                    <a
                      href={`tel:${salesStaff.phone}`}
                      className="text-green-600 hover:underline font-medium flex items-center gap-1"
                    >
                      <Phone className="w-4 h-4" />
                      {salesStaff.phone}
                    </a>
                  </div>
                )}
                {salesStaff.joinDate && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Member Since
                    </label>
                    <p className="text-slate-900 font-medium">
                      {new Date(salesStaff.joinDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition"
            >
              Close
            </button>
            <button
              onClick={() => alert("Edit functionality to be implemented")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Edit Company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
