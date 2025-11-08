import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, XCircle, Clock, User } from "lucide-react";
import { useState, useMemo } from "react";
import { mockClientRequests, mockUsers, ClientRequest, mockStaff } from "@/lib/mockData";
import { toast } from "sonner";

export default function AdminClientRequestDetail() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [assignedToStaffId, setAssignedToStaffId] = useState("");

  const request = useMemo(() => {
    // Check in mock data first
    let foundRequest = mockClientRequests.find((r) => r.id === requestId);

    // If not found in mock data, check localStorage
    if (!foundRequest) {
      const storedRequests = JSON.parse(
        localStorage.getItem("mockClientRequests") || "[]",
      );
      foundRequest = storedRequests.find(
        (r: ClientRequest) => r.id === requestId,
      );
    }

    return foundRequest;
  }, [requestId]);

  if (!request) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Request not found
          </h2>
          <Button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const handleApprove = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Update client request status
      request.status = "approved";
      request.reviewedAt = new Date().toISOString();
      const currentAdmin = JSON.parse(
        localStorage.getItem("currentUser") || "{}",
      );
      request.reviewedBy = currentAdmin.id || "admin";

      // Create actual user account
      const newUserId = `U${mockUsers.length + 1}`;
      const newUser = {
        id: newUserId,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        companyName: request.companyName || "",
        country: request.country || "",
        city: request.city || "",
        whatsappNumber: request.whatsappNumber || "",
        website: request.website || "",
        status: "active" as const,
        subscriptionPlan: request.subscriptionPlan,
        subscriptionStatus: "active" as const,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      mockUsers.push(newUser);

      // Save to localStorage
      localStorage.setItem(
        `clientRequest_${requestId}`,
        JSON.stringify(request),
      );
      localStorage.setItem(`user_${newUserId}`, JSON.stringify(newUser));
      localStorage.setItem(
        "mockClientRequests",
        JSON.stringify(mockClientRequests),
      );
      localStorage.setItem("mockUsers", JSON.stringify(mockUsers));

      toast.success(
        `✅ ${request.firstName} ${request.lastName}'s account has been approved!`,
      );
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error("Error approving request: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Update client request status
      request.status = "rejected";
      request.reviewedAt = new Date().toISOString();
      request.rejectionReason = rejectionReason;
      const currentAdmin = JSON.parse(
        localStorage.getItem("currentUser") || "{}",
      );
      request.reviewedBy = currentAdmin.id || "admin";

      // Save to localStorage
      localStorage.setItem(
        `clientRequest_${requestId}`,
        JSON.stringify(request),
      );
      localStorage.setItem(
        "mockClientRequests",
        JSON.stringify(mockClientRequests),
      );

      toast.success(
        `❌ Request rejected. ${request.firstName} will be notified.`,
      );
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error("Error rejecting request: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/dashboard")}
          className="gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Client Requests
        </Button>

        {/* Request Details Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {request.firstName} {request.lastName}
              </h1>
              <p className="text-slate-600 mt-1">{request.email}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {request.status === "pending_approval" && (
                  <>
                    <Clock className="w-6 h-6 text-yellow-600" />
                    <span className="text-lg font-semibold text-yellow-600">
                      Pending Review
                    </span>
                  </>
                )}
                {request.status === "approved" && (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">
                      Approved
                    </span>
                  </>
                )}
                {request.status === "rejected" && (
                  <>
                    <XCircle className="w-6 h-6 text-red-600" />
                    <span className="text-lg font-semibold text-red-600">
                      Rejected
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-slate-500">
                Applied: {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Request Information */}
          <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-200">
            <div>
              <label className="text-sm font-medium text-slate-600">
                Company Name
              </label>
              <p className="text-slate-900 font-medium mt-1">
                {request.companyName || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Subscription Plan
              </label>
              <p className="text-slate-900 font-medium mt-1 capitalize">
                {request.subscriptionPlan}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Country
              </label>
              <p className="text-slate-900 font-medium mt-1">
                {request.country || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">City</label>
              <p className="text-slate-900 font-medium mt-1">
                {request.city || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                WhatsApp
              </label>
              <p className="text-slate-900 font-medium mt-1">
                {request.whatsappNumber || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Website
              </label>
              <p className="text-slate-900 font-medium mt-1">
                {request.website || "Not provided"}
              </p>
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {request.status === "rejected" && request.rejectionReason && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-700 mb-2">
                Rejection Reason:
              </p>
              <p className="text-red-600">{request.rejectionReason}</p>
            </div>
          )}

          {/* Review Information (if already reviewed) */}
          {request.reviewedAt && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">
                Reviewed on {new Date(request.reviewedAt).toLocaleDateString()}{" "}
                by <span className="font-medium">Admin</span>
              </p>
            </div>
          )}

          {/* Action Buttons (only if pending) */}
          {request.status === "pending_approval" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Rejection Reason (required if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Incomplete information, suspicious activity, business policy violation..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve & Create Account
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isProcessing || !rejectionReason.trim()}
                  variant="destructive"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Request
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
