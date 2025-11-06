import { useState, useMemo } from "react";
import { Download, Filter, Calendar, TrendingUp, Users, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { mockAttendanceRecords, mockStaff } from "@/lib/mockData";

export default function AdminAttendanceReport() {
  const [dateRange, setDateRange] = useState<"today" | "week" | "month">("month");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [staffSearch, setStaffSearch] = useState<string>("");

  const filteredRecords = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    if (dateRange === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === "week") {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    return mockAttendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      const staff = mockStaff.find((s) => s.id === record.staffId);

      const matchesDateRange = recordDate >= startDate;
      const matchesDepartment = !departmentFilter || staff?.department === departmentFilter;
      const matchesSearch =
        !staffSearch ||
        staff?.firstName.toLowerCase().includes(staffSearch.toLowerCase()) ||
        staff?.lastName.toLowerCase().includes(staffSearch.toLowerCase());

      return matchesDateRange && matchesDepartment && matchesSearch;
    });
  }, [dateRange, departmentFilter, staffSearch]);

  const calculateStats = () => {
    const stats: Record<
      string,
      {
        staffName: string;
        totalHours: number;
        daysWorked: number;
        confirmations: number;
        missedConfirmations: number;
        attendanceRate: number;
        department: string;
      }
    > = {};

    filteredRecords.forEach((record) => {
      if (!stats[record.staffId]) {
        const staff = mockStaff.find((s) => s.id === record.staffId);
        stats[record.staffId] = {
          staffName: staff ? `${staff.firstName} ${staff.lastName}` : "Unknown",
          totalHours: 0,
          daysWorked: 0,
          confirmations: 0,
          missedConfirmations: 0,
          attendanceRate: 0,
          department: staff?.department || "Unknown",
        };
      }

      stats[record.staffId].totalHours += record.hoursWorked;
      stats[record.staffId].daysWorked += 1;
      stats[record.staffId].confirmations += record.checkInConfirmations;
      stats[record.staffId].missedConfirmations += record.missedConfirmations;
    });

    // Calculate attendance rates
    Object.keys(stats).forEach((staffId) => {
      const total = stats[staffId].confirmations + stats[staffId].missedConfirmations;
      stats[staffId].attendanceRate = total > 0 ? Math.round((stats[staffId].confirmations / total) * 100) : 0;
    });

    return Object.entries(stats)
      .map(([_, data]) => data)
      .sort((a, b) => b.totalHours - a.totalHours);
  };

  const stats = calculateStats();

  const globalStats = {
    totalStaff: stats.length,
    totalHours: stats.reduce((sum, s) => sum + s.totalHours, 0),
    avgAttendanceRate:
      stats.length > 0 ? Math.round(stats.reduce((sum, s) => sum + s.attendanceRate, 0) / stats.length) : 0,
    totalMissed: stats.reduce((sum, s) => sum + s.missedConfirmations, 0),
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Attendance Report
          </h1>
          <p className="text-slate-600">
            Comprehensive attendance and work tracking across all staff members
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Staff Members</p>
                <p className="text-3xl font-bold text-slate-900">{globalStats.totalStaff}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-slate-900">{globalStats.totalHours.toFixed(1)}</p>
              </div>
              <Clock className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Avg Attendance Rate</p>
                <p className={`text-3xl font-bold ${globalStats.avgAttendanceRate >= 90 ? "text-green-600" : globalStats.avgAttendanceRate >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                  {globalStats.avgAttendanceRate}%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Missed Confirmations</p>
                <p className="text-3xl font-bold text-red-600">{globalStats.totalMissed}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {Array.from(new Set(mockStaff.map((s) => s.department))).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Staff</label>
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Detailed Report Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Staff Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Department</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Days Worked</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Total Hours</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Avg Daily</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Confirmations</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Missed</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stats.map((stat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{stat.staffName}</td>
                    <td className="px-6 py-4 text-slate-700 text-sm">{stat.department}</td>
                    <td className="px-6 py-4 text-center text-slate-700">{stat.daysWorked}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-900">
                      {stat.totalHours.toFixed(1)} hrs
                    </td>
                    <td className="px-6 py-4 text-center text-slate-700">
                      {stat.daysWorked > 0 ? (stat.totalHours / stat.daysWorked).toFixed(1) : 0} hrs
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {stat.confirmations}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        {stat.missedConfirmations}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            backgroundColor:
                              stat.attendanceRate >= 90
                                ? "#dcfce7"
                                : stat.attendanceRate >= 70
                                ? "#fef3c7"
                                : "#fee2e2",
                            color:
                              stat.attendanceRate >= 90
                                ? "#166534"
                                : stat.attendanceRate >= 70
                                ? "#92400e"
                                : "#991b1b",
                          }}
                        >
                          {stat.attendanceRate}%
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {stats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-600">No attendance records found for the selected filters</p>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="mt-8 flex justify-end">
          <Button
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            onClick={() => {
              const csv = [
                ["Staff Name", "Department", "Days Worked", "Total Hours", "Avg Daily", "Confirmations", "Missed", "Rate"],
                ...stats.map((s) => [
                  s.staffName,
                  s.department,
                  s.daysWorked,
                  s.totalHours.toFixed(1),
                  (s.daysWorked > 0 ? s.totalHours / s.daysWorked : 0).toFixed(1),
                  s.confirmations,
                  s.missedConfirmations,
                  s.attendanceRate + "%",
                ]),
              ]
                .map((r) => r.join(","))
                .join("\n");

              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `attendance_report_${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
            }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
