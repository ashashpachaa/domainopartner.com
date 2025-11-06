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
  Package,
  Save,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockOrders, mockUsers, mockProducts, mockStaff, mockStageDeadlines, type OrderHistory } from "@/lib/mockData";

export default function AdminOperationDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState("");
  const [fileNotes, setFileNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [apostilleFiles, setApostilleFiles] = useState<File[]>([]);
  const [apostilleNotes, setApostilleNotes] = useState("");
  const [poaFiles, setPoaFiles] = useState<File[]>([]);
  const [poaNotes, setPoaNotes] = useState("");
  const [financialReportFiles, setFinancialReportFiles] = useState<File[]>([]);
  const [financialReportNotes, setFinancialReportNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [activeTab, setActiveTab] = useState<"workflow" | "apostille" | "poa" | "financial_report" | "shipping" | "history">("workflow");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [impersonateStaffId, setImpersonateStaffId] = useState<string>("");
  const [adminMode, setAdminMode] = useState(true);
  const [stageDeadlines, setStageDeadlines] = useState(mockStageDeadlines);
  const [showDeadlineSettings, setShowDeadlineSettings] = useState(false);
  const [editingDeadlineId, setEditingDeadlineId] = useState<string | null>(null);
  const [operationFormData, setOperationFormData] = useState({
    companyName: "",
    companyNumber: "",
  });

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

  // Get current staff to check their role
  const currentStaff = mockStaff.find((s) => s.id === effectiveUserId);
  const isSalesStaff = currentStaff?.role === "sales";
  const isAdmin = currentStaff?.role === "super_admin" || currentStaff?.role === "operation_manager";

  // Live countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Initialize operation form data from order
  useEffect(() => {
    if (order?.operationReviewForm) {
      setOperationFormData({
        companyName: order.operationReviewForm.companyName || "",
        companyNumber: order.operationReviewForm.companyNumber || "",
      });
    }
    if (order?.trackingNumber) {
      setTrackingNumber(order.trackingNumber);
    }
  }, [order?.id]);

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

  const getStaffName = (staffId?: string) => {
    if (!staffId) return "Unassigned";
    const staff = mockStaff.find((s) => s.id === staffId);
    return staff ? `${staff.firstName} ${staff.lastName}` : "Unknown";
  };

  // Build dynamic workflow stages based on product services
  const getWorkflowStages = () => {
    const stages: Array<{ id: string; label: string; icon: string; requiresUpload?: boolean }> = [
      { id: "new", label: "Order Created", icon: "📋" },
      { id: "pending_sales_review", label: "Sales Review", icon: "👤" },
      { id: "pending_operation", label: "Operation Process", icon: "⚙️" },
      { id: "pending_operation_manager_review", label: "Manager Review", icon: "✓" },
      { id: "awaiting_client_acceptance", label: "Client Acceptance", icon: "����" },
    ];

    // Add conditional stages based on product services
    if (product?.services.hasApostille) {
      stages.push({ id: "pending_apostille", label: "Apostille Processing", icon: "🔏", requiresUpload: true });
    }
    if (product?.services.hasPOA) {
      stages.push({ id: "pending_poa", label: "Power of Attorney", icon: "📄", requiresUpload: true });
    }
    if (product?.services.hasFinancialReport) {
      stages.push({ id: "pending_financial_report", label: "Financial Report", icon: "����", requiresUpload: true });
    }
    if (product?.services.hasShipping) {
      stages.push({ id: "shipping_preparation", label: "Shipping & Tracking", icon: "📦", requiresUpload: false });
    }

    stages.push({ id: "completed", label: "Completed", icon: "✅" });
    return stages;
  };

  const workflowStages = getWorkflowStages();
  const currentStageIndex = workflowStages.findIndex(
    (s) => s.id === order.status
  );

  // Determine if current user can take actions on this order
  const canAccept = () => {
    // Admin override - always allow in admin mode
    if (adminMode && impersonateStaffId) return true;

    if (order.status === "new") return true;
    if (order.status === "pending_sales_review" && order.assignedToSalesId === effectiveUserId) return true;
    if (order.status === "pending_operation" && order.assignedToOperationId === effectiveUserId) return true;
    if (order.status === "pending_operation_manager_review" && order.assignedToManagerId === effectiveUserId) return true;
    if (order.status === "awaiting_client_acceptance" && effectiveUserId === "client") return true;
    if (["pending_apostille", "pending_poa", "pending_financial_report", "shipping_preparation"].includes(order.status) && order.assignedToManagerId === effectiveUserId) return true;
    return false;
  };

  // Get the next status based on current status and workflow stages
  const getNextStatus = (): string => {
    const currentIndex = workflowStages.findIndex(s => s.id === order.status);
    if (currentIndex < workflowStages.length - 1) {
      return workflowStages[currentIndex + 1].id;
    }
    return "completed";
  };

  // Get rejection status based on current status
  const getRejectionStatus = (): string => {
    const rejectionMap: { [key: string]: string } = {
      "new": "new",
      "pending_sales_review": "rejected_by_sales",
      "pending_operation": "rejected_by_operation",
      "pending_operation_manager_review": "pending_operation",
      "awaiting_client_acceptance": "pending_operation_manager_review",
      "pending_apostille": "rejected_by_apostille",
      "pending_poa": "rejected_by_poa",
      "pending_financial_report": "rejected_by_financial_report",
      "shipping_preparation": "rejected_by_shipping",
    };
    return rejectionMap[order.status] || order.status;
  };

  const handleAccept = () => {
    if (canAccept()) {
      // Check if operation review form is required and completed
      if (order.status === "pending_operation") {
        const isFormCompleted = operationFormData.companyName.trim() &&
                               operationFormData.companyNumber.trim();

        if (!isFormCompleted) {
          alert("Please complete the Operation Review Form before proceeding.\n\nBoth company name and company number must be provided.");
          return;
        }
      }

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

      // Auto-assign staff when accepting a new order
      if (order.status === "new") {
        updatedOrder.assignedToSalesId = effectiveUserId;
        updatedOrder.createdByStaffId = effectiveUserId;
        newHistoryEntry.description = `${currentStaff?.firstName} assigned this order to Sales Review`;
      }

      // Save operation review form data when transitioning from pending_operation
      if (order.status === "pending_operation") {
        updatedOrder.operationReviewForm = {
          isCompleted: true,
          submittedBy: effectiveUserId,
          submittedByName: currentStaff?.firstName + " " + currentStaff?.lastName || "Unknown",
          submittedAt: new Date().toISOString(),
          companyName: operationFormData.companyName,
          companyNumber: operationFormData.companyNumber,
        };
      }

      // Mark services as complete when moving past their stage
      if (order.status === "pending_apostille") {
        updatedOrder.completedServices.apostilleComplete = true;
      }
      if (order.status === "pending_poa") {
        updatedOrder.completedServices.poaComplete = true;
      }
      if (order.status === "pending_financial_report") {
        updatedOrder.completedServices.financialReportComplete = true;
      }
      if (order.status === "shipping_preparation") {
        updatedOrder.completedServices.shippingComplete = true;
      }

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

      // Uncheck services when rejecting FROM those stages (going back for rework)
      if (order.status === "pending_apostille") {
        updatedOrder.completedServices.apostilleComplete = false;
      }
      if (order.status === "pending_poa") {
        updatedOrder.completedServices.poaComplete = false;
      }
      if (order.status === "pending_financial_report") {
        updatedOrder.completedServices.financialReportComplete = false;
      }
      if (order.status === "shipping_preparation") {
        updatedOrder.completedServices.shippingComplete = false;
      }

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
      "pending_apostille": "Apostille Processing",
      "pending_poa": "Power of Attorney",
      "pending_financial_report": "Financial Report",
      "shipping_preparation": "Shipping & Tracking",
      "completed": "Completed",
      "rejected_by_sales": "Rejected by Sales",
      "rejected_by_operation": "Rejected by Operation",
      "rejected_by_operation_manager": "Rejected by Manager",
      "rejected_by_client": "Rejected by Client",
      "rejected_by_apostille": "Rejected by Apostille",
      "rejected_by_poa": "Rejected by POA",
      "rejected_by_financial_report": "Rejected by Financial Report",
      "rejected_by_shipping": "Rejected by Shipping",
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
    if (selectedFiles.length === 0) {
      alert("Please select at least one file");
      return;
    }

    if (!fileNotes.trim()) {
      alert("Please add a description for the files");
      return;
    }

    const currentStaff = mockStaff.find((s) => s.id === currentUserId);
    const updatedOrder = { ...order };
    updatedOrder.operationFiles = [...(order.operationFiles || [])];

    selectedFiles.forEach((file) => {
      const newFile = {
        id: `F${updatedOrder.operationFiles.length + 1}`,
        orderId: order.id,
        fileName: file.name,
        fileSize: file.size,
        uploadedBy: currentUserId,
        uploadedByName: currentStaff?.firstName + " " + currentStaff?.lastName || "Unknown",
        uploadedAt: new Date().toISOString(),
        stage: getFileStageFromStatus(order.status),
        fileType: "document" as any,
        description: fileNotes,
        visibleToClient: false,
      };
      updatedOrder.operationFiles.push(newFile);
    });

    saveOrder(updatedOrder);
    setFileNotes("");
    setSelectedFiles([]);
    alert(`${selectedFiles.length} file(s) uploaded successfully!`);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const maxSize = 5 * 1024 * 1024 * 1024; // 5GB per file
      const newFiles: File[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > maxSize) {
          alert(`File "${file.name}" exceeds 5GB limit`);
          continue;
        }
        newFiles.push(file);
      }

      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const getFileStageFromStatus = (status: string): "sales" | "operation" | "manager" | "apostille" | "poa" | "financial_report" | "shipping" => {
    const stageMap: { [key: string]: "sales" | "operation" | "manager" | "apostille" | "poa" | "financial_report" | "shipping" } = {
      "pending_sales_review": "sales",
      "pending_operation": "operation",
      "pending_operation_manager_review": "manager",
      "pending_apostille": "apostille",
      "pending_poa": "poa",
      "pending_financial_report": "financial_report",
      "shipping_preparation": "shipping",
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

    // Calculate cumulative deadline based on all stages up to current
    const stageOrder = ["new", "pending_sales_review", "pending_operation", "pending_operation_manager_review", "awaiting_client_acceptance", "shipping_preparation"];
    const currentStageIndex = stageOrder.indexOf(order.status);
    let cumulativeDays = 0;

    // Sum up all days from stages up to and including current stage
    for (let i = 0; i <= currentStageIndex; i++) {
      const stageId = stageOrder[i];
      const config = stageDeadlines.find((d) => d.stageId === stageId);
      if (config) {
        cumulativeDays += config.daysAllowed;
      }
    }

    switch (order.status) {
      case "new":
        stageName = "Order Created";
        daysAllowed = stageDeadlines.find((d) => d.stageId === "new")?.daysAllowed || 3;
        deadlineDate = addBusinessDays(createdDate, daysAllowed);
        affectedStaffId = null;
        break;
      case "pending_sales_review":
        stageName = "Sales Review";
        daysAllowed = stageDeadlines.find((d) => d.stageId === "pending_sales_review")?.daysAllowed || 0.25;
        // For cumulative calculation, use hours for quick stages
        if (daysAllowed < 1) {
          deadlineDate = new Date(createdDate.getTime() + daysAllowed * 24 * 60 * 60 * 1000);
        } else {
          deadlineDate = addBusinessDays(createdDate, cumulativeDays);
        }
        affectedStaffId = order.assignedToSalesId || null;
        break;
      case "pending_operation":
        stageName = "Operation Processing";
        daysAllowed = stageDeadlines.find((d) => d.stageId === "pending_operation")?.daysAllowed || 3;
        deadlineDate = addBusinessDays(createdDate, cumulativeDays);
        affectedStaffId = order.assignedToOperationId || null;
        break;
      case "pending_operation_manager_review":
        stageName = "Manager Review";
        daysAllowed = stageDeadlines.find((d) => d.stageId === "pending_operation_manager_review")?.daysAllowed || 1;
        deadlineDate = addBusinessDays(createdDate, cumulativeDays);
        affectedStaffId = order.assignedToManagerId || null;
        break;
      case "awaiting_client_acceptance":
        stageName = "Client Acceptance Review";
        daysAllowed = stageDeadlines.find((d) => d.stageId === "awaiting_client_acceptance")?.daysAllowed || 1;
        deadlineDate = addBusinessDays(createdDate, cumulativeDays);
        affectedStaffId = order.assignedToSalesId || null;
        break;
      case "shipping_preparation":
        stageName = product?.services.hasApostille ? "Apostille Processing" : "Shipping Preparation";
        daysAllowed = stageDeadlines.find((d) => d.stageId === "shipping_preparation")?.daysAllowed || 2;
        deadlineDate = addBusinessDays(createdDate, cumulativeDays);
        affectedStaffId = order.assignedToManagerId || null;
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
  }, [order.status, order.createdAt, order.assignedToSalesId, order.assignedToOperationId, order.assignedToManagerId, stageDeadlines]);

  // Get deadline info for all stages
  const getStageDealinesInfo = useMemo(() => {
    const createdDate = new Date(order.createdAt);
    const now = currentTime; // Use currentTime for live updates
    let cumulativeDays = 0;

    const stageDeadlines = workflowStages.map((stage) => {
      let daysAllowed = 0;

      // Calculate days allowed for each stage
      if (stage.id === "new") daysAllowed = 3;
      else if (stage.id === "pending_sales_review") daysAllowed = 0.25; // 6 hours
      else if (stage.id === "pending_operation") daysAllowed = 3;
      else if (stage.id === "pending_operation_manager_review") daysAllowed = 1;
      else if (stage.id === "awaiting_client_acceptance") daysAllowed = 1;
      else if (stage.id === "pending_apostille") daysAllowed = 1;
      else if (stage.id === "pending_poa") daysAllowed = 1;
      else if (stage.id === "pending_financial_report") daysAllowed = 1;
      else if (stage.id === "shipping_preparation") daysAllowed = 1;
      else if (stage.id === "completed") daysAllowed = 0;

      cumulativeDays += daysAllowed;
      let deadlineDate: Date;

      if (daysAllowed < 1) {
        deadlineDate = new Date(createdDate.getTime() + daysAllowed * 24 * 60 * 60 * 1000);
      } else {
        deadlineDate = addBusinessDays(createdDate, Math.floor(cumulativeDays));
      }

      return {
        id: stage.id,
        label: stage.label,
        daysAllowed,
        deadlineDate,
      };
    });

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
        isApproaching: timeRemaining < 6 * 60 * 60 * 1000 && !(now > stage.deadlineDate),
      };
    });
  }, [order.createdAt, currentTime, workflowStages]);

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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-amber-900">🔑 Admin Controls</h3>
              <button
                onClick={() => setShowDeadlineSettings(!showDeadlineSettings)}
                className="text-sm px-3 py-1 rounded bg-amber-200 text-amber-900 hover:bg-amber-300 font-medium"
              >
                {showDeadlineSettings ? "Hide" : "Show"} Deadline Settings
              </button>
            </div>

            {/* Deadline Settings */}
            {showDeadlineSettings && (
              <div className="bg-white rounded-lg p-6 mb-6 border-2 border-amber-300">
                <h4 className="font-bold text-slate-900 mb-4">⏱️ Configure Stage Deadlines</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {stageDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        editingDeadlineId === deadline.id
                          ? "border-blue-400 bg-blue-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{deadline.stageName}</p>
                          <p className="text-xs text-slate-600 mt-1">{deadline.description}</p>
                          {deadline.notes && (
                            <p className="text-xs text-slate-500 mt-1 italic">Note: {deadline.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {editingDeadlineId === deadline.id ? (
                            <>
                              <input
                                type="number"
                                step="0.25"
                                value={
                                  stageDeadlines.find((d) => d.id === deadline.id)?.daysAllowed || 0
                                }
                                onChange={(e) => {
                                  setStageDeadlines(
                                    stageDeadlines.map((d) =>
                                      d.id === deadline.id
                                        ? { ...d, daysAllowed: parseFloat(e.target.value) }
                                        : d
                                    )
                                  );
                                }}
                                className="w-20 px-2 py-1 border border-blue-400 rounded text-sm"
                              />
                              <span className="text-sm text-slate-600 w-16">days</span>
                              <button
                                onClick={() => setEditingDeadlineId(null)}
                                className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                              >
                                Save
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="text-right">
                                <p className="font-bold text-lg text-blue-600">
                                  {deadline.daysAllowed}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {deadline.daysAllowed < 1 ? "hours" : "days"}
                                </p>
                              </div>
                              <button
                                onClick={() => setEditingDeadlineId(deadline.id)}
                                className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                              >
                                Edit
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 text-xs text-blue-800">
                  <p className="font-semibold mb-1">💡 Tip:</p>
                  <p>
                    Update deadline values (in days) for each workflow stage. Use decimals for hours
                    (e.g., 0.25 = 6 hours). Changes apply to all new orders using these stages.
                  </p>
                </div>
              </div>
            )}

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

        {/* Client Information Section */}
        {user && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8 border border-purple-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Client Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Name */}
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Client Name</p>
                <p className="text-base font-medium text-slate-900">{user.firstName} {user.lastName}</p>
              </div>

              {/* Email */}
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Email</p>
                <p className="text-sm text-slate-900 break-all">{user.email || "N/A"}</p>
              </div>

              {/* Phone */}
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">WhatsApp</p>
                <p className="text-sm text-slate-900">{user.whatsappNumber || "N/A"}</p>
              </div>

              {/* Company */}
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Company</p>
                <p className="text-sm text-slate-900">{user.companyName || "N/A"}</p>
              </div>

              {/* Country */}
              {user.country && (
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Country</p>
                  <p className="text-sm text-slate-900">{user.country}</p>
                </div>
              )}

              {/* Account Created */}
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Account Created</p>
                <p className="text-sm text-slate-900">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Company Information Section */}
        {order.companyInfo && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-8 border border-blue-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Company Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Company Name</p>
                <p className="text-sm font-semibold text-slate-900">{order.companyInfo.companyName}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Total Capital</p>
                <p className="text-sm font-semibold text-slate-900">{order.currency} {order.companyInfo.totalCapital}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Price Per Share</p>
                <p className="text-sm font-semibold text-slate-900">{order.currency} {order.companyInfo.pricePerShare}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Currency</p>
                <p className="text-sm font-semibold text-slate-900">{order.currency}</p>
              </div>
            </div>

            {order.companyInfo.companyActivities && (
              <div className="mt-6 bg-white rounded-lg p-4 border border-blue-100">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Business Activities</p>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{order.companyInfo.companyActivities}</p>
              </div>
            )}
          </div>
        )}

        {/* Shareholders Section */}
        {order.shareholders && order.shareholders.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-8 border border-amber-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-600" />
              Shareholders ({order.shareholders.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-amber-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Date of Birth</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Nationality</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-700">Ownership %</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-700">Passport</th>
                  </tr>
                </thead>
                <tbody>
                  {order.shareholders.map((shareholder, index) => (
                    <tr key={shareholder.id} className={index % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                      <td className="px-4 py-4 border-b border-amber-100">
                        <div>
                          <p className="font-medium text-slate-900">{shareholder.firstName} {shareholder.lastName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-b border-amber-100 text-slate-700">
                        {new Date(shareholder.dateOfBirth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4 border-b border-amber-100 text-slate-700">
                        {shareholder.nationality}
                      </td>
                      <td className="px-4 py-4 border-b border-amber-100 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                          {shareholder.ownershipPercentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 border-b border-amber-100 text-center">
                        {shareholder.passportFile ? (
                          <a
                            href={shareholder.passportFile.fileUrl}
                            download={shareholder.passportFile.fileName}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        ) : (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Ownership Summary */}
            <div className="mt-6 pt-6 border-t-2 border-amber-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Total Ownership:</span>
                <span className="text-lg font-bold text-amber-700">
                  {order.shareholders.reduce((sum, sh) => sum + sh.ownershipPercentage, 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Section */}
        <div className="bg-white rounded-lg p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            Order Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Order Number */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Order Number</p>
              <p className="text-base font-mono font-bold text-slate-900">{order.orderNumber}</p>
            </div>

            {/* Created Date */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Created Date</p>
              <p className="text-base font-medium text-slate-900">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Amount & Currency - Only visible to Sales and Admin */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Amount</p>
              {isSalesStaff || isAdmin ? (
                <p className="text-lg font-bold text-slate-900">
                  {order.currency} {order.amount.toLocaleString()}
                </p>
              ) : (
                <p className="text-sm text-slate-500 italic">Restricted - Sales & Admin Only</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">Description</label>
            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {order.description || "N/A"}
            </p>
          </div>

          {/* Service Type & Countries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">Service Type</label>
              <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {order.serviceType || "N/A"}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">Countries</label>
              <div className="flex flex-wrap gap-2">
                {order.countries && order.countries.length > 0 ? (
                  order.countries.map((country, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                    >
                      {country}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">N/A</span>
                )}
              </div>
            </div>
          </div>

          {/* Sales Representative */}
          {order.assignedToSalesId && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">Assigned Sales Representative</label>
              <p className="text-base font-medium text-slate-900">
                {getStaffName(order.assignedToSalesId)}
              </p>
            </div>
          )}
        </div>

        {/* Product & Services Section */}
        {product && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Product & Services Required
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Details */}
              <div className="bg-white rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Product Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Product Name</p>
                    <p className="text-base font-medium text-slate-900">{product.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Description</p>
                    <p className="text-sm text-slate-700">{product.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    {/* Price - Only show to Sales staff */}
                    {isSalesStaff ? (
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Price</p>
                        <p className="text-lg font-bold text-blue-600">
                          {product.currency} {product.price.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Price</p>
                        <p className="text-sm text-slate-500 italic">Restricted - Sales Only</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Duration</p>
                      <p className="text-sm text-slate-900">{product.duration}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Requirements</p>
                    <p className="text-sm text-slate-700">{product.requirements}</p>
                  </div>
                </div>
              </div>

              {/* Services Status */}
              <div className="bg-white rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Services Status</h3>
                <div className="space-y-3">
                  {/* Apostille */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        order.completedServices.apostilleComplete
                          ? "bg-green-600 border-green-600"
                          : product.services.hasApostille
                          ? "border-orange-400"
                          : "border-slate-300"
                      }`}>
                        {order.completedServices.apostilleComplete && (
                          <span className="text-white text-xs font-bold">✓</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Apostille Certification</p>
                        <p className="text-xs text-slate-600">
                          {product.services.hasApostille ? "Required" : "Not included"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      order.completedServices.apostilleComplete
                        ? "bg-green-100 text-green-700"
                        : product.services.hasApostille
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {order.completedServices.apostilleComplete ? "Done" : product.services.hasApostille ? "Pending" : "N/A"}
                    </span>
                  </div>

                  {/* POA */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        order.completedServices.poaComplete
                          ? "bg-green-600 border-green-600"
                          : product.services.hasPOA
                          ? "border-orange-400"
                          : "border-slate-300"
                      }`}>
                        {order.completedServices.poaComplete && (
                          <span className="text-white text-xs font-bold">✓</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Power of Attorney (POA)</p>
                        <p className="text-xs text-slate-600">
                          {product.services.hasPOA ? "Required" : "Not included"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      order.completedServices.poaComplete
                        ? "bg-green-100 text-green-700"
                        : product.services.hasPOA
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {order.completedServices.poaComplete ? "Done" : product.services.hasPOA ? "Pending" : "N/A"}
                    </span>
                  </div>

                  {/* Financial Report */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        order.completedServices.financialReportComplete
                          ? "bg-green-600 border-green-600"
                          : product.services.hasFinancialReport
                          ? "border-orange-400"
                          : "border-slate-300"
                      }`}>
                        {order.completedServices.financialReportComplete && (
                          <span className="text-white text-xs font-bold">✓</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Financial Report</p>
                        <p className="text-xs text-slate-600">
                          {product.services.hasFinancialReport ? "Required" : "Not included"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      order.completedServices.financialReportComplete
                        ? "bg-green-100 text-green-700"
                        : product.services.hasFinancialReport
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {order.completedServices.financialReportComplete ? "Done" : product.services.hasFinancialReport ? "Pending" : "N/A"}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        order.completedServices.shippingComplete
                          ? "bg-green-600 border-green-600"
                          : product.services.hasShipping
                          ? "border-orange-400"
                          : "border-slate-300"
                      }`}>
                        {order.completedServices.shippingComplete && (
                          <span className="text-white text-xs font-bold">✓</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">International Shipping</p>
                        <p className="text-xs text-slate-600">
                          {product.services.hasShipping ? "Required" : "Not included"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      order.completedServices.shippingComplete
                        ? "bg-green-100 text-green-700"
                        : product.services.hasShipping
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {order.completedServices.shippingComplete ? "Done" : product.services.hasShipping ? "Pending" : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Completion Summary */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-900 mb-2">Overall Completion</p>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (Object.values(order.completedServices).filter(Boolean).length /
                              Object.values(order.completedServices).length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      {Object.values(order.completedServices).filter(Boolean).length} of{" "}
                      {Object.values(order.completedServices).length} services completed
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
          {["workflow", "apostille", "poa", "financial_report", "shipping", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "workflow"
                ? "Workflow & Files"
                : tab === "apostille"
                ? "Apostille"
                : tab === "poa"
                ? "POA"
                : tab === "financial_report"
                ? "Financial Report"
                : tab === "shipping"
                ? "Shipping"
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
                    multiple
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
                      PDF, DOC, DOCX, JPG, PNG (Max 5GB per file)
                    </p>
                  </label>
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-slate-700">
                        {selectedFiles.length} file(s) selected
                      </p>
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-blue-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-blue-700">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeSelectedFile(idx)}
                            className="text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* File Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Files Notes/Description *
                  </label>
                  <textarea
                    value={fileNotes}
                    onChange={(e) => setFileNotes(e.target.value)}
                    placeholder="Describe what you're uploading (applies to all selected files). E.g., 'Tax ID documentation', 'Company registration papers', etc."
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 resize-none"
                  />
                </div>

                <Button
                  onClick={handleFileUpload}
                  disabled={selectedFiles.length === 0 || !fileNotes.trim()}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {selectedFiles.length > 1 ? `${selectedFiles.length} Files` : "Files"}
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
                        onClick={() => handleDownloadFile(file)}
                        className="text-slate-600 hover:text-slate-900"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Operation Review Form - Completed View */}
            {order.operationReviewForm?.isCompleted && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-8 border-2 border-green-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Operation Review Form (Completed)
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company Name */}
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Company Name</p>
                      <p className="text-sm font-medium text-slate-900">
                        {order.operationReviewForm.companyName || "Not provided"}
                      </p>
                    </div>

                    {/* Company Number */}
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Company Number</p>
                      <p className="text-sm font-medium text-slate-900">
                        {order.operationReviewForm.companyNumber || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Operation Review Form - Only visible in Operation Processing stage */}
            {order.status === "pending_operation" && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-8 border-2 border-indigo-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                  Operation Review Form (Required)
                </h3>
                <p className="text-sm text-slate-700 mb-6">
                  Complete this form before moving the order to Manager Review. All fields are mandatory.
                </p>

                <div className="space-y-6">
                  {/* Company Name Section */}
                  <div className="bg-white rounded-lg p-6 border border-indigo-200">
                    <label className="block text-base font-semibold text-slate-900 mb-3">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={operationFormData.companyName}
                      onChange={(e) =>
                        setOperationFormData({
                          ...operationFormData,
                          companyName: e.target.value,
                        })
                      }
                      placeholder="Enter the company name"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Company Number Section */}
                  <div className="bg-white rounded-lg p-6 border border-indigo-200">
                    <label className="block text-base font-semibold text-slate-900 mb-3">
                      Company Number *
                    </label>
                    <input
                      type="text"
                      value={operationFormData.companyNumber}
                      onChange={(e) =>
                        setOperationFormData({
                          ...operationFormData,
                          companyNumber: e.target.value,
                        })
                      }
                      placeholder="Enter the company number"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Completion Status */}
                  <div className={`rounded-lg p-4 border-2 ${
                    operationFormData.companyName.trim() &&
                    operationFormData.companyNumber.trim()
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}>
                    <p className={`text-sm font-semibold ${
                      operationFormData.companyName.trim() &&
                      operationFormData.companyNumber.trim()
                        ? "text-green-800"
                        : "text-amber-800"
                    }`}>
                      {operationFormData.companyName.trim() &&
                      operationFormData.companyNumber.trim()
                        ? "✓ Form Complete - Ready to proceed to Manager Review"
                        : "⚠ Form Incomplete - Complete all fields to proceed"}
                    </p>
                  </div>
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
              order.status === "pending_apostille" ? (
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    Apostille Documents Upload
                  </h3>
                  <p className="text-sm text-slate-600 mb-6">
                    Upload apostille documents for this order. Apostille is a certificate authenticating the origin of a document.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id="apostille-file-input"
                        onChange={(e) => {
                          if (e.target.files) {
                            setApostilleFiles(Array.from(e.target.files));
                          }
                        }}
                      />
                      <label
                        htmlFor="apostille-file-input"
                        className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary-400 transition"
                      >
                        <span className="text-slate-600">Click to select apostille documents or drag and drop</span>
                      </label>
                      {apostilleFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-slate-700">
                            {apostilleFiles.length} file(s) selected
                          </p>
                          {apostilleFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                              <span className="text-sm text-slate-700">{file.name}</span>
                              <button
                                onClick={() => {
                                  setApostilleFiles(apostilleFiles.filter((_, i) => i !== idx));
                                }}
                                className="text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Document Description (Optional)</label>
                      <textarea
                        value={apostilleNotes}
                        onChange={(e) => setApostilleNotes(e.target.value)}
                        placeholder="Please describe the documents and any relevant details..."
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 resize-none"
                      />
                    </div>

                    <Button
                      onClick={() => {
                        if (apostilleFiles.length > 0) {
                          const updatedOrder = { ...order };
                          updatedOrder.operationFiles.push({
                            id: `F-${Date.now()}`,
                            orderId: order.id,
                            fileName: apostilleFiles[0].name,
                            fileSize: apostilleFiles[0].size,
                            uploadedBy: effectiveUserId,
                            uploadedByName: currentStaff?.firstName + " " + currentStaff?.lastName || "Unknown",
                            uploadedAt: new Date().toISOString(),
                            stage: "apostille",
                            fileType: "apostille",
                            description: apostilleNotes,
                            visibleToClient: false,
                          });
                          updatedOrder.completedServices.apostilleComplete = true;
                          localStorage.setItem(`order_${orderId}`, JSON.stringify(updatedOrder));
                          setApostilleFiles([]);
                          setApostilleNotes("");
                          setOrder(updatedOrder);
                          alert("Apostille documents uploaded successfully!");
                        } else {
                          alert("Please select at least one file");
                        }
                      }}
                      className="w-full bg-primary-600 hover:bg-primary-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Apostille Documents
                    </Button>

                    {/* Uploaded Files */}
                    {order.operationFiles?.filter(f => f.stage === "apostille").length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h4 className="font-semibold text-slate-900">Uploaded Documents</h4>
                        {order.operationFiles.filter(f => f.stage === "apostille").map((file) => (
                          <div key={file.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-slate-900">{file.fileName}</p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Uploaded by {file.uploadedByName} on {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                                {file.description && <p className="text-sm text-slate-700 mt-2">{file.description}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900">
                    Apostille documents can only be uploaded when the order is in the Apostille Processing stage.
                  </p>
                </div>
              )
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-slate-600">
                  This product does not require Apostille service.
                </p>
              </div>
            )}
          </div>
        )}

        {/* POA Tab */}
        {activeTab === "poa" && (
          <div className="space-y-6">
            {product?.services.hasPOA ? (
              <>
                {order.status === "pending_poa" && (
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-600" />
                      Power of Attorney Upload
                    </h3>
                    <p className="text-sm text-slate-600 mb-6">
                      Upload Power of Attorney documents for this order.
                    </p>

                    {/* File Upload */}
                    <div className="mb-6">
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id="poa-file-input"
                        onChange={(e) => {
                          if (e.target.files) {
                            setPoaFiles(Array.from(e.target.files));
                          }
                        }}
                      />
                      <label
                        htmlFor="poa-file-input"
                        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-500 cursor-pointer transition-colors flex flex-col items-center"
                      >
                        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-900 mb-1">
                          Click to upload file or drag and drop
                        </p>
                        <p className="text-xs text-slate-600">
                          PDF, DOC, DOCX, JPG, PNG (Max 5GB per file)
                        </p>
                      </label>
                      {poaFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-slate-700">
                            {poaFiles.length} file(s) selected
                          </p>
                          {poaFiles.map((file, idx) => (
                            <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-blue-900 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-blue-700">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setPoaFiles(poaFiles.filter((_, i) => i !== idx))}
                                className="text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* File Notes */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Document Notes/Description *
                      </label>
                      <textarea
                        value={poaNotes}
                        onChange={(e) => setPoaNotes(e.target.value)}
                        placeholder="Please describe the documents and any relevant details..."
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 resize-none"
                      />
                    </div>

                    <Button
                      onClick={() => {
                        if (poaFiles.length > 0 && poaNotes.trim()) {
                          const updatedOrder = { ...order };
                          updatedOrder.operationFiles.push({
                            id: `file_${Date.now()}`,
                            orderId: order.id,
                            fileName: poaFiles[0].name,
                            fileSize: poaFiles[0].size,
                            uploadedBy: effectiveUserId,
                            uploadedByName: mockStaff.find(s => s.id === effectiveUserId)?.firstName || "Unknown",
                            uploadedAt: new Date().toISOString(),
                            stage: "poa",
                            fileType: "poa",
                            description: poaNotes,
                            visibleToClient: false,
                          });
                          setOrder(updatedOrder);
                          localStorage.setItem(`order_${orderId}`, JSON.stringify(updatedOrder));
                          setPoaFiles([]);
                          setPoaNotes("");
                          alert("POA documents uploaded successfully!");
                        } else {
                          alert("Please select files and add a description");
                        }
                      }}
                      className="w-full bg-primary-600 hover:bg-primary-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload POA Documents
                    </Button>
                  </div>
                )}


                {/* Uploaded Files - Always visible */}
                {order.operationFiles?.filter(f => f.stage === "poa").length > 0 && (
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-4">POA Documents</h4>
                    <div className="space-y-3">
                      {order.operationFiles.filter(f => f.stage === "poa").map((file) => (
                        <div key={file.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{file.fileName}</p>
                              <p className="text-xs text-slate-600 mt-1">
                                By {file.uploadedByName} on {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                              {file.description && (
                                <p className="text-sm text-slate-700 mt-2">{file.description}</p>
                              )}
                            </div>
                            <button className="ml-4 px-3 py-1 rounded bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <p className="text-slate-600">
                  This product does not require Power of Attorney service.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Financial Report Tab */}
        {activeTab === "financial_report" && (
          <div className="space-y-6">
            {product?.services.hasFinancialReport ? (
              <>
                {order.status === "pending_financial_report" && (
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-600" />
                      Financial Report Upload
                    </h3>
                    <p className="text-sm text-slate-600 mb-6">
                      Upload Financial Report documents for this order.
                    </p>

                    {/* File Upload */}
                    <div className="mb-6">
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id="financial-file-input"
                        onChange={(e) => {
                          if (e.target.files) {
                            setFinancialReportFiles(Array.from(e.target.files));
                          }
                        }}
                      />
                      <label
                        htmlFor="financial-file-input"
                        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-500 cursor-pointer transition-colors flex flex-col items-center"
                      >
                        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-900 mb-1">
                          Click to upload file or drag and drop
                        </p>
                        <p className="text-xs text-slate-600">
                          PDF, DOC, DOCX, JPG, PNG (Max 5GB per file)
                        </p>
                      </label>
                      {financialReportFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-slate-700">
                            {financialReportFiles.length} file(s) selected
                          </p>
                          {financialReportFiles.map((file, idx) => (
                            <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-blue-900 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-blue-700">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setFinancialReportFiles(financialReportFiles.filter((_, i) => i !== idx))}
                                className="text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* File Notes */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Document Notes/Description *
                      </label>
                      <textarea
                        value={financialReportNotes}
                        onChange={(e) => setFinancialReportNotes(e.target.value)}
                        placeholder="Please describe the financial report and any relevant details..."
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 resize-none"
                      />
                    </div>

                    <Button
                      onClick={() => {
                        if (financialReportFiles.length > 0 && financialReportNotes.trim()) {
                          const updatedOrder = { ...order };
                          updatedOrder.operationFiles.push({
                            id: `file_${Date.now()}`,
                            orderId: order.id,
                            fileName: financialReportFiles[0].name,
                            fileSize: financialReportFiles[0].size,
                            uploadedBy: effectiveUserId,
                            uploadedByName: mockStaff.find(s => s.id === effectiveUserId)?.firstName || "Unknown",
                            uploadedAt: new Date().toISOString(),
                            stage: "financial_report",
                            fileType: "financial_report",
                            description: financialReportNotes,
                            visibleToClient: false,
                          });
                          setOrder(updatedOrder);
                          localStorage.setItem(`order_${orderId}`, JSON.stringify(updatedOrder));
                          setFinancialReportFiles([]);
                          setFinancialReportNotes("");
                          alert("Financial Report documents uploaded successfully!");
                        } else {
                          alert("Please select files and add a description");
                        }
                      }}
                      className="w-full bg-primary-600 hover:bg-primary-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Financial Report
                    </Button>
                  </div>
                )}


                {/* Uploaded Files - Always visible */}
                {order.operationFiles?.filter(f => f.stage === "financial_report").length > 0 && (
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-4">Financial Report Documents</h4>
                    <div className="space-y-3">
                      {order.operationFiles.filter(f => f.stage === "financial_report").map((file) => (
                        <div key={file.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{file.fileName}</p>
                              <p className="text-xs text-slate-600 mt-1">
                                By {file.uploadedByName} on {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                              {file.description && (
                                <p className="text-sm text-slate-700 mt-2">{file.description}</p>
                              )}
                            </div>
                            <button className="ml-4 px-3 py-1 rounded bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <p className="text-slate-600">
                  This product does not require Financial Report service.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === "shipping" && (
          <div className="space-y-6">
            {product?.services.hasShipping ? (
              <>
                {order.status === "shipping_preparation" && (
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary-600" />
                      Shipping & Tracking
                    </h3>
                    <p className="text-sm text-slate-600 mb-6">
                      Add tracking number for this shipment.
                    </p>

                    {/* Tracking Number Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Tracking Number *
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter shipping tracking number (e.g., DHL123456789)"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                      />
                      <p className="text-xs text-slate-600 mt-1">
                        Enter the courier tracking number for this shipment
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        if (trackingNumber.trim()) {
                          const updatedOrder = { ...order };
                          updatedOrder.trackingNumber = trackingNumber;
                          updatedOrder.trackingNumberAddedBy = effectiveUserId;
                          updatedOrder.trackingNumberAddedAt = new Date().toISOString();
                          updatedOrder.completedServices.shippingComplete = true;
                          updatedOrder.status = "completed";

                          // Add history entry for status transition
                          const historyEntry: OrderHistory = {
                            id: `H-${Date.now()}`,
                            orderId: orderId!,
                            previousStatus: "shipping_preparation",
                            newStatus: "completed",
                            actionType: "status_transition",
                            actionBy: effectiveUserId,
                            actionByName: currentStaff?.firstName + " " + currentStaff?.lastName || "Unknown",
                            createdAt: new Date().toISOString(),
                            details: `Tracking number added: ${trackingNumber}`,
                          };
                          updatedOrder.history.push(historyEntry);

                          setOrder(updatedOrder);
                          localStorage.setItem(`order_${orderId}`, JSON.stringify(updatedOrder));
                          setTrackingNumber("");
                          alert("Tracking number added successfully! Order marked as completed.");
                        } else {
                          alert("Please enter a tracking number");
                        }
                      }}
                      className="w-full bg-primary-600 hover:bg-primary-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Add Tracking Number
                    </Button>
                  </div>
                )}


                {/* Current Tracking Info - Always visible */}
                {order.trackingNumber && (
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-4">Tracking Information</h4>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Tracking Number</p>
                          <p className="text-lg font-bold text-primary-600 mt-1">{order.trackingNumber}</p>
                          <p className="text-xs text-slate-600 mt-2">
                            Added by {mockStaff.find(s => s.id === order.trackingNumberAddedBy)?.firstName || "Unknown"} on{" "}
                            {order.trackingNumberAddedAt
                              ? new Date(order.trackingNumberAddedAt).toLocaleDateString()
                              : "Unknown date"}
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <p className="text-slate-600">
                  This product does not require shipping service.
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
