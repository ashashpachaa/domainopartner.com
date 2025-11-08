import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  mockStaff,
  mockStaffCommissions,
  Staff,
  StaffCommission,
  CommissionTier,
} from "@/lib/mockData";

export default function AdminStaffCommission() {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();

  // Load staff from localStorage first, then fallback to mockStaff
  const staff = useMemo(() => {
    const localStorageStaff = localStorage.getItem(`staff_${staffId}`);
    if (localStorageStaff) {
      try {
        return JSON.parse(localStorageStaff);
      } catch (e) {
        console.error("Error parsing staff from localStorage:", e);
      }
    }
    return mockStaff.find((s) => s.id === staffId);
  }, []);

  const commission = mockStaffCommissions.find((c) => c.staffId === staffId);

  const [isEditingTier, setIsEditingTier] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [currency, setCurrency] = useState(commission?.currency || "USD");
  const [tiers, setTiers] = useState<CommissionTier[]>(commission?.tiers || []);

  const [formData, setFormData] = useState<Partial<CommissionTier>>({
    orderCountMin: 1,
    orderCountMax: 10,
    percentageRate: 5,
    fixedAmount: 50,
    description: "",
  });

  if (!staff) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Staff member not found</p>
          <Link to="/admin/staff">
            <Button>Back to Staff</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const handleAddTier = () => {
    if (
      formData.orderCountMin &&
      formData.orderCountMax &&
      formData.percentageRate !== undefined &&
      formData.fixedAmount !== undefined
    ) {
      const newTier: CommissionTier = {
        id: `T${Date.now()}`,
        orderCountMin: formData.orderCountMin,
        orderCountMax: formData.orderCountMax,
        percentageRate: formData.percentageRate,
        fixedAmount: formData.fixedAmount,
        description:
          formData.description ||
          `Orders ${formData.orderCountMin}-${formData.orderCountMax}`,
      };

      if (editingTierId) {
        setTiers(tiers.map((t) => (t.id === editingTierId ? newTier : t)));
        setEditingTierId(null);
      } else {
        setTiers([...tiers, newTier]);
      }

      setFormData({
        orderCountMin: 1,
        orderCountMax: 10,
        percentageRate: 5,
        fixedAmount: 50,
        description: "",
      });
      setIsEditingTier(false);
    }
  };

  const handleEditTier = (tier: CommissionTier) => {
    setFormData(tier);
    setEditingTierId(tier.id);
    setIsEditingTier(true);
  };

  const handleDeleteTier = (tierId: string) => {
    setTiers(tiers.filter((t) => t.id !== tierId));
  };

  const handleSaveCommission = () => {
    navigate(`/admin/staff/${staffId}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to={`/admin/staff/${staffId}`}>
          <Button
            variant="ghost"
            className="gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Staff Detail
          </Button>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Commission Configuration
              </h1>
              <p className="text-slate-600 mb-4">
                Configure commission tiers for{" "}
                <span className="font-semibold">
                  {staff.firstName} {staff.lastName}
                </span>
              </p>
              <p className="text-sm text-slate-500">
                Set up tiered commissions based on order count. Each tier
                applies when the staff member reaches the order count threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Commission Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <optgroup label="Major Currencies">
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
              <option value="JPY">JPY - Japanese Yen (¥)</option>
              <option value="CHF">CHF - Swiss Franc (CHF)</option>
              <option value="CAD">CAD - Canadian Dollar (C$)</option>
              <option value="AUD">AUD - Australian Dollar (A$)</option>
            </optgroup>

            <optgroup label="Asian Currencies">
              <option value="SGD">SGD - Singapore Dollar (S$)</option>
              <option value="HKD">HKD - Hong Kong Dollar (HK$)</option>
              <option value="CNY">CNY - Chinese Yuan (¥)</option>
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="IDR">IDR - Indonesian Rupiah (Rp)</option>
              <option value="MYR">MYR - Malaysian Ringgit (RM)</option>
              <option value="PHP">PHP - Philippine Peso (₱)</option>
              <option value="THB">THB - Thai Baht (฿)</option>
              <option value="VND">VND - Vietnamese Dong (₫)</option>
              <option value="KRW">KRW - South Korean Won (₩)</option>
              <option value="TWD">TWD - Taiwan Dollar (NT$)</option>
              <option value="PKR">PKR - Pakistani Rupee (₨)</option>
              <option value="BDT">BDT - Bangladeshi Taka (৳)</option>
            </optgroup>

            <optgroup label="European Currencies">
              <option value="SEK">SEK - Swedish Krona (kr)</option>
              <option value="NOK">NOK - Norwegian Krone (kr)</option>
              <option value="DKK">DKK - Danish Krone (kr)</option>
              <option value="PLN">PLN - Polish Zloty (zł)</option>
              <option value="CZK">CZK - Czech Koruna (Kč)</option>
              <option value="HUF">HUF - Hungarian Forint (Ft)</option>
              <option value="RON">RON - Romanian Leu (lei)</option>
              <option value="BGN">BGN - Bulgarian Lev (лв)</option>
              <option value="HRK">HRK - Croatian Kuna (kn)</option>
              <option value="RUB">RUB - Russian Ruble (₽)</option>
              <option value="TRY">TRY - Turkish Lira (₺)</option>
              <option value="UAH">UAH - Ukrainian Hryvnia (₴)</option>
            </optgroup>

            <optgroup label="Americas Currencies">
              <option value="BRL">BRL - Brazilian Real (R$)</option>
              <option value="MXN">MXN - Mexican Peso (Mex$)</option>
              <option value="ARS">ARS - Argentine Peso ($)</option>
              <option value="CLP">CLP - Chilean Peso ($)</option>
              <option value="COP">COP - Colombian Peso ($)</option>
              <option value="PEN">PEN - Peruvian Sol (S/)</option>
              <option value="UYU">UYU - Uruguayan Peso ($U)</option>
              <option value="VEF">VEF - Venezuelan Bolívar (Bs)</option>
            </optgroup>

            <optgroup label="Middle East & Africa">
              <option value="AED">AED - UAE Dirham (د.إ)</option>
              <option value="SAR">SAR - Saudi Riyal (﷼)</option>
              <option value="QAR">QAR - Qatar Riyal (﷼)</option>
              <option value="KWD">KWD - Kuwaiti Dinar (د.ك)</option>
              <option value="BHD">BHD - Bahraini Dinar (.د.ب)</option>
              <option value="OMR">OMR - Omani Rial (ر.ع.)</option>
              <option value="JOD">JOD - Jordanian Dinar (د.ا)</option>
              <option value="LBP">LBP - Lebanese Pound (ل.ل)</option>
              <option value="EGP">EGP - Egyptian Pound (£)</option>
              <option value="ZAR">ZAR - South African Rand (R)</option>
              <option value="NGN">NGN - Nigerian Naira (₦)</option>
              <option value="GHS">GHS - Ghanaian Cedi (₵)</option>
              <option value="KES">KES - Kenyan Shilling (KSh)</option>
              <option value="TZS">TZS - Tanzanian Shilling (TSh)</option>
              <option value="UGX">UGX - Ugandan Shilling (USh)</option>
              <option value="ETB">ETB - Ethiopian Birr (Br)</option>
              <option value="MAD">MAD - Moroccan Dirham (د.م.)</option>
              <option value="TND">TND - Tunisian Dinar (د.ت)</option>
            </optgroup>

            <optgroup label="Other Currencies">
              <option value="NZD">NZD - New Zealand Dollar (NZ$)</option>
              <option value="THB">THB - Thai Baht (฿)</option>
              <option value="MOP">MOP - Macanese Pataca (P)</option>
              <option value="HNL">HNL - Honduran Lempira (L)</option>
              <option value="GTQ">GTQ - Guatemalan Quetzal (Q)</option>
              <option value="CRC">CRC - Costa Rican Colón (₡)</option>
              <option value="PYG">PYG - Paraguayan Guaraní (₲)</option>
              <option value="BOB">BOB - Bolivian Boliviano (Bs.)</option>
              <option value="ISK">ISK - Icelandic Króna (kr)</option>
              <option value="NIS">NIS - Israeli New Sheqel (₪)</option>
            </optgroup>
          </select>
          <p className="text-xs text-slate-500 mt-2">
            All commissions for this staff will be calculated in {currency}
          </p>
        </div>

        {/* Commission Tiers */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Commission Tiers
            </h2>
            {!isEditingTier && (
              <Button
                onClick={() => setIsEditingTier(true)}
                className="gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
              >
                <Plus className="w-4 h-4" />
                Add Tier
              </Button>
            )}
          </div>

          {isEditingTier && (
            <div className="px-8 py-6 bg-primary-50 border-b border-primary-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                {editingTierId ? "Edit" : "New"} Commission Tier
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Order Count Min */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Order Count Min
                  </label>
                  <input
                    type="number"
                    value={formData.orderCountMin || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderCountMin: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600"
                  />
                </div>

                {/* Order Count Max */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Order Count Max
                  </label>
                  <input
                    type="number"
                    value={formData.orderCountMax || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderCountMax: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600"
                  />
                </div>

                {/* Percentage Rate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Percentage Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.percentageRate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentageRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600"
                  />
                </div>

                {/* Fixed Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Fixed Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fixedAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fixedAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="E.g., Orders 1-10"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddTier}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
                >
                  {editingTierId ? "Update Tier" : "Add Tier"}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingTier(false);
                    setEditingTierId(null);
                    setFormData({
                      orderCountMin: 1,
                      orderCountMax: 10,
                      percentageRate: 5,
                      fixedAmount: 50,
                      description: "",
                    });
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Tiers List */}
          <div className="divide-y divide-slate-200">
            {tiers.length === 0 ? (
              <div className="px-8 py-12 text-center">
                <p className="text-slate-600">
                  No commission tiers configured yet
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Add your first tier to get started
                </p>
              </div>
            ) : (
              tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="px-8 py-6 hover:bg-slate-50 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {tier.description}
                        </h3>
                        <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
                          {tier.orderCountMin}-{tier.orderCountMax}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Percentage</p>
                          <p className="font-semibold text-slate-900">
                            {tier.percentageRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Fixed Amount</p>
                          <p className="font-semibold text-slate-900">
                            {currency} {tier.fixedAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditTier(tier)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteTier(tier.id)}
                        variant="outline"
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Example Calculation */}
        {tiers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              Example Commission Calculation
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              Commission is calculated as:{" "}
              <span className="font-semibold">
                (Invoice Amount × Percentage Rate) + Fixed Amount
              </span>
            </p>
            <div className="bg-white rounded p-4 space-y-3">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Example:</span> If a staff
                member has 8 orders and closes a {currency}1,000 invoice:
              </p>
              {tiers[0] && (
                <p className="text-sm text-slate-700 ml-4">
                  Commission = ({currency}1,000 × {tiers[0].percentageRate}%) +{" "}
                  {currency}
                  {tiers[0].fixedAmount} = {currency}
                  {(
                    1000 * (tiers[0].percentageRate / 100) +
                    tiers[0].fixedAmount
                  ).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-3 justify-end">
          <Link to={`/admin/staff/${staffId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            onClick={handleSaveCommission}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Save Commission Configuration
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
