import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Mail,
  Globe,
  MapPin,
  Phone,
  FileText,
} from "lucide-react";
import { mockInvoices, mockUsers, mockStaff } from "@/lib/mockData";

export default function AdminInvoiceDetail() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();

  const invoice = mockInvoices.find((inv) => inv.id === invoiceId);
  const user = invoice ? mockUsers.find((u) => u.id === invoice.userId) : null;
  const createdByStaff = invoice && invoice.createdByStaffId
    ? mockStaff.find((s) => s.id === invoice.createdByStaffId)
    : null;

  if (!invoice || !user) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Invoice not found</p>
          <Link to="/admin/invoices">
            <Button>Back to Invoices</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      draft: "bg-slate-100 text-slate-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-slate-100 text-slate-800",
    };
    return statusColors[status] || "bg-slate-100 text-slate-800";
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.1; // 10% tax (simplified)
  const total = subtotal + tax;

  const isOverdue =
    invoice.status === "overdue" &&
    new Date(invoice.dueDate) < new Date();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/admin/invoices">
          <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Button>
        </Link>

        {/* Invoice Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {invoice.invoiceNumber}
              </h1>
              <p className="text-slate-600">{invoice.description}</p>
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Created</p>
                  <p className="font-medium text-slate-900">
                    {new Date(invoice.createdAt || invoice.issueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })} at{" "}
                    {new Date(invoice.createdAt || invoice.issueDate).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {invoice.paidDate && (
                  <div>
                    <p className="text-slate-500 mb-1">Paid</p>
                    <p className="font-medium text-slate-900">
                      {new Date(invoice.paidDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })} at{" "}
                      {new Date(invoice.paidDate).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 mb-1">Created By</p>
                  <p className="font-medium text-slate-900">
                    {createdByStaff
                      ? `${createdByStaff.firstName} ${createdByStaff.lastName}`
                      : "System"}
                  </p>
                </div>
              </div>
              <span
                className={`inline-block mt-4 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                  invoice.status
                )}`}
              >
                {invoice.status.toUpperCase()}
              </span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" />
                Send Email
              </Button>
              <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Invoice Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Invoice Dates */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Invoice Dates
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Issue Date
                  </p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {new Date(invoice.issueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Due Date
                  </p>
                  <p className={`text-sm font-medium mt-1 ${
                    isOverdue ? "text-red-600" : "text-slate-900"
                  }`}>
                    {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {isOverdue && <span className="ml-2 text-red-600">(Overdue)</span>}
                  </p>
                </div>
                {invoice.paidDate && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Paid Date
                    </p>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      {new Date(invoice.paidDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Bill To
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-slate-600">{user.companyName}</p>
                </div>

                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {user.city}, {user.country}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{user.whatsappNumber}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Globe className="w-4 h-4" />
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {user.website}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Invoice Items
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-3 text-left font-semibold text-slate-900">
                    Description
                  </th>
                  <th className="px-8 py-3 text-right font-semibold text-slate-900">
                    Quantity
                  </th>
                  <th className="px-8 py-3 text-right font-semibold text-slate-900">
                    Unit Price
                  </th>
                  <th className="px-8 py-3 text-right font-semibold text-slate-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-8 py-4 text-slate-900">{item.description}</td>
                    <td className="px-8 py-4 text-right text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="px-8 py-4 text-right text-slate-600">
                      {invoice.currency} {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-8 py-4 text-right font-semibold text-slate-900">
                      {invoice.currency}{" "}
                      {(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Totals */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900 font-medium">
                    {invoice.currency} {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax (10%)</span>
                  <span className="text-slate-900 font-medium">
                    {invoice.currency} {tax.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-slate-300 pt-3 flex justify-between">
                  <span className="text-slate-900 font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {invoice.currency} {total.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Payment Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Payment Status
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Invoice Amount
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {invoice.currency} {invoice.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Currency
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {invoice.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Metadata */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Invoice Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Number of Items
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {invoice.items.length} item{invoice.items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Customer
                </p>
                <Link
                  to={`/admin/users/${user.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 mt-1 inline-block"
                >
                  {user.firstName} {user.lastName}
                </Link>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Invoice ID
                </p>
                <p className="text-xs font-mono text-slate-600 mt-1">
                  {invoice.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline">Mark as Draft</Button>
          <Button variant="outline">Send Invoice</Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            Cancel Invoice
          </Button>
          <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white">
            Mark as Paid
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
