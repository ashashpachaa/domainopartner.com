import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { mockProducts, Product } from "@/lib/mockData";

export default function AdminEditProduct() {
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();
  const isNewProduct = productId === "new" || !productId;

  const existingProduct = !isNewProduct
    ? mockProducts.find((p) => p.id === productId)
    : null;

  const [formData, setFormData] = useState<Partial<Product>>(
    existingProduct || {
      id: `P${(mockProducts.length + 1).toString().padStart(3, "0")}`,
      name: "",
      description: "",
      duration: "",
      requirements: "",
      services: {
        hasApostille: false,
        hasShipping: false,
        hasPOA: false,
      },
      createdAt: new Date().toISOString(),
      status: "active",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      const [parent, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [field]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.duration) {
      alert("Please fill in all required fields");
      return;
    }

    if (isNewProduct) {
      // Add new product to the list (in a real app, this would be an API call)
      console.log("Creating new product:", formData);
      alert("Product created successfully!");
    } else {
      // Update existing product
      console.log("Updating product:", formData);
      alert("Product updated successfully!");
    }

    navigate("/admin/products");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Back Button */}
        <Link to="/admin/products">
          <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
        </Link>

        {/* Form */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            {isNewProduct ? "Create New Product" : "Edit Product"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Product Information
              </h2>
              <div className="space-y-4">
                {/* Product ID (Read-only for existing products) */}
                {!isNewProduct && (
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Product ID
                    </label>
                    <Input
                      type="text"
                      value={formData.id || ""}
                      disabled
                      className="bg-slate-50 cursor-not-allowed"
                    />
                  </div>
                )}

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Product Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="e.g., UK New Company Formation"
                    required
                    className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    placeholder="Detailed description of the product"
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 resize-none"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Duration *
                  </label>
                  <Input
                    type="text"
                    name="duration"
                    value={formData.duration || ""}
                    onChange={handleChange}
                    placeholder="e.g., 3-5 business days"
                    required
                    className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements || ""}
                    onChange={handleChange}
                    placeholder="List of requirements or prerequisites"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 resize-none"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || "active"}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Additional Services
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="services.hasApostille"
                    checked={formData.services?.hasApostille || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium text-slate-900">Apostille</p>
                    <p className="text-sm text-slate-600">
                      Document certification and apostille service
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="services.hasPOA"
                    checked={formData.services?.hasPOA || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium text-slate-900">Power of Attorney (POA)</p>
                    <p className="text-sm text-slate-600">
                      Power of attorney documentation and preparation
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="services.hasShipping"
                    checked={formData.services?.hasShipping || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium text-slate-900">Shipping</p>
                    <p className="text-sm text-slate-600">
                      Document shipping and delivery services
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-slate-200 pt-6 flex gap-3 justify-end">
              <Link to="/admin/products">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white gap-2"
              >
                <Save className="w-4 h-4" />
                {isNewProduct ? "Create Product" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
