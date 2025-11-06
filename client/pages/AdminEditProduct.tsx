import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { mockProducts, Product } from "@/lib/mockData";
import { toast } from "sonner";

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
      price: 0,
      currency: "USD",
      country: "",
      services: {
        hasApostille: false,
        hasShipping: false,
        hasPOA: false,
        hasFinancialReport: false,
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
    } else if (name === "duration") {
      // Auto-append " business days" only if not already present
      let finalValue = value;
      if (value && !value.endsWith(" business days")) {
        finalValue = value + " business days";
      }
      setFormData((prev) => ({
        ...prev,
        [name]: finalValue,
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

    // Validate required fields - check for empty strings, null, or undefined
    if (
      !formData.name?.trim() ||
      !formData.description?.trim() ||
      !formData.duration?.trim() ||
      formData.price === null ||
      formData.price === undefined ||
      formData.price === "" ||
      !formData.currency?.trim() ||
      !formData.country?.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isNewProduct) {
      // Create new product object
      const newProduct: Product = {
        id: formData.id || `P${(mockProducts.length + 1).toString().padStart(3, "0")}`,
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        requirements: formData.requirements || "",
        price: formData.price,
        currency: formData.currency,
        country: formData.country,
        services: formData.services || {
          hasApostille: false,
          hasShipping: false,
          hasPOA: false,
          hasFinancialReport: false,
        },
        createdAt: new Date().toISOString(),
        status: formData.status || "active",
      };

      // Add to mockProducts array
      mockProducts.push(newProduct);

      // Save to localStorage
      localStorage.setItem(`product_${newProduct.id}`, JSON.stringify(newProduct));

      toast.success("Product created successfully!");
    } else {
      // Update existing product
      const updatedProduct: Product = {
        ...existingProduct!,
        ...formData,
        createdAt: existingProduct?.createdAt || new Date().toISOString(),
      } as Product;

      // Update in mockProducts array
      const index = mockProducts.findIndex((p) => p.id === updatedProduct.id);
      if (index >= 0) {
        mockProducts[index] = updatedProduct;
      }

      // Update localStorage
      localStorage.setItem(`product_${updatedProduct.id}`, JSON.stringify(updatedProduct));

      toast.success("Product updated successfully!");
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
                    Duration (business days) *
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="text"
                      name="duration"
                      value={formData.duration?.replace(/ business days$/, "") || ""}
                      onChange={handleChange}
                      placeholder="e.g., 3-5"
                      required
                      className="border-slate-300 focus:border-primary-500 focus:ring-primary-500 flex-1"
                    />
                    <span className="text-sm text-slate-500 font-medium whitespace-nowrap">business days</span>
                  </div>
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

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Price *
                  </label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleChange}
                    placeholder="e.g., 500"
                    min="0"
                    step="0.01"
                    required
                    className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Currency *
                  </label>
                  <select
                    name="currency"
                    value={formData.currency || "USD"}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="AED">AED - United Arab Emirates Dirham</option>
                    <option value="AFN">AFN - Afghan Afghani</option>
                    <option value="ALL">ALL - Albanian Lek</option>
                    <option value="AMD">AMD - Armenian Dram</option>
                    <option value="ANG">ANG - Anguillan Guilder</option>
                    <option value="AOA">AOA - Angolan Kwanza</option>
                    <option value="ARS">ARS - Argentine Peso</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="AWG">AWG - Aruban Florin</option>
                    <option value="AZN">AZN - Azerbaijani Manat</option>
                    <option value="BAM">BAM - Bosnia and Herzegovina Convertible Mark</option>
                    <option value="BBD">BBD - Barbadian Dollar</option>
                    <option value="BDT">BDT - Bangladeshi Taka</option>
                    <option value="BGN">BGN - Bulgarian Lev</option>
                    <option value="BHD">BHD - Bahraini Dinar</option>
                    <option value="BIF">BIF - Burundian Franc</option>
                    <option value="BMD">BMD - Bermudian Dollar</option>
                    <option value="BND">BND - Brunei Dollar</option>
                    <option value="BOB">BOB - Bolivian Boliviano</option>
                    <option value="BRL">BRL - Brazilian Real</option>
                    <option value="BSD">BSD - Bahamian Dollar</option>
                    <option value="BTC">BTC - Bitcoin</option>
                    <option value="BTN">BTN - Bhutanese Ngultrum</option>
                    <option value="BWP">BWP - Botswana Pula</option>
                    <option value="BYN">BYN - Belarusian Ruble</option>
                    <option value="BZD">BZD - Belize Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="CDF">CDF - Congolese Franc</option>
                    <option value="CHE">CHE - WIR Euro</option>
                    <option value="CHF">CHF - Swiss Franc</option>
                    <option value="CHW">CHW - WIR Franc</option>
                    <option value="CLF">CLF - Chilean Unit of Account</option>
                    <option value="CLP">CLP - Chilean Peso</option>
                    <option value="CNH">CNH - Chinese Yuan (offshore)</option>
                    <option value="CNY">CNY - Chinese Yuan</option>
                    <option value="COP">COP - Colombian Peso</option>
                    <option value="COU">COU - Colombian Real Value Unit</option>
                    <option value="CRC">CRC - Costa Rican Colón</option>
                    <option value="CUC">CUC - Cuban Convertible Peso</option>
                    <option value="CUP">CUP - Cuban Peso</option>
                    <option value="CVE">CVE - Cape Verdean Escudo</option>
                    <option value="CZK">CZK - Czech Koruna</option>
                    <option value="DJF">DJF - Djiboutian Franc</option>
                    <option value="DKK">DKK - Danish Krone</option>
                    <option value="DOP">DOP - Dominican Peso</option>
                    <option value="DZD">DZD - Algerian Dinar</option>
                    <option value="EGP">EGP - Egyptian Pound</option>
                    <option value="ERN">ERN - Eritrean Nakfa</option>
                    <option value="ETB">ETB - Ethiopian Birr</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="FJD">FJD - Fijian Dollar</option>
                    <option value="FKP">FKP - Falkland Islands Pound</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="GEL">GEL - Georgian Lari</option>
                    <option value="GHS">GHS - Ghanaian Cedi</option>
                    <option value="GIP">GIP - Gibraltar Pound</option>
                    <option value="GMD">GMD - Gambian Dalasi</option>
                    <option value="GNF">GNF - Guinean Franc</option>
                    <option value="GTQ">GTQ - Guatemalan Quetzal</option>
                    <option value="GYD">GYD - Guyanaese Dollar</option>
                    <option value="HKD">HKD - Hong Kong Dollar</option>
                    <option value="HNL">HNL - Honduran Lempira</option>
                    <option value="HRK">HRK - Croatian Kuna</option>
                    <option value="HTG">HTG - Haitian Gourde</option>
                    <option value="HUF">HUF - Hungarian Forint</option>
                    <option value="IDR">IDR - Indonesian Rupiah</option>
                    <option value="ILS">ILS - Israeli New Shekel</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="IQD">IQD - Iraqi Dinar</option>
                    <option value="IRR">IRR - Iranian Rial</option>
                    <option value="ISK">ISK - Icelandic Króna</option>
                    <option value="JMD">JMD - Jamaican Dollar</option>
                    <option value="JOD">JOD - Jordanian Dinar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="KGS">KGS - Kyrgyzstani Som</option>
                    <option value="KHR">KHR - Cambodian Riel</option>
                    <option value="KMF">KMF - Comorian Franc</option>
                    <option value="KPW">KPW - North Korean Won</option>
                    <option value="KRW">KRW - South Korean Won</option>
                    <option value="KWD">KWD - Kuwaiti Dinar</option>
                    <option value="KYD">KYD - Cayman Islands Dollar</option>
                    <option value="KZT">KZT - Kazakhstani Tenge</option>
                    <option value="LAK">LAK - Laotian Kip</option>
                    <option value="LBP">LBP - Lebanese Pound</option>
                    <option value="LKR">LKR - Sri Lankan Rupee</option>
                    <option value="LRD">LRD - Liberian Dollar</option>
                    <option value="LSL">LSL - Lesotho Loti</option>
                    <option value="LYD">LYD - Libyan Dinar</option>
                    <option value="MAD">MAD - Moroccan Dirham</option>
                    <option value="MDL">MDL - Moldovan Leu</option>
                    <option value="MGA">MGA - Malagasy Ariary</option>
                    <option value="MKD">MKD - Macedonian Denar</option>
                    <option value="MMK">MMK - Myanmar Kyat</option>
                    <option value="MNT">MNT - Mongolian Tugrik</option>
                    <option value="MOP">MOP - Macanese Pataca</option>
                    <option value="MRU">MRU - Mauritanian Ouguiya</option>
                    <option value="MUR">MUR - Mauritian Rupee</option>
                    <option value="MVR">MVR - Maldivian Rufiyaa</option>
                    <option value="MWK">MWK - Malawian Kwacha</option>
                    <option value="MXN">MXN - Mexican Peso</option>
                    <option value="MXV">MXV - Mexican Investment Unit</option>
                    <option value="MYR">MYR - Malaysian Ringgit</option>
                    <option value="MZN">MZN - Mozambican Metical</option>
                    <option value="NAD">NAD - Namibian Dollar</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="NIO">NIO - Nicaraguan Córdoba</option>
                    <option value="NOK">NOK - Norwegian Krone</option>
                    <option value="NPR">NPR - Nepalese Rupee</option>
                    <option value="NZD">NZD - New Zealand Dollar</option>
                    <option value="OMR">OMR - Omani Rial</option>
                    <option value="PAB">PAB - Panamanian Balboa</option>
                    <option value="PEN">PEN - Peruvian Nuevo Sol</option>
                    <option value="PGK">PGK - Papua New Guinean Kina</option>
                    <option value="PHP">PHP - Philippine Peso</option>
                    <option value="PKR">PKR - Pakistani Rupee</option>
                    <option value="PLN">PLN - Polish Zloty</option>
                    <option value="PYG">PYG - Paraguayan Guaraní</option>
                    <option value="QAR">QAR - Qatari Rial</option>
                    <option value="RON">RON - Romanian Leu</option>
                    <option value="RSD">RSD - Serbian Dinar</option>
                    <option value="RUB">RUB - Russian Ruble</option>
                    <option value="RWF">RWF - Rwandan Franc</option>
                    <option value="SAR">SAR - Saudi Arabian Riyal</option>
                    <option value="SBD">SBD - Solomon Islands Dollar</option>
                    <option value="SCR">SCR - Seychellois Rupee</option>
                    <option value="SDG">SDG - Sudanese Pound</option>
                    <option value="SEK">SEK - Swedish Krona</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="SHP">SHP - Saint Helena Pound</option>
                    <option value="SLL">SLL - Sierra Leonean Leone</option>
                    <option value="SOS">SOS - Somali Shilling</option>
                    <option value="SRD">SRD - Surinamese Dollar</option>
                    <option value="SSP">SSP - South Sudanese Pound</option>
                    <option value="STN">STN - São Tomé and Príncipe Dobra</option>
                    <option value="SYP">SYP - Syrian Pound</option>
                    <option value="SZL">SZL - Swazi Lilangeni</option>
                    <option value="THB">THB - Thai Baht</option>
                    <option value="TJS">TJS - Tajikistani Somoni</option>
                    <option value="TMT">TMT - Turkmenistani Manat</option>
                    <option value="TND">TND - Tunisian Dinar</option>
                    <option value="TOP">TOP - Tongan Paʻanga</option>
                    <option value="TRY">TRY - Turkish Lira</option>
                    <option value="TTD">TTD - Trinidad and Tobago Dollar</option>
                    <option value="TWD">TWD - New Taiwan Dollar</option>
                    <option value="TZS">TZS - Tanzanian Shilling</option>
                    <option value="UAH">UAH - Ukrainian Hryvnia</option>
                    <option value="UGX">UGX - Ugandan Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="USN">USN - US Dollar (Next day)</option>
                    <option value="UYI">UYI - Uruguayan Peso (Indexed)</option>
                    <option value="UYU">UYU - Uruguayan Peso</option>
                    <option value="UZS">UZS - Uzbekistani Som</option>
                    <option value="VEF">VEF - Venezuelan Bolívar (fixed rate)</option>
                    <option value="VES">VES - Venezuelan Bolívar</option>
                    <option value="VND">VND - Vietnamese Đồng</option>
                    <option value="VUV">VUV - Vanuatu Vatu</option>
                    <option value="WST">WST - Samoan Tala</option>
                    <option value="XAF">XAF - Central African CFA Franc</option>
                    <option value="XAG">XAG - Silver (one troy ounce)</option>
                    <option value="XAU">XAU - Gold (one troy ounce)</option>
                    <option value="XBA">XBA - European Composite Unit (EURCO)</option>
                    <option value="XBB">XBB - European Monetary Unit (E.M.U.-6)</option>
                    <option value="XBC">XBC - European Unit of Account 9 (E.U.A.-9)</option>
                    <option value="XBD">XBD - European Unit of Account 17 (E.U.A.-17)</option>
                    <option value="XCD">XCD - East Caribbean Dollar</option>
                    <option value="XDR">XDR - Special Drawing Right</option>
                    <option value="XOF">XOF - West African CFA Franc</option>
                    <option value="XPD">XPD - Palladium (one troy ounce)</option>
                    <option value="XPF">XPF - CFP Franc</option>
                    <option value="XPT">XPT - Platinum (one troy ounce)</option>
                    <option value="XSU">XSU - Sucre</option>
                    <option value="XTS">XTS - Code reserved for testing</option>
                    <option value="XUA">XUA - ADB Unit of Account</option>
                    <option value="XXX">XXX - No currency</option>
                    <option value="YER">YER - Yemeni Rial</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="ZMW">ZMW - Zambian Kwacha</option>
                    <option value="ZWL">ZWL - Zimbabwean Dollar</option>
                  </select>
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

                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="services.hasFinancialReport"
                    checked={formData.services?.hasFinancialReport || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium text-slate-900">Financial Report</p>
                    <p className="text-sm text-slate-600">
                      Comprehensive financial analysis and reporting service
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
