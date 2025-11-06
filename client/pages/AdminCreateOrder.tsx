import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useState } from "react";
import { mockOrders, mockUsers, mockProducts, Order } from "@/lib/mockData";
import { toast } from "sonner";

export default function AdminCreateOrder() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Order>>({
    id: `O${String(mockOrders.length + 1).padStart(3, "0")}`,
    orderNumber: `ORD-${new Date().getFullYear()}-${String(mockOrders.length + 1).padStart(3, "0")}`,
    description: "",
    amount: 0,
    currency: "USD",
    status: "new",
    serviceType: "",
    countries: [],
    createdAt: new Date().toISOString().split("T")[0],
    userId: "",
    productId: "",
    history: [],
    rejectionReasons: [],
  });

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countryInput, setCountryInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const addCountry = () => {
    if (countryInput.trim() && !selectedCountries.includes(countryInput)) {
      setSelectedCountries([...selectedCountries, countryInput]);
      setFormData((prev) => ({
        ...prev,
        countries: [...(prev.countries || []), countryInput],
      }));
      setCountryInput("");
    }
  };

  const removeCountry = (country: string) => {
    setSelectedCountries(selectedCountries.filter((c) => c !== country));
    setFormData((prev) => ({
      ...prev,
      countries: (prev.countries || []).filter((c) => c !== country),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.serviceType || !formData.userId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const orderId = formData.id || `O${String(mockOrders.length + 1).padStart(3, "0")}`;

    // Get selected product to set requiredServices
    const product = mockProducts.find(p => p.id === formData.productId);

    // In a real app, this would save to a database
    const newOrder: Order = {
      id: orderId,
      orderNumber: formData.orderNumber || "",
      description: formData.description,
      amount: formData.amount || 0,
      currency: formData.currency || "USD",
      status: "new",
      serviceType: formData.serviceType,
      countries: formData.countries || [],
      createdAt: formData.createdAt || new Date().toISOString().split("T")[0],
      userId: formData.userId,
      productId: formData.productId,
      history: [
        {
          id: `H-${Date.now()}`,
          orderId: orderId,
          previousStatus: "new",
          newStatus: "new",
          actionType: "system_transition",
          actionBy: "system",
          actionByName: "System",
          createdAt: new Date().toISOString(),
        },
      ],
      rejectionReasons: [],
      operationFiles: [],
      clientCanViewFiles: false,
      clientCanViewTracking: false,
      comments: [],
      completedServices: {
        apostilleComplete: false,
        shippingComplete: false,
        poaComplete: false,
        financialReportComplete: false,
      },
      operationReviewForm: {
        isCompleted: false,
        operationNotes: "",
        qualityCheck: false,
        documentsVerified: false,
        complianceReview: false,
      },
      requiredServices: product?.services || {
        hasApostille: false,
        hasShipping: false,
        hasPOA: false,
        hasFinancialReport: false,
      },
    };

    mockOrders.push(newOrder);
    localStorage.setItem(`order_${newOrder.id}`, JSON.stringify(newOrder));

    toast.success("Order created successfully!");
    navigate(`/admin/operations/${newOrder.id}`);
  };

  return (
    <AdminLayout>
      <div className="flex-1 overflow-auto bg-slate-100">
        <div className="p-8">
          {/* Back Button */}
          <Link to="/admin/orders">
            <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900 mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>

          {/* Form Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Create New Order</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Client *
                    </label>
                    <select
                      name="userId"
                      value={formData.userId || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                      required
                    >
                      <option value="">Select a client</option>
                      {mockUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.companyName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Product (Optional)
                    </label>
                    <select
                      name="productId"
                      value={formData.productId || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value="">Select a product</option>
                      {mockProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Service Type *
                    </label>
                    <Input
                      type="text"
                      name="serviceType"
                      value={formData.serviceType || ""}
                      onChange={handleChange}
                      placeholder="e.g., Company Registration"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Amount *
                    </label>
                    <Input
                      type="number"
                      name="amount"
                      value={formData.amount || ""}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Currency *
                    </label>
                    <select
                      name="currency"
                      value={formData.currency || "USD"}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                    >
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                      <option value="CAD">CAD</option>
                      <option value="SEK">SEK</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Countries */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Countries</h2>
                <div className="flex gap-2 mb-4">
                  <Input
                    type="text"
                    value={countryInput}
                    onChange={(e) => setCountryInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCountry();
                      }
                    }}
                    placeholder="Enter country name and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={addCountry}
                    className="bg-slate-200 text-slate-900 hover:bg-slate-300"
                  >
                    Add
                  </Button>
                </div>
                {selectedCountries.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCountries.map((country) => (
                      <div
                        key={country}
                        className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                      >
                        {country}
                        <button
                          type="button"
                          onClick={() => removeCountry(country)}
                          className="hover:text-primary-900"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Create Order
                </Button>
                <Link to="/admin/orders">
                  <Button variant="outline" className="gap-2">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
