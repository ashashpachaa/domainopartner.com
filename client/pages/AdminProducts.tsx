import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockProducts, Product } from "@/lib/mockData";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatusFilter =
      filterStatus === "all" || product.status === filterStatus;

    const matchesServiceFilter =
      !serviceFilter ||
      (serviceFilter === "apostille" && product.services.hasApostille) ||
      (serviceFilter === "poa" && product.services.hasPOA) ||
      (serviceFilter === "shipping" && product.services.hasShipping) ||
      (serviceFilter === "no-services" &&
        !product.services.hasApostille &&
        !product.services.hasPOA &&
        !product.services.hasShipping);

    return matchesSearch && matchesStatusFilter && matchesServiceFilter;
  });

  const deleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== productId));
    }
  };

  const toggleProductStatus = (productId: string) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p,
      ),
    );
  };

  const getServicesList = (product: Product) => {
    const services = [];
    if (product.services.hasApostille) services.push("Apostille");
    if (product.services.hasPOA) services.push("POA");
    if (product.services.hasShipping) services.push("Shipping");
    return services.length > 0 ? services.join(", ") : "No additional services";
  };

  const toggleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const bulkDeleteProducts = () => {
    if (selectedProducts.size === 0) return;
    if (
      confirm(
        `Are you sure you want to delete ${selectedProducts.size} product(s)?`,
      )
    ) {
      setProducts(
        products.filter((p) => !selectedProducts.has(p.id)),
      );
      setSelectedProducts(new Set());
    }
  };

  const bulkToggleStatus = (newStatus: "active" | "inactive") => {
    if (selectedProducts.size === 0) return;
    setProducts(
      products.map((p) =>
        selectedProducts.has(p.id) ? { ...p, status: newStatus } : p,
      ),
    );
    setSelectedProducts(new Set());
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Items / Products
            </h2>
            <p className="text-slate-600">
              Manage your service products and packages
            </p>
          </div>
          <Link to="/admin/products/new">
            <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by product name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "all" | "active" | "inactive")
              }
              className="px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
            >
              <option value="">All Services</option>
              <option value="apostille">Apostille</option>
              <option value="poa">Power of Attorney</option>
              <option value="shipping">Shipping</option>
              <option value="no-services">No Additional Services</option>
            </select>
          </div>
          {(serviceFilter || searchTerm || filterStatus !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setServiceFilter("");
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear filters
            </button>
          )}
          <p className="text-sm text-slate-600 mt-3">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Bulk Actions Bar */}
        {selectedProducts.size > 0 && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedProducts.size === filteredProducts.length}
                onChange={toggleSelectAll}
                className="w-5 h-5 rounded"
              />
              <span className="font-semibold text-slate-900">
                {selectedProducts.size} product(s) selected
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => bulkToggleStatus("active")}
                className="bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                Mark Active
              </Button>
              <Button
                onClick={() => bulkToggleStatus("inactive")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
              >
                Mark Inactive
              </Button>
              <Button
                onClick={bulkDeleteProducts}
                className="bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                Delete Selected
              </Button>
              <Button
                onClick={() => setSelectedProducts(new Set())}
                className="bg-slate-300 hover:bg-slate-400 text-slate-900 text-sm"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No products found</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                      className="w-5 h-5 rounded mt-1"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">{product.id}</p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      product.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {product.status === "active" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {product.status}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Price */}
                <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Price
                  </p>
                  <p className="text-xl font-bold text-primary-600 mt-1">
                    {product.currency} {product.price.toLocaleString()}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div>
                    <label className="text-slate-500">Duration</label>
                    <p className="text-slate-900 font-medium">
                      {product.duration}
                    </p>
                  </div>
                  <div>
                    <label className="text-slate-500">Services</label>
                    <p className="text-slate-900 font-medium">
                      {getServicesList(product)}
                    </p>
                  </div>
                </div>

                {/* Service Badges */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {product.services.hasApostille && (
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">
                      Apostille
                    </span>
                  )}
                  {product.services.hasPOA && (
                    <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded">
                      POA
                    </span>
                  )}
                  {product.services.hasShipping && (
                    <span className="inline-block px-2 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded">
                      Shipping
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-slate-200 pt-4">
                  <Link to={`/admin/products/${product.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleProductStatus(product.id)}
                    className={`flex-1 ${
                      product.status === "active"
                        ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                        : "text-green-600 hover:text-green-700 hover:bg-green-50"
                    }`}
                  >
                    {product.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-slate-600 text-sm font-medium mb-2">
              Total Products
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {products.length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-slate-600 text-sm font-medium mb-2">Active</p>
            <p className="text-3xl font-bold text-green-600">
              {products.filter((p) => p.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-slate-600 text-sm font-medium mb-2">
              With Apostille
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {products.filter((p) => p.services.hasApostille).length}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
