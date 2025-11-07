import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockCompanyIncorporations,
  mockStaff,
  CompanyIncorporation,
  CompanyDirector,
  CompanyShareholder,
} from "@/lib/mockData";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, FileText, Download, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface IncorporationFormData {
  companyName: string;
  companyType: "private_limited" | "public_limited" | "limited_by_guarantee";
  registeredOfficeAddress: string;
  registeredOfficePostcode: string;
  registeredOfficeCity: string;
  registeredOfficeCountry: string;
  shareCapital: string;
  shareType: string;
}

interface DirectorFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  postcode: string;
  city: string;
  country: string;
}

interface ShareholderFormData {
  firstName: string;
  lastName: string;
  address: string;
  postcode: string;
  city: string;
  country: string;
  shareAllocation: string;
}

export default function AdminUKCompanySetup() {
  const navigate = useNavigate();
  const [incorporations, setIncorporations] = useState<CompanyIncorporation[]>(
    mockCompanyIncorporations
  );
  const [showNewForm, setShowNewForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Main form state
  const [formData, setFormData] = useState<IncorporationFormData>({
    companyName: "",
    companyType: "private_limited",
    registeredOfficeAddress: "",
    registeredOfficePostcode: "",
    registeredOfficeCity: "",
    registeredOfficeCountry: "United Kingdom",
    shareCapital: "1000",
    shareType: "Ordinary Shares",
  });

  // Directors
  const [directors, setDirectors] = useState<CompanyDirector[]>([]);
  const [showDirectorForm, setShowDirectorForm] = useState(false);
  const [directorFormData, setDirectorFormData] = useState<DirectorFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    postcode: "",
    city: "",
    country: "United Kingdom",
  });

  // Shareholders
  const [shareholders, setShareholders] = useState<CompanyShareholder[]>([]);
  const [showShareholderForm, setShowShareholderForm] = useState(false);
  const [shareholderFormData, setShareholderFormData] = useState<ShareholderFormData>({
    firstName: "",
    lastName: "",
    address: "",
    postcode: "",
    city: "",
    country: "United Kingdom",
    shareAllocation: "",
  });

  // Stats
  const stats = useMemo(() => {
    return {
      total: incorporations.length,
      draft: incorporations.filter((i) => i.status === "draft").length,
      submitted: incorporations.filter((i) => i.status === "submitted").length,
      completed: incorporations.filter((i) => i.status === "completed").length,
      rejected: incorporations.filter((i) => i.status === "rejected").length,
    };
  }, [incorporations]);

  // Add Director
  const handleAddDirector = () => {
    if (!directorFormData.firstName || !directorFormData.lastName) {
      toast.error("Please fill in director details");
      return;
    }

    const newDirector: CompanyDirector = {
      id: `DIR${Date.now()}`,
      ...directorFormData,
    };

    setDirectors([...directors, newDirector]);
    setDirectorFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "",
      address: "",
      postcode: "",
      city: "",
      country: "United Kingdom",
    });
    setShowDirectorForm(false);
    toast.success("Director added");
  };

  // Add Shareholder
  const handleAddShareholder = () => {
    if (!shareholderFormData.firstName || !shareholderFormData.shareAllocation) {
      toast.error("Please fill in shareholder details");
      return;
    }

    const totalShares = shareholders.reduce((sum, s) => sum + parseInt(shareholderFormData.shareAllocation), 0) + parseInt(shareholderFormData.shareAllocation);
    const ownershipPercentage = (parseInt(shareholderFormData.shareAllocation) / totalShares) * 100;

    const newShareholder: CompanyShareholder = {
      id: `SHA${Date.now()}`,
      ...shareholderFormData,
      shareAllocation: parseInt(shareholderFormData.shareAllocation),
      ownershipPercentage,
    };

    setShareholders([...shareholders, newShareholder]);
    setShareholderFormData({
      firstName: "",
      lastName: "",
      address: "",
      postcode: "",
      city: "",
      country: "United Kingdom",
      shareAllocation: "",
    });
    setShowShareholderForm(false);
    toast.success("Shareholder added");
  };

  // Submit Incorporation
  const handleSubmitIncorporation = () => {
    if (
      !formData.companyName ||
      directors.length === 0 ||
      shareholders.length === 0
    ) {
      toast.error("Please fill in all required fields (company details, at least 1 director, at least 1 shareholder)");
      return;
    }

    const newIncorporation: CompanyIncorporation = {
      id: `INC${Date.now()}`,
      ...formData,
      shareCapital: parseInt(formData.shareCapital),
      directors,
      shareholders,
      status: "draft",
      createdBy: "S001",
      createdAt: new Date().toISOString(),
      currency: "GBP",
      filingFee: 12,
    };

    // Save to localStorage
    localStorage.setItem(`incorporation_${newIncorporation.id}`, JSON.stringify(newIncorporation));

    // Add to state
    setIncorporations([newIncorporation, ...incorporations]);

    // Reset form
    setFormData({
      companyName: "",
      companyType: "private_limited",
      registeredOfficeAddress: "",
      registeredOfficePostcode: "",
      registeredOfficeCity: "",
      registeredOfficeCountry: "United Kingdom",
      shareCapital: "1000",
      shareType: "Ordinary Shares",
    });
    setDirectors([]);
    setShareholders([]);
    setShowNewForm(false);
    setActiveTab("list");

    toast.success("Company incorporation saved as draft");
  };

  // Submit to Companies House (redirect to payment)
  const handleSubmitToCompaniesHouse = (incorporation: CompanyIncorporation) => {
    // Update status to payment_pending
    const updated = { ...incorporation, status: "payment_pending" as const };
    setIncorporations(incorporations.map((i) => (i.id === incorporation.id ? updated : i)));
    localStorage.setItem(`incorporation_${incorporation.id}`, JSON.stringify(updated));

    // Redirect to Companies House payment page with details
    const paymentUrl = `https://www.payments.service.gov.uk/?company=${encodeURIComponent(
      incorporation.companyName
    )}&fee=12&reference=${incorporation.id}`;

    toast.success("Redirecting to payment page...");
    setTimeout(() => {
      window.open(paymentUrl, "_blank");
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "payment_pending":
        return "bg-orange-100 text-orange-800";
      case "filing":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">UK Company Setup</h1>
            <p className="text-slate-600 mt-2">
              Create and file new companies with Companies House
            </p>
          </div>
          <Button
            onClick={() => {
              setActiveTab("create");
              setShowNewForm(true);
              setEditingId(null);
              setDirectors([]);
              setShareholders([]);
            }}
            className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Company
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Total</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Draft</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.draft}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Submitted</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{stats.submitted}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{stats.rejected}</p>
          </div>
        </div>

        {/* New Company Form */}
        {showNewForm && activeTab === "create" && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Create New Company</h2>

            {/* Company Details Section */}
            <div className="space-y-4 p-6 bg-slate-50 rounded-lg">
              <h3 className="text-lg font-bold text-slate-900">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    placeholder="Company name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Type *
                  </label>
                  <select
                    value={formData.companyType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyType: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="private_limited">Private Limited</option>
                    <option value="public_limited">Public Limited</option>
                    <option value="limited_by_guarantee">Limited by Guarantee</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Registered Office Address *
                  </label>
                  <input
                    type="text"
                    value={formData.registeredOfficeAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registeredOfficeAddress: e.target.value,
                      })
                    }
                    placeholder="Street address"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={formData.registeredOfficePostcode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registeredOfficePostcode: e.target.value,
                      })
                    }
                    placeholder="SW1A 1AA"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.registeredOfficeCity}
                    onChange={(e) =>
                      setFormData({ ...formData, registeredOfficeCity: e.target.value })
                    }
                    placeholder="London"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Share Capital *
                  </label>
                  <input
                    type="number"
                    value={formData.shareCapital}
                    onChange={(e) =>
                      setFormData({ ...formData, shareCapital: e.target.value })
                    }
                    placeholder="1000"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Share Type *
                  </label>
                  <input
                    type="text"
                    value={formData.shareType}
                    onChange={(e) =>
                      setFormData({ ...formData, shareType: e.target.value })
                    }
                    placeholder="Ordinary Shares"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Directors Section */}
            <div className="space-y-4 p-6 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Directors * (at least 1)</h3>
                <Button
                  onClick={() => setShowDirectorForm(!showDirectorForm)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Director
                </Button>
              </div>

              {showDirectorForm && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={directorFormData.firstName}
                      onChange={(e) =>
                        setDirectorFormData({
                          ...directorFormData,
                          firstName: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={directorFormData.lastName}
                      onChange={(e) =>
                        setDirectorFormData({
                          ...directorFormData,
                          lastName: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="date"
                      value={directorFormData.dateOfBirth}
                      onChange={(e) =>
                        setDirectorFormData({
                          ...directorFormData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Nationality"
                      value={directorFormData.nationality}
                      onChange={(e) =>
                        setDirectorFormData({
                          ...directorFormData,
                          nationality: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={directorFormData.address}
                      onChange={(e) =>
                        setDirectorFormData({
                          ...directorFormData,
                          address: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Postcode"
                      value={directorFormData.postcode}
                      onChange={(e) =>
                        setDirectorFormData({
                          ...directorFormData,
                          postcode: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={directorFormData.city}
                      onChange={(e) =>
                        setDirectorFormData({
                          ...directorFormData,
                          city: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={directorFormData.country}
                      onChange={(e) =>
                        setDirectorFormData({
                          ...directorFormData,
                          country: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddDirector}
                      className="bg-primary-600 hover:bg-primary-700 flex-1"
                    >
                      Add Director
                    </Button>
                    <Button
                      onClick={() => setShowDirectorForm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {directors.length > 0 && (
                <div className="space-y-2">
                  {directors.map((director) => (
                    <div
                      key={director.id}
                      className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-slate-900">
                        {director.firstName} {director.lastName} ({director.nationality})
                      </span>
                      <button
                        onClick={() =>
                          setDirectors(directors.filter((d) => d.id !== director.id))
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shareholders Section */}
            <div className="space-y-4 p-6 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Shareholders * (at least 1)</h3>
                <Button
                  onClick={() => setShowShareholderForm(!showShareholderForm)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Shareholder
                </Button>
              </div>

              {showShareholderForm && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={shareholderFormData.firstName}
                      onChange={(e) =>
                        setShareholderFormData({
                          ...shareholderFormData,
                          firstName: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={shareholderFormData.lastName}
                      onChange={(e) =>
                        setShareholderFormData({
                          ...shareholderFormData,
                          lastName: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={shareholderFormData.address}
                      onChange={(e) =>
                        setShareholderFormData({
                          ...shareholderFormData,
                          address: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Postcode"
                      value={shareholderFormData.postcode}
                      onChange={(e) =>
                        setShareholderFormData({
                          ...shareholderFormData,
                          postcode: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={shareholderFormData.city}
                      onChange={(e) =>
                        setShareholderFormData({
                          ...shareholderFormData,
                          city: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={shareholderFormData.country}
                      onChange={(e) =>
                        setShareholderFormData({
                          ...shareholderFormData,
                          country: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="Share Allocation"
                      value={shareholderFormData.shareAllocation}
                      onChange={(e) =>
                        setShareholderFormData({
                          ...shareholderFormData,
                          shareAllocation: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddShareholder}
                      className="bg-primary-600 hover:bg-primary-700 flex-1"
                    >
                      Add Shareholder
                    </Button>
                    <Button
                      onClick={() => setShowShareholderForm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {shareholders.length > 0 && (
                <div className="space-y-2">
                  {shareholders.map((shareholder) => (
                    <div
                      key={shareholder.id}
                      className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-medium text-slate-900">
                          {shareholder.firstName} {shareholder.lastName}
                        </span>
                        <p className="text-xs text-slate-500">
                          {shareholder.shareAllocation} shares ({shareholderFormData.shareAllocation ? Math.round((shareholder.shareAllocation / parseInt(shareholderFormData.shareAllocation)) * 100) : 0}%)
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setShareholders(shareholders.filter((s) => s.id !== shareholder.id))
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4">
              <Button
                onClick={() => {
                  setShowNewForm(false);
                  setFormData({
                    companyName: "",
                    companyType: "private_limited",
                    registeredOfficeAddress: "",
                    registeredOfficePostcode: "",
                    registeredOfficeCity: "",
                    registeredOfficeCountry: "United Kingdom",
                    shareCapital: "1000",
                    shareType: "Ordinary Shares",
                  });
                  setDirectors([]);
                  setShareholders([]);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitIncorporation}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Save as Draft
              </Button>
            </div>
          </div>
        )}

        {/* Incorporations List */}
        {activeTab === "list" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Company Incorporations</h2>
            <div className="grid grid-cols-1 gap-4">
              {incorporations.length > 0 ? (
                incorporations.map((inc) => (
                  <div
                    key={inc.id}
                    className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {inc.companyName}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${getStatusColor(
                              inc.status
                            )}`}
                          >
                            {inc.status.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          Type: <span className="font-medium">{inc.companyType.replace(/_/g, " ").toUpperCase()}</span>
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Directors</p>
                            <p className="font-bold text-slate-900">{inc.directors.length}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Shareholders</p>
                            <p className="font-bold text-slate-900">{inc.shareholders.length}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Share Capital</p>
                            <p className="font-bold text-slate-900">{inc.shareCapital}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Filing Fee</p>
                            <p className="font-bold text-slate-900">£{inc.filingFee}</p>
                          </div>
                        </div>
                        {inc.companyRegistrationNumber && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs text-green-700">
                              CRN: <span className="font-bold">{inc.companyRegistrationNumber}</span>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {inc.status === "draft" && (
                          <Button
                            onClick={() => handleSubmitToCompaniesHouse(inc)}
                            className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Submit & Pay
                          </Button>
                        )}
                        {inc.status === "completed" && (
                          <Button
                            variant="outline"
                            disabled
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">No companies created yet. Click "New Company" to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
