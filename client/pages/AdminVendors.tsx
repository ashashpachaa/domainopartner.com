import { useState, useMemo } from "react";
import { mockVendors, Vendor } from "@/lib/mockData";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

interface VendorFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  status: "active" | "inactive";
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VendorFormData>({
    name: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    taxId: "",
    paymentTerms: "30",
    status: "active",
  });

  const filteredVendors = useMemo(() => {
    let filtered = vendors;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(search) ||
          v.email.toLowerCase().includes(search) ||
          v.country.toLowerCase().includes(search)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((v) => v.status === filterStatus);
    }

    return filtered.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [vendors, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    return {
      totalVendors: vendors.length,
      activeVendors: vendors.filter((v) => v.status === "active").length,
      totalSpent: vendors.reduce((sum, v) => sum + v.totalSpent, 0),
      averageSpent: vendors.length > 0 ? vendors.reduce((sum, v) => sum + v.totalSpent, 0) / vendors.length : 0,
    };
  }, [vendors]);

  const handleAddVendor = () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in required fields");
      return;
    }

    const newVendor: Vendor = {
      id: editingId || `VEN${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      address: formData.address,
      taxId: formData.taxId || undefined,
      paymentTerms: parseInt(formData.paymentTerms),
      status: formData.status,
      totalSpent: editingId
        ? vendors.find((v) => v.id === editingId)?.totalSpent || 0
        : 0,
      currency: "USD",
      createdAt: editingId ? vendors.find((v) => v.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
    };

    if (editingId) {
      setVendors(vendors.map((v) => (v.id === editingId ? newVendor : v)));
      toast.success("Vendor updated");
      setEditingId(null);
    } else {
      setVendors([newVendor, ...vendors]);
      toast.success("Vendor added");
    }

    setShowForm(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      country: "",
      address: "",
      taxId: "",
      paymentTerms: "30",
      status: "active",
    });
  };

  const handleEdit = (vendor: Vendor) => {
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      country: vendor.country,
      address: vendor.address,
      taxId: vendor.taxId || "",
      paymentTerms: vendor.paymentTerms.toString(),
      status: vendor.status,
    });
    setEditingId(vendor.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setVendors(vendors.filter((v) => v.id !== id));
    toast.success("Vendor deleted");
  };

  const handleStatusChange = (id: string, newStatus: "active" | "inactive") => {
    setVendors(
      vendors.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
    toast.success(`Vendor marked as ${newStatus}`);
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Vendor Management</h1>
            <p className="text-slate-600 mt-2">Manage vendor information and payment terms</p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setShowForm(!showForm);
              setFormData({
                name: "",
                email: "",
                phone: "",
                country: "",
                address: "",
                taxId: "",
                paymentTerms: "30",
                status: "active",
              });
            }}
            className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancel" : "Add Vendor"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Total Vendors</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalVendors}</p>
            <p className="text-xs text-slate-500 mt-1">{stats.activeVendors} active</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">${stats.totalSpent.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Average Per Vendor</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              ${Math.round(stats.averageSpent).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm">Inactive Vendors</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {stats.totalVendors - stats.activeVendors}
            </p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? "Edit Vendor" : "Add New Vendor"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Vendor name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vendor@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1-xxx-xxx-xxxx"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tax ID
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="Tax ID"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Terms (Days)
                </label>
                <input
                  type="number"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  placeholder="30"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button onClick={() => setShowForm(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleAddVendor} className="bg-primary-600 hover:bg-primary-700">
                {editingId ? "Update Vendor" : "Add Vendor"}
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vendors..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Vendors</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.length > 0 ? (
            filteredVendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition">
                <div className={`p-6 ${vendor.status === "active" ? "bg-green-50" : "bg-red-50"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{vendor.name}</h3>
                    <select
                      value={vendor.status}
                      onChange={(e) => handleStatusChange(vendor.id, e.target.value as any)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${
                        vendor.status === "active"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${vendor.email}`} className="text-primary-600 hover:text-primary-700">
                        {vendor.email}
                      </a>
                    </div>
                    {vendor.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${vendor.phone}`} className="text-primary-600 hover:text-primary-700">
                          {vendor.phone}
                        </a>
                      </div>
                    )}
                    {vendor.country && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{vendor.country}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Total Spent</span>
                      <span className="text-lg font-bold text-slate-900">
                        ${vendor.totalSpent.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-3 mb-4">
                    <div>
                      <p className="text-slate-500">Payment Terms</p>
                      <p className="font-bold text-slate-900">{vendor.paymentTerms} days</p>
                    </div>
                    {vendor.taxId && (
                      <div>
                        <p className="text-slate-500">Tax ID</p>
                        <p className="font-bold text-slate-900 truncate">{vendor.taxId}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500">No vendors found. Add one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
