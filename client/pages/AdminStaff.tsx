import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Shield,
  Mail,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { mockStaff, Staff, StaffRole } from "@/lib/mockData";

const roleColors: Record<StaffRole, string> = {
  super_admin: "bg-red-100 text-red-800",
  admin: "bg-purple-100 text-purple-800",
  operation_manager: "bg-blue-100 text-blue-800",
  operation: "bg-green-100 text-green-800",
  sales: "bg-orange-100 text-orange-800",
  accounting: "bg-cyan-100 text-cyan-800",
};

const roleLabels: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  operation_manager: "Operation Manager",
  operation: "Operation",
  sales: "Sales",
  accounting: "Accounting",
};

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<StaffRole | "all">("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredStaff = staff
    .filter((member) => {
      const matchesSearch =
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRoleFilter =
        filterRole === "all" || member.role === filterRole;

      const matchesDepartmentFilter =
        !filterDepartment || member.department === filterDepartment;

      const matchesStatusFilter =
        filterStatus === "all" || member.status === filterStatus;

      return matchesSearch && matchesRoleFilter && matchesDepartmentFilter && matchesStatusFilter;
    })
    .sort(
      (a, b) =>
        new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
    );

  const deleteStaff = (staffId: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      setStaff(staff.filter((member) => member.id !== staffId));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Staff Management
            </h2>
            <p className="text-slate-600">
              Manage staff members and assign roles and permissions
            </p>
          </div>
          <Link to="/admin/staff/new">
            <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Staff
            </Button>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) =>
                setFilterRole(e.target.value as StaffRole | "all")
              }
              className="px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="operation_manager">Operation Manager</option>
              <option value="operation">Operation</option>
              <option value="sales">Sales</option>
              <option value="accounting">Accounting</option>
            </select>
          </div>
          <p className="text-sm text-slate-600 mt-3">
            Showing {filteredStaff.length} of {staff.length} staff members
          </p>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600">No staff members found</p>
            </div>
          ) : (
            filteredStaff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition"
              >
                {/* Header with Role Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{member.id}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${roleColors[member.role]}`}
                  >
                    <Shield className="w-3 h-3" />
                    {roleLabels[member.role]}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Department:</span>{" "}
                    {member.department}
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        member.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Joined: {new Date(member.joinDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                  <Link to={`/admin/staff/${member.id}`} className="flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-primary-600 hover:text-primary-700 hover:bg-primary-50 justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </Link>
                  <Link to={`/admin/staff/${member.id}/edit`} className="flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-slate-600 hover:text-slate-700 hover:bg-slate-100 justify-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteStaff(member.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-slate-600 text-xs font-medium mb-1">
              Total Staff
            </p>
            <p className="text-2xl font-bold text-slate-900">{staff.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-slate-600 text-xs font-medium mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {staff.filter((s) => s.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-slate-600 text-xs font-medium mb-1">
              Admins
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {staff.filter((s) => s.role === "admin" || s.role === "super_admin").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-slate-600 text-xs font-medium mb-1">
              Departments
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {new Set(staff.map((s) => s.department)).size}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
