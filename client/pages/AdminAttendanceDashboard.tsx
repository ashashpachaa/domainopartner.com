import { useState, useMemo } from "react";
import { mockAttendanceRecords, mockStaff } from "@/lib/mockData";
import AdminLayout from "@/components/AdminLayout";
import { Calendar, AlertCircle, CheckCircle2, TrendingDown, Users } from "lucide-react";

export default function AdminAttendanceDashboard() {
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "custom">("month");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const departments = Array.from(new Set(mockStaff.map((s) => s.department)));

  const filteredRecords = useMemo(() => {
    const now = new Date();
    let records = [...mockAttendanceRecords];

    // Date filter
    if (dateFilter === "today") {
      const today = now.toISOString().split("T")[0];
      records = records.filter((r) => r.date === today);
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      records = records.filter((r) => r.date >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      records = records.filter((r) => r.date >= monthAgo);
    } else if (dateFilter === "custom") {
      if (customStartDate) {
        records = records.filter((r) => r.date >= customStartDate);
      }
      if (customEndDate) {
        records = records.filter((r) => r.date <= customEndDate);
      }
    }

    // Department filter
    if (departmentFilter !== "all") {
      const deptStaffIds = mockStaff
        .filter((s) => s.department === departmentFilter)
        .map((s) => s.id);
      records = records.filter((r) => deptStaffIds.includes(r.staffId));
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dateFilter, departmentFilter]);

  const stats = useMemo(() => {
    const totalHours = filteredRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
    const presentDays = filteredRecords.filter((r) => r.attendanceStatus === "present").length;
    const inactiveDays = filteredRecords.filter((r) => r.attendanceStatus === "inactive").length;
    const totalConfirmations = filteredRecords.reduce((sum, r) => sum + r.confirmations, 0);
    const totalMissed = filteredRecords.reduce((sum, r) => sum + r.missedConfirmations, 0);
    const lateDays = filteredRecords.filter((r) => r.isLate).length;

    return {
      totalHours: totalHours.toFixed(2),
      presentDays,
      inactiveDays,
      totalConfirmations,
      totalMissed,
      lateDays,
      attendanceRate:
        presentDays + inactiveDays > 0
          ? (
              ((presentDays) / (presentDays + inactiveDays)) *
              100
            ).toFixed(1)
          : "0",
    };
  }, [filteredRecords]);

  const staffStats = useMemo(() => {
    return mockStaff.map((staff) => {
      const staffRecords = filteredRecords.filter((r) => r.staffId === staff.id);
      const totalHours = staffRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
      const presentDays = staffRecords.filter((r) => r.attendanceStatus === "present").length;
      const inactiveDays = staffRecords.filter((r) => r.attendanceStatus === "inactive").length;
      const missedConfirmations = staffRecords.reduce((sum, r) => sum + r.missedConfirmations, 0);
      const lateDays = staffRecords.filter((r) => r.isLate).length;

      return {
        ...staff,
        totalHours: totalHours.toFixed(2),
        presentDays,
        inactiveDays,
        missedConfirmations,
        lateDays,
        attendanceRate:
          presentDays + inactiveDays > 0
            ? (((presentDays) / (presentDays + inactiveDays)) * 100).toFixed(1)
            : "N/A",
      };
    });
  }, [filteredRecords]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-slate-600 mt-2">Monitor staff attendance, work hours, and check-ins</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Total Hours</p>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalHours}</p>
            <p className="text-xs text-slate-500 mt-1">hours worked</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Attendance Rate</p>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.attendanceRate}%</p>
            <p className="text-xs text-slate-500 mt-1">present days</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Present Days</p>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.presentDays}</p>
            <p className="text-xs text-slate-500 mt-1">staff days</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Inactive Days</p>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.inactiveDays}</p>
            <p className="text-xs text-slate-500 mt-1">marked inactive</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Confirmations</p>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalConfirmations}</p>
            <p className="text-xs text-slate-500 mt-1">check-ins</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Missed Checks</p>
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalMissed}</p>
            <p className="text-xs text-slate-500 mt-1">missed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Period</label>
              <div className="flex gap-2">
                {(["today", "week", "month"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setDateFilter(period)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      dateFilter === period
                        ? "bg-primary-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {period === "today"
                      ? "Today"
                      : period === "week"
                      ? "This Week"
                      : "This Month"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Staff Attendance Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Department
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                    Present Days
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                    Inactive Days
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                    Attendance Rate
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                    Missed Checks
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                    Late Days
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffStats.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-600">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  staffStats.map((staff) => (
                    <tr
                      key={staff.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {staff.firstName} {staff.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{staff.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-700">{staff.department}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-slate-900">{staff.totalHours}h</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                          {staff.presentDays}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded ${
                            staff.inactiveDays > 0
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {staff.inactiveDays}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-medium ${
                            parseFloat(staff.attendanceRate as string) >= 90
                              ? "text-green-600"
                              : parseFloat(staff.attendanceRate as string) >= 70
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {staff.attendanceRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded ${
                            staff.missedConfirmations > 0
                              ? "bg-orange-100 text-orange-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {staff.missedConfirmations}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded ${
                            staff.lateDays > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {staff.lateDays}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
