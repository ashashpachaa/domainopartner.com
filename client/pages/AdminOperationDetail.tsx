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
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"workflow" | "apostille" | "history">("workflow");

  const order = mockOrders.find((o) => o.id === orderId);
  const user = order ? mockUsers.find((u) => u.id === order.userId) : null;
  const product = order?.productId
    ? mockProducts.find((p) => p.id === order.productId)
    : null;

  // Get current user from localStorage (assuming it's stored as currentStaff or similar)
  const currentUserId = localStorage.getItem("currentStaffId") || "S002"; // Default to manager for demo

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

  // Determine if current user can take actions on this order
  const canAccept = () => {
    if (order.status === "pending_sales_review" && order.assignedToSalesId === currentUserId) return true;
    if (order.status === "pending_operation" && order.assignedToOperationId === currentUserId) return true;
    if (order.status === "pending_operation_manager_review" && order.assignedToManagerId === currentUserId) return true;
    if (order.status === "awaiting_client_acceptance" && currentUserId === "client") return true;
    if (order.status === "shipping_preparation" && order.assignedToManagerId === currentUserId) return true;
    return false;
  };

  // Get the next status based on current status
  const getNextStatus = (): string => {
    const statusMap: { [key: string]: string } = {
      "pending_sales_review": "pending_operation",
      "pending_operation": "pending_operation_manager_review",
      "pending_operation_manager_review": "awaiting_client_acceptance",
      "awaiting_client_acceptance": product?.services.hasApostille ? "shipping_preparation" : "shipping_preparation",
      "shipping_preparation": "completed",
    };
    return statusMap[order.status] || order.status;
  };

  // Get rejection status based on current status
  const getRejectionStatus = (): string => {
    const statusMap: { [key: string]: string } = {
      "pending_sales_review": "rejected_by_sales",
      "pending_operation": "rejected_by_operation",
      "pending_operation_manager_review": "rejected_by_operation_manager",
      "awaiting_client_acceptance": "rejected_by_client",
    };
    return statusMap[order.status] || order.status;
  };

  const handleAccept = () => {
    if (canAccept()) {
      const nextStatus = getNextStatus();
      const currentStaff = mockStaff.find((s) => s.id === currentUserId);

      // Add history entry
      const newHistoryEntry = {
        id: `H${order.id}-${order.history.length + 1}`,
        orderId: order.id,
        previousStatus: order.status as any,
        newStatus: nextStatus as any,
        actionType: "accept" as any,
        actionBy: currentUserId,
        actionByName: currentStaff?.firstName + " " + currentStaff?.lastName || "Unknown",
        description: `${currentStaff?.firstName} accepted the order - moved to ${getStatusLabel(nextStatus)}`,
        createdAt: new Date().toISOString(),
      };

      order.history.push(newHistoryEntry);
      order.status = nextStatus as any;

      // Mark as completed if final stage
      if (nextStatus === "completed") {
        order.completedAt = new Date().toISOString().split("T")[0];
      }

      alert(`Order accepted and moved to ${getStatusLabel(nextStatus)}`);
      window.location.reload(); // Reload to see the changes
    } else {
      alert("You don't have permission to accept this order at this stage");
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    if (canAccept()) {
      const rejectionStatus = getRejectionStatus();
      const currentStaff = mockStaff.find((s) => s.id === currentUserId);

      // Add history entry
      const newHistoryEntry = {
        id: `H${order.id}-${order.history.length + 1}`,
        orderId: order.id,
        previousStatus: order.status as any,
        newStatus: rejectionStatus as any,
        actionType: "reject" as any,
        actionBy: currentUserId,
        actionByName: currentStaff?.firstName + " " + currentStaff?.lastName || "Unknown",
        reason: rejectReason,
        description: `${currentStaff?.firstName} rejected the order - ${rejectReason}`,
        createdAt: new Date().toISOString(),
      };

      order.history.push(newHistoryEntry);
      order.status = rejectionStatus as any;
      order.rejectionReasons.push(rejectReason);

      setRejectReason("");
      setShowRejectForm(false);

      alert(`Order rejected with reason: ${rejectReason}`);
      window.location.reload(); // Reload to see the changes
    } else {
      alert("You don't have permission to reject this order at this stage");
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      "new": "Order Created",
      "pending_sales_review": "Sales Review",
      "pending_operation": "Operation",
      "pending_operation_manager_review": "Manager Review",
      "awaiting_client_acceptance": "Client Acceptance",
      "shipping_preparation": "Shipping Preparation",
      "completed": "Completed",
      "rejected_by_sales": "Rejected by Sales",
      "rejected_by_operation": "Rejected by Operation",
      "rejected_by_operation_manager": "Rejected by Manager",
      "rejected_by_client": "Rejected by Client",
    };
    return labels[status] || status;
  };

  const handleAddTracking = () => {
    if (trackingInput.trim()) {
      order.trackingNumber = trackingInput;
      order.trackingNumberAddedBy = currentUserId;
      order.trackingNumberAddedAt = new Date().toISOString();
      setTrackingInput("");
      alert("Tracking number added successfully!");
      window.location.reload();
    }
  };

  const handleFileUpload = () => {
    if (fileNotes.trim()) {
      const currentStaff = mockStaff.find((s) => s.id === currentUserId);
      const newFile = {
        id: `F${order.operationFiles.length + 1}`,
        orderId: order.id,
        fileName: `Document_${new Date().getTime()}.pdf`,
        fileSize: Math.random() * 5000000, // Random size in bytes
        uploadedBy: currentUserId,
        uploadedByName: currentStaff?.firstName + " " + currentStaff?.lastName || "Unknown",
        uploadedAt: new Date().toISOString(),
        stage: getFileStageFromStatus(order.status),
        fileType: "document" as any,
        description: fileNotes,
      };

      order.operationFiles.push(newFile);
      setFileNotes("");
      alert("File uploaded successfully!");
      window.location.reload();
    }
  };

  const getFileStageFromStatus = (status: string): "sales" | "operation" | "manager" | "apostille" => {
    const stageMap: { [key: string]: "sales" | "operation" | "manager" | "apostille" } = {
      "pending_sales_review": "sales",
      "pending_operation": "operation",
      "pending_operation_manager_review": "manager",
      "shipping_preparation": "apostille",
      "awaiting_client_acceptance": "manager",
    };
    return stageMap[status] || "operation";
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

        {/* Workflow Action Buttons */}
        {!["completed", "rejected_by_sales", "rejected_by_operation", "rejected_by_operation_manager", "rejected_by_client"].includes(order.status) && canAccept() && (
          <div className="bg-white rounded-lg p-6 border border-slate-200 flex gap-3 items-center">
            <Button
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept & Move Forward
            </Button>

            {!showRejectForm ? (
              <Button
                onClick={() => setShowRejectForm(true)}
                variant="destructive"
                className="gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Reject Order
              </Button>
            ) : (
              <div className="flex-1 flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please explain why you're rejecting this order..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-red-500 focus:ring-red-500 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleReject}
                    variant="destructive"
                    disabled={!rejectReason.trim()}
                  >
                    Submit Rejection
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason("");
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

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
                  .map((event, index) => {
                    // Generate description if not present
                    const description = event.description || generateHistoryDescription(event);
                    return (
                      <div
                        key={index}
                        className="flex gap-4 pb-4 border-b border-slate-200 last:border-b-0"
                      >
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-600 mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {description}
                          </p>
                          {event.reason && (
                            <p className="text-xs text-red-600 mt-1">
                              Reason: {event.reason}
                            </p>
                          )}
                          {event.notes && (
                            <p className="text-xs text-blue-600 mt-1">
                              Notes: {event.notes}
                            </p>
                          )}
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
                    );
                  })}
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
