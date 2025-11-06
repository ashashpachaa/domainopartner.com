import { useState, useMemo, useEffect } from "react";
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
  Calendar,
  User,
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"workflow" | "apostille" | "history">("workflow");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [impersonateStaffId, setImpersonateStaffId] = useState<string>("");
  const [adminMode, setAdminMode] = useState(true);

  // Load order from localStorage or mockData
  const getOrder = () => {
    const stored = localStorage.getItem(`order_${orderId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return mockOrders.find((o) => o.id === orderId);
  };

  const [order, setOrder] = useState(() => getOrder());

  // Save order to localStorage whenever it changes
  const saveOrder = (updatedOrder: any) => {
    setOrder(updatedOrder);
    localStorage.setItem(`order_${orderId}`, JSON.stringify(updatedOrder));
  };

  const user = order ? mockUsers.find((u) => u.id === order.userId) : null;
  const product = order?.productId
    ? mockProducts.find((p) => p.id === order.productId)
    : null;

  // Get current user from localStorage (assuming it's stored as currentStaff or similar)
  const currentUserId = localStorage.getItem("currentStaffId") || "S002"; // Default to manager for demo

  // Admin impersonation - use selected staff or current user
  const effectiveUserId = adminMode && impersonateStaffId ? impersonateStaffId : currentUserId;

  // Live countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
    // Admin override - always allow in admin mode
    if (adminMode && impersonateStaffId) return true;

    if (order.status === "pending_sales_review" && order.assignedToSalesId === effectiveUserId) return true;
    if (order.status === "pending_operation" && order.assignedToOperationId === effectiveUserId) return true;
    if (order.status === "pending_operation_manager_review" && order.assignedToManagerId === effectiveUserId) return true;
    if (order.status === "awaiting_client_acceptance" && effectiveUserId === "client") return true;
    if (order.status === "shipping_preparation" && order.assignedToManagerId === effectiveUserId) return true;
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
  // Orders go back to previous stage for rework instead of terminal rejection
  const getRejectionStatus = (): string => {
    const statusMap: { [key: string]: string } = {
      "pending_sales_review": "rejected_by_sales", // Terminal - back to client to fix
      "pending_operation": "rejected_by_operation", // Terminal - back to client to fix
      "pending_operation_manager_review": "pending_operation", // REWORK: Send back to Operation for fixes
      "awaiting_client_acceptance": "pending_operation_manager_review", // REWORK: Send back to Manager for fixes
    };
    return statusMap[order.status] || order.status;
  };

  const handleAccept = () => {
    if (canAccept()) {
      const nextStatus = getNextStatus();
      const currentStaff = mockStaff.find((s) => s.id === effectiveUserId);

      // Add history entry
      const newHistoryEntry = {
        id: `H${order.id}-${order.history.length + 1}`,
        orderId: order.id,
        previousStatus: order.status as any,
        newStatus: nextStatus as any,
        actionType: "accept" as any,
        actionBy: effectiveUserId,
        actionByName: currentStaff?.firstName + " " + currentStaff?.lastName || "Unknown",
        description: `${currentStaff?.firstName} accepted the order - moved to ${getStatusLabel(nextStatus)}`,
        createdAt: new Date().toISOString(),
      };

      const updatedOrder = { ...order };
      updatedOrder.history = [...(order.history || []), newHistoryEntry];
      updatedOrder.status = nextStatus as any;

      // Mark as completed if final stage
      if (nextStatus === "completed") {
        updatedOrder.completedAt = new Date().toISOString().split("T")[0];
        updatedOrder.completedServices.apostilleComplete = true;
        updatedOrder.completedServices.shippingComplete = true;
        updatedOrder.completedServices.poaComplete = true;
        updatedOrder.completedServices.financialReportComplete = true;
      }

      saveOrder(updatedOrder);
      alert(`Order accepted and moved to ${getStatusLabel(nextStatus)}`);
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
      const currentStaff = mockStaff.find((s) => s.id === effectiveUserId);
      const isReworkFlow = ["pending_operation_manager_review", "awaiting_client_acceptance"].includes(order.status);

      // Add history entry
      const newHistoryEntry = {
        id: `H${order.id}-${order.history.length + 1}`,
        orderId: order.id,
        previousStatus: order.status as any,
        newStatus: rejectionStatus as any,
        actionType: "reject" as any,
        actionBy: effectiveUserId,
        actionByName: currentStaff?.firstName + " " + currentStaff?.lastName || "Unknown",
        reason: rejectReason,
        description: isReworkFlow
          ? `${currentStaff?.firstName} sent back for rework - ${rejectReason}`
          : `${currentStaff?.firstName} rejected the order - ${rejectReason}`,
        createdAt: new Date().toISOString(),
      };

      // Add rejection comment (visible to staff)
      const rejectionComment = {
        id: `C${order.id}-REJ-${Date.now()}`,
        orderId: order.id,
        commentBy: effectiveUserId,
        commentByName: currentStaff?.firstName + " " + currentStaff?.lastName || "Unknown",
        commentByRole: currentStaff?.role as any,
        content: `⚠️ REJECTION/REWORK: ${rejectReason}`,
        isInternal: true,
        createdAt: new Date().toISOString(),
      };

      const updatedOrder = { ...order };
      updatedOrder.history = [...(order.history || []), newHistoryEntry];
      updatedOrder.comments = [...(order.comments || []), rejectionComment];
      updatedOrder.status = rejectionStatus as any;
      updatedOrder.rejectionReasons = [...(order.rejectionReasons || []), rejectReason];

      saveOrder(updatedOrder);
      setRejectReason("");
      setShowRejectForm(false);

      const message = isReworkFlow
        ? `Order sent back for rework: ${rejectReason}`
        : `Order rejected with reason: ${rejectReason}`;
      alert(message);
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
      const updatedOrder = { ...order };
      updatedOrder.trackingNumber = trackingInput;
      updatedOrder.trackingNumberAddedBy = effectiveUserId;
      updatedOrder.trackingNumberAddedAt = new Date().toISOString();
      updatedOrder.completedServices.shippingComplete = true;
      saveOrder(updatedOrder);
      setTrackingInput("");
      alert("Tracking number added successfully!");
    }
  };

  const handleAutoCompleteAll = () => {
    if (!window.confirm("Auto-complete all workflow stages? This will move the order through all remaining stages and mark all services as complete.")) {
      return;
    }

    const stages: any[] = [
      "pending_sales_review",
      "pending_operation",
      "pending_operation_manager_review",
      "awaiting_client_acceptance",
      "shipping_preparation",
      "completed",
    ];

    // Move through all stages from current position
    const currentIndex = stages.indexOf(order.status);
    const updatedOrder = { ...order };
    updatedOrder.history = [...(order.history || [])];

    for (let i = currentIndex; i < stages.length; i++) {
      const toStatus = stages[i];
      const staff = mockStaff.find(
        (s) =>
          (toStatus === "pending_sales_review" && s.id === order.assignedToSalesId) ||
          (toStatus === "pending_operation" && s.id === order.assignedToOperationId) ||
          (toStatus === "pending_operation_manager_review" && s.id === order.assignedToManagerId) ||
          (toStatus === "awaiting_client_acceptance" && s.role === "sales") ||
          (toStatus === "shipping_preparation" && s.id === order.assignedToManagerId) ||
          (toStatus === "completed" && s.id === order.assignedToManagerId)
      );

      const historyEntry = {
        id: `H${order.id}-${updatedOrder.history.length + 1}`,
        orderId: order.id,
        previousStatus: updatedOrder.status as any,
        newStatus: toStatus as any,
        actionType: "accept" as any,
        actionBy: staff?.id || "S002",
        actionByName: `${staff?.firstName || "System"} ${staff?.lastName || ""}`,
        description: `Order auto-progressed to ${getStatusLabel(toStatus)}`,
        createdAt: new Date().toISOString(),
      };

      updatedOrder.history.push(historyEntry);
      updatedOrder.status = toStatus as any;
    }

    // Mark all services as complete
    updatedOrder.completedServices.apostilleComplete = true;
    updatedOrder.completedServices.shippingComplete = true;
    updatedOrder.completedServices.poaComplete = true;
    updatedOrder.completedServices.financialReportComplete = true;
    updatedOrder.completedAt = new Date().toISOString().split("T")[0];
    updatedOrder.clientAccepted = true;
    updatedOrder.clientAcceptedAt = new Date().toISOString();
    updatedOrder.clientCanViewFiles = true;
    updatedOrder.clientCanViewTracking = true;

    if (!updatedOrder.trackingNumber) {
      updatedOrder.trackingNumber = `AUTO-${Math.random().toString(36).substring(7).toUpperCase()}`;
      updatedOrder.trackingNumberAddedBy = effectiveUserId;
      updatedOrder.trackingNumberAddedAt = new Date().toISOString();
    }

    saveOrder(updatedOrder);
    alert("Order auto-completed! All stages progressed and services marked complete.");
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    if (!fileNotes.trim()) {
      alert("Please add a description for the file");
      return;
    }

    const currentStaff = mockStaff.find((s) => s.id === currentUserId);
    const newFile = {
      id: `F${order.operationFiles.length + 1}`,
      orderId: order.id,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      uploadedBy: currentUserId,
      uploadedByName: currentStaff?.firstName + " " + currentStaff?.lastName || "Unknown",
      uploadedAt: new Date().toISOString(),
      stage: getFileStageFromStatus(order.status),
      fileType: "document" as any,
      description: fileNotes,
    };

    order.operationFiles.push(newFile);
    setFileNotes("");
    setSelectedFile(null);
    alert("File uploaded successfully!");
    window.location.reload();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert("File size exceeds 10MB limit");
        return;
      }
      setSelectedFile(file);
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

  const generateHistoryDescription = (event: any): string => {
    if (event.actionType === "accept") {
      return `${event.actionByName} accepted the order and moved it to ${getStatusLabel(event.newStatus)}`;
    } else if (event.actionType === "reject") {
      return `${event.actionByName} rejected the order`;
    } else if (event.actionType === "resubmit") {
      return `${event.actionByName} resubmitted the order to ${getStatusLabel(event.newStatus)}`;
    } else if (event.actionType === "system_transition") {
      return `Order automatically moved to ${getStatusLabel(event.newStatus)} by ${event.actionByName}`;
    } else if (event.actionType === "edit") {
      return `${event.actionByName} edited the order`;
    }
    return `${event.actionByName} performed ${event.actionType} action`;
  };

  // Calculate business days (Mon-Fri only)
  const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
    let count = 0;
    const current = new Date(startDate);
    while (current < endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  // Add business days to a date
  const addBusinessDays = (startDate: Date, daysToAdd: number): Date => {
    let count = 0;
    const result = new Date(startDate);
    while (count < daysToAdd) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
    }
    return result;
  };

  // Get deadline and affected staff for current stage
  const getDeadlineInfo = useMemo(() => {
    const now = new Date();
    const createdDate = new Date(order.createdAt);
    let deadlineDate: Date;
    let affectedStaffId: string | null = null;
    let stageName = "";
    let daysAllowed = 0;

    switch (order.status) {
      case "pending_sales_review":
        stageName = "Sales Review";
        daysAllowed = 0.25; // 6 hours
        deadlineDate = new Date(createdDate.getTime() + 6 * 60 * 60 * 1000);
        affectedStaffId = order.assignedToSalesId || null;
        break;
      case "pending_operation":
        stageName = "Operation Processing";
        daysAllowed = 3;
        deadlineDate = addBusinessDays(createdDate, 3);
        affectedStaffId = order.assignedToOperationId || null;
        break;
      case "pending_operation_manager_review":
        stageName = "Manager Review";
        daysAllowed = 1;
        deadlineDate = addBusinessDays(createdDate, 4); // 3 days operation + 1 day manager
        affectedStaffId = order.assignedToManagerId || null;
        break;
      case "awaiting_client_acceptance":
        stageName = "Client Acceptance Review";
        daysAllowed = 1;
        deadlineDate = addBusinessDays(createdDate, 5); // 3 days operation + 1 day manager + 1 day sales
        affectedStaffId = order.assignedToSalesId || null;
        break;
      case "shipping_preparation":
        // If apostille required, deadline is 1 day for apostille, then 2 days for tracking
        if (product?.services.hasApostille) {
          stageName = "Apostille Processing";
          daysAllowed = 1;
          deadlineDate = addBusinessDays(createdDate, 7); // 3 + 1 + 1 + 1 + 1 (apostille)
          affectedStaffId = order.assignedToManagerId || null;
        } else {
          stageName = "Shipping Preparation";
          daysAllowed = 2;
          deadlineDate = addBusinessDays(createdDate, 8); // Total for tracking
          affectedStaffId = order.assignedToManagerId || null;
        }
        break;
      default:
        return {
          stageName: getStatusLabel(order.status),
          deadlineDate: null,
          daysRemaining: null,
          hoursRemaining: null,
          affectedStaff: null,
          isOverdue: false,
          isApproaching: false,
          daysAllowed: 0,
        };
    }

    const affectedStaff = affectedStaffId
      ? mockStaff.find((s) => s.id === affectedStaffId)
      : null;
    const timeRemaining = deadlineDate.getTime() - now.getTime();
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const isOverdue = now > deadlineDate;
    const isApproaching = timeRemaining < 6 * 60 * 60 * 1000 && !isOverdue; // Less than 6 hours

    return {
      stageName,
      deadlineDate,
      daysRemaining,
      hoursRemaining,
      affectedStaff,
      isOverdue,
      isApproaching,
      daysAllowed,
    };
  }, [order.status, order.createdAt, order.assignedToSalesId, order.assignedToOperationId, order.assignedToManagerId]);

  // Get deadline info for all stages
  const getStageDealinesInfo = useMemo(() => {
    const createdDate = new Date(order.createdAt);
    const now = currentTime; // Use currentTime for live updates

    const stageDeadlines = [
      {
        id: "new",
        label: "Order Created",
        daysAllowed: 0,
        deadlineDate: createdDate,
      },
      {
        id: "pending_sales_review",
        label: "Sales Review",
        daysAllowed: 0.25, // 6 hours
        deadlineDate: new Date(createdDate.getTime() + 6 * 60 * 60 * 1000),
      },
      {
        id: "pending_operation",
        label: "Operation Process",
        daysAllowed: 3,
        deadlineDate: addBusinessDays(createdDate, 3),
      },
      {
        id: "pending_operation_manager_review",
        label: "Manager Review",
        daysAllowed: 1,
        deadlineDate: addBusinessDays(createdDate, 4),
      },
      {
        id: "awaiting_client_acceptance",
        label: "Client Acceptance",
        daysAllowed: 1,
        deadlineDate: addBusinessDays(createdDate, 5),
      },
      {
        id: "shipping_preparation",
        label: "Shipping & Complete",
        daysAllowed: product?.services.hasApostille ? 1 : 2,
        deadlineDate: addBusinessDays(createdDate, product?.services.hasApostille ? 7 : 8),
      },
    ];

    return stageDeadlines.map((stage) => {
      const timeRemaining = stage.deadlineDate.getTime() - now.getTime();
      const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

      return {
        ...stage,
        timeRemaining,
        daysRemaining,
        hoursRemaining,
        minutesRemaining,
        isOverdue: now > stage.deadlineDate,
        isApproaching: timeRemaining < 6 * 60 * 60 * 1000 && !( now > stage.deadlineDate),
      };
    });
  }, [order.createdAt, currentTime, product?.services.hasApostille]);

  const getDeadlineColor = () => {
    if (["completed", "rejected_by_sales", "rejected_by_operation", "rejected_by_operation_manager", "rejected_by_client"].includes(order.status)) {
      return "bg-slate-50 border-slate-200";
    }
    if (getDeadlineInfo.isOverdue) {
      return "bg-red-50 border-red-200";
    }
    if (getDeadlineInfo.isApproaching) {
      return "bg-yellow-50 border-yellow-200";
    }
    return "bg-blue-50 border-blue-200";
  };

  const getDeadlineTextColor = () => {
    if (["completed", "rejected_by_sales", "rejected_by_operation", "rejected_by_operation_manager", "rejected_by_client"].includes(order.status)) {
      return "text-slate-700";
    }
    if (getDeadlineInfo.isOverdue) {
      return "text-red-700";
    }
    if (getDeadlineInfo.isApproaching) {
      return "text-yellow-700";
    }
    return "text-blue-700";
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
              <p className="text-xs text-slate-600 mt-1">
                Created:{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                at{" "}
                {new Date(order.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        {adminMode && (
          <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-200">
            <h3 className="text-lg font-bold text-amber-900 mb-4">🔑 Admin Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Staff Impersonation */}
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Impersonate Staff (Bypass Role Check)
                </label>
                <select
                  value={impersonateStaffId}
                  onChange={(e) => setImpersonateStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white text-slate-900"
                >
                  <option value="">-- No Impersonation --</option>
                  {mockStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName} ({staff.role})
                    </option>
                  ))}
                </select>
                {impersonateStaffId && (
                  <p className="text-xs text-amber-700 mt-2">
                    ✓ Acting as {mockStaff.find(s => s.id === impersonateStaffId)?.firstName}
                  </p>
                )}
              </div>

              {/* Auto-Complete Button */}
              <div className="flex flex-col justify-end">
                <Button
                  onClick={handleAutoCompleteAll}
                  className="bg-amber-600 hover:bg-amber-700 text-white gap-2 w-full"
                >
                  ⚡ Auto-Complete All Stages
                </Button>
                <p className="text-xs text-amber-700 mt-2">
                  Progresses order through all remaining stages
                </p>
              </div>

              {/* Quick Service Completion */}
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Mark Services Complete
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={order.completedServices.apostilleComplete}
                      onChange={(e) => {
                        order.completedServices.apostilleComplete = e.target.checked;
                        window.location.reload();
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-amber-900">Apostille</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={order.completedServices.shippingComplete}
                      onChange={(e) => {
                        order.completedServices.shippingComplete = e.target.checked;
                        window.location.reload();
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-amber-900">Shipping</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={order.completedServices.poaComplete}
                      onChange={(e) => {
                        order.completedServices.poaComplete = e.target.checked;
                        window.location.reload();
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-amber-900">POA</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={order.completedServices.financialReportComplete}
                      onChange={(e) => {
                        order.completedServices.financialReportComplete = e.target.checked;
                        window.location.reload();
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-amber-900">Financial Report</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details & Deadlines Section */}
        <div className={`rounded-lg p-6 border-2 ${getDeadlineColor()}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Created By */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-slate-600" />
                <p className="text-xs font-semibold text-slate-600 uppercase">Created By</p>
              </div>
              <p className={`text-sm font-medium ${getDeadlineTextColor()}`}>
                {order.createdByStaffId
                  ? mockStaff.find((s) => s.id === order.createdByStaffId)?.firstName +
                    " " +
                    mockStaff.find((s) => s.id === order.createdByStaffId)?.lastName
                  : "Unknown"}
              </p>
            </div>

            {/* Current Stage */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <p className="text-xs font-semibold text-slate-600 uppercase">Current Stage</p>
              </div>
              <p className={`text-sm font-medium ${getDeadlineTextColor()}`}>
                {getDeadlineInfo.stageName}
              </p>
            </div>

            {/* Deadline & Countdown */}
            {getDeadlineInfo.deadlineDate && !["completed", "rejected_by_sales", "rejected_by_operation", "rejected_by_operation_manager", "rejected_by_client"].includes(order.status) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <p className="text-xs font-semibold text-slate-600 uppercase">Deadline</p>
                </div>
                <p className={`text-sm font-medium ${getDeadlineTextColor()}`}>
                  {getDeadlineInfo.deadlineDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className={`text-xs mt-1 font-semibold ${
                  getDeadlineInfo.isOverdue
                    ? "text-red-600"
                    : getDeadlineInfo.isApproaching
                    ? "text-yellow-600"
                    : "text-blue-600"
                }`}>
                  {getDeadlineInfo.isOverdue ? (
                    <>⚠️ OVERDUE</>
                  ) : (
                    <>
                      {getDeadlineInfo.daysRemaining}d {getDeadlineInfo.hoursRemaining}h remaining
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Affected Staff */}
            {getDeadlineInfo.affectedStaff && !["completed", "rejected_by_sales", "rejected_by_operation", "rejected_by_operation_manager", "rejected_by_client"].includes(order.status) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-slate-600" />
                  <p className="text-xs font-semibold text-slate-600 uppercase">Responsible</p>
                </div>
                <p className={`text-sm font-medium ${getDeadlineTextColor()}`}>
                  {getDeadlineInfo.affectedStaff.firstName} {getDeadlineInfo.affectedStaff.lastName}
                </p>
                {(getDeadlineInfo.isOverdue || getDeadlineInfo.isApproaching) && (
                  <p className={`text-xs mt-1 font-semibold ${
                    getDeadlineInfo.isOverdue
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}>
                    ⚠️ Performance Impact
                  </p>
                )}
              </div>
            )}
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
            Workflow Progress & Deadlines
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

            {/* Stages with Deadlines */}
            <div className="relative z-10 flex justify-between">
              {workflowStages.map((stage, index) => {
                const stageDeadlineInfo = getStageDealinesInfo[index];
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                  <div key={stage.id} className="flex flex-col items-center flex-1 relative">
                    {/* Stage Circle */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 border-2 transition-all ${
                        isCompleted
                          ? "bg-green-600 border-green-600 text-white"
                          : isCurrent
                          ? "bg-primary-600 border-primary-600 text-white shadow-lg"
                          : "bg-white border-slate-300 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isCurrent ? (
                        <Clock className="w-6 h-6 animate-pulse" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    {/* Stage Label */}
                    <p className="text-xs font-medium text-slate-900 text-center max-w-[80px] mb-2">
                      {stage.label}
                    </p>

                    {/* Deadline Info - Show for all stages */}
                    <div className="text-center max-w-[100px]">
                      {isCompleted ? (
                        <div className="text-xs">
                          <p className="text-green-700 font-semibold">✓ Completed</p>
                        </div>
                      ) : (
                        <div className="text-xs">
                          {stageDeadlineInfo.isOverdue ? (
                            <div className="text-red-600 font-semibold">
                              <p>⚠️ OVERDUE</p>
                            </div>
                          ) : stageDeadlineInfo.isApproaching ? (
                            <div className="text-yellow-600 font-semibold">
                              <p>{stageDeadlineInfo.hoursRemaining}h {stageDeadlineInfo.minutesRemaining}m</p>
                              <p className="text-yellow-600">Approaching</p>
                            </div>
                          ) : (
                            <div className="text-slate-600">
                              <p className="font-semibold">
                                {stageDeadlineInfo.daysRemaining}d {stageDeadlineInfo.hoursRemaining}h
                              </p>
                              <p className="text-slate-500 text-xs">{stageDeadlineInfo.daysAllowed} day(s)</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Stage Timer - Large Display */}
          {currentStageIndex >= 0 && currentStageIndex < workflowStages.length && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Current Stage: {workflowStages[currentStageIndex].label}
              </h3>
              <div className={`rounded-lg p-6 border-2 ${
                getDeadlineInfo.isOverdue
                  ? "bg-red-50 border-red-200"
                  : getDeadlineInfo.isApproaching
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-blue-50 border-blue-200"
              }`}>
                <div className="text-center">
                  <p className={`text-sm font-medium mb-2 ${
                    getDeadlineInfo.isOverdue
                      ? "text-red-700"
                      : getDeadlineInfo.isApproaching
                      ? "text-yellow-700"
                      : "text-blue-700"
                  }`}>
                    Time Remaining
                  </p>
                  <div className="text-4xl font-bold mb-2 font-mono" style={{
                    color: getDeadlineInfo.isOverdue
                      ? "#dc2626"
                      : getDeadlineInfo.isApproaching
                      ? "#ea580c"
                      : "#2563eb"
                  }}>
                    {getDeadlineInfo.isOverdue ? (
                      <span>OVERDUE ⚠️</span>
                    ) : (
                      <span>
                        {getDeadlineInfo.daysRemaining}d {getDeadlineInfo.hoursRemaining}h
                      </span>
                    )}
                  </div>
                  <p className={`text-xs font-medium ${
                    getDeadlineInfo.isOverdue
                      ? "text-red-600"
                      : getDeadlineInfo.isApproaching
                      ? "text-yellow-600"
                      : "text-blue-600"
                  }`}>
                    Deadline: {getDeadlineInfo.deadlineDate?.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shipping & Tracking Information Section */}
        {order.status === "shipping_preparation" && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
            <div className="space-y-6">
              {/* Shipping Stage Info */}
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  Shipping & Tracking Stage
                </h3>
                <p className="text-sm text-green-800">
                  {product?.services.hasApostille
                    ? "Order is ready for apostille processing and tracking number assignment"
                    : "Order is ready for shipping and tracking number assignment"}
                </p>
              </div>

              {/* Tracking Information */}
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  Tracking Information
                </h4>

                {order.trackingNumber ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-900 mb-2 font-medium">
                        Tracking Number
                      </p>
                      <p className="text-2xl font-bold text-green-600 font-mono mb-3">
                        {order.trackingNumber}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-green-700">
                        <div>
                          <p className="font-semibold">Added By:</p>
                          <p>{order.trackingNumberAddedBy ? mockStaff.find(s => s.id === order.trackingNumberAddedBy)?.firstName + " " + mockStaff.find(s => s.id === order.trackingNumberAddedBy)?.lastName : "Unknown"}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Added On:</p>
                          <p>
                            {order.trackingNumberAddedAt
                              ? new Date(order.trackingNumberAddedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }) +
                                " at " +
                                new Date(order.trackingNumberAddedAt).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Unknown date"}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-green-600 mt-3">
                        ✅ Tracking number is visible to the client in their dashboard
                      </p>
                    </div>
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
                        placeholder="e.g., TRK123456789, FEDEX-12345, UPS-67890"
                        className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                      />
                      <p className="text-xs text-slate-600 mt-2">
                        Enter courier name and tracking number (e.g., FEDEX-794612345678)
                      </p>
                    </div>

                    <Button
                      onClick={handleAddTracking}
                      disabled={!trackingInput.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Add Tracking Number
                    </Button>
                  </div>
                )}
              </div>

              {/* Client Visibility Info */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>
                    Once tracking is added, the client will be able to see it on their order dashboard.
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

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
                {/* File Selection Area */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Select File *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-500 cursor-pointer transition-colors flex flex-col items-center"
                  >
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      Click to upload file or drag and drop
                    </p>
                    <p className="text-xs text-slate-600">
                      PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </p>
                  </label>
                  {selectedFile && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-blue-700">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* File Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    File Notes/Description *
                  </label>
                  <textarea
                    value={fileNotes}
                    onChange={(e) => setFileNotes(e.target.value)}
                    placeholder="Describe what you're uploading (e.g., 'Tax ID documentation', 'Company registration papers', etc.)"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 resize-none"
                  />
                </div>

                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || !fileNotes.trim()}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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

            {(order.history && order.history.length > 0) || (order.comments && order.comments.length > 0) ? (
              <div className="space-y-4">
                {[
                  ...(order.history || []).map((e: any) => ({ ...e, type: "history" })),
                  ...(order.comments || []).map((c: any) => ({ ...c, type: "comment", createdAt: c.createdAt }))
                ]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((event, index) => {
                    const isHistory = event.type === "history";
                    const isComment = event.type === "comment";
                    const description = isHistory
                      ? (event.description || generateHistoryDescription(event))
                      : `Comment by ${event.commentByName}`;
                    const isInternal = isComment && event.isInternal;

                    return (
                      <div
                        key={index}
                        className={`flex gap-4 pb-4 border-b border-slate-200 last:border-b-0 ${
                          isInternal ? "bg-slate-50 p-3 rounded-lg" : ""
                        }`}
                      >
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          isComment
                            ? isInternal ? "bg-yellow-500" : "bg-blue-600"
                            : "bg-primary-600"
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-slate-900">
                              {description}
                            </p>
                            {isComment && isInternal && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Internal
                              </span>
                            )}
                          </div>

                          {isComment && (
                            <p className="text-sm text-slate-700 mt-2 bg-white p-2 rounded border border-slate-200">
                              {event.content}
                            </p>
                          )}

                          {isHistory && event.reason && (
                            <p className="text-xs text-red-600 mt-1">
                              Reason: {event.reason}
                            </p>
                          )}
                          {isHistory && event.notes && (
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
