import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Download,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockOrders, mockUsers, mockProducts, mockStaff } from "@/lib/mockData";

export default function AdminOperationDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState("");
  const [fileNotes, setFileNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"workflow" | "apostille" | "history">("workflow");

  const order = mockOrders.find((o) => o.id === orderId);
  const user = order ? mockUsers.find((u) => u.id === order.userId) : null;
  const product = order?.productId
    ? mockProducts.find((p) => p.id === order.productId)
    : null;

  if (!order || !user) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Order not found</p>
          <Link to="/admin/operations">
            <Button>Back to Operations</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const workflowStages = [
    { id: "new", label: "Order Created", icon: "📋" },
    { id: "pending_sales_review", label: "Sales Review", icon: "👤" },
    { id: "pending_operation", label: "Operation Process", icon: "⚙️" },
    {
      id: "pending_operation_manager_review",
      label: "Manager Review",
      icon: "✓",
    },
    { id: "awaiting_client_acceptance", label: "Client Acceptance", icon: "🤝" },
    { id: "shipping_preparation", label: "Shipping & Complete", icon: "📦" },
  ];

  const currentStageIndex = workflowStages.findIndex(
    (s) => s.id === order.status
  );

  const handleAddTracking = () => {
    if (trackingInput.trim()) {
      console.log("Adding tracking:", trackingInput);
      setTrackingInput("");
      alert("Tracking number added successfully!");
    }
  };

  const handleFileUpload = () => {
    if (fileNotes.trim()) {
      console.log("Uploading file with notes:", fileNotes);
      setFileNotes("");
      alert("File uploaded successfully!");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <Link to="/admin/operations">
          <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Operations
          </Button>
        </Link>

        {/* Order Title Card */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {order.orderNumber}
              </h1>
              <p className="text-slate-600 mt-2">
                {user.firstName} {user.lastName} • {user.companyName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">
                {order.currency} {order.amount.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Created:{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Progress */}
        <div className="bg-white rounded-lg p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Workflow Progress
          </h2>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStageIndex + 1) / workflowStages.length) * 100}%`,
                }}
              />
            </div>

            {/* Stages */}
            <div className="relative z-10 flex justify-between">
              {workflowStages.map((stage, index) => (
                <div key={stage.id} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 border-2 ${
                      index <= currentStageIndex
                        ? "bg-primary-600 border-primary-600 text-white"
                        : "bg-white border-slate-300 text-slate-400"
                    }`}
                  >
                    {index < currentStageIndex ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : index === currentStageIndex ? (
                      <Clock className="w-6 h-6 animate-pulse" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-900 text-center max-w-[80px]">
                    {stage.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {["workflow", "apostille", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "workflow"
                ? "Workflow & Files"
                : tab === "apostille"
                ? "Apostille"
                : "Activity Log"}
            </button>
          ))}
        </div>

        {/* Workflow Tab */}
        {activeTab === "workflow" && (
          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary-600" />
                Upload Files
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    File Notes/Description
                  </label>
                  <textarea
                    value={fileNotes}
                    onChange={(e) => setFileNotes(e.target.value)}
                    placeholder="Describe what you're uploading (e.g., 'Tax ID documentation', 'Company registration papers', etc.)"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 resize-none"
                  />
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-500 cursor-pointer transition-colors">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    Click to upload file or drag and drop
                  </p>
                  <p className="text-xs text-slate-600">
                    PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>

                <Button
                  onClick={handleFileUpload}
                  disabled={!fileNotes.trim()}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </div>

            {/* Uploaded Files List */}
            {order.operationFiles && order.operationFiles.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Uploaded Files ({order.operationFiles.length})
                </h3>

                <div className="space-y-3">
                  {order.operationFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {file.fileName}
                          </p>
                          <div className="flex gap-2 text-xs text-slate-600 mt-1">
                            <span>{file.uploadedByName}</span>
                            <span>•</span>
                            <span>
                              {new Date(file.uploadedAt).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )}
                            </span>
                            <span>•</span>
                            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs">
                              {file.stage}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:text-slate-900"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracking Number Section */}
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600" />
                Tracking Information
              </h3>

              {order.trackingNumber ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900 mb-2">
                    Tracking number added by:
                  </p>
                  <p className="text-2xl font-bold text-green-600 font-mono mb-2">
                    {order.trackingNumber}
                  </p>
                  <p className="text-xs text-green-700">
                    Added on{" "}
                    {order.trackingNumberAddedAt
                      ? new Date(order.trackingNumberAddedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )
                      : "Unknown date"}{" "}
                    by {order.trackingNumberAddedBy || "Unknown"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Add Tracking Number
                    </label>
                    <Input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="e.g., TRK123456789"
                      className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    />
                    <p className="text-xs text-slate-600 mt-2">
                      Once added, this tracking number will be visible to the
                      client in their dashboard
                    </p>
                  </div>

                  <Button
                    onClick={handleAddTracking}
                    disabled={!trackingInput.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Add Tracking Number
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Apostille Tab */}
        {activeTab === "apostille" && (
          <div className="space-y-6">
            {product?.services.hasApostille ? (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Apostille Required
                </h3>
                <p className="text-sm text-blue-800">
                  This product includes apostille service. After client accepts
                  the order, documents will need to be apostilled by the
                  operation manager before shipment.
                </p>

                {order.apostilleDocuments &&
                order.apostilleDocuments.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {order.apostilleDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-lg border-2 ${
                          doc.isComplete
                            ? "bg-green-50 border-green-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">
                              {doc.documentName}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              Apostilled by: {doc.apostilledByName}
                            </p>
                            {doc.certificateNumber && (
                              <p className="text-xs text-slate-600 mt-1">
                                Certificate #: {doc.certificateNumber}
                              </p>
                            )}
                          </div>
                          {doc.isComplete && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-900">
                      No apostille documents yet. They will be processed after
                      client acceptance.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <p className="text-slate-600">
                  This product does not require apostille service.
                </p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              Activity Log
            </h3>

            {order.history && order.history.length > 0 ? (
              <div className="space-y-4">
                {[...order.history]
                  .reverse()
                  .map((event, index) => (
                    <div
                      key={index}
                      className="flex gap-4 pb-4 border-b border-slate-200 last:border-b-0"
                    >
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-600 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {event.description}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {new Date(event.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-slate-600">No activity yet</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
