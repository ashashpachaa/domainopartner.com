import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockOrders, mockProducts, Shareholder } from "@/lib/mockData";
import ClientLayout from "@/components/ClientLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, AlertCircle, Plus, Trash2, Edit2, X, Check, Loader } from "lucide-react";
import { toast } from "sonner";
import { useCompanyNameValidation } from "@/hooks/useCompanyNameValidation";

export default function ClientCreateOrder() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const companyValidation = useCompanyNameValidation();

  const [formData, setFormData] = useState({
    description: "",
    productId: "",
    serviceType: "",
    countries: "",
    amount: "",
    currency: "USD",
    notes: "",
  });

  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    companyActivities: "",
    totalCapital: "",
    pricePerShare: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [editingShareholderId, setEditingShareholderId] = useState<string | null>(null);
  const [shareholderForm, setShareholderForm] = useState({
    fullName: "",
    dateOfBirth: "",
    nationality: "",
    ownershipPercentage: "",
  });
  const [shareholderPassportFile, setShareholderPassportFile] = useState<File | null>(null);
  const [showShareholderForm, setShowShareholderForm] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB in bytes
  const MAX_FILES = 5;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
    let newTotalSize = totalSize;
    const filesToAdd: File[] = [];

    for (const file of files) {
      if (uploadedFiles.length + filesToAdd.length >= MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed`);
        break;
      }

      if (newTotalSize + file.size > MAX_FILE_SIZE) {
        toast.error("Total file size exceeds 5GB limit");
        break;
      }

      newTotalSize += file.size;
      filesToAdd.push(file);
    }

    if (filesToAdd.length > 0) {
      setUploadedFiles([...uploadedFiles, ...filesToAdd]);
      toast.success(`${filesToAdd.length} file(s) added`);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    toast.success("File removed");
  };

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getTotalUploadSize = () => {
    return uploadedFiles.reduce((sum, f) => sum + f.size, 0);
  };

  const handleProductChange = (productId: string) => {
    const product = mockProducts.find((p) => p.id === productId);
    setSelectedProduct(product);
    setFormData({
      ...formData,
      productId,
      amount: product ? product.price.toString() : "",
      currency: product ? product.currency : "USD",
      countries: product ? product.country : "",
    });
  };

  const handleShareholderPassportSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Passport file must be less than 50MB");
        return;
      }
      setShareholderPassportFile(file);
      toast.success("Passport file selected");
    }
  };

  const validateShareholderForm = () => {
    if (!shareholderForm.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    const nameParts = shareholderForm.fullName.trim().split(/\s+/);
    if (nameParts.length < 2) {
      toast.error("Please enter both first and last name");
      return false;
    }
    if (!shareholderForm.dateOfBirth) {
      toast.error("Date of birth is required");
      return false;
    }
    if (!shareholderForm.nationality.trim()) {
      toast.error("Nationality is required");
      return false;
    }
    const percentage = parseFloat(shareholderForm.ownershipPercentage);
    if (!shareholderForm.ownershipPercentage || isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast.error("Ownership percentage must be between 0 and 100");
      return false;
    }
    return true;
  };

  const addShareholder = () => {
    if (!validateShareholderForm()) {
      return;
    }

    // Split full name into first and last name
    const nameParts = shareholderForm.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const newShareholder: Shareholder = {
      id: editingShareholderId || `SH-${Date.now()}`,
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: shareholderForm.dateOfBirth,
      nationality: shareholderForm.nationality,
      ownershipPercentage: parseFloat(shareholderForm.ownershipPercentage),
      passportFile: shareholderPassportFile ? {
        fileName: shareholderPassportFile.name,
        fileSize: shareholderPassportFile.size,
        fileUrl: URL.createObjectURL(shareholderPassportFile),
        uploadedAt: new Date().toISOString(),
      } : undefined,
    };

    if (editingShareholderId) {
      setShareholders(shareholders.map((sh) => (sh.id === editingShareholderId ? newShareholder : sh)));
      toast.success("Shareholder updated");
      setEditingShareholderId(null);
    } else {
      setShareholders([...shareholders, newShareholder]);
      toast.success("Shareholder added");
    }

    resetShareholderForm();
  };

  const resetShareholderForm = () => {
    setShareholderForm({
      fullName: "",
      dateOfBirth: "",
      nationality: "",
      ownershipPercentage: "",
    });
    setShareholderPassportFile(null);
    setShowShareholderForm(false);
    setEditingShareholderId(null);
  };

  const editShareholder = (shareholder: Shareholder) => {
    const fullName = `${shareholder.firstName} ${shareholder.lastName}`.trim();
    setShareholderForm({
      fullName: fullName,
      dateOfBirth: shareholder.dateOfBirth,
      nationality: shareholder.nationality,
      ownershipPercentage: shareholder.ownershipPercentage.toString(),
    });
    setEditingShareholderId(shareholder.id);
    setShowShareholderForm(true);
  };

  const removeShareholder = (id: string) => {
    setShareholders(shareholders.filter((sh) => sh.id !== id));
    toast.success("Shareholder removed");
  };

  const getTotalOwnershipPercentage = () => {
    return shareholders.reduce((sum, sh) => sum + sh.ownershipPercentage, 0);
  };

  const validateShareholders = () => {
    if (shareholders.length === 0) {
      toast.error("At least one shareholder is required");
      return false;
    }
    const totalPercentage = getTotalOwnershipPercentage();
    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error(`Ownership percentages must add up to 100% (currently ${totalPercentage.toFixed(2)}%)`);
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.productId || !formData.serviceType || !formData.countries || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.serviceType === "Company Formation" && !validateShareholders()) {
      return;
    }

    if (formData.serviceType === "Company Formation") {
      if (!companyInfo.companyName.trim()) {
        toast.error("Company name is required");
        return;
      }
      if (!companyInfo.companyActivities.trim()) {
        toast.error("Company activities description is required");
        return;
      }
      if (!companyInfo.totalCapital || parseFloat(companyInfo.totalCapital) <= 0) {
        toast.error("Total capital must be greater than 0");
        return;
      }
      if (!companyInfo.pricePerShare || parseFloat(companyInfo.pricePerShare) <= 0) {
        toast.error("Price per share must be greater than 0");
        return;
      }
    }

    try {
      const maxOrderNum = mockOrders
        .filter((o) => o.orderNumber.startsWith("ORD-"))
        .map((o) => {
          const match = o.orderNumber.match(/ORD-\d+-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .reduce((max, num) => Math.max(max, num), 0);

      const newOrderId = `O${Math.max(mockOrders.length, maxOrderNum) + 1}`;
      const orderYear = new Date().getFullYear();
      const newOrderNumber = `ORD-${orderYear}-${maxOrderNum + 1}`;

      const newOrder = {
        id: newOrderId,
        orderNumber: newOrderNumber,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        status: "pending_sales_review" as const,
        serviceType: formData.serviceType,
        countries: formData.countries.split(",").map((c) => c.trim()),
        createdAt: new Date().toISOString().split("T")[0],
        userId: currentUser.id,
        productId: formData.productId,
        assignedToSalesId: undefined,
        history: [
          {
            id: `H-${Date.now()}`,
            orderId: newOrderId,
            previousStatus: "new" as const,
            newStatus: "pending_sales_review" as const,
            actionType: "system_transition" as const,
            actionBy: "system",
            actionByName: "System",
            createdAt: new Date().toISOString(),
          },
        ],
        rejectionReasons: [],
        operationFiles: uploadedFiles.map((file, index) => ({
          id: `F-${Date.now()}-${index}`,
          orderId: newOrderId,
          fileName: file.name,
          fileSize: file.size,
          fileUrl: URL.createObjectURL(file),
          uploadedBy: currentUser.id,
          uploadedByName: `${currentUser.firstName} ${currentUser.lastName}`,
          uploadedAt: new Date().toISOString(),
          stage: "sales" as const,
          fileType: "document" as const,
          description: `Client-uploaded file: ${file.name}`,
          visibleToClient: true,
        })),
        clientCanViewFiles: true,
        clientCanViewTracking: true,
        comments: [],
        completedServices: {
          apostilleComplete: false,
          shippingComplete: false,
          poaComplete: false,
          financialReportComplete: false,
        },
        operationReviewForm: {
          isCompleted: false,
          companyName: "",
          companyNumber: "",
        },
        requiredServices: selectedProduct?.services || {
          hasApostille: false,
          hasShipping: false,
          hasPOA: false,
          hasFinancialReport: false,
        },
        shareholders: formData.serviceType === "Company Formation" ? shareholders : undefined,
        companyInfo: formData.serviceType === "Company Formation" ? companyInfo : undefined,
      };

      mockOrders.push(newOrder);
      localStorage.setItem(`order_${newOrder.id}`, JSON.stringify(newOrder));

      toast.success("Order created successfully!");
      navigate(`/client/orders/${newOrder.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <Button
            onClick={() => navigate("/client/orders")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Create New Order</h1>
          <p className="text-slate-600 mt-2">Fill in the details below to request a new service</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Select Service Product *
              </label>
              <select
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
              >
                <option value="">Choose a product...</option>
                {mockProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Details */}
            {selectedProduct && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Included Services</h3>
                <div className="space-y-1 text-sm text-blue-700">
                  {selectedProduct.services.hasApostille && <p>✓ Apostille Processing</p>}
                  {selectedProduct.services.hasPOA && <p>✓ Power of Attorney</p>}
                  {selectedProduct.services.hasFinancialReport && <p>✓ Financial Report</p>}
                  {selectedProduct.services.hasShipping && <p>✓ Shipping</p>}
                  {!selectedProduct.services.hasApostille &&
                    !selectedProduct.services.hasPOA &&
                    !selectedProduct.services.hasFinancialReport &&
                    !selectedProduct.services.hasShipping && <p>Standard processing</p>}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what service you need..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                rows={4}
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Service Type *
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
              >
                <option value="">Select service type...</option>
                <option value="Company Formation">Company Formation</option>
                <option value="Legal Documents">Legal Documents</option>
                <option value="Compliance">Compliance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Countries */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Countries *
              </label>
              <Input
                type="text"
                value={formData.countries}
                disabled={!selectedProduct}
                placeholder={selectedProduct ? "Auto-populated from product" : "Select a product first"}
                className="bg-slate-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">
                {selectedProduct ? "Auto-populated from product details (non-editable)" : "Select a product to auto-populate"}
              </p>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Amount *
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  disabled={!selectedProduct}
                  placeholder={selectedProduct ? "0.00" : "Select a product first"}
                  step="0.01"
                  className="bg-slate-50 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {selectedProduct ? "Auto-populated from product (non-editable)" : "Select a product to auto-populate"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  disabled={!selectedProduct}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-slate-50 cursor-not-allowed disabled:opacity-75"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AED">AED</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedProduct ? "Auto-populated from product (non-editable)" : "Select a product first"}
                </p>
              </div>
            </div>

            {/* Shareholders Section - Only for Company Formation */}
            {formData.serviceType === "Company Formation" && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Shareholders & Ownership Structure *</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Add all company shareholders. Ownership percentages must add up to 100%.
                  </p>
                </div>

                {/* Shareholders List */}
                {shareholders.length > 0 && (
                  <div className="space-y-3">
                    {shareholders.map((shareholder) => (
                      <div
                        key={shareholder.id}
                        className="bg-white rounded-lg border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">
                              {shareholder.firstName} {shareholder.lastName}
                            </p>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-slate-600">
                              <p>DOB: {new Date(shareholder.dateOfBirth).toLocaleDateString()}</p>
                              <p>Nationality: {shareholder.nationality}</p>
                              <p className="font-medium text-slate-900">
                                Ownership: {shareholder.ownershipPercentage}%
                              </p>
                              {shareholder.passportFile && (
                                <p className="text-green-600">✓ Passport uploaded</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => editShareholder(shareholder)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition"
                              title="Edit shareholder"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeShareholder(shareholder.id)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition"
                              title="Remove shareholder"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ownership Total */}
                {shareholders.length > 0 && (
                  <div className={`p-3 rounded-lg ${Math.abs(getTotalOwnershipPercentage() - 100) < 0.01 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <p className={`text-sm font-medium ${Math.abs(getTotalOwnershipPercentage() - 100) < 0.01 ? 'text-green-700' : 'text-yellow-700'}`}>
                      Total Ownership: {getTotalOwnershipPercentage().toFixed(2)}%
                    </p>
                  </div>
                )}

                {/* Add Shareholder Form */}
                {!showShareholderForm ? (
                  <button
                    type="button"
                    onClick={() => setShowShareholderForm(true)}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg text-purple-700 font-medium hover:bg-purple-50 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Shareholder
                  </button>
                ) : (
                  <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-900">
                        {editingShareholderId ? "Edit Shareholder" : "Add Shareholder"}
                      </h4>
                      <button
                        type="button"
                        onClick={resetShareholderForm}
                        className="p-1 hover:bg-slate-100 rounded-lg transition"
                      >
                        <X className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        value={shareholderForm.fullName || ""}
                        onChange={(e) => setShareholderForm({ ...shareholderForm, fullName: e.target.value })}
                        placeholder="e.g., Ahmed Sameh Elmorsy"
                      />
                      <p className="text-xs text-slate-500 mt-1">First and last name</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Date of Birth *
                        </label>
                        <Input
                          type="date"
                          value={shareholderForm.dateOfBirth}
                          onChange={(e) => setShareholderForm({ ...shareholderForm, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Nationality *
                        </label>
                        <Input
                          type="text"
                          value={shareholderForm.nationality}
                          onChange={(e) => setShareholderForm({ ...shareholderForm, nationality: e.target.value })}
                          placeholder="e.g., American, British"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Ownership Percentage (%) *
                      </label>
                      <Input
                        type="number"
                        value={shareholderForm.ownershipPercentage}
                        onChange={(e) => setShareholderForm({ ...shareholderForm, ownershipPercentage: e.target.value })}
                        placeholder="0.00"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Upload Passport (Optional)
                      </label>
                      <input
                        type="file"
                        onChange={handleShareholderPassportSelect}
                        accept=".jpg,.jpeg,.png"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">Max 50MB. Supported formats: JPG, PNG</p>
                      {shareholderPassportFile && (
                        <p className="text-sm text-green-600 mt-2">✓ {shareholderPassportFile.name} selected</p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={addShareholder}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
                      >
                        {editingShareholderId ? "Update Shareholder" : "Add Shareholder"}
                      </button>
                      <button
                        type="button"
                        onClick={resetShareholderForm}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Company Information Section - Only for Company Formation */}
            {formData.serviceType === "Company Formation" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Company Information *</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Provide details about the company being formed.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    value={companyInfo.companyName}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                    placeholder="e.g., Acme Corporation Ltd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Company Activities *
                  </label>
                  <textarea
                    value={companyInfo.companyActivities}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, companyActivities: e.target.value })}
                    placeholder="Describe the company's main business activities..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Total Capital *
                    </label>
                    <Input
                      type="number"
                      value={companyInfo.totalCapital}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, totalCapital: e.target.value })}
                      placeholder="e.g., 100000"
                      step="0.01"
                    />
                    <p className="text-xs text-slate-500 mt-1">Enter amount in {formData.currency}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Price Per Share *
                    </label>
                    <Input
                      type="number"
                      value={companyInfo.pricePerShare}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, pricePerShare: e.target.value })}
                      placeholder="e.g., 100"
                      step="0.01"
                    />
                    <p className="text-xs text-slate-500 mt-1">Price per share in {formData.currency}</p>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Attach Files (Optional)
              </label>
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                  isDragging
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-300 bg-slate-50 hover:border-primary-400"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-slate-900">
                        Drag and drop your files here
                      </p>
                      <p className="text-sm text-slate-600">or click to select</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Max 5 files, 5GB total
                    </p>
                  </div>
                </label>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-slate-900">
                      {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} uploaded
                    </p>
                    <p className="text-xs text-slate-600">
                      {getFileSize(getTotalUploadSize())} / 5GB
                    </p>
                  </div>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <svg
                          className="w-4 h-4 text-slate-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4a2 2 0 012-2h6a1 1 0 00-.707-1.707A2 2 0 0012 0h-2C6.477 0 4 2.686 4 6v6h2V6c0-1.1.9-2 2-2V4z" />
                          <path d="M8 8a1 1 0 011-1h2a1 1 0 011 1v8a1 1 0 01-1 1H9a1 1 0 01-1-1V8zM4 10a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM12 10a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">{getFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information or special requirements..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                rows={3}
              />
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Next Steps</p>
                <p>After submitting your order, our team will review it and contact you within 24 hours to confirm the details and timeline.</p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => navigate("/client/orders")}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
              <Button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700">
                Create Order
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
}
