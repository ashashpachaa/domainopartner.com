import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Building,
  MapPin,
  Globe,
  Phone,
  AlertCircle,
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
import { mockClientRequests, mockStaff, mockUsers } from "@/lib/mockData";

const statusConfig = {
  pending_approval: {
    label: "Pending Approval",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    description: "Waiting for admin review and approval",
  },
  approved: {
    label: "Approved",
    color: "text-green-700",
    bgColor: "bg-green-50",
    description: "Request has been approved. Client can now login.",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-50",
    description: "Request has been rejected.",
  },
};

export default function AdminClientRequestDetail() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<typeof mockClientRequests[0] | null>(null);
  const [actionModal, setActionModal] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedSalesPersonId, setSelectedSalesPersonId] = useState<string>("");

  const request = mockClientRequests.find((r) => r.id === requestId);

  if (!request) {
    return (
      <AdminLayout>
        <div className="flex-1 overflow-auto bg-slate-100 p-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900">Request not found</h2>
            <Button onClick={() => navigate("/admin/client-requests")} className="mt-4">
              Back to Requests
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const config = statusConfig[request.status];
  const reviewedBy = request.reviewedBy
    ? mockStaff.find((s) => s.id === request.reviewedBy)
    : null;

  const handleEdit = () => {
    setEditData({ ...request });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editData) {
      alert(
        "Client request updated (Demo: " +
          editData.firstName +
          " " +
          editData.lastName +
          ") - Changes saved!"
      );
      setIsEditing(false);
    }
  };

  const handleApprove = () => {
    setSelectedSalesPersonId("");
    setActionModal("approve");
  };

  const handleReject = () => {
    setActionModal("reject");
  };

  const submitApprove = () => {
    if (!selectedSalesPersonId) {
      alert("Please select a sales person to manage this client account");
      return;
    }

    const selectedSalesPerson = mockStaff.find((s) => s.id === selectedSalesPersonId);
    const newUserId = `U${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    alert(
      `Client ${request.firstName} ${request.lastName} has been APPROVED!\n\n` +
      `✓ New user account created (ID: ${newUserId})\n` +
      `✓ Subscription Plan: ${selectedPlan}\n` +
      `✓ Account Manager: ${selectedSalesPerson?.firstName} ${selectedSalesPerson?.lastName}\n\n` +
      `The client can now login and the sales person will manage their account.`
    );
    setActionModal(null);
    navigate("/admin/client-requests");
  };

  const submitReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    alert(
      `Client ${request.firstName} ${request.lastName} has been rejected with reason: ${rejectionReason}\n\nEmail notification will be sent.`
    );
    setActionModal(null);
    setRejectionReason("");
  };

  return (
    <AdminLayout>
      <div className="flex-1 overflow-auto bg-slate-100">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/client-requests")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold text-slate-900">
              {request.firstName} {request.lastName}
            </h1>
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
                  {request.status === "approved" && (
                    <CheckCircle className={`w-12 h-12 ${config.color}`} />
                  )}
                  {request.status === "rejected" && (
                    <XCircle className={`w-12 h-12 ${config.color}`} />
                  )}
                  {request.status === "pending_approval" && (
                    <Clock className={`w-12 h-12 ${config.color}`} />
                  )}
                </div>
              </div>

              {/* Application Details */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Application Details</h3>
                  {request.status === "pending_approval" && (
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      Edit Details
                    </Button>
                  )}
                </div>

                {isEditing && editData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-600">First Name</label>
                        <Input
                          value={editData.firstName}
                          onChange={(e) =>
                            setEditData({ ...editData, firstName: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600">Last Name</label>
                        <Input
                          value={editData.lastName}
                          onChange={(e) =>
                            setEditData({ ...editData, lastName: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Email</label>
                      <Input
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Company Name</label>
                      <Input
                        value={editData.companyName}
                        onChange={(e) =>
                          setEditData({ ...editData, companyName: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-600">Country</label>
                        <Input
                          value={editData.country}
                          onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600">City</label>
                        <Input
                          value={editData.city}
                          onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">WhatsApp Number</label>
                      <Input
                        value={editData.whatsappNumber}
                        onChange={(e) =>
                          setEditData({ ...editData, whatsappNumber: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-600">Website</label>
                      <Input
                        value={editData.website}
                        onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-slate-500 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <p className="text-slate-900 font-medium mt-1">{request.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Company
                      </label>
                      <p className="text-slate-900 font-medium mt-1">{request.companyName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </label>
                      <p className="text-slate-900 font-medium mt-1">
                        {request.city}, {request.country}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        WhatsApp
                      </label>
                      <p className="text-slate-900 font-medium mt-1">{request.whatsappNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Website
                      </label>
                      <p className="text-slate-900 font-medium mt-1">{request.website}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">Subscription Plan</label>
                      <p className="text-slate-900 font-medium mt-1 capitalize">
                        {request.subscriptionPlan}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Rejection Reason (if rejected) */}
              {request.status === "rejected" && request.rejectionReason && (
                <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                  <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Rejection Reason
                  </h3>
                  <p className="text-red-700">{request.rejectionReason}</p>
                  <p className="text-xs text-red-600 mt-3">
                    An email notification was sent to the client with this reason.
                  </p>
                </div>
              )}

              {/* Review Information */}
              {request.reviewedAt && (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Review Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-slate-600">Reviewed By</label>
                      <p className="text-slate-900 font-medium mt-1">
                        {reviewedBy
                          ? `${reviewedBy.firstName} ${reviewedBy.lastName}`
                          : "System Admin"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Review Date</label>
                      <p className="text-slate-900 font-medium mt-1">
                        {new Date(request.reviewedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Actions */}
            <div className="space-y-6">
              {request.status === "pending_approval" && (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Actions</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={handleApprove}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Request
                    </Button>
                    <Button onClick={handleReject} variant="destructive" className="w-full">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Request
                    </Button>
                  </div>
                </div>
              )}

              {/* Application Timeline */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Timeline</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">Request Submitted</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {request.reviewedAt && (
                    <div className="flex gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          request.status === "approved"
                            ? "bg-green-100"
                            : request.status === "rejected"
                              ? "bg-red-100"
                              : "bg-slate-100"
                        }`}
                      >
                        {request.status === "approved" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {request.status === "approved" ? "Request Approved" : "Request Rejected"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(request.reviewedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={actionModal === "approve"} onOpenChange={(open) => !open && setActionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Client Request</DialogTitle>
            <DialogDescription>
              This client will be able to login and access the platform with the selected plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-semibold text-slate-900">Subscription Plan</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600"
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900">
                Account Manager (Sales Person) *
              </label>
              <select
                value={selectedSalesPersonId}
                onChange={(e) => setSelectedSalesPersonId(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600"
              >
                <option value="">-- Select a Sales Person --</option>
                {mockStaff
                  .filter((staff) => staff.role === "Sales")
                  .map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                This sales person will manage the client account and handle the order workflow.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setActionModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={submitApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionModal === "reject"} onOpenChange={(open) => !open && setActionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Client Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. An email notification will be sent to the client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-red-600 min-h-24"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setActionModal(null)}>
              Cancel
            </Button>
            <Button onClick={submitReject} variant="destructive">
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
