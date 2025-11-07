import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockCompanyIncorporations,
  CompanyIncorporation,
  CompanyDirector,
  CompanyShareholder,
} from "@/lib/mockData";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle,
  Copy,
  X,
  AlertCircle,
  CheckSquare,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { storeRegisteredCompany } from "@/hooks/useCompanyDetails";
import { useCompanyNameValidation } from "@/hooks/useCompanyNameValidation";

interface IncorporationStep {
  id: string;
  name: string;
  label: string;
}

interface OfficerDetail {
  id: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  businessOccupation: string;
  roles: {
    director: boolean;
    secretary: boolean;
    shareholder: boolean;
    psc: boolean;
  };
  personType: "individual" | "corporate";
  consent: boolean;
  residentialAddress: {
    line1: string;
    line2: string;
    town: string;
    county: string;
    postcode: string;
    country: string;
  };
  serviceAddress: {
    sameAsResidential: boolean;
    line1: string;
    line2: string;
    town: string;
    county: string;
    postcode: string;
    country: string;
  };
  shareholderAddress: {
    sameAsResidential: boolean;
    sameAsService: boolean;
    line1: string;
    line2: string;
    town: string;
    county: string;
    postcode: string;
    country: string;
  };
  shareholdings: {
    shareClass: string;
    currency: string;
    nominalValue: string;
    numberOfShares: string;
    amountPaid: string;
    totalAmount: string;
    paymentStatus: string;
  };
  significantControl: {
    pscConfirm: boolean;
    sharesOver25: string;
    sharesOver50: string;
    votingRightsOver25: string;
    votingRightsOver50: string;
    appointDirectors: string;
    exerciseControl: string;
    trustControl: {
      sharesOver25: string;
      votingRightsOver25: string;
      trustAppointDirectors: string;
    };
    firmControl: {
      sharesOver25: string;
      votingRightsOver25: string;
    };
  };
  personalIdentification: {
    type: string;
    answer: string;
  }[];
}

interface IncorporationFormData {
  companyName: string;
  companyType: "private_limited" | "public_limited" | "unlimited" | "private_guarantee";
  registeredOfficeLocation: string;
  registeredOfficeAddress: {
    line1: string;
    line2: string;
    town: string;
    county: string;
    postcode: string;
    country: string;
  };
  shareCapital: string;
  shareClass: {
    description: string;
    currency: string;
    nominalValue: string;
    type: string;
    prescribedParticulars: string;
  };
  shareClassification: boolean;
  businessActivities: string[];
  tradingAddress: string;
  documentsSelection: {
    articlesOfAssociation: string;
    firstBoardMinute: string;
    shareCertificate: string;
    printedDocuments: boolean;
    boundRecords: boolean;
    hmrcLetter: boolean;
    consentLetters: boolean;
  };
  bankingDetails: {
    barclaysBankAccount: boolean;
  };
  extras: {
    sameDayService: boolean;
    certificateOfGoodStanding: boolean;
    companySeal: boolean;
    companyStamp: boolean;
    companyNamePlate: boolean;
    domainName: boolean;
  };
  confirmations: {
    memorandumAccepted: boolean;
    futureActivitiesLawful: boolean;
    termsAccepted: boolean;
    authorityGiven: boolean;
  };
}

const steps: IncorporationStep[] = [
  { id: "1", name: "Company Details", label: "Company details" },
  { id: "2", name: "Officers / shareholders", label: "Officers / shareholders" },
  { id: "3", name: "Documents & extras", label: "Documents & extras" },
  { id: "4", name: "Summary", label: "Summary" },
  { id: "5", name: "Delivery", label: "Delivery" },
];

export default function AdminUKCompanySetup() {
  const navigate = useNavigate();
  const [incorporations, setIncorporations] = useState<CompanyIncorporation[]>(
    mockCompanyIncorporations,
  );
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [currentStep, setCurrentStep] = useState(0);
  const { validationResult, isValidating, checkCompanyName } = useCompanyNameValidation();

  const [formData, setFormData] = useState<IncorporationFormData>({
    companyName: "",
    companyType: "private_limited",
    registeredOfficeLocation: "England and Wales",
    registeredOfficeAddress: {
      line1: "",
      line2: "",
      town: "",
      county: "",
      postcode: "",
      country: "England and Wales",
    },
    shareCapital: "1",
    shareClass: {
      description: "Ordinary",
      currency: "GBP",
      nominalValue: "1",
      type: "Ordinary",
      prescribedParticulars: "Each share is entitled to one vote in any circumstances. Each share is entitled to share equally in dividend payments or any other distribution, including a distribution arising from a winding up of the company.",
    },
    shareClassification: false,
    businessActivities: [""],
    tradingAddress: "",
    documentsSelection: {
      articlesOfAssociation: "model",
      firstBoardMinute: "included",
      shareCertificate: "basic",
      printedDocuments: false,
      boundRecords: false,
      hmrcLetter: false,
      consentLetters: false,
    },
    bankingDetails: {
      barclaysBankAccount: false,
    },
    extras: {
      sameDayService: false,
      certificateOfGoodStanding: false,
      companySeal: false,
      companyStamp: false,
      companyNamePlate: false,
      domainName: false,
    },
    confirmations: {
      memorandumAccepted: false,
      futureActivitiesLawful: false,
      termsAccepted: false,
      authorityGiven: false,
    },
  });

  const [officers, setOfficers] = useState<OfficerDetail[]>([]);
  const [showOfficerForm, setShowOfficerForm] = useState(false);
  const [editingOfficerId, setEditingOfficerId] = useState<string | null>(null);
  const [currentOfficerStep, setCurrentOfficerStep] = useState(0);

  const [defaultOfficer, setDefaultOfficer] = useState<OfficerDetail>({
    id: `OFF${Date.now()}`,
    title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    businessOccupation: "",
    personType: "individual",
    roles: {
      director: false,
      secretary: false,
      shareholder: false,
      psc: false,
    },
    consent: false,
    residentialAddress: {
      line1: "",
      line2: "",
      town: "",
      county: "",
      postcode: "",
      country: "United Kingdom",
    },
    serviceAddress: {
      sameAsResidential: true,
      line1: "",
      line2: "",
      town: "",
      county: "",
      postcode: "",
      country: "United Kingdom",
    },
    shareholderAddress: {
      sameAsResidential: true,
      sameAsService: false,
      line1: "",
      line2: "",
      town: "",
      county: "",
      postcode: "",
      country: "United Kingdom",
    },
    shareholdings: {
      shareClass: "Ordinary",
      currency: "GBP",
      nominalValue: "1.00",
      numberOfShares: "",
      amountPaid: "",
      totalAmount: "",
      paymentStatus: "Fully paid",
    },
    significantControl: {
      pscConfirm: false,
      sharesOver25: "No",
      sharesOver50: "No",
      votingRightsOver25: "No",
      votingRightsOver50: "No",
      appointDirectors: "No",
      exerciseControl: "No",
      trustControl: {
        sharesOver25: "No",
        votingRightsOver25: "No",
        trustAppointDirectors: "No",
      },
      firmControl: {
        sharesOver25: "No",
        votingRightsOver25: "No",
      },
    },
    personalIdentification: [
      { type: "", answer: "" },
      { type: "", answer: "" },
      { type: "", answer: "" },
    ],
  });

  const [currentOfficer, setCurrentOfficer] = useState<OfficerDetail>(defaultOfficer);

  const handleAddOfficer = () => {
    if (!currentOfficer.firstName || !currentOfficer.lastName) {
      toast.error("Please fill in officer name");
      return;
    }

    if (!Object.values(currentOfficer.roles).some(r => r)) {
      toast.error("Please select at least one role");
      return;
    }

    if (editingOfficerId) {
      setOfficers(officers.map(o => o.id === editingOfficerId ? currentOfficer : o));
      toast.success("Officer updated");
      setEditingOfficerId(null);
    } else {
      setOfficers([...officers, currentOfficer]);
      toast.success("Officer added");
    }

    setShowOfficerForm(false);
    setCurrentOfficerStep(0);
    setCurrentOfficer({ ...defaultOfficer, id: `OFF${Date.now()}` });
  };

  const handleEditOfficer = (officer: OfficerDetail) => {
    setCurrentOfficer(officer);
    setEditingOfficerId(officer.id);
    setShowOfficerForm(true);
    setCurrentOfficerStep(0);
  };

  const handleDeleteOfficer = (id: string) => {
    setOfficers(officers.filter(o => o.id !== id));
    toast.success("Officer removed");
  };

  const handleSubmitIncorporation = () => {
    if (!formData.companyName || !formData.registeredOfficeAddress.postcode) {
      toast.error("Please fill in required company details");
      return;
    }

    if (isValidating) {
      toast.error("Please wait for company name validation to complete");
      return;
    }

    if (validationResult?.isAvailable === false) {
      toast.error("Please choose a different company name. This name already exists or is too similar to an existing company.");
      return;
    }

    if (validationResult?.isAvailable === null && formData.companyName) {
      toast.error("Please validate the company name before submitting");
      return;
    }

    if (officers.length === 0) {
      toast.error("Please add at least one director");
      return;
    }

    if (!formData.confirmations.memorandumAccepted || !formData.confirmations.termsAccepted) {
      toast.error("Please accept all confirmations");
      return;
    }

    const directors = officers.filter(o => o.roles.director);
    const shareholders = officers.filter(o => o.roles.shareholder);

    const newIncorporation: CompanyIncorporation = {
      id: `INC${Date.now()}`,
      companyName: formData.companyName,
      companyType: formData.companyType as any,
      registeredOfficeAddress: `${formData.registeredOfficeAddress.line1}, ${formData.registeredOfficeAddress.town}, ${formData.registeredOfficeAddress.postcode}`,
      registeredOfficePostcode: formData.registeredOfficeAddress.postcode,
      registeredOfficeCity: formData.registeredOfficeAddress.town,
      registeredOfficeCountry: formData.registeredOfficeAddress.country,
      shareCapital: parseInt(formData.shareCapital),
      shareType: formData.shareClass.type,
      sicCode: formData.businessActivities[0] || "",
      directors: directors.map(o => ({
        id: o.id,
        firstName: o.firstName,
        lastName: o.lastName,
        dateOfBirth: o.dateOfBirth,
        nationality: o.nationality,
        address: o.residentialAddress.line1,
        postcode: o.residentialAddress.postcode,
        city: o.residentialAddress.town,
        country: o.residentialAddress.country,
      })),
      shareholders: shareholders.map(o => ({
        id: o.id,
        firstName: o.firstName,
        lastName: o.lastName,
        address: o.residentialAddress.line1,
        postcode: o.residentialAddress.postcode,
        city: o.residentialAddress.town,
        country: o.residentialAddress.country,
        shareAllocation: parseInt(o.shareholdings.numberOfShares) || 0,
        ownershipPercentage: 0,
      })),
      status: "draft",
      createdBy: "S001",
      createdAt: new Date().toISOString(),
      currency: "GBP",
      filingFee: 12,
      memorandumOfAssociationAccepted: formData.confirmations.memorandumAccepted,
      articlesOfAssociationAccepted: true,
      complianceStatementAccepted: true,
      directorConsentAccepted: true,
      shareholderConsentAccepted: true,
    };

    localStorage.setItem(
      `incorporation_${newIncorporation.id}`,
      JSON.stringify(newIncorporation),
    );

    setIncorporations([newIncorporation, ...incorporations]);
    setActiveTab("list");
    setCurrentStep(0);
    resetForm();

    toast.success("Company incorporation saved as draft");
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      companyType: "private_limited",
      registeredOfficeLocation: "England and Wales",
      registeredOfficeAddress: {
        line1: "",
        line2: "",
        town: "",
        county: "",
        postcode: "",
        country: "England and Wales",
      },
      shareCapital: "1",
      shareClass: {
        description: "Ordinary",
        currency: "GBP",
        nominalValue: "1",
        type: "Ordinary",
        prescribedParticulars: "Each share is entitled to one vote in any circumstances. Each share is entitled to share equally in dividend payments or any other distribution, including a distribution arising from a winding up of the company.",
      },
      shareClassification: false,
      businessActivities: [""],
      tradingAddress: "",
      documentsSelection: {
        articlesOfAssociation: "model",
        firstBoardMinute: "included",
        shareCertificate: "basic",
        printedDocuments: false,
        boundRecords: false,
        hmrcLetter: false,
        consentLetters: false,
      },
      bankingDetails: {
        barclaysBankAccount: false,
      },
      extras: {
        sameDayService: false,
        certificateOfGoodStanding: false,
        companySeal: false,
        companyStamp: false,
        companyNamePlate: false,
        domainName: false,
      },
      confirmations: {
        memorandumAccepted: false,
        futureActivitiesLawful: false,
        termsAccepted: false,
        authorityGiven: false,
      },
    });
    setOfficers([]);
    setShowOfficerForm(false);
    setEditingOfficerId(null);
    setCurrentOfficerStep(0);
    setCurrentOfficer({ ...defaultOfficer, id: `OFF${Date.now()}` });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">UK Company Setup</h1>
            <p className="text-slate-600 mt-2">Create and file new companies with Companies House</p>
          </div>
          <Button
            onClick={() => {
              setActiveTab("create");
              setCurrentStep(0);
              resetForm();
            }}
            className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Company
          </Button>
        </div>

        {activeTab === "create" && (
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            {!showOfficerForm ? (
              <>
                <div className="flex gap-8">
                  <div className="w-48 flex-shrink-0">
                    <div className="space-y-2">
                      {steps.map((step, idx) => (
                        <div
                          key={step.id}
                          onClick={() => setCurrentStep(idx)}
                          className={`p-4 rounded-lg cursor-pointer transition ${
                            currentStep === idx
                              ? "bg-blue-600 text-white"
                              : currentStep > idx
                              ? "bg-green-100 text-green-900"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{step.id}</span>
                            {currentStep > idx && <CheckCircle className="w-4 h-4" />}
                          </div>
                          <p className="text-sm font-medium">{step.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    {currentStep === 0 && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">Enter company name and select company type</h2>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Company name *</label>
                            <input
                              type="text"
                              value={formData.companyName}
                              onChange={(e) => {
                                setFormData({ ...formData, companyName: e.target.value });
                                checkCompanyName(e.target.value);
                              }}
                              placeholder="Company name"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                            {formData.companyName && (
                              <div className="mt-2 space-y-1">
                                {isValidating && (
                                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                                    <Loader className="w-4 h-4 animate-spin" />
                                    <span>Checking availability...</span>
                                  </div>
                                )}

                                {!isValidating && validationResult && (
                                  <>
                                    {validationResult.isAvailable === true && (
                                      <div className="flex items-center gap-2 text-green-600 text-sm">
                                        <CheckSquare className="w-4 h-4" />
                                        <span>✓ Company name is available</span>
                                      </div>
                                    )}

                                    {validationResult.isAvailable === false && validationResult.exactMatch && (
                                      <div className="flex items-center gap-2 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <div>
                                          <span>✗ Company name already exists: </span>
                                          <strong>{validationResult.exactMatch.title}</strong>
                                          {validationResult.exactMatch.company_status && (
                                            <span> ({validationResult.exactMatch.company_status})</span>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {validationResult.similarMatch && !validationResult.exactMatch && (
                                      <div className="flex items-center gap-2 text-amber-600 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <div>
                                          <span>⚠ Similar company found: </span>
                                          <strong>{validationResult.similarMatch.title}</strong>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Select the type of company you wish to form *</label>
                            <div className="space-y-3">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="companyType"
                                  value="private_limited"
                                  checked={formData.companyType === "private_limited"}
                                  onChange={(e) => setFormData({ ...formData, companyType: e.target.value as any })}
                                  className="w-4 h-4"
                                />
                                <div>
                                  <p className="font-medium text-slate-900">Private company limited by shares</p>
                                </div>
                              </label>

                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="companyType"
                                  value="private_guarantee"
                                  checked={formData.companyType === "private_guarantee"}
                                  onChange={(e) => setFormData({ ...formData, companyType: e.target.value as any })}
                                  className="w-4 h-4"
                                />
                                <div>
                                  <p className="font-medium text-slate-900">Private company limited by guarantee</p>
                                </div>
                              </label>

                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="companyType"
                                  value="public_limited"
                                  checked={formData.companyType === "public_limited"}
                                  onChange={(e) => setFormData({ ...formData, companyType: e.target.value as any })}
                                  className="w-4 h-4"
                                />
                                <div>
                                  <p className="font-medium text-slate-900">Public limited company (PLC)</p>
                                </div>
                              </label>

                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="companyType"
                                  value="unlimited"
                                  checked={formData.companyType === "unlimited"}
                                  onChange={(e) => setFormData({ ...formData, companyType: e.target.value as any })}
                                  className="w-4 h-4"
                                />
                                <div>
                                  <p className="font-medium text-slate-900">Community interest company (CIC)</p>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold text-slate-900">Officers / shareholders / PSCs of your company</h2>
                          <Button
                            onClick={() => {
                              setShowOfficerForm(true);
                              setCurrentOfficerStep(0);
                              setCurrentOfficer({ ...defaultOfficer, id: `OFF${Date.now()}` });
                              setEditingOfficerId(null);
                            }}
                            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add first officer / shareholder / PSC
                          </Button>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900 space-y-2">
                          <p>Please add your first officer / shareholder / PSC.</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>You must have at least one director who is an individual of at least 16 years of age</li>
                            <li>You must have at least one shareholder</li>
                            <li>Both the director and shareholder roles can be fulfilled by the same individual</li>
                            <li>You must include details of all People with Significant Control over the company (PSCs), who may also be officers or shareholders</li>
                          </ul>
                        </div>

                        {officers.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-slate-100 border-b border-slate-200">
                                <tr>
                                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">Name</th>
                                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-900">Dir</th>
                                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-900">Sec</th>
                                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-900">Shares</th>
                                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-900">PSC</th>
                                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-900">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {officers.map((officer) => (
                                  <tr key={officer.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                      {officer.firstName} {officer.lastName}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {officer.roles.director && <span className="text-green-600 font-bold">✓</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {officer.roles.secretary && <span className="text-green-600 font-bold">✓</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {officer.roles.shareholder && <span className="text-slate-900">{officer.shareholdings.numberOfShares}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {officer.roles.psc && <span className="text-green-600 font-bold">✓</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <button
                                          onClick={() => handleEditOfficer(officer)}
                                          className="text-blue-600 hover:text-blue-700"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteOfficer(officer.id)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">Share classes</h2>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Share class description</label>
                            <input
                              type="text"
                              value={formData.shareClass.description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  shareClass: { ...formData.shareClass, description: e.target.value },
                                })
                              }
                              placeholder="e.g., Ordinary"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                              <select
                                value={formData.shareClass.currency}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    shareClass: { ...formData.shareClass, currency: e.target.value },
                                  })
                                }
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                              >
                                <option value="GBP">£ GBP</option>
                                <option value="EUR">€ EUR</option>
                                <option value="USD">$ USD</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Nominal value per share</label>
                              <input
                                type="text"
                                value={formData.shareClass.nominalValue}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    shareClass: { ...formData.shareClass, nominalValue: e.target.value },
                                  })
                                }
                                placeholder="1.00"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Type of share</label>
                            <input
                              type="text"
                              value={formData.shareClass.type}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  shareClass: { ...formData.shareClass, type: e.target.value },
                                })
                              }
                              placeholder="Ordinary"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Prescribed particulars</label>
                            <textarea
                              value={formData.shareClass.prescribedParticulars}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  shareClass: { ...formData.shareClass, prescribedParticulars: e.target.value },
                                })
                              }
                              rows={4}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.shareClassification}
                              onChange={(e) => setFormData({ ...formData, shareClassification: e.target.checked })}
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm font-medium text-slate-700">Do you want to add additional share classes?</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">Documents & extras</h2>

                        <div className="space-y-4">
                          <div className="border-t border-slate-200 pt-4">
                            <h3 className="font-bold text-slate-900 mb-3">Documents</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between py-2">
                                <span>Articles of association</span>
                                <span className="text-slate-600">Model articles of association - Yes - No extra cost</span>
                              </div>
                              <div className="flex justify-between py-2 border-t border-slate-200 pt-2">
                                <span>First board minute - electronic</span>
                                <span className="text-slate-600">Yes - Included in package</span>
                              </div>
                              <div className="flex justify-between py-2 border-t border-slate-200 pt-2">
                                <span>Share certificate - Online Basic share certificates</span>
                                <span className="text-slate-600">Yes - No extra cost</span>
                              </div>
                              <div className="flex justify-between py-2 border-t border-slate-200 pt-2">
                                <span>Printed incorporation documents</span>
                                <span className="text-slate-600">No</span>
                              </div>
                              <div className="flex justify-between py-2 border-t border-slate-200 pt-2">
                                <span>Bound company records</span>
                                <span className="text-slate-600">No</span>
                              </div>
                              <div className="flex justify-between py-2 border-t border-slate-200 pt-2">
                                <span>Letter notifying HMRC the company is dormant</span>
                                <span className="text-slate-600">No</span>
                              </div>
                              <div className="flex justify-between py-2 border-t border-slate-200 pt-2">
                                <span>Officer consent to act letter(s)</span>
                                <span className="text-slate-600">No</span>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-200 pt-4">
                            <h3 className="font-bold text-slate-900 mb-3">Banking</h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.bankingDetails.barclaysBankAccount}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    bankingDetails: { barclaysBankAccount: e.target.checked },
                                  })
                                }
                                className="w-4 h-4 rounded"
                              />
                              <span className="text-sm text-slate-700">Barclays bank account - The account is not available as one or more of the officers or shareholders is not a UK resident</span>
                            </label>
                          </div>

                          <div className="border-t border-slate-200 pt-4">
                            <h3 className="font-bold text-slate-900 mb-3">Extras</h3>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.extras.sameDayService}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      extras: { ...formData.extras, sameDayService: e.target.checked },
                                    })
                                  }
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-slate-700">Same day service</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.extras.certificateOfGoodStanding}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      extras: { ...formData.extras, certificateOfGoodStanding: e.target.checked },
                                    })
                                  }
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-slate-700">Certificate of good standing</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.extras.companySeal}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      extras: { ...formData.extras, companySeal: e.target.checked },
                                    })
                                  }
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-slate-700">Company seal</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.extras.companyStamp}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      extras: { ...formData.extras, companyStamp: e.target.checked },
                                    })
                                  }
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-slate-700">Company stamp</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.extras.companyNamePlate}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      extras: { ...formData.extras, companyNamePlate: e.target.checked },
                                    })
                                  }
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-slate-700">Company name plate</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.extras.domainName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      extras: { ...formData.extras, domainName: e.target.checked },
                                    })
                                  }
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-slate-700">Domain name</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">Confirmation</h2>

                        <div className="space-y-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.confirmations.memorandumAccepted}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  confirmations: { ...formData.confirmations, memorandumAccepted: e.target.checked },
                                })
                              }
                              className="w-4 h-4 rounded mt-1"
                            />
                            <div>
                              <p className="font-medium text-slate-900">Tick to confirm that each subscriber to this memorandum of association wishes to form a company under the Companies Act 2006 and agrees to become a member of the company and to take at least one share.</p>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer border-t border-slate-200 pt-4">
                            <input
                              type="checkbox"
                              checked={formData.confirmations.futureActivitiesLawful}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  confirmations: { ...formData.confirmations, futureActivitiesLawful: e.target.checked },
                                })
                              }
                              className="w-4 h-4 rounded mt-1"
                            />
                            <div>
                              <p className="font-medium text-slate-900">Tick to confirm that the intended future activities of the company are lawful.</p>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer border-t border-slate-200 pt-4">
                            <input
                              type="checkbox"
                              checked={formData.confirmations.termsAccepted}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  confirmations: { ...formData.confirmations, termsAccepted: e.target.checked },
                                })
                              }
                              className="w-4 h-4 rounded mt-1"
                            />
                            <div>
                              <p className="font-medium text-slate-900">I confirm my acceptance of the Inform Direct <a href="#" className="text-blue-600 underline">terms and conditions</a> and <a href="#" className="text-blue-600 underline">system capabilities</a></p>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer border-t border-slate-200 pt-4">
                            <input
                              type="checkbox"
                              checked={formData.confirmations.authorityGiven}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  confirmations: { ...formData.confirmations, authorityGiven: e.target.checked },
                                })
                              }
                              className="w-4 h-4 rounded mt-1"
                            />
                            <div>
                              <p className="font-medium text-slate-900">Tick to confirm that you have the explicit authority from the officers and those who benefit from the company being formed for their details and those of the company to be passed to Registered Office (UK) Ltd (trading as MYCO Limited) for the purpose of providing registered office and/or service address services, to carry out identity verification checks on them and to be contacted directly by Registered Office (UK) Ltd.</p>
                            </div>
                          </label>
                        </div>

                        {formData.confirmations.memorandumAccepted &&
                        formData.confirmations.futureActivitiesLawful &&
                        formData.confirmations.termsAccepted &&
                        formData.confirmations.authorityGiven ? (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 font-medium">✓ All confirmations accepted</p>
                          </div>
                        ) : (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 font-medium">⚠️ All confirmations must be accepted before proceeding</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
                      <Button
                        onClick={() => {
                          if (currentStep > 0) {
                            setCurrentStep(currentStep - 1);
                          } else {
                            setActiveTab("list");
                            resetForm();
                          }
                        }}
                        variant="outline"
                      >
                        {currentStep === 0 ? "Close" : "Previous"}
                      </Button>

                      {currentStep < steps.length - 1 ? (
                        <Button
                          onClick={() => {
                            if (currentStep === 0 && !formData.companyName) {
                              toast.error("Please enter company name");
                              return;
                            }
                            if (currentStep === 1 && officers.length === 0) {
                              toast.error("Please add at least one officer");
                              return;
                            }
                            setCurrentStep(currentStep + 1);
                          }}
                          className="bg-green-600 hover:bg-green-700 ml-auto flex items-center gap-2"
                        >
                          Continue
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmitIncorporation}
                          className="bg-green-600 hover:bg-green-700 ml-auto"
                        >
                          Submit & Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingOfficerId ? "Edit" : "Add"} Officer / Shareholder / PSC
                  </h2>
                  <button
                    onClick={() => {
                      setShowOfficerForm(false);
                      setCurrentOfficerStep(0);
                      setEditingOfficerId(null);
                      setCurrentOfficer({ ...defaultOfficer, id: `OFF${Date.now()}` });
                    }}
                  >
                    <X className="w-6 h-6 text-slate-600 hover:text-slate-900" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-6">
                  {["Role", "Details", "Addresses", "Shareholding", "Significant Control"].map((label, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentOfficerStep(idx)}
                      className={`py-2 px-3 rounded text-sm font-medium transition ${
                        currentOfficerStep === idx
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {currentOfficerStep === 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Provide details for the officer / shareholder / PSC of your company</h3>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Person type</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="personType"
                            value="individual"
                            checked={currentOfficer.personType === "individual"}
                            onChange={(e) => setCurrentOfficer({ ...currentOfficer, personType: e.target.value as any })}
                          />
                          <span className="text-sm">Individual</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="personType"
                            value="corporate"
                            checked={currentOfficer.personType === "corporate"}
                            onChange={(e) => setCurrentOfficer({ ...currentOfficer, personType: e.target.value as any })}
                          />
                          <span className="text-sm">Corporate</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentOfficer.roles.director}
                            onChange={(e) =>
                              setCurrentOfficer({
                                ...currentOfficer,
                                roles: { ...currentOfficer.roles, director: e.target.checked },
                              })
                            }
                          />
                          <span className="text-sm">Director</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentOfficer.roles.secretary}
                            onChange={(e) =>
                              setCurrentOfficer({
                                ...currentOfficer,
                                roles: { ...currentOfficer.roles, secretary: e.target.checked },
                              })
                            }
                          />
                          <span className="text-sm">Secretary</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentOfficer.roles.shareholder}
                            onChange={(e) =>
                              setCurrentOfficer({
                                ...currentOfficer,
                                roles: { ...currentOfficer.roles, shareholder: e.target.checked },
                              })
                            }
                          />
                          <span className="text-sm">Shareholder</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentOfficer.roles.psc}
                            onChange={(e) =>
                              setCurrentOfficer({
                                ...currentOfficer,
                                roles: { ...currentOfficer.roles, psc: e.target.checked },
                              })
                            }
                          />
                          <span className="text-sm">Person with significant control</span>
                        </label>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">You must appoint at least one director who is an individual of at least 16 years of age.</p>
                  </div>
                )}

                {currentOfficerStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Enter person details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <select
                        value={currentOfficer.title}
                        onChange={(e) => setCurrentOfficer({ ...currentOfficer, title: e.target.value })}
                        className="px-4 py-2 border border-slate-300 rounded-lg"
                      >
                        <option value="">-- Please select --</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                        <option value="Dr">Dr</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Forename"
                        value={currentOfficer.firstName}
                        onChange={(e) => setCurrentOfficer({ ...currentOfficer, firstName: e.target.value })}
                        className="px-4 py-2 border border-slate-300 rounded-lg"
                      />

                      <input
                        type="text"
                        placeholder="Middle name(s)"
                        value={currentOfficer.middleName}
                        onChange={(e) => setCurrentOfficer({ ...currentOfficer, middleName: e.target.value })}
                        className="px-4 py-2 border border-slate-300 rounded-lg"
                      />

                      <input
                        type="text"
                        placeholder="Surname"
                        value={currentOfficer.lastName}
                        onChange={(e) => setCurrentOfficer({ ...currentOfficer, lastName: e.target.value })}
                        className="px-4 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date of birth</label>
                      <input
                        type="date"
                        value={currentOfficer.dateOfBirth}
                        onChange={(e) => setCurrentOfficer({ ...currentOfficer, dateOfBirth: e.target.value })}
                        className="px-4 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nationality</label>
                      <input
                        type="text"
                        placeholder="e.g., British, Egyptian"
                        value={currentOfficer.nationality}
                        onChange={(e) => setCurrentOfficer({ ...currentOfficer, nationality: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Business occupation</label>
                      <input
                        type="text"
                        placeholder="e.g., CEO, Manager"
                        value={currentOfficer.businessOccupation}
                        onChange={(e) => setCurrentOfficer({ ...currentOfficer, businessOccupation: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentOfficer.consent}
                        onChange={(e) => setCurrentOfficer({ ...currentOfficer, consent: e.target.checked })}
                        className="w-4 h-4 rounded mt-1"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Tick to confirm that the officer has given consent to act</p>
                      </div>
                    </label>
                  </div>
                )}

                {currentOfficerStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Enter person address details</h3>

                    <div>
                      <h4 className="font-bold text-slate-900 mb-3">Residential address</h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Address line 1"
                          value={currentOfficer.residentialAddress.line1}
                          onChange={(e) =>
                            setCurrentOfficer({
                              ...currentOfficer,
                              residentialAddress: { ...currentOfficer.residentialAddress, line1: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Address line 2"
                          value={currentOfficer.residentialAddress.line2}
                          onChange={(e) =>
                            setCurrentOfficer({
                              ...currentOfficer,
                              residentialAddress: { ...currentOfficer.residentialAddress, line2: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Town"
                          value={currentOfficer.residentialAddress.town}
                          onChange={(e) =>
                            setCurrentOfficer({
                              ...currentOfficer,
                              residentialAddress: { ...currentOfficer.residentialAddress, town: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="County / region"
                          value={currentOfficer.residentialAddress.county}
                          onChange={(e) =>
                            setCurrentOfficer({
                              ...currentOfficer,
                              residentialAddress: { ...currentOfficer.residentialAddress, county: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Postcode"
                          value={currentOfficer.residentialAddress.postcode}
                          onChange={(e) =>
                            setCurrentOfficer({
                              ...currentOfficer,
                              residentialAddress: { ...currentOfficer.residentialAddress, postcode: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                        <select
                          value={currentOfficer.residentialAddress.country}
                          onChange={(e) =>
                            setCurrentOfficer({
                              ...currentOfficer,
                              residentialAddress: { ...currentOfficer.residentialAddress, country: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="Egypt">Egypt</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 mb-3">Service address</h4>
                      <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={currentOfficer.serviceAddress.sameAsResidential}
                          onChange={(e) =>
                            setCurrentOfficer({
                              ...currentOfficer,
                              serviceAddress: { ...currentOfficer.serviceAddress, sameAsResidential: e.target.checked },
                            })
                          }
                        />
                        <span className="text-sm">Same as residential address above</span>
                      </label>

                      {!currentOfficer.serviceAddress.sameAsResidential && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Address line 1"
                            value={currentOfficer.serviceAddress.line1}
                            onChange={(e) =>
                              setCurrentOfficer({
                                ...currentOfficer,
                                serviceAddress: { ...currentOfficer.serviceAddress, line1: e.target.value },
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="Address line 2"
                            value={currentOfficer.serviceAddress.line2}
                            onChange={(e) =>
                              setCurrentOfficer({
                                ...currentOfficer,
                                serviceAddress: { ...currentOfficer.serviceAddress, line2: e.target.value },
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="Town"
                            value={currentOfficer.serviceAddress.town}
                            onChange={(e) =>
                              setCurrentOfficer({
                                ...currentOfficer,
                                serviceAddress: { ...currentOfficer.serviceAddress, town: e.target.value },
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="County / region"
                            value={currentOfficer.serviceAddress.county}
                            onChange={(e) =>
                              setCurrentOfficer({
                                ...currentOfficer,
                                serviceAddress: { ...currentOfficer.serviceAddress, county: e.target.value },
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="Postcode"
                            value={currentOfficer.serviceAddress.postcode}
                            onChange={(e) =>
                              setCurrentOfficer({
                                ...currentOfficer,
                                serviceAddress: { ...currentOfficer.serviceAddress, postcode: e.target.value },
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                          />
                          <select
                            value={currentOfficer.serviceAddress.country}
                            onChange={(e) =>
                              setCurrentOfficer({
                                ...currentOfficer,
                                serviceAddress: { ...currentOfficer.serviceAddress, country: e.target.value },
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                          >
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="United Arab Emirates">United Arab Emirates</option>
                            <option value="Egypt">Egypt</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentOfficerStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Enter details of shareholdings</h3>

                    {currentOfficer.roles.shareholder && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded text-sm text-blue-900">
                          <p>Shareholding 1 for {currentOfficer.firstName} {currentOfficer.lastName}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Share class</label>
                            <input
                              type="text"
                              value={currentOfficer.shareholdings.shareClass}
                              onChange={(e) =>
                                setCurrentOfficer({
                                  ...currentOfficer,
                                  shareholdings: { ...currentOfficer.shareholdings, shareClass: e.target.value },
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                            <input
                              type="text"
                              value={currentOfficer.shareholdings.currency}
                              onChange={(e) =>
                                setCurrentOfficer({
                                  ...currentOfficer,
                                  shareholdings: { ...currentOfficer.shareholdings, currency: e.target.value },
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nominal value per share</label>
                            <input
                              type="text"
                              value={currentOfficer.shareholdings.nominalValue}
                              onChange={(e) =>
                                setCurrentOfficer({
                                  ...currentOfficer,
                                  shareholdings: { ...currentOfficer.shareholdings, nominalValue: e.target.value },
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Number of shares *</label>
                            <input
                              type="number"
                              value={currentOfficer.shareholdings.numberOfShares}
                              onChange={(e) =>
                                setCurrentOfficer({
                                  ...currentOfficer,
                                  shareholdings: { ...currentOfficer.shareholdings, numberOfShares: e.target.value },
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Amount paid for each share *</label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">£</span>
                              <input
                                type="number"
                                value={currentOfficer.shareholdings.amountPaid}
                                onChange={(e) =>
                                  setCurrentOfficer({
                                    ...currentOfficer,
                                    shareholdings: { ...currentOfficer.shareholdings, amountPaid: e.target.value },
                                  })
                                }
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Total amount paid for the shares *</label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">£</span>
                              <input
                                type="number"
                                value={currentOfficer.shareholdings.totalAmount}
                                onChange={(e) =>
                                  setCurrentOfficer({
                                    ...currentOfficer,
                                    shareholdings: { ...currentOfficer.shareholdings, totalAmount: e.target.value },
                                  })
                                }
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">The shares are</label>
                            <select
                              value={currentOfficer.shareholdings.paymentStatus}
                              onChange={(e) =>
                                setCurrentOfficer({
                                  ...currentOfficer,
                                  shareholdings: { ...currentOfficer.shareholdings, paymentStatus: e.target.value },
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            >
                              <option value="Fully paid">Fully paid</option>
                              <option value="Partially paid">Partially paid</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {!currentOfficer.roles.shareholder && (
                      <p className="text-slate-600 text-sm">This officer is not marked as a shareholder. No shareholding information is required.</p>
                    )}
                  </div>
                )}

                {currentOfficerStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Enter the person's significant control criteria</h3>

                    {currentOfficer.roles.psc ? (
                      <div className="space-y-6">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentOfficer.significantControl.pscConfirm}
                            onChange={(e) =>
                              setCurrentOfficer({
                                ...currentOfficer,
                                significantControl: { ...currentOfficer.significantControl, pscConfirm: e.target.checked },
                              })
                            }
                            className="w-4 h-4 rounded mt-1"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-900">Tick to confirm that the individual has confirmed they are a PSC</p>
                          </div>
                        </label>

                        <div className="space-y-3 border-t border-slate-200 pt-4">
                          <p className="font-medium text-slate-900">1. The person holds, directly or indirectly, more than 25% of the shares in the company</p>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="sharesOver25"
                                value="Yes"
                                checked={currentOfficer.significantControl.sharesOver25 === "Yes"}
                                onChange={(e) =>
                                  setCurrentOfficer({
                                    ...currentOfficer,
                                    significantControl: { ...currentOfficer.significantControl, sharesOver25: e.target.value },
                                  })
                                }
                              />
                              <span className="text-sm">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="sharesOver25"
                                value="No"
                                checked={currentOfficer.significantControl.sharesOver25 === "No"}
                                onChange={(e) =>
                                  setCurrentOfficer({
                                    ...currentOfficer,
                                    significantControl: { ...currentOfficer.significantControl, sharesOver25: e.target.value },
                                  })
                                }
                              />
                              <span className="text-sm">No</span>
                            </label>
                          </div>
                          {currentOfficer.significantControl.sharesOver25 === "Yes" && (
                            <div className="ml-4 space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="sharesLevel"
                                  value="More than 25% but not more than 50%"
                                  checked={currentOfficer.significantControl.sharesOver50 === "More than 25% but not more than 50%"}
                                  onChange={(e) =>
                                    setCurrentOfficer({
                                      ...currentOfficer,
                                      significantControl: { ...currentOfficer.significantControl, sharesOver50: e.target.value },
                                    })
                                  }
                                />
                                <span className="text-sm">More than 25% but not more than 50% of the shares in the company</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="sharesLevel"
                                  value="More than 50% but less than 75%"
                                  checked={currentOfficer.significantControl.sharesOver50 === "More than 50% but less than 75%"}
                                  onChange={(e) =>
                                    setCurrentOfficer({
                                      ...currentOfficer,
                                      significantControl: { ...currentOfficer.significantControl, sharesOver50: e.target.value },
                                    })
                                  }
                                />
                                <span className="text-sm">More than 50% but less than 75% of the shares in the company</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="sharesLevel"
                                  value="75% or more of the shares"
                                  checked={currentOfficer.significantControl.sharesOver50 === "75% or more of the shares"}
                                  onChange={(e) =>
                                    setCurrentOfficer({
                                      ...currentOfficer,
                                      significantControl: { ...currentOfficer.significantControl, sharesOver50: e.target.value },
                                    })
                                  }
                                />
                                <span className="text-sm">75% or more of the shares in the company</span>
                              </label>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 border-t border-slate-200 pt-4">
                          <p className="font-medium text-slate-900">2. The person holds, directly or indirectly, more than 25% of the voting rights</p>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="votingRightsOver25"
                                value="Yes"
                                checked={currentOfficer.significantControl.votingRightsOver25 === "Yes"}
                                onChange={(e) =>
                                  setCurrentOfficer({
                                    ...currentOfficer,
                                    significantControl: { ...currentOfficer.significantControl, votingRightsOver25: e.target.value },
                                  })
                                }
                              />
                              <span className="text-sm">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="votingRightsOver25"
                                value="No"
                                checked={currentOfficer.significantControl.votingRightsOver25 === "No"}
                                onChange={(e) =>
                                  setCurrentOfficer({
                                    ...currentOfficer,
                                    significantControl: { ...currentOfficer.significantControl, votingRightsOver25: e.target.value },
                                  })
                                }
                              />
                              <span className="text-sm">No</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-3 border-t border-slate-200 pt-4">
                          <p className="font-medium text-slate-900">3. The person holds the right, directly or indirectly, to appoint or remove a majority of the board of directors</p>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="appointDirectors"
                                value="Yes"
                                checked={currentOfficer.significantControl.appointDirectors === "Yes"}
                                onChange={(e) =>
                                  setCurrentOfficer({
                                    ...currentOfficer,
                                    significantControl: { ...currentOfficer.significantControl, appointDirectors: e.target.value },
                                  })
                                }
                              />
                              <span className="text-sm">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="appointDirectors"
                                value="No"
                                checked={currentOfficer.significantControl.appointDirectors === "No"}
                                onChange={(e) =>
                                  setCurrentOfficer({
                                    ...currentOfficer,
                                    significantControl: { ...currentOfficer.significantControl, appointDirectors: e.target.value },
                                  })
                                }
                              />
                              <span className="text-sm">No</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-3 border-t border-slate-200 pt-4">
                          <p className="font-medium text-slate-900">4. The person has the right to exercise, or actually exercises, significant influence or control over the company.</p>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="exerciseControl"
                                value="Yes"
                                checked={currentOfficer.significantControl.exerciseControl === "Yes"}
                                onChange={(e) =>
                                  setCurrentOfficer({
                                    ...currentOfficer,
                                    significantControl: { ...currentOfficer.significantControl, exerciseControl: e.target.value },
                                  })
                                }
                              />
                              <span className="text-sm">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="exerciseControl"
                                value="No"
                                checked={currentOfficer.significantControl.exerciseControl === "No"}
                                onChange={(e) =>
                                  setCurrentOfficer({
                                    ...currentOfficer,
                                    significantControl: { ...currentOfficer.significantControl, exerciseControl: e.target.value },
                                  })
                                }
                              />
                              <span className="text-sm">No</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-600 text-sm">This officer is not marked as a Person with Significant Control. No control criteria information is required.</p>
                    )}
                  </div>
                )}

                <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
                  <Button
                    onClick={() => {
                      if (currentOfficerStep > 0) {
                        setCurrentOfficerStep(currentOfficerStep - 1);
                      } else {
                        setShowOfficerForm(false);
                        setEditingOfficerId(null);
                        setCurrentOfficer({ ...defaultOfficer, id: `OFF${Date.now()}` });
                      }
                    }}
                    variant="outline"
                  >
                    {currentOfficerStep === 0 ? "Back" : "Previous"}
                  </Button>

                  {currentOfficerStep < 4 ? (
                    <Button
                      onClick={() => setCurrentOfficerStep(currentOfficerStep + 1)}
                      className="bg-green-600 hover:bg-green-700 ml-auto flex items-center gap-2"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAddOfficer}
                      className="bg-green-600 hover:bg-green-700 ml-auto"
                    >
                      {editingOfficerId ? "Update Officer" : "Add Officer"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "list" && (
          <div className="space-y-4">
            {incorporations.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {incorporations.map((inc) => (
                  <div
                    key={inc.id}
                    className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{inc.companyName}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${getStatusColor(
                              inc.status,
                            )}`}
                          >
                            {inc.status.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
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
                            <p className="font-bold text-slate-900">£{inc.shareCapital}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Filing Fee</p>
                            <p className="font-bold text-slate-900">£{inc.filingFee}</p>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="flex items-center gap-2">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-500">No companies created yet. Click "New Company" to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
