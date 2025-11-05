import { useState } from "react";
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
                      Created Date
                    </label>
                    <p className="text-slate-900 font-medium mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "accept" ? "Accept Order" : "Reject Order"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "accept"
                ? "Are you sure you want to accept this order? It will move to the next stage."
                : "Please provide a reason for rejecting this order."}
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
