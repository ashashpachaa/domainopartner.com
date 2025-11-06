import { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockOrders, mockProducts, mockStaff } from "@/lib/mockData";
import ClientLayout from "@/components/ClientLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, MapPin, Clock, CheckCircle2, AlertCircle, History } from "lucide-react";
import { fetchCompanyDetails, storeRegisteredCompany } from "@/hooks/useCompanyDetails";
import { toast } from "sonner";

export default function ClientOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const order = useMemo(() => {
    return mockOrders.find((o) => o.id === orderId);
  }, [orderId]);

  const product = useMemo(() => {
    return order ? mockProducts.find((p) => p.id === order.productId) : null;
  }, [order]);

  const salesStaff = useMemo(() => {
    return order ? mockStaff.find((s) => s.id === order.assignedToSalesId) : null;
  }, [order]);

  if (!order) {
    return (
      <ClientLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Order not found</p>
          <Button onClick={() => navigate("/client/orders")} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </ClientLayout>
    );
  }

  // Get workflow stages
  const workflowStages = [
    { key: "pending_sales_review", label: "Sales Review" },
    { key: "pending_operation", label: "Operation" },
    { key: "pending_operation_manager_review", label: "Manager Review" },
    { key: "awaiting_client_acceptance", label: "Your Approval" },
    ...(product?.services.hasApostille ? [{ key: "pending_apostille", label: "Apostille" }] : []),
    ...(product?.services.hasPOA ? [{ key: "pending_poa", label: "Power of Attorney" }] : []),
    ...(product?.services.hasFinancialReport ? [{ key: "pending_financial_report", label: "Financial Report" }] : []),
    ...(product?.services.hasShipping ? [{ key: "shipping_preparation", label: "Shipping" }] : []),
    { key: "completed", label: "Completed" },
  ];

  const currentStageIndex = workflowStages.findIndex((s) => order.status.includes(s.key));

  const getStatusColor = (status: string) => {
    if (status.includes("completed")) return "text-green-600";
    if (status.includes("rejected")) return "text-red-600";
    if (status.includes("client")) return "text-blue-600";
    return "text-yellow-600";
  };

  const getStatusLabel = (status: string) => {
    if (status.includes("completed")) return "Completed";
    if (status.includes("rejected")) return "Rejected";
    if (status.includes("client")) return "Awaiting Your Response";
    return "In Progress";
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              onClick={() => navigate("/client/orders")}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
            <h1 className="text-3xl font-bold text-slate-900">{order.orderNumber}</h1>
            <p className="text-slate-600 mt-2">Order Details & Status</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </div>
        </div>

        {/* Alert if action needed */}
        {order.status.includes("client") && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-blue-900">Action Required</p>
            <p className="text-sm text-blue-700 mt-1">
              We're waiting for your approval to proceed with this order. Please review the documents and confirm.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600">Service Type</p>
                  <p className="font-semibold text-slate-900">{order.serviceType}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Amount</p>
                  <p className="font-semibold text-slate-900">${order.amount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Created</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Countries</p>
                  <p className="font-semibold text-slate-900">{order.countries?.join(", ") || "N/A"}</p>
                </div>
                {order.history && order.history.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600">Last Updated</p>
                    <p className="font-semibold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {new Date(order.history[order.history.length - 1].createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              {order.description && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">Description</p>
                  <p className="text-slate-900">{order.description}</p>
                </div>
              )}
            </div>

            {/* Workflow Progress */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Progress</h2>
              <div className="space-y-4">
                {workflowStages.map((stage, index) => {
                  const isCompleted = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;

                  return (
                    <div key={stage.key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center mt-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                            isCompleted
                              ? "bg-green-100 text-green-700"
                              : isCurrent
                              ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                        </div>
                        {index < workflowStages.length - 1 && (
                          <div
                            className={`w-0.5 h-12 my-2 ${
                              isCompleted ? "bg-green-300" : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pt-1">
                        <p
                          className={`font-semibold ${
                            isCompleted
                              ? "text-green-700"
                              : isCurrent
                              ? "text-blue-700"
                              : "text-slate-500"
                          }`}
                        >
                          {stage.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-blue-600 mt-1">Current stage</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Documents */}
            {order.operationFiles && order.operationFiles.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Documents</h2>
                <div className="space-y-3">
                  {order.operationFiles
                    .filter((f) => f.visibleToClient !== false)
                    .map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{file.fileName}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>
                          {file.description && (
                            <p className="text-xs text-slate-600 mt-1">{file.description}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = file.fileUrl || "#";
                            link.download = file.fileName;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Company Information */}
            {order.companyInfo && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-600">Company Name</p>
                    <p className="font-semibold text-slate-900">{order.companyInfo.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Price Per Share</p>
                    <p className="font-semibold text-slate-900">{order.currency} {order.companyInfo.pricePerShare}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Capital</p>
                    <p className="font-semibold text-slate-900">{order.currency} {order.companyInfo.totalCapital}</p>
                  </div>
                </div>
                {order.companyInfo.companyActivities && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">Business Activities</p>
                    <p className="text-slate-900 mt-2">{order.companyInfo.companyActivities}</p>
                  </div>
                )}
              </div>
            )}

            {/* Shareholders */}
            {order.shareholders && order.shareholders.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Shareholders & Ownership</h2>
                <div className="space-y-4">
                  {order.shareholders.map((shareholder, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {shareholder.firstName} {shareholder.lastName}
                          </p>
                        </div>
                        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {shareholder.ownershipPercentage}%
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Date of Birth</p>
                          <p className="font-medium text-slate-900">
                            {new Date(shareholder.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Nationality</p>
                          <p className="font-medium text-slate-900">{shareholder.nationality}</p>
                        </div>
                      </div>
                      {shareholder.passportFile && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-sm text-slate-600 mb-2">Passport Document</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = shareholder.passportFile?.fileUrl || "#";
                              link.download = shareholder.passportFile?.fileName || "passport";
                              link.click();
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {shareholder.passportFile.fileName}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-purple-700">
                      Total Ownership: {order.shareholders.reduce((sum, sh) => sum + sh.ownershipPercentage, 0)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Number */}
            {order.trackingNumber && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Shipping Tracking</h2>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Tracking Number</p>
                  <p className="font-mono font-semibold text-slate-900 text-lg">{order.trackingNumber}</p>
                  <p className="text-xs text-slate-600 mt-2">
                    Added: {order.trackingNumberAddedAt ? new Date(order.trackingNumberAddedAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Info */}
            {product && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Product</h3>
                <p className="font-medium text-slate-900 mb-2">{product.name}</p>
                <div className="space-y-2 text-sm">
                  {product.services.hasApostille && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Apostille
                    </div>
                  )}
                  {product.services.hasPOA && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Power of Attorney
                    </div>
                  )}
                  {product.services.hasFinancialReport && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Financial Report
                    </div>
                  )}
                  {product.services.hasShipping && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Shipping
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info */}
            {salesStaff && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Your Account Manager</h3>
                <p className="font-medium text-slate-900 mb-1">
                  {salesStaff.firstName} {salesStaff.lastName}
                </p>
                <p className="text-sm text-slate-600 mb-3">{salesStaff.email}</p>
                <Button variant="outline" className="w-full" onClick={() => navigate("/client/messages")}>
                  Send Message
                </Button>
              </div>
            )}

            {/* Activity Timeline */}
            {order.history && order.history.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  {order.history
                    .slice()
                    .reverse()
                    .map((entry, index) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {index + 1}
                          </div>
                          {index < order.history.length - 1 && (
                            <div className="w-0.5 h-12 bg-slate-200 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-medium text-slate-900">
                            {entry.newStatus?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {new Date(entry.createdAt).toLocaleDateString()} at{" "}
                            {new Date(entry.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            by <span className="font-medium">{entry.actionByName}</span>
                          </p>
                          {entry.description && (
                            <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2 rounded">
                              {entry.description}
                            </p>
                          )}
                          {entry.reason && (
                            <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">
                              <span className="font-medium">Reason:</span> {entry.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
