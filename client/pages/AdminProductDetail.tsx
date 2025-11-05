import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
} from "lucide-react";
import { mockProducts } from "@/lib/mockData";

export default function AdminProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const product = mockProducts.find((p) => p.id === productId);

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Product not found</p>
          <Link to="/admin/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const getServicesList = (hasApostille: boolean, hasPOA: boolean, hasShipping: boolean) => {
    const services = [];
    if (hasApostille) services.push("Apostille");
    if (hasPOA) services.push("POA");
    if (hasShipping) services.push("Shipping");
    return services.length > 0 ? services.join(", ") : "No additional services";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/admin/products">
          <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
        </Link>

        {/* Product Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {product.name}
              </h1>
              <p className="text-slate-600 mb-4">{product.description}</p>
              
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                    product.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {product.status === "active" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </div>
              </div>

              <p className="text-sm text-slate-500 font-mono">ID: {product.id}</p>
            </div>

            <div className="flex gap-3">
              <Link to={`/admin/products/${product.id}/edit`}>
                <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Duration */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Duration
                </h3>
                <p className="text-lg font-medium text-slate-900">
                  {product.duration}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  Requirements
                </h3>
                <p className="text-slate-600 whitespace-pre-line">
                  {product.requirements}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Pricing */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-primary-600 font-bold">$</span>
                  Pricing
                </h3>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary-600">
                      {product.price.toLocaleString()}
                    </span>
                    <span className="text-lg font-semibold text-slate-700">
                      {product.currency}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    Base price for this service
                  </p>
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                  Additional Services
                </h3>
                <div className="space-y-2">
                  {product.services.hasApostille && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Apostille</span>
                    </div>
                  )}
                  {product.services.hasPOA && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-900">Power of Attorney (POA)</span>
                    </div>
                  )}
                  {product.services.hasShipping && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-900">Shipping</span>
                    </div>
                  )}
                  {!product.services.hasApostille && !product.services.hasPOA && !product.services.hasShipping && (
                    <p className="text-slate-600 italic">No additional services</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Product Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Product Name
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {product.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Status
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Created At
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {new Date(product.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Service Summary
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Price
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {product.currency} {product.price.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Duration
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {product.duration}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Included Services
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {getServicesList(
                    product.services.hasApostille,
                    product.services.hasPOA,
                    product.services.hasShipping
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Product ID
                </p>
                <p className="text-xs font-mono text-slate-600 mt-1">
                  {product.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Link to={`/admin/products/${product.id}/edit`}>
            <Button variant="outline">Edit Product</Button>
          </Link>
          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Product
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
