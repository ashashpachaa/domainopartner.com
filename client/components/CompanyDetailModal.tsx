import { X, User as UserIcon, Phone, Mail, MapPin, Building2, UserCheck, FileText } from "lucide-react";
import { RegisteredCompany } from "@/hooks/useCompanyDetails";
import { mockUsers, mockOrders, mockStaff } from "@/lib/mockData";
import { useCompanyIncorporationLink } from "@/hooks/useCompanyIncorporationLink";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CompanyDetailModalProps {
  company: RegisteredCompany;
  onClose: () => void;
}

export default function CompanyDetailModal({
  company,
  onClose,
}: CompanyDetailModalProps) {
  const [amendmentTab, setAmendmentTab] = useState<string>("history");
  const [showAmendmentForm, setShowAmendmentForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amendments, setAmendments] = useState<any[]>([]);
  const { getIncorporationForCompany, canFileAmendments, getAmendmentHistory } = useCompanyIncorporationLink();

  // Load amendments on mount or when company changes
  useEffect(() => {
    // Try to get amendments from linked incorporation first
    const linkedAmendments = getAmendmentHistory(company);
    if (linkedAmendments.length > 0) {
      setAmendments(linkedAmendments);
      return;
    }

    // Fallback: check if amendments are stored directly on the company in localStorage
    const storedCompany = localStorage.getItem(`company_${company.id}`);
    if (storedCompany) {
      const parsed = JSON.parse(storedCompany);
      if (parsed.amendments) {
        setAmendments(parsed.amendments);
      }
    }
  }, [company.id]);

  // Amendment form states
  const [directorFirstName, setDirectorFirstName] = useState("");
  const [directorLastName, setDirectorLastName] = useState("");
  const [directorDOB, setDirectorDOB] = useState("");
  const [resignDirectorId, setResignDirectorId] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newAddressCity, setNewAddressCity] = useState("");
  const [newAddressPostcode, setNewAddressPostcode] = useState("");
  const [newSicCode, setNewSicCode] = useState("");
  const [newCapitalAmount, setNewCapitalAmount] = useState("");
  const [shareholderName, setShareholderName] = useState("");
  const [shareholderPercentage, setShareholderPercentage] = useState("");
  const [confirmationYear, setConfirmationYear] = useState(new Date().getFullYear());
  const [newCompanyName, setNewCompanyName] = useState("");
  const [registeredOfficeEmail, setRegisteredOfficeEmail] = useState(company.registeredOfficeEmail || "");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const owner = mockUsers.find((u) => u.id === company.userId);

  const handleSaveEmail = () => {
    const updatedCompany = {
      ...company,
      registeredOfficeEmail,
    };

    localStorage.setItem(`company_${company.id}`, JSON.stringify(updatedCompany));
    toast.success("Registered office email updated!");
    setIsEditingEmail(false);
  };

  // Find the order linked to this company
  const linkedOrder = mockOrders.find((o) => o.id === company.orderId);

  // Get the sales staff assigned to this company
  const salesStaff = linkedOrder
    ? mockStaff.find((s) => s.id === linkedOrder.assignedToSalesId)
    : null;

  // Get linked incorporation for amendments
  const incorporation = getIncorporationForCompany(company);
  const canAmend = canFileAmendments(company);

  const submitAmendment = async (formType: string, amendmentData: any) => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/companies-house/submit-amendment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incorporationId: incorporation?.id || company.id,
          formType,
          companyRegistrationNumber: company.companyNumber,
          amendment: amendmentData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit amendment");
      }

      const result = await response.json();
      const filingRef = result.filingReference || `CH-AMEND-${Date.now()}`;

      // Create amendment object
      const newAmendment = {
        id: `AMD-${Date.now()}`,
        formType,
        status: result.status || "filed",
        filingReference: filingRef,
        submittedAt: new Date().toISOString(),
        amendment: amendmentData,
      };

      // Persist amendment to incorporation's amendments array if linked
      if (incorporation) {
        const updatedIncorporation = {
          ...incorporation,
          amendments: [...(incorporation.amendments || []), newAmendment],
        };

        localStorage.setItem(
          `incorporation_${incorporation.id}`,
          JSON.stringify(updatedIncorporation)
        );
      } else {
        // Fallback: Store amendment directly on the company
        const storedCompany = localStorage.getItem(`company_${company.id}`);
        const companyData = storedCompany ? JSON.parse(storedCompany) : { ...company };
        companyData.amendments = [...(companyData.amendments || []), newAmendment];
        localStorage.setItem(`company_${company.id}`, JSON.stringify(companyData));
      }

      // Update local state to show amendment immediately
      setAmendments([...amendments, newAmendment]);

      toast.success(
        `Amendment submitted! Reference: ${filingRef}`
      );

      setShowAmendmentForm(false);
      setAmendmentTab("history");
      resetAmendmentForms();

      // Reload to reflect the new amendment in the UI
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error("Amendment submission error:", error);
      toast.error(error.message || "Failed to submit amendment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAmendmentForms = () => {
    setDirectorFirstName("");
    setDirectorLastName("");
    setDirectorDOB("");
    setResignDirectorId("");
    setNewAddress("");
    setNewAddressCity("");
    setNewAddressPostcode("");
    setNewSicCode("");
    setNewCapitalAmount("");
    setShareholderName("");
    setShareholderPercentage("");
    setConfirmationYear(new Date().getFullYear());
    setNewCompanyName("");
  };

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
                  Registered Office Email
                </label>
                {isEditingEmail ? (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={registeredOfficeEmail}
                      onChange={(e) => setRegisteredOfficeEmail(e.target.value)}
                      placeholder="office@company.co.uk"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                    />
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleSaveEmail}
                      disabled={!registeredOfficeEmail.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingEmail(false);
                        setRegisteredOfficeEmail(company.registeredOfficeEmail || "");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-slate-900 font-medium">
                      {registeredOfficeEmail || "Not set"}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingEmail(true)}
                    >
                      {registeredOfficeEmail ? "Edit" : "Add"}
                    </Button>
                  </div>
                )}
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

            {/* Reminder about Companies House email */}
            <div className="mt-6 pt-4 border-t border-slate-200 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                📧 Amendment Confirmation Email
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Companies House will send amendment confirmations to the registered office email address.
              </p>
              <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                <li>Update the email above to ensure you receive filings confirmations</li>
                <li>You can also check/update it on the <a href="https://www.companieshouse.gov.uk/services/authenticationandlogin" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:text-blue-700 underline">Companies House portal</a> (Company Details → Registered Office)</li>
                <li>Confirmations usually arrive within 1-2 hours after filing</li>
              </ul>
            </div>
          </div>

          {/* Account Owner (Client) Information */}
          {owner && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-purple-600" />
                Account Owner (Client)
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

          {/* Amendments Section */}
          {company.country === "United Kingdom" && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                Company Amendments
              </h3>

              <div className="space-y-4">
                <p className="text-sm text-slate-600 mb-4">
                  File amendments to update company details at Companies House.
                </p>

                  {/* Amendment Tabs */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <Button
                      onClick={() => { setAmendmentTab("history"); setShowAmendmentForm(false); }}
                      variant={amendmentTab === "history" ? "default" : "outline"}
                      size="sm"
                    >
                      Amendment History
                    </Button>
                    <Button
                      onClick={() => { setAmendmentTab("director_appoint"); setShowAmendmentForm(true); }}
                      variant={amendmentTab === "director_appoint" ? "default" : "outline"}
                      size="sm"
                    >
                      Appoint Director
                    </Button>
                    <Button
                      onClick={() => { setAmendmentTab("director_resign"); setShowAmendmentForm(true); }}
                      variant={amendmentTab === "director_resign" ? "default" : "outline"}
                      size="sm"
                    >
                      Resign Director
                    </Button>
                    <Button
                      onClick={() => { setAmendmentTab("address"); setShowAmendmentForm(true); }}
                      variant={amendmentTab === "address" ? "default" : "outline"}
                      size="sm"
                    >
                      Change Address
                    </Button>
                    <Button
                      onClick={() => { setAmendmentTab("sic"); setShowAmendmentForm(true); }}
                      variant={amendmentTab === "sic" ? "default" : "outline"}
                      size="sm"
                    >
                      Change SIC
                    </Button>
                    <Button
                      onClick={() => { setAmendmentTab("capital"); setShowAmendmentForm(true); }}
                      variant={amendmentTab === "capital" ? "default" : "outline"}
                      size="sm"
                    >
                      Increase Capital
                    </Button>
                    <Button
                      onClick={() => { setAmendmentTab("shareholder"); setShowAmendmentForm(true); }}
                      variant={amendmentTab === "shareholder" ? "default" : "outline"}
                      size="sm"
                    >
                      Shareholder Change
                    </Button>
                    <Button
                      onClick={() => { setAmendmentTab("annual_confirmation"); setShowAmendmentForm(true); }}
                      variant={amendmentTab === "annual_confirmation" ? "default" : "outline"}
                      size="sm"
                    >
                      Annual Confirmation
                    </Button>
                    <Button
                      onClick={() => { setAmendmentTab("company_name_change"); setShowAmendmentForm(true); }}
                      variant={amendmentTab === "company_name_change" ? "default" : "outline"}
                      size="sm"
                    >
                      Change Company Name
                    </Button>
                  </div>

                  {/* Amendment History View */}
                  {amendmentTab === "history" && !showAmendmentForm && (
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      {amendments.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-700 mb-3">Recent Amendments: {amendments.length}</p>
                          {amendments.map((amd: any) => (
                            <div key={amd.id} className="bg-slate-50 p-2 rounded border border-slate-200 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">
                                  {amd.formType.replace(/_/g, " ").toUpperCase()}
                                </span>
                                <span className={`font-bold ${amd.status === "filed" ? "text-green-600" : amd.status === "rejected" ? "text-red-600" : "text-blue-600"}`}>
                                  {amd.status}
                                </span>
                              </div>
                              {amd.filingReference && (
                                <p className="text-orange-600 font-medium mt-1">{amd.filingReference}</p>
                              )}
                              <p className="text-slate-500 mt-1">{new Date(amd.submittedAt || amd.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-600 text-sm">No amendments filed yet</p>
                      )}
                    </div>
                  )}

                  {/* Amendment Forms */}
                  {showAmendmentForm && (
                    <div className="bg-white border border-slate-200 p-4 rounded-lg space-y-4">
                      {/* Appoint Director Form */}
                      {amendmentTab === "director_appoint" && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-900">Appoint Director</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="First Name"
                              value={directorFirstName}
                              onChange={(e) => setDirectorFirstName(e.target.value)}
                              className="px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Last Name"
                              value={directorLastName}
                              onChange={(e) => setDirectorLastName(e.target.value)}
                              className="px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <input
                              type="date"
                              placeholder="Date of Birth"
                              value={directorDOB}
                              onChange={(e) => setDirectorDOB(e.target.value)}
                              className="col-span-2 px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <Button variant="outline" size="sm" disabled={isSubmitting} onClick={() => { setShowAmendmentForm(false); setDirectorFirstName(""); setDirectorLastName(""); setDirectorDOB(""); }}>Cancel</Button>
                            <Button size="sm" disabled={isSubmitting || !directorFirstName.trim() || !directorLastName.trim() || !directorDOB} className="bg-blue-600 hover:bg-blue-700" onClick={() => { submitAmendment("director_appoint", { firstName: directorFirstName, lastName: directorLastName, dateOfBirth: directorDOB }); }}>
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Resign Director Form */}
                      {amendmentTab === "director_resign" && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-900">Resign Director</h4>
                          <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Select Director</label>
                            <select
                              value={resignDirectorId}
                              onChange={(e) => setResignDirectorId(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            >
                              <option value="">Choose a director...</option>
                              <option value="DIR001">Ahmed Hassan</option>
                              <option value="DIR002">Fatima Hassan</option>
                            </select>
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <Button variant="outline" size="sm" disabled={isSubmitting} onClick={() => { setShowAmendmentForm(false); setResignDirectorId(""); }}>Cancel</Button>
                            <Button size="sm" disabled={isSubmitting || !resignDirectorId} className="bg-blue-600 hover:bg-blue-700" onClick={() => { submitAmendment("director_resign", { directorId: resignDirectorId }); }}>
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Change Address Form */}
                      {amendmentTab === "address" && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-900">Change Registered Office Address</h4>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Address Line 1"
                              value={newAddress}
                              onChange={(e) => setNewAddress(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              placeholder="City"
                              value={newAddressCity}
                              onChange={(e) => setNewAddressCity(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Postcode"
                              value={newAddressPostcode}
                              onChange={(e) => setNewAddressPostcode(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <Button variant="outline" size="sm" disabled={isSubmitting} onClick={() => { setShowAmendmentForm(false); setNewAddress(""); setNewAddressCity(""); setNewAddressPostcode(""); }}>Cancel</Button>
                            <Button size="sm" disabled={isSubmitting || !newAddress.trim() || !newAddressCity.trim() || !newAddressPostcode.trim()} className="bg-blue-600 hover:bg-blue-700" onClick={() => { submitAmendment("address_change", { addressLine1: newAddress, city: newAddressCity, postcode: newAddressPostcode }); }}>
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Change SIC Form */}
                      {amendmentTab === "sic" && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-900">Change SIC Code</h4>
                          <input
                            type="text"
                            placeholder="e.g., 62011 - Software publishing"
                            value={newSicCode}
                            onChange={(e) => setNewSicCode(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                          />
                          <div className="flex gap-2 justify-end pt-2">
                            <Button variant="outline" size="sm" disabled={isSubmitting} onClick={() => { setShowAmendmentForm(false); setNewSicCode(""); }}>Cancel</Button>
                            <Button size="sm" disabled={isSubmitting || !newSicCode.trim()} className="bg-blue-600 hover:bg-blue-700" onClick={() => { submitAmendment("sic_change", { newSicCode }); }}>
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Increase Capital Form */}
                      {amendmentTab === "capital" && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-900">Increase Share Capital</h4>
                          <input
                            type="number"
                            placeholder="New Capital Amount (£)"
                            value={newCapitalAmount}
                            onChange={(e) => setNewCapitalAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                          />
                          <div className="flex gap-2 justify-end pt-2">
                            <Button variant="outline" size="sm" disabled={isSubmitting} onClick={() => { setShowAmendmentForm(false); setNewCapitalAmount(""); }}>Cancel</Button>
                            <Button size="sm" disabled={isSubmitting || !newCapitalAmount || parseFloat(newCapitalAmount) <= 0} className="bg-blue-600 hover:bg-blue-700" onClick={() => { submitAmendment("capital_increase", { newCapitalAmount: parseFloat(newCapitalAmount) }); }}>
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Shareholder Change Form */}
                      {amendmentTab === "shareholder" && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-900">Shareholder Change</h4>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Shareholder Name"
                              value={shareholderName}
                              onChange={(e) => setShareholderName(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Ownership Percentage"
                              value={shareholderPercentage}
                              onChange={(e) => setShareholderPercentage(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <Button variant="outline" size="sm" disabled={isSubmitting} onClick={() => { setShowAmendmentForm(false); setShareholderName(""); setShareholderPercentage(""); }}>Cancel</Button>
                            <Button size="sm" disabled={isSubmitting || !shareholderName.trim() || !shareholderPercentage || parseFloat(shareholderPercentage) < 0 || parseFloat(shareholderPercentage) > 100} className="bg-blue-600 hover:bg-blue-700" onClick={() => { submitAmendment("shareholder_change", { shareholderName, shareholderPercentage: parseFloat(shareholderPercentage) }); }}>
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Annual Confirmation Form */}
                      {amendmentTab === "annual_confirmation" && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-900">Annual Confirmation (CS01)</h4>
                          <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Confirmation Year</label>
                            <input
                              type="number"
                              value={confirmationYear}
                              onChange={(e) => setConfirmationYear(parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            />
                          </div>
                          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded">Directors and shareholders will be confirmed as unchanged unless updated here.</p>
                          <div className="flex gap-2 justify-end pt-2">
                            <Button variant="outline" size="sm" disabled={isSubmitting} onClick={() => { setShowAmendmentForm(false); setConfirmationYear(new Date().getFullYear()); }}>Cancel</Button>
                            <Button size="sm" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700" onClick={() => { submitAmendment("annual_confirmation", { confirmationYear }); }}>
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Change Company Name Form */}
                      {amendmentTab === "company_name_change" && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-900">Change Company Name</h4>
                          <input
                            type="text"
                            placeholder="New Company Name"
                            value={newCompanyName}
                            onChange={(e) => setNewCompanyName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                          />
                          <div className="flex gap-2 justify-end pt-2">
                            <Button variant="outline" size="sm" disabled={isSubmitting} onClick={() => { setShowAmendmentForm(false); setNewCompanyName(""); }}>Cancel</Button>
                            <Button size="sm" disabled={isSubmitting || !newCompanyName.trim()} className="bg-blue-600 hover:bg-blue-700" onClick={() => { submitAmendment("company_name_change", { oldCompanyName: company.companyName, newCompanyName }); }}>
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                          </div>
                        </div>
                      )}
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
            <Button
              onClick={() => window.location.href = `/admin/uk-company-setup?companyId=${company.id}`}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Edit Company
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
