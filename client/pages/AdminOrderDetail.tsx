import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  MapPin,
  User,
  FileText,
  Download,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockOrders, Order, OrderStatus, mockUsers, mockStaff, mockProducts } from "@/lib/mockData";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; description: string }
> = {
  new: {
    label: "New",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    description: "Order created, awaiting sales review",
  },
  pending_sales_review: {
    label: "Pending Sales Review",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    description: "Sales is reviewing the order",
  },
  rejected_by_sales: {
    label: "Rejected by Sales",
    color: "text-red-700",
    bgColor: "bg-red-50",
    description: "Sales rejected the order, waiting for client/sales to fix",
  },
  pending_operation: {
    label: "Pending Operation",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    description: "Operation is working on the order",
  },
  rejected_by_operation: {
    label: "Rejected by Operation",
    color: "text-red-700",
    bgColor: "bg-red-50",
    description: "Operation rejected the order, waiting for fixes",
  },
  pending_operation_manager_review: {
    label: "Pending Manager Review",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    description: "Operation Manager is reviewing the order",
  },
  rejected_by_operation_manager: {
    label: "Rejected by Manager",
    color: "text-red-700",
    bgColor: "bg-red-50",
    description: "Manager rejected the order, waiting for fixes",
  },
  awaiting_client_acceptance: {
    label: "Awaiting Client Acceptance",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    description: "Waiting for client to accept the order",
  },
  rejected_by_client: {
    label: "Rejected by Client",
    color: "text-red-700",
    bgColor: "bg-red-50",
    description: "Client rejected the order",
  },
  shipping_preparation: {
    label: "Shipping Preparation",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    description: "Operation Manager preparing shipping and documents",
  },
  completed: {
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-50",
    description: "Order completed successfully",
  },
};

export default function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shippingNumber, setShippingNumber] = useState("");
  const [showShippingModal, setShowShippingModal] = useState(false);

  const order = mockOrders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex-1 overflow-auto bg-slate-100 p-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900">Order not found</h2>
            <Button onClick={() => navigate("/admin/orders")} className="mt-4">
              Back to Orders
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const client = mockUsers.find((u) => u.id === order.userId);
  const config = statusConfig[order.status];

  const getStaffName = (staffId?: string) => {
    if (!staffId) return "Unassigned";
    const staff = mockStaff.find((s) => s.id === staffId);
    return staff ? `${staff.firstName} ${staff.lastName}` : "Unknown";
  };

  const handleDownloadFile = (file: any) => {
    // Create a mock file download with the original filename
    const fileData = `File: ${file.fileName}\nSize: ${file.fileSize} bytes\nUploaded By: ${file.uploadedByName}\nUploaded At: ${new Date(file.uploadedAt).toLocaleString()}\nStage: ${file.stage}\nDescription: ${file.description || "N/A"}\n\n--- File Content ---\nThis is a mock download of ${file.fileName}. In a production environment, this would contain the actual file content.`;

    // Determine MIME type based on file extension
    let mimeType = "application/octet-stream";
    if (file.fileName.endsWith(".pdf")) mimeType = "application/pdf";
    else if (file.fileName.endsWith(".doc") || file.fileName.endsWith(".docx")) mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (file.fileName.endsWith(".jpg") || file.fileName.endsWith(".jpeg")) mimeType = "image/jpeg";
    else if (file.fileName.endsWith(".png")) mimeType = "image/png";

    // Create a blob with file information
    const dataBlob = new Blob([fileData], { type: mimeType });

    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAction = (type: "accept" | "reject") => {
    setActionType(type);
    if (type === "accept") {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleAccept = () => {
    setIsModalOpen(false);

    if (order.status === "awaiting_client_acceptance") {
      // Check if order has a product
      if (order.productId) {
        const product = mockProducts.find((p) => p.id === order.productId);
        if (product) {
          const hasApostille = product.services.hasApostille;
          const hasShipping = product.services.hasShipping;

          if (!hasApostille && !hasShipping) {
            // Auto-complete order
            alert(
              `Order accepted and automatically completed!\n\nProduct "${product.name}" does not require apostille or shipping services.`
            );
          } else {
            // Send to shipping preparation
            const services = [];
            if (hasApostille) services.push("apostille");
            if (hasShipping) services.push("shipping");

            alert(
              `Order accepted and sent to Operation Manager!\n\nProduct "${product.name}" requires: ${services.join(" and ")} services.`
            );
          }
        } else {
          alert("Order accepted! Product information not found.");
        }
      } else {
        alert("Order accepted! (This is a demo - no actual changes were made)");
      }
    } else {
      alert("Order accepted! (This is a demo - no actual changes were made)");
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }
    setIsModalOpen(false);
    setRejectReason("");
    alert(`Order rejected with reason: ${rejectReason}`);
  };

  const handleShippingSubmit = () => {
    if (!shippingNumber.trim()) {
      alert("Please enter a shipping number");
      return;
    }
    setShowShippingModal(false);
    setShippingNumber("");
    alert(`Order completed with shipping number: ${shippingNumber}`);
  };

  const shouldShowSalesActions =
    order.status === "pending_sales_review" || order.status === "rejected_by_operation";
  const shouldShowOperationActions =
    order.status === "pending_operation" || order.status === "rejected_by_operation_manager";
  const shouldShowManagerActions =
    order.status === "pending_operation_manager_review" || order.status === "rejected_by_sales";
  const shouldShowClientActions = order.status === "awaiting_client_acceptance";
  const shouldShowShippingActions = order.status === "shipping_preparation";

  return (
    <AdminLayout>
      <div className="flex-1 overflow-auto bg-slate-100">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold text-slate-900">{order.orderNumber}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <div className={`rounded-lg border-2 p-6 ${config.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-2xl font-bold ${config.color}`}>{config.label}</h2>
                    <p className="text-slate-600 mt-1">{config.description}</p>
                  </div>
                  {order.status === "completed" && (
                    <CheckCircle className={`w-12 h-12 ${config.color}`} />
                  )}
                  {order.status.startsWith("rejected") && (
                    <XCircle className={`w-12 h-12 ${config.color}`} />
                  )}
                  {!order.status.startsWith("rejected") && order.status !== "completed" && (
                    <Clock className={`w-12 h-12 ${config.color}`} />
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Order Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-slate-500">Description</label>
                    <p className="text-slate-900 font-medium mt-1">{order.description}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Service Type</label>
                    <p className="text-slate-900 font-medium mt-1">{order.serviceType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Amount
                    </label>
                    <p className="text-slate-900 font-medium mt-1">
                      {order.amount.toLocaleString()} {order.currency}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Created Date & Time
                    </label>
                    <p className="text-slate-900 font-medium mt-1">
                      {new Date(order.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Created By</label>
                    <p className="text-slate-900 font-medium mt-1">
                      {client ? `${client.firstName} ${client.lastName}` : "Unknown Client"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Countries
                    </label>
                    <p className="text-slate-900 font-medium mt-1">
                      {order.countries.join(", ")}
                    </p>
                  </div>
                  {order.completedAt && (
                    <div>
                      <label className="text-sm text-slate-500">Completed Date</label>
                      <p className="text-slate-900 font-medium mt-1">
                        {new Date(order.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Information */}
              {order.productId && mockProducts.find((p) => p.id === order.productId) && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Product Information</h3>
                  {(() => {
                    const product = mockProducts.find((p) => p.id === order.productId);
                    if (!product) return null;

                    const hasApostille = product.services.hasApostille;
                    const hasShipping = product.services.hasShipping;
                    const hasPOA = product.services.hasPOA;

                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-blue-700 font-semibold">Product Name</label>
                          <p className="text-blue-900 font-medium mt-1">{product.name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-blue-700 font-semibold">Description</label>
                          <p className="text-blue-900 mt-1">{product.description}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm text-blue-700 font-semibold">Duration</label>
                            <p className="text-blue-900 font-medium mt-1">{product.duration}</p>
                          </div>
                          <div>
                            <label className="text-sm text-blue-700 font-semibold">Status</label>
                            <p className="text-blue-900 font-medium mt-1 capitalize">{product.status}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-blue-200">
                          <label className="text-sm text-blue-700 font-semibold block mb-3">
                            Included Services
                          </label>
                          <div className="flex gap-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  hasApostille ? "bg-green-500" : "bg-slate-300"
                                }`}
                              />
                              <span className="text-sm text-blue-900">Apostille</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  hasShipping ? "bg-green-500" : "bg-slate-300"
                                }`}
                              />
                              <span className="text-sm text-blue-900">Shipping</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  hasPOA ? "bg-green-500" : "bg-slate-300"
                                }`}
                              />
                              <span className="text-sm text-blue-900">POA</span>
                            </div>
                          </div>
                        </div>
                        {order.status === "awaiting_client_acceptance" && (
                          <div className="pt-3 border-t border-blue-200">
                            <p className="text-sm text-blue-700 font-semibold">
                              {!hasApostille && !hasShipping
                                ? "✓ Order will auto-complete when client accepts (no additional services required)"
                                : `✓ Order will be sent to Operation Manager for ${[
                                    hasApostille && "apostille",
                                    hasShipping && "shipping",
                                  ]
                                    .filter(Boolean)
                                    .join(" and ")} when client accepts`}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Client Information */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Client Information
                </h3>
                {client && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-slate-500">Name</label>
                      <p className="text-slate-900 font-medium mt-1">
                        {client.firstName} {client.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">Company</label>
                      <p className="text-slate-900 font-medium mt-1">{client.companyName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">Email</label>
                      <p className="text-slate-900 font-medium mt-1">{client.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">WhatsApp</label>
                      <p className="text-slate-900 font-medium mt-1">{client.whatsappNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">Location</label>
                      <p className="text-slate-900 font-medium mt-1">
                        {client.city}, {client.country}
                      </p>
                    </div>
                    {order.clientAccepted && (
                      <div>
                        <label className="text-sm text-slate-500">Client Status</label>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-medium">Accepted</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment History */}
              {order.paymentHistory && order.paymentHistory.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Payment History
                  </h3>
                  <div className="space-y-4">
                    {order.paymentHistory.map((payment) => {
                      const isPaid = payment.status === "paid";
                      const isOverdue = payment.status === "overdue";
                      const isPending = payment.status === "pending";
                      const isPartial = payment.status === "partial";
                      const isFailed = payment.status === "failed";

                      let statusBgColor = "bg-slate-100";
                      let statusTextColor = "text-slate-700";
                      let statusLabel = "Unknown";

                      if (isPaid) {
                        statusBgColor = "bg-green-100";
                        statusTextColor = "text-green-700";
                        statusLabel = "Paid";
                      } else if (isOverdue) {
                        statusBgColor = "bg-red-100";
                        statusTextColor = "text-red-700";
                        statusLabel = "Overdue";
                      } else if (isPending) {
                        statusBgColor = "bg-yellow-100";
                        statusTextColor = "text-yellow-700";
                        statusLabel = "Pending";
                      } else if (isPartial) {
                        statusBgColor = "bg-blue-100";
                        statusTextColor = "text-blue-700";
                        statusLabel = "Partial";
                      } else if (isFailed) {
                        statusBgColor = "bg-red-100";
                        statusTextColor = "text-red-700";
                        statusLabel = "Failed";
                      }

                      return (
                        <div
                          key={payment.id}
                          className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {payment.description}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Reference: {payment.reference || "N/A"}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusBgColor} ${statusTextColor}`}
                            >
                              {statusLabel}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <label className="text-xs text-slate-500 font-semibold">
                                Amount
                              </label>
                              <p className="text-slate-900 font-bold mt-1">
                                {payment.amount.toLocaleString()} {payment.currency}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 font-semibold">
                                Due Date
                              </label>
                              <p className="text-slate-900 font-medium mt-1">
                                {new Date(payment.dueDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            {payment.paidDate && (
                              <div>
                                <label className="text-xs text-slate-500 font-semibold">
                                  Paid Date
                                </label>
                                <p className="text-slate-900 font-medium mt-1">
                                  {new Date(payment.paidDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            )}
                            <div>
                              <label className="text-xs text-slate-500 font-semibold">
                                Payment Method
                              </label>
                              <p className="text-slate-900 font-medium mt-1">
                                {payment.method || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rejection Reasons */}
              {order.rejectionReasons && order.rejectionReasons.length > 0 && (
                <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                  <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Rejection Reasons
                  </h3>
                  <ul className="space-y-2">
                    {order.rejectionReasons.map((reason, index) => (
                      <li key={index} className="text-red-700 flex items-start gap-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Attached Documents */}
              {order.operationFiles && order.operationFiles.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Attached Documents ({order.operationFiles.length})
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
                            {file.description && (
                              <p className="text-xs text-slate-600 mt-2">{file.description}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadFile(file)}
                          className="ml-2 text-slate-600 hover:text-slate-900"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order History */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Order History
                </h3>
                <div className="space-y-4">
                  {order.history.map((entry, index) => (
                    <div key={entry.id} className="pb-4 border-b border-slate-200 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {entry.actionByName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(entry.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {entry.actionType === "accept"
                            ? "Accepted"
                            : entry.actionType === "reject"
                              ? "Rejected"
                              : entry.actionType === "resubmit"
                                ? "Resubmitted"
                                : "System"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        {entry.previousStatus} → {entry.newStatus}
                      </p>
                      {entry.reason && (
                        <p className="text-sm text-red-600 mt-1">
                          <strong>Reason:</strong> {entry.reason}
                        </p>
                      )}
                      {entry.notes && (
                        <p className="text-sm text-blue-600 mt-1">
                          <strong>Notes:</strong> {entry.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Assignment Info */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Assigned To</h3>
                <div className="space-y-3">
                  {order.assignedToSalesId && (
                    <div>
                      <label className="text-xs text-slate-500">Sales</label>
                      <p className="text-sm font-medium text-slate-900">
                        {getStaffName(order.assignedToSalesId)}
                      </p>
                    </div>
                  )}
                  {order.assignedToOperationId && (
                    <div>
                      <label className="text-xs text-slate-500">Operation</label>
                      <p className="text-sm font-medium text-slate-900">
                        {getStaffName(order.assignedToOperationId)}
                      </p>
                    </div>
                  )}
                  {order.assignedToManagerId && (
                    <div>
                      <label className="text-xs text-slate-500">Manager</label>
                      <p className="text-sm font-medium text-slate-900">
                        {getStaffName(order.assignedToManagerId)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {(shouldShowSalesActions ||
                shouldShowOperationActions ||
                shouldShowManagerActions ||
                shouldShowClientActions ||
                shouldShowShippingActions) && (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Actions</h3>
                  <div className="space-y-3">
                    {(shouldShowSalesActions ||
                      shouldShowOperationActions ||
                      shouldShowManagerActions ||
                      shouldShowClientActions) && (
                      <>
                        <Button
                          onClick={() => handleAction("accept")}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Order
                        </Button>
                        <Button
                          onClick={() => handleAction("reject")}
                          variant="destructive"
                          className="w-full"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Order
                        </Button>
                      </>
                    )}
                    {shouldShowShippingActions && (
                      <Button
                        onClick={() => setShowShippingModal(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Complete & Add Shipping
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accept/Reject Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "accept" ? "Accept Order" : "Reject Order"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "accept" ? (
                order.status === "awaiting_client_acceptance" && order.productId ? (
                  (() => {
                    const product = mockProducts.find((p) => p.id === order.productId);
                    if (product) {
                      const hasApostille = product.services.hasApostille;
                      const hasShipping = product.services.hasShipping;

                      if (!hasApostille && !hasShipping) {
                        return (
                          <span>
                            This order will be <strong>automatically completed</strong> when the client
                            accepts it, as the product "{product.name}" requires no additional services.
                          </span>
                        );
                      } else {
                        const services = [];
                        if (hasApostille) services.push("apostille");
                        if (hasShipping) services.push("shipping");

                        return (
                          <span>
                            This order will be sent to the Operation Manager for{" "}
                            <strong>{services.join(" and ")}</strong> when the client accepts it.
                          </span>
                        );
                      }
                    }
                    return "Are you sure you want to accept this order? It will move to the next stage.";
                  })()
                ) : (
                  "Are you sure you want to accept this order? It will move to the next stage."
                )
              ) : (
                "Please provide a reason for rejecting this order."
              )}
            </DialogDescription>
          </DialogHeader>

          {actionType === "reject" && (
            <div className="space-y-4 py-4">
              <Input
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={actionType === "accept" ? handleAccept : handleReject}
              className={actionType === "accept" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {actionType === "accept" ? "Accept" : "Reject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shipping Modal */}
      <Dialog open={showShippingModal} onOpenChange={setShowShippingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Order & Add Shipping</DialogTitle>
            <DialogDescription>
              Enter the shipping number and documents will be uploaded.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter shipping number..."
              value={shippingNumber}
              onChange={(e) => setShippingNumber(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowShippingModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleShippingSubmit} className="bg-blue-600 hover:bg-blue-700">
              Complete Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
