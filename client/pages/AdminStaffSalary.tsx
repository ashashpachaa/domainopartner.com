import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  mockStaff,
  mockStaffSalaries,
  mockStaffBonuses,
  Staff,
  StaffSalary,
  StaffBonus,
} from "@/lib/mockData";

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CHF: "CHF",
  CAD: "C$",
  AUD: "A$",
  SGD: "S$",
  HKD: "HK$",
  CNY: "¥",
  INR: "₹",
  IDR: "Rp",
  MYR: "RM",
  PHP: "₱",
  THB: "฿",
  VND: "₫",
  KRW: "₩",
  TWD: "NT$",
  PKR: "₨",
  BDT: "৳",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  CZK: "Kč",
  HUF: "Ft",
  RON: "lei",
  BGN: "лв",
  HRK: "kn",
  RUB: "₽",
  TRY: "₺",
  UAH: "₴",
  BRL: "R$",
  MXN: "Mex$",
  ARS: "$",
  CLP: "$",
  COP: "$",
  PEN: "S/",
  UYU: "$U",
  VEF: "Bs",
  AED: "د.إ",
  SAR: "﷼",
  KWD: "د.ك",
  BHD: ".د.ب",
  OMR: "ر.ع.",
  JOD: "د.ا",
  LBP: "ل.ل",
  EGP: "£",
  ZAR: "R",
  NGN: "₦",
  GHS: "₵",
  KES: "KSh",
  TZS: "TSh",
  UGX: "USh",
  ETB: "Br",
  MAD: "د.م.",
  TND: "د.ت",
  NZD: "NZ$",
  MOP: "P",
  HNL: "L",
  GTQ: "Q",
  CRC: "₡",
  PYG: "₲",
  BOB: "Bs.",
  ISK: "kr",
  NIS: "₪",
};

export default function AdminStaffSalary() {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();

  const staff = mockStaff.find((s) => s.id === staffId);
  const salary = mockStaffSalaries.find((s) => s.staffId === staffId);

  const [formData, setFormData] = useState<StaffSalary>(
    salary || {
      staffId: staffId || "",
      baseSalary: 0,
      currency: "USD",
      underperformanceDeduction: 0,
      underperformanceThreshold: 60,
      rejectionFee: 50,
      totalRejectionFees: 0,
      lastSalaryDate: new Date().toISOString().split("T")[0],
      nextSalaryDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }
  );

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

  const handleSave = () => {
    navigate(`/admin/staff/${staffId}`);
  };

  const currencySymbol = currencySymbols[formData.currency] || formData.currency;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to={`/admin/staff/${staffId}`}>
          <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Staff Detail
          </Button>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Salary Configuration
          </h1>
          <p className="text-slate-600">
            Configure salary and underperformance deduction for{" "}
            <span className="font-semibold">
              {staff.firstName} {staff.lastName}
            </span>
          </p>
        </div>

        {/* Salary Configuration Form */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 space-y-8">
          {/* Base Salary Section */}
          <div className="border-b border-slate-200 pb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Base Salary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Base Salary Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Base Salary Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        baseSalary: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                  <span className="absolute right-4 top-2.5 text-slate-600 font-semibold">
                    {currencySymbol}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Monthly salary amount for this staff member
                </p>
              </div>

              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Salary Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currency: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                >
                  <optgroup label="Major Currencies">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CHF">CHF - Swiss Franc</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </optgroup>

                  <optgroup label="Asian Currencies">
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="HKD">HKD - Hong Kong Dollar</option>
                    <option value="CNY">CNY - Chinese Yuan</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="IDR">IDR - Indonesian Rupiah</option>
                    <option value="MYR">MYR - Malaysian Ringgit</option>
                    <option value="PHP">PHP - Philippine Peso</option>
                    <option value="THB">THB - Thai Baht</option>
                  </optgroup>

                  <optgroup label="European Currencies">
                    <option value="SEK">SEK - Swedish Krona</option>
                    <option value="NOK">NOK - Norwegian Krone</option>
                    <option value="DKK">DKK - Danish Krone</option>
                    <option value="PLN">PLN - Polish Zloty</option>
                    <option value="CZK">CZK - Czech Koruna</option>
                    <option value="HUF">HUF - Hungarian Forint</option>
                    <option value="RON">RON - Romanian Leu</option>
                  </optgroup>

                  <optgroup label="Americas Currencies">
                    <option value="BRL">BRL - Brazilian Real</option>
                    <option value="MXN">MXN - Mexican Peso</option>
                    <option value="ARS">ARS - Argentine Peso</option>
                    <option value="CLP">CLP - Chilean Peso</option>
                  </optgroup>

                  <optgroup label="Middle East & Africa">
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="EGP">EGP - Egyptian Pound</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                  </optgroup>

                  <optgroup label="Other Currencies">
                    <option value="NZD">NZD - New Zealand Dollar</option>
                    <option value="ISK">ISK - Icelandic Króna</option>
                    <option value="NIS">NIS - Israeli New Sheqel</option>
                  </optgroup>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Currency for salary payments
                </p>
              </div>
            </div>
          </div>

          {/* Underperformance Deduction Section */}
          <div className="border-b border-slate-200 pb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Underperformance Deduction
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deduction Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Deduction Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.underperformanceDeduction}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        underperformanceDeduction: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                  <span className="absolute right-4 top-2.5 text-slate-600 font-semibold">
                    {currencySymbol}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Amount to deduct from salary when performance is below threshold
                </p>
              </div>

              {/* Threshold Score */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Performance Threshold
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.underperformanceThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        underperformanceThreshold: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                  <span className="absolute right-4 top-2.5 text-slate-600 font-semibold">
                    /100
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Performance score below this threshold triggers deduction
                </p>
              </div>
            </div>

            {/* Example Calculation */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">Example:</span> If performance score falls below{" "}
                <span className="font-semibold">{formData.underperformanceThreshold}</span>, a deduction of{" "}
                <span className="font-semibold">
                  {currencySymbol}{formData.underperformanceDeduction.toLocaleString()}
                </span>{" "}
                will be applied to the monthly salary.
              </p>
            </div>
          </div>

          {/* Rejection Fee Section */}
          <div className="border-b border-slate-200 pb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Rejection Fee Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rejection Fee Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Rejection Fee Per Order
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.rejectionFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rejectionFee: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    min="0"
                    step="5"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                  <span className="absolute right-4 top-2.5 text-slate-600 font-semibold">
                    {currencySymbol}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Amount deducted from salary for each rejected order review
                </p>
              </div>

              {/* Total Rejection Fees (Display Only) */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Total Rejection Fees (Current Period)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={`${currencySymbol}${formData.totalRejectionFees.toLocaleString()}`}
                    disabled
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Cumulative rejection fees deducted this period
                </p>
              </div>
            </div>

            {/* Rejection Fee Info */}
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-900">
                <span className="font-semibold">How it works:</span> When an order review is rejected by any role, a fee of{" "}
                <span className="font-semibold">
                  {currencySymbol}{formData.rejectionFee.toLocaleString()}
                </span>{" "}
                is deducted from the staff member's salary. Multiple rejections result in cumulative deductions.
                Additionally, <span className="font-semibold">-10 performance points</span> are also applied per rejection.
              </p>
            </div>
          </div>

          {/* Salary Dates */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Salary Payment Dates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Last Salary Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Last Salary Payment Date
                </label>
                <input
                  type="date"
                  value={formData.lastSalaryDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lastSalaryDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Most recent salary payment date
                </p>
              </div>

              {/* Next Salary Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Next Salary Payment Date
                </label>
                <input
                  type="date"
                  value={formData.nextSalaryDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nextSalaryDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Upcoming salary payment date
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-green-900 mb-4">
            Salary Configuration Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-green-700 uppercase font-semibold">
                Monthly Salary
              </p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {currencySymbol}
                {formData.baseSalary.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-green-700 uppercase font-semibold">
                Underperformance Deduction
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                -{currencySymbol}
                {formData.underperformanceDeduction.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-green-700 uppercase font-semibold">
                Per Rejection Fee
              </p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                -{currencySymbol}
                {formData.rejectionFee.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-green-700 uppercase font-semibold">
                Total Rejections Deducted
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                -{currencySymbol}
                {formData.totalRejectionFees.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Net Salary Calculation */}
          <div className="mt-6 pt-6 border-t border-green-300">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-slate-900">
                Estimated Net Salary (before underperformance deduction):
              </p>
              <p className="text-3xl font-bold text-green-600">
                {currencySymbol}
                {(formData.baseSalary - formData.totalRejectionFees).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Link to={`/admin/staff/${staffId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Save Salary Configuration
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
