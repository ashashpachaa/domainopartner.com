import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockOrders, mockProducts } from "@/lib/mockData";
import ClientLayout from "@/components/ClientLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ClientCreateOrder() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const [formData, setFormData] = useState({
    description: "",
    productId: "",
    serviceType: "",
    countries: "",
    amount: "",
    currency: "USD",
    notes: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.productId || !formData.serviceType || !formData.countries || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Find max existing order number
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
        status: "pending_sales_review",
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
            previousStatus: "new",
            newStatus: "pending_sales_review",
            actionType: "system_transition",
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
          stage: "sales",
          notes: `Client-uploaded file: ${file.name}`,
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
          operationNotes: "",
          qualityCheck: false,
          documentsVerified: false,
          complianceReview: false,
        },
        requiredServices: selectedProduct?.services || {
          hasApostille: false,
          hasShipping: false,
          hasPOA: false,
          hasFinancialReport: false,
        },
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
                Countries (comma-separated) *
              </label>
              <Input
                type="text"
                value={formData.countries}
                onChange={(e) => setFormData({ ...formData, countries: e.target.value })}
                placeholder="e.g., USA, UK, Germany"
              />
              <p className="text-xs text-slate-500 mt-1">Separate multiple countries with commas</p>
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
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AED">AED</option>
                </select>
              </div>
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
                variant="outline"
                onClick={() => navigate("/client/orders")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700"
              >
                Create Order
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
}
