import { useState, useMemo } from "react";
import { mockAttendanceRecords, mockStaff, AttendanceRecord } from "@/lib/mockData";
import { Calendar, Clock, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

export default function StaffAttendanceDashboard() {
  const currentStaffId = localStorage.getItem("currentStaffId") || "S001";
  const staff = mockStaff.find((s) => s.id === currentStaffId);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month">("month");

  const staffAttendance = useMemo(() => {
    return mockAttendanceRecords.filter((r) => r.staffId === currentStaffId);
  }, [currentStaffId]);

  const filteredRecords = useMemo(() => {
    const now = new Date();
    const records = [...staffAttendance].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (dateFilter === "today") {
      const today = now.toISOString().split("T")[0];
      return records.filter((r) => r.date === today);
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      return records.filter((r) => r.date >= weekAgo);
    } else {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      return records.filter((r) => r.date >= monthAgo);
    }
  }, [staffAttendance, dateFilter]);

  const stats = useMemo(() => {
    const totalHours = filteredRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
    const totalDays = filteredRecords.filter((r) => r.attendanceStatus === "present").length;
    const totalConfirmations = filteredRecords.reduce((sum, r) => sum + r.confirmations, 0);
    const totalMissed = filteredRecords.reduce((sum, r) => sum + r.missedConfirmations, 0);
    const lateDays = filteredRecords.filter((r) => r.isLate).length;

    return {
      totalHours: totalHours.toFixed(2),
      totalDays,
      averageHours: (totalHours / Math.max(totalDays, 1)).toFixed(2),
      totalConfirmations,
      totalMissed,
      lateDays,
    };
  }, [filteredRecords]);

  if (!staff) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-slate-600">Staff member not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Attendance</h1>
          <p className="text-slate-600 mt-2">
            Track your work hours, confirmations, and attendance history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Total Hours</p>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalHours}</p>
            <p className="text-xs text-slate-500 mt-1">hours worked</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Avg Daily</p>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.averageHours}</p>
            <p className="text-xs text-slate-500 mt-1">hours per day</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Attendance Days</p>
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalDays}</p>
            <p className="text-xs text-slate-500 mt-1">days present</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Confirmations</p>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalConfirmations}</p>
            <p className="text-xs text-slate-500 mt-1">approved checks</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Missed</p>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalMissed}</p>
            <p className="text-xs text-slate-500 mt-1">missed checks</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Late Arrivals</p>
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.lateDays}</p>
            <p className="text-xs text-slate-500 mt-1">late days</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
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

        {/* Attendance Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Login
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Logout
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                    Hours Worked
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                    Confirmations
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                    Missed
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-600">
                      No attendance records found for this period
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-700">
                          {record.loginTime
                            ? new Date(record.loginTime).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-700">
                          {record.logoutTime
                            ? new Date(record.logoutTime).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-slate-900">
                          {record.hoursWorked.toFixed(2)}h
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                          {record.confirmations}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded ${
                            record.missedConfirmations > 0
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {record.missedConfirmations}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            record.attendanceStatus === "present"
                              ? "bg-green-100 text-green-800"
                              : record.attendanceStatus === "inactive"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {record.attendanceStatus === "present" && (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Present
                            </>
                          )}
                          {record.attendanceStatus === "inactive" && (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                          {record.attendanceStatus === "absent" && "Absent"}
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
    </div>
  );
}
