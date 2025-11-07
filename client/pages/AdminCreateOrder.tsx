import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  XCircle,
  Upload,
  Trash2,
  FileText,
  Loader,
  Check,
  AlertCircle,
} from "lucide-react";
import { FormEvent, useState } from "react";
import {
  mockOrders,
  mockUsers,
  mockProducts,
  mockStaff,
  mockCompaniesForSale,
  Order,
  OperationFile,
} from "@/lib/mockData";
import { toast } from "sonner";
import { useCompanyNameValidation } from "@/hooks/useCompanyNameValidation";

export default function AdminCreateOrder() {
  const navigate = useNavigate();
  const companyValidation = useCompanyNameValidation();

  // Calculate the next order number based on max existing order ID
  const getNextOrderNum = () => {
    const maxOrderNum = Math.max(
      0,
      ...mockOrders.map((o) => {
        const match = o.id.match(/O(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }),
    );
    return maxOrderNum + 1;
  };

  const nextOrderNum = getNextOrderNum();

  const [formData, setFormData] = useState<Partial<Order>>({
    id: `O${String(nextOrderNum).padStart(3, "0")}`,
    orderNumber: `ORD-${new Date().getFullYear()}-${String(nextOrderNum).padStart(3, "0")}`,
    description: "",
    amount: 0,
    currency: "USD",
    status: "new",
    serviceType: "",
    countries: [],
    createdAt: new Date().toISOString().split("T")[0],
    userId: "",
    productId: "",
    assignedToSalesId: "",
    history: [],
    rejectionReasons: [],
  });

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countryInput, setCountryInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; size: number; type: string }>
  >([]);
  const [fileDescription, setFileDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyNumber, setCompanyNumber] = useState("");
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState(mockCompaniesForSale.filter(c => c.country === "United Kingdom" && c.registrationStatus !== "sold"));

  const selectedProduct = mockProducts.find((p) => p.id === formData.productId);
  const salesStaff = mockStaff.filter((s) => s.role === "sales");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "productId") {
      const product = mockProducts.find((p) => p.id === value);
      if (product) {
        // Auto-fill amount, currency, and country from product
        setFormData((prev) => ({
          ...prev,
          productId: value,
          amount: product.price,
          currency: product.currency,
          serviceType: product.name,
          countries: [product.country],
        }));
        setSelectedCountries([product.country]);

        // Show company selector if UK Acquisitions Package is selected
        if (product.id === "P005") { // UK Acquisitions Package
          setShowCompanySelector(true);
          setAvailableCompanies(mockCompaniesForSale.filter(c => c.country === "United Kingdom" && c.registrationStatus !== "sold"));
        } else {
          setShowCompanySelector(false);
          setCompanyName("");
          setCompanyNumber("");
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "amount" ? parseFloat(value) : value,
      }));
    }
  };

  const addCountry = () => {
    if (countryInput.trim() && !selectedCountries.includes(countryInput)) {
      setSelectedCountries([...selectedCountries, countryInput]);
      setFormData((prev) => ({
        ...prev,
        countries: [...(prev.countries || []), countryInput],
      }));
      setCountryInput("");
    }
  };

  const removeCountry = (country: string) => {
    setSelectedCountries(selectedCountries.filter((c) => c !== country));
    setFormData((prev) => ({
      ...prev,
      countries: (prev.countries || []).filter((c) => c !== country),
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Check file size (max 5GB)
      if (file.size > 5 * 1024 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 5GB)`);
        return;
      }

      // Check if file already exists
      if (uploadedFiles.some((f) => f.name === file.name)) {
        toast.error(`File ${file.name} is already uploaded`);
        return;
      }

      // Add file to uploaded files list
      setUploadedFiles([
        ...uploadedFiles,
        {
          name: file.name,
          size: file.size,
          type: file.type,
        },
      ]);
    });

    // Reset input
    e.target.value = "";
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.name !== fileName));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const selectCompanyForAcquisition = (company: typeof mockCompaniesForSale[0]) => {
    setCompanyName(company.companyName);
    setCompanyNumber(company.companyNumber);
    setShowCompanySelector(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      !formData.description ||
      !formData.serviceType ||
      !formData.userId ||
      !formData.assignedToSalesId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Company name validation for company-related services
    if (formData.serviceType?.toLowerCase().includes("company")) {
      if (!companyName.trim()) {
        toast.error("Company name is required for company formation orders");
        return;
      }
      if (companyValidation.isAvailable === false) {
        toast.error(
          "This company name is already registered. Please choose a different name.",
        );
        return;
      }
      if (companyValidation.isAvailable === null) {
        toast.error(
          "Please wait for company name availability check to complete",
        );
        return;
      }
    }

    const orderId = formData.id || `O${String(nextOrderNum).padStart(3, "0")}`;

    // Get selected product to set requiredServices
    const product = mockProducts.find((p) => p.id === formData.productId);

    // In a real app, this would save to a database
    const operationStaff = mockStaff.find((s) => s.role === "operation");
    const managerStaff = mockStaff.find((s) => s.role === "operation_manager");

    const newOrder: Order = {
      id: orderId,
      orderNumber: formData.orderNumber || "",
      description: formData.description,
      amount: formData.amount || 0,
      currency: formData.currency || "USD",
      status: "new",
      serviceType: formData.serviceType,
      countries: formData.countries || [],
      createdAt: formData.createdAt || new Date().toISOString().split("T")[0],
      userId: formData.userId,
      productId: formData.productId,
      assignedToSalesId: formData.assignedToSalesId,
      assignedToOperationId: operationStaff?.id,
      assignedToManagerId: managerStaff?.id,
      history: [
        {
          id: `H-${Date.now()}`,
          orderId: orderId,
          previousStatus: "new",
          newStatus: "new",
          actionType: "system_transition",
          actionBy: "system",
          actionByName: "System",
          createdAt: new Date().toISOString(),
        },
      ],
      rejectionReasons: [],
      operationFiles: uploadedFiles.map((file, index) => ({
        id: `F-${orderId}-${index}-${Date.now()}`,
        orderId: orderId,
        fileName: file.name,
        fileSize: file.size,
        fileUrl: `https://example.com/files/${file.name}`,
        uploadedBy: formData.assignedToSalesId || "system",
        uploadedByName:
          mockStaff.find((s) => s.id === formData.assignedToSalesId)
            ?.firstName +
            " " +
            mockStaff.find((s) => s.id === formData.assignedToSalesId)
              ?.lastName || "System",
        uploadedAt: new Date().toISOString(),
        stage: "sales" as const,
        fileType: "document" as const,
        description: fileDescription || undefined,
        visibleToClient: true,
      })),
      clientCanViewFiles: false,
      clientCanViewTracking: false,
      comments: [],
      completedServices: {
        apostilleComplete: false,
        shippingComplete: false,
        poaComplete: false,
        financialReportComplete: false,
      },
      operationReviewForm: {
        isCompleted: false,
        companyName: companyName || "",
        companyNumber: companyNumber || "",
      },
      requiredServices: product?.services || {
        hasApostille: false,
        hasShipping: false,
        hasPOA: false,
        hasFinancialReport: false,
      },
    };

    mockOrders.push(newOrder);
    localStorage.setItem(`order_${newOrder.id}`, JSON.stringify(newOrder));

    toast.success("Order created successfully!");
    navigate(`/admin/operations/${newOrder.id}`);
  };

  return (
    <AdminLayout>
      <div className="flex-1 overflow-auto bg-slate-100">
        <div className="p-8">
          {/* Back Button */}
          <Link to="/admin/operations">
            <Button
              variant="ghost"
              className="gap-2 text-slate-600 hover:text-slate-900 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Operations
            </Button>
          </Link>

          {/* Form Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-8 max-w-5xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Create New Order
            </h1>
            <p className="text-slate-600 mb-8">
              Fill in the order details and select a sales representative to
              manage client interaction
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Client Selection */}
              <div className="pb-8 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                    1
                  </span>
                  Select Client
                </h2>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Client *
                  </label>
                  <select
                    name="userId"
                    value={formData.userId || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="">Select a client</option>
                    {mockUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.companyName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2: Product Selection & Service Summary */}
              <div className="pb-8 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                    2
                  </span>
                  Select Product & Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Product *
                    </label>
                    <select
                      name="productId"
                      value={formData.productId || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white"
                      required
                    >
                      <option value="">Select a product</option>
                      {mockProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    {selectedProduct && (
                      <p className="text-xs text-slate-500 mt-2">
                        {selectedProduct.description}
                      </p>
                    )}
                  </div>

                  {/* Service Summary */}
                  {selectedProduct && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">
                        Included Services
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {selectedProduct.services.hasApostille ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-400" />
                          )}
                          <span
                            className={
                              selectedProduct.services.hasApostille
                                ? "text-slate-900"
                                : "text-slate-500"
                            }
                          >
                            Apostille Processing
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedProduct.services.hasPOA ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-400" />
                          )}
                          <span
                            className={
                              selectedProduct.services.hasPOA
                                ? "text-slate-900"
                                : "text-slate-500"
                            }
                          >
                            Power of Attorney (POA)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedProduct.services.hasFinancialReport ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-400" />
                          )}
                          <span
                            className={
                              selectedProduct.services.hasFinancialReport
                                ? "text-slate-900"
                                : "text-slate-500"
                            }
                          >
                            Financial Report
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedProduct.services.hasShipping ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-400" />
                          )}
                          <span
                            className={
                              selectedProduct.services.hasShipping
                                ? "text-slate-900"
                                : "text-slate-500"
                            }
                          >
                            Shipping & Tracking
                          </span>
                        </div>
                      </div>
                      {selectedProduct && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <p className="text-xs text-slate-600 mb-2">
                            <span className="font-semibold">Duration:</span>{" "}
                            {selectedProduct.duration}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Sales Assignment */}
              <div className="pb-8 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                    3
                  </span>
                  Assign Sales Representative
                </h2>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Sales Staff *
                  </label>
                  <select
                    name="assignedToSalesId"
                    value={formData.assignedToSalesId || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="">Select a sales representative</option>
                    {salesStaff.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.firstName} {staff.lastName} ({staff.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-2">
                    The assigned sales representative will interact with the
                    client and make the order visible in their dashboard
                  </p>
                </div>
              </div>

              {/* Step 4: Order Details */}
              <div className="pb-8 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                    4
                  </span>
                  Order Details
                </h2>

                {/* Company Name (if Company Formation) */}
                {formData.serviceType?.toLowerCase().includes("company") && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          companyValidation.validateWithDebounce(
                            e.target.value,
                          );
                        }}
                        placeholder="e.g., Acme Corporation Ltd"
                        className={`${
                          companyValidation.isAvailable === false
                            ? "border-red-500 focus:border-red-500"
                            : companyValidation.isAvailable === true
                              ? "border-green-500 focus:border-green-500"
                              : ""
                        }`}
                      />
                      <div className="absolute right-3 top-2.5">
                        {companyValidation.isChecking && (
                          <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                        )}
                        {!companyValidation.isChecking &&
                          companyValidation.isAvailable === true && (
                            <Check className="w-5 h-5 text-green-600" />
                          )}
                        {!companyValidation.isChecking &&
                          companyValidation.isAvailable === false && (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                      </div>
                    </div>

                    {companyValidation.isAvailable === false && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-700 mb-1">
                          Company name is not available
                        </p>
                        {companyValidation.exactMatch && (
                          <div className="text-xs text-red-600 space-y-1 mt-2">
                            <p>
                              <strong>Registered as:</strong>{" "}
                              {companyValidation.exactMatch.title}
                            </p>
                            {companyValidation.exactMatch.company_number && (
                              <p>
                                <strong>Company Number:</strong>{" "}
                                {companyValidation.exactMatch.company_number}
                              </p>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-red-700 font-medium mt-2">
                          Please choose a different company name.
                        </p>
                      </div>
                    )}

                    {companyValidation.isAvailable === true && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Company name is available for registration
                      </p>
                    )}

                    {companyValidation.error && (
                      <p className="text-xs text-orange-600 mt-1">
                        Could not verify availability: {companyValidation.error}
                      </p>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    rows={3}
                    placeholder="Provide details about this order"
                    required
                  />
                </div>

                {/* Service Type, Amount, Currency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Service Type *
                    </label>
                    <Input
                      type="text"
                      name="serviceType"
                      value={formData.serviceType || ""}
                      onChange={handleChange}
                      placeholder="e.g., Company Registration"
                      disabled={!!selectedProduct}
                      className={selectedProduct ? "bg-slate-100" : ""}
                      required
                    />
                    {selectedProduct && (
                      <p className="text-xs text-slate-500 mt-1">
                        Auto-filled from product
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Amount *
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        name="amount"
                        value={formData.amount || ""}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        disabled={!!selectedProduct}
                        className={selectedProduct ? "bg-slate-100" : ""}
                        required
                      />
                    </div>
                    {selectedProduct && (
                      <p className="text-xs text-slate-500 mt-1">
                        Auto-filled from product
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Currency *
                    </label>
                    <select
                      name="currency"
                      value={formData.currency || "USD"}
                      onChange={handleChange}
                      disabled={!!selectedProduct}
                      className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white ${selectedProduct ? "bg-slate-100" : ""}`}
                    >
                      <option value="AED">
                        AED - United Arab Emirates Dirham
                      </option>
                      <option value="AFN">AFN - Afghan Afghani</option>
                      <option value="ALL">ALL - Albanian Lek</option>
                      <option value="AMD">AMD - Armenian Dram</option>
                      <option value="ANG">ANG - Anguillan Guilder</option>
                      <option value="AOA">AOA - Angolan Kwanza</option>
                      <option value="ARS">ARS - Argentine Peso</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="AWG">AWG - Aruban Florin</option>
                      <option value="AZN">AZN - Azerbaijani Manat</option>
                      <option value="BAM">
                        BAM - Bosnia and Herzegovina Convertible Mark
                      </option>
                      <option value="BBD">BBD - Barbadian Dollar</option>
                      <option value="BDT">BDT - Bangladeshi Taka</option>
                      <option value="BGN">BGN - Bulgarian Lev</option>
                      <option value="BHD">BHD - Bahraini Dinar</option>
                      <option value="BIF">BIF - Burundian Franc</option>
                      <option value="BMD">BMD - Bermudian Dollar</option>
                      <option value="BND">BND - Brunei Dollar</option>
                      <option value="BOB">BOB - Bolivian Boliviano</option>
                      <option value="BRL">BRL - Brazilian Real</option>
                      <option value="BSD">BSD - Bahamian Dollar</option>
                      <option value="BTC">BTC - Bitcoin</option>
                      <option value="BTN">BTN - Bhutanese Ngultrum</option>
                      <option value="BWP">BWP - Botswana Pula</option>
                      <option value="BYN">BYN - Belarusian Ruble</option>
                      <option value="BZD">BZD - Belize Dollar</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="CDF">CDF - Congolese Franc</option>
                      <option value="CHE">CHE - WIR Euro</option>
                      <option value="CHF">CHF - Swiss Franc</option>
                      <option value="CHW">CHW - WIR Franc</option>
                      <option value="CLF">CLF - Chilean Unit of Account</option>
                      <option value="CLP">CLP - Chilean Peso</option>
                      <option value="CNH">CNH - Chinese Yuan (offshore)</option>
                      <option value="CNY">CNY - Chinese Yuan</option>
                      <option value="COP">COP - Colombian Peso</option>
                      <option value="COU">
                        COU - Colombian Real Value Unit
                      </option>
                      <option value="CRC">CRC - Costa Rican Colón</option>
                      <option value="CUC">CUC - Cuban Convertible Peso</option>
                      <option value="CUP">CUP - Cuban Peso</option>
                      <option value="CVE">CVE - Cape Verdean Escudo</option>
                      <option value="CZK">CZK - Czech Koruna</option>
                      <option value="DJF">DJF - Djiboutian Franc</option>
                      <option value="DKK">DKK - Danish Krone</option>
                      <option value="DOP">DOP - Dominican Peso</option>
                      <option value="DZD">DZD - Algerian Dinar</option>
                      <option value="EGP">EGP - Egyptian Pound</option>
                      <option value="ERN">ERN - Eritrean Nakfa</option>
                      <option value="ETB">ETB - Ethiopian Birr</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="FJD">FJD - Fijian Dollar</option>
                      <option value="FKP">FKP - Falkland Islands Pound</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="GEL">GEL - Georgian Lari</option>
                      <option value="GHS">GHS - Ghanaian Cedi</option>
                      <option value="GIP">GIP - Gibraltar Pound</option>
                      <option value="GMD">GMD - Gambian Dalasi</option>
                      <option value="GNF">GNF - Guinean Franc</option>
                      <option value="GTQ">GTQ - Guatemalan Quetzal</option>
                      <option value="GYD">GYD - Guyanaese Dollar</option>
                      <option value="HKD">HKD - Hong Kong Dollar</option>
                      <option value="HNL">HNL - Honduran Lempira</option>
                      <option value="HRK">HRK - Croatian Kuna</option>
                      <option value="HTG">HTG - Haitian Gourde</option>
                      <option value="HUF">HUF - Hungarian Forint</option>
                      <option value="IDR">IDR - Indonesian Rupiah</option>
                      <option value="ILS">ILS - Israeli New Shekel</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="IQD">IQD - Iraqi Dinar</option>
                      <option value="IRR">IRR - Iranian Rial</option>
                      <option value="ISK">ISK - Icelandic Króna</option>
                      <option value="JMD">JMD - Jamaican Dollar</option>
                      <option value="JOD">JOD - Jordanian Dinar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="KGS">KGS - Kyrgyzstani Som</option>
                      <option value="KHR">KHR - Cambodian Riel</option>
                      <option value="KMF">KMF - Comorian Franc</option>
                      <option value="KPW">KPW - North Korean Won</option>
                      <option value="KRW">KRW - South Korean Won</option>
                      <option value="KWD">KWD - Kuwaiti Dinar</option>
                      <option value="KYD">KYD - Cayman Islands Dollar</option>
                      <option value="KZT">KZT - Kazakhstani Tenge</option>
                      <option value="LAK">LAK - Laotian Kip</option>
                      <option value="LBP">LBP - Lebanese Pound</option>
                      <option value="LKR">LKR - Sri Lankan Rupee</option>
                      <option value="LRD">LRD - Liberian Dollar</option>
                      <option value="LSL">LSL - Lesotho Loti</option>
                      <option value="LYD">LYD - Libyan Dinar</option>
                      <option value="MAD">MAD - Moroccan Dirham</option>
                      <option value="MDL">MDL - Moldovan Leu</option>
                      <option value="MGA">MGA - Malagasy Ariary</option>
                      <option value="MKD">MKD - Macedonian Denar</option>
                      <option value="MMK">MMK - Myanmar Kyat</option>
                      <option value="MNT">MNT - Mongolian Tugrik</option>
                      <option value="MOP">MOP - Macanese Pataca</option>
                      <option value="MRU">MRU - Mauritanian Ouguiya</option>
                      <option value="MUR">MUR - Mauritian Rupee</option>
                      <option value="MVR">MVR - Maldivian Rufiyaa</option>
                      <option value="MWK">MWK - Malawian Kwacha</option>
                      <option value="MXN">MXN - Mexican Peso</option>
                      <option value="MXV">MXV - Mexican Investment Unit</option>
                      <option value="MYR">MYR - Malaysian Ringgit</option>
                      <option value="MZN">MZN - Mozambican Metical</option>
                      <option value="NAD">NAD - Namibian Dollar</option>
                      <option value="NGN">NGN - Nigerian Naira</option>
                      <option value="NIO">NIO - Nicaraguan Córdoba</option>
                      <option value="NOK">NOK - Norwegian Krone</option>
                      <option value="NPR">NPR - Nepalese Rupee</option>
                      <option value="NZD">NZD - New Zealand Dollar</option>
                      <option value="OMR">OMR - Omani Rial</option>
                      <option value="PAB">PAB - Panamanian Balboa</option>
                      <option value="PEN">PEN - Peruvian Nuevo Sol</option>
                      <option value="PGK">PGK - Papua New Guinean Kina</option>
                      <option value="PHP">PHP - Philippine Peso</option>
                      <option value="PKR">PKR - Pakistani Rupee</option>
                      <option value="PLN">PLN - Polish Zloty</option>
                      <option value="PYG">PYG - Paraguayan Guaraní</option>
                      <option value="QAR">QAR - Qatari Rial</option>
                      <option value="RON">RON - Romanian Leu</option>
                      <option value="RSD">RSD - Serbian Dinar</option>
                      <option value="RUB">RUB - Russian Ruble</option>
                      <option value="RWF">RWF - Rwandan Franc</option>
                      <option value="SAR">SAR - Saudi Arabian Riyal</option>
                      <option value="SBD">SBD - Solomon Islands Dollar</option>
                      <option value="SCR">SCR - Seychellois Rupee</option>
                      <option value="SDG">SDG - Sudanese Pound</option>
                      <option value="SEK">SEK - Swedish Krona</option>
                      <option value="SGD">SGD - Singapore Dollar</option>
                      <option value="SHP">SHP - Saint Helena Pound</option>
                      <option value="SLL">SLL - Sierra Leonean Leone</option>
                      <option value="SOS">SOS - Somali Shilling</option>
                      <option value="SRD">SRD - Surinamese Dollar</option>
                      <option value="SSP">SSP - South Sudanese Pound</option>
                      <option value="STN">
                        STN - São Tomé and Príncipe Dobra
                      </option>
                      <option value="SYP">SYP - Syrian Pound</option>
                      <option value="SZL">SZL - Swazi Lilangeni</option>
                      <option value="THB">THB - Thai Baht</option>
                      <option value="TJS">TJS - Tajikistani Somoni</option>
                      <option value="TMT">TMT - Turkmenistani Manat</option>
                      <option value="TND">TND - Tunisian Dinar</option>
                      <option value="TOP">TOP - Tongan Pa��anga</option>
                      <option value="TRY">TRY - Turkish Lira</option>
                      <option value="TTD">
                        TTD - Trinidad and Tobago Dollar
                      </option>
                      <option value="TWD">TWD - New Taiwan Dollar</option>
                      <option value="TZS">TZS - Tanzanian Shilling</option>
                      <option value="UAH">UAH - Ukrainian Hryvnia</option>
                      <option value="UGX">UGX - Ugandan Shilling</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="USN">USN - US Dollar (Next day)</option>
                      <option value="UYI">
                        UYI - Uruguayan Peso (Indexed)
                      </option>
                      <option value="UYU">UYU - Uruguayan Peso</option>
                      <option value="UZS">UZS - Uzbekistani Som</option>
                      <option value="VEF">
                        VEF - Venezuelan Bolívar (fixed rate)
                      </option>
                      <option value="VES">VES - Venezuelan Bolívar</option>
                      <option value="VND">VND - Vietnamese Đồng</option>
                      <option value="VUV">VUV - Vanuatu Vatu</option>
                      <option value="WST">WST - Samoan Tala</option>
                      <option value="XAF">
                        XAF - Central African CFA Franc
                      </option>
                      <option value="XAG">XAG - Silver (one troy ounce)</option>
                      <option value="XAU">XAU - Gold (one troy ounce)</option>
                      <option value="XBA">
                        XBA - European Composite Unit (EURCO)
                      </option>
                      <option value="XBB">
                        XBB - European Monetary Unit (E.M.U.-6)
                      </option>
                      <option value="XBC">
                        XBC - European Unit of Account 9 (E.U.A.-9)
                      </option>
                      <option value="XBD">
                        XBD - European Unit of Account 17 (E.U.A.-17)
                      </option>
                      <option value="XCD">XCD - East Caribbean Dollar</option>
                      <option value="XDR">XDR - Special Drawing Right</option>
                      <option value="XOF">XOF - West African CFA Franc</option>
                      <option value="XPD">
                        XPD - Palladium (one troy ounce)
                      </option>
                      <option value="XPF">XPF - CFP Franc</option>
                      <option value="XPT">
                        XPT - Platinum (one troy ounce)
                      </option>
                      <option value="XSU">XSU - Sucre</option>
                      <option value="XTS">
                        XTS - Code reserved for testing
                      </option>
                      <option value="XUA">XUA - ADB Unit of Account</option>
                      <option value="XXX">XXX - No currency</option>
                      <option value="YER">YER - Yemeni Rial</option>
                      <option value="ZAR">ZAR - South African Rand</option>
                      <option value="ZMW">ZMW - Zambian Kwacha</option>
                      <option value="ZWL">ZWL - Zimbabwean Dollar</option>
                    </select>
                    {selectedProduct && (
                      <p className="text-xs text-slate-500 mt-1">
                        Auto-filled from product
                      </p>
                    )}
                  </div>
                </div>

                {/* Countries */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Countries
                  </label>
                  <div className="flex gap-2 mb-4">
                    <Input
                      type="text"
                      value={countryInput}
                      onChange={(e) => setCountryInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCountry();
                        }
                      }}
                      placeholder="Enter country name and press Enter"
                    />
                    <Button
                      type="button"
                      onClick={addCountry}
                      className="bg-slate-200 text-slate-900 hover:bg-slate-300"
                    >
                      Add
                    </Button>
                  </div>
                  {selectedCountries.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedCountries.map((country) => (
                        <div
                          key={country}
                          className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                        >
                          {country}
                          <button
                            type="button"
                            onClick={() => removeCountry(country)}
                            className="hover:text-primary-900"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedProduct && selectedCountries.length > 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      Auto-filled from product
                    </p>
                  )}
                </div>
              </div>

              {/* Step 5: Document Upload */}
              <div className="pb-8 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                    5
                  </span>
                  Attach Documents
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Upload customer documents. These will be visible in the order
                  workflow automatically.
                </p>

                {/* File Upload Area */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-900 mb-3">
                    Upload Documents (Max 5GB per file)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-400 hover:bg-primary-50 transition cursor-pointer relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="*"
                    />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF, DOC, DOCX, XLS, XLSX, images, and more
                    </p>
                  </div>
                </div>

                {/* File Description */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Document Description (Optional)
                    </label>
                    <textarea
                      value={fileDescription}
                      onChange={(e) => setFileDescription(e.target.value)}
                      placeholder="Add a note about these documents..."
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Attached Files ({uploadedFiles.length})
                    </h3>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-3 rounded border border-slate-200"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-primary-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.name)}
                            className="ml-4 text-red-600 hover:text-red-700 transition flex-shrink-0"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Create Order
                </Button>
                <Link to="/admin/operations">
                  <Button variant="outline" className="gap-2">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
