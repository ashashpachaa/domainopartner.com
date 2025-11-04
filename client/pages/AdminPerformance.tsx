import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  mockStaff,
  mockStaffPerformances,
  Staff,
  StaffPerformance,
} from "@/lib/mockData";

export default function AdminPerformance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "name" | "rejections">(
    "score"
  );
  const [showOnlyUnderperforming, setShowOnlyUnderperforming] = useState(false);

  // Filter and sort performance data
  const filteredAndSorted = useMemo(() => {
    let data = mockStaffPerformances
      .map((perf) => {
        const staff = mockStaff.find((s) => s.id === perf.staffId);
        return { staff, performance: perf };
      })
      .filter((item) => item.staff);

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          item.staff?.firstName.toLowerCase().includes(search) ||
          item.staff?.lastName.toLowerCase().includes(search) ||
          item.staff?.email.toLowerCase().includes(search)
      );
    }

    // Underperformance filter
    if (showOnlyUnderperforming) {
      data = data.filter((item) => item.performance.currentScore < 60);
    }

    // Sort
    data.sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.performance.currentScore - a.performance.currentScore;
        case "rejections":
          return b.performance.rejections - a.performance.rejections;
        case "name":
          const aName = `${a.staff?.firstName} ${a.staff?.lastName}`;
          const bName = `${b.staff?.firstName} ${b.staff?.lastName}`;
          return aName.localeCompare(bName);
        default:
          return 0;
      }
    });

    return data;
  }, [searchTerm, sortBy, showOnlyUnderperforming]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusIcon = (score: number) => {
    if (score >= 80)
      return (
        <CheckCircle className="w-5 h-5 text-green-600" />
      );
    if (score >= 60)
      return (
        <TrendingUp className="w-5 h-5 text-blue-600" />
      );
    if (score >= 40)
      return (
        <AlertCircle className="w-5 h-5 text-amber-600" />
      );
    return (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const totalUnderperforming = mockStaffPerformances.filter(
    (p) => p.currentScore < 60
  ).length;
  const averageScore =
    mockStaffPerformances.reduce((sum, p) => sum + p.currentScore, 0) /
    mockStaffPerformances.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Performance Management
            </h1>
            <p className="text-slate-600 mt-1">
              Monitor and manage staff performance scores
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Average Score */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Average Performance
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {averageScore.toFixed(1)}/100
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Staff */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Staff
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {mockStaffPerformances.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Underperforming */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Underperforming ({"<"} 60)
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {totalUnderperforming}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "score" | "name" | "rejections")
              }
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600"
            >
              <option value="score">Sort by Score (Highest)</option>
              <option value="rejections">Sort by Rejections</option>
              <option value="name">Sort by Name</option>
            </select>

            <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={showOnlyUnderperforming}
                onChange={(e) => setShowOnlyUnderperforming(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-slate-700">
                Show Underperforming Only
              </span>
            </label>
          </div>
        </div>

        {/* Performance Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Performance Score
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Achievements
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAndSorted.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-600">
                      No staff found
                    </td>
                  </tr>
                ) : (
                  filteredAndSorted.map(({ staff, performance }) => (
                    <tr key={performance.staffId} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {staff?.firstName} {staff?.lastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {staff?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-block px-3 py-2 rounded-lg border ${getScoreColor(
                            performance.currentScore
                          )}`}
                        >
                          <p className="font-bold text-lg">
                            {performance.currentScore}/100
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{performance.earlyCompletions} early completions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span>{performance.rejections} rejections</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(performance.currentScore)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreBadge(
                              performance.currentScore
                            )}`}
                          >
                            {performance.currentScore >= 80
                              ? "Excellent"
                              : performance.currentScore >= 60
                              ? "Good"
                              : performance.currentScore >= 40
                              ? "Fair"
                              : "Poor"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link to={`/admin/staff/${performance.staffId}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
            Showing {filteredAndSorted.length} of{" "}
            {mockStaffPerformances.length} staff members
          </div>
        </div>

        {/* Performance Scale Legend */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-4">
            Performance Score Scale
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-900">80-100</p>
              <p className="text-xs text-green-700">Excellent</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900">60-79</p>
              <p className="text-xs text-blue-700">Good</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-900">40-59</p>
              <p className="text-xs text-amber-700">Fair</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-900">0-39</p>
              <p className="text-xs text-red-700">Poor</p>
            </div>
          </div>
        </div>

        {/* Performance Factors */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Performance Factors
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Order Completion Bonus</p>
                <p className="text-sm text-slate-600">
                  +10 points for completing orders before the deadline
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Rejection Penalty</p>
                <p className="text-sm text-slate-600">
                  -10 points for each review request that gets rejected
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Score Cap</p>
                <p className="text-sm text-slate-600">
                  Maximum score is capped at 100 points (cannot exceed)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Underperformance Threshold</p>
                <p className="text-sm text-slate-600">
                  Below 60 points triggers salary deduction based on staff configuration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
