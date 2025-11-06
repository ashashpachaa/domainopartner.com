import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { mockStaff, Staff, StaffRole, WorkflowStage } from "@/lib/mockData";

const staffRoles: { value: StaffRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "operation_manager", label: "Operation Manager" },
  { value: "operation", label: "Operation" },
  { value: "sales", label: "Sales" },
  { value: "accounting", label: "Accounting" },
];

const departments = [
  "Management",
  "Operations",
  "Sales",
  "Accounting",
  "Support",
];

const workflowStages: { value: WorkflowStage; label: string; description: string }[] = [
  { value: "sales", label: "Sales Review", description: "Review and approve sales orders" },
  { value: "operation", label: "Operation Process", description: "Handle order operations" },
  { value: "manager", label: "Manager Review", description: "Review and approve operations" },
  { value: "client", label: "Client Acceptance", description: "Handle client communications" },
  { value: "shipping", label: "Shipping & Complete", description: "Manage shipping and completion" },
];

export default function AdminEditStaff() {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  const isNew = staffId === "new";

  const existingMember = !isNew ? mockStaff.find((s) => s.id === staffId) : null;

  const [formData, setFormData] = useState<Partial<Staff>>(
    existingMember || {
      id: `S${Date.now()}`,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "sales" as StaffRole,
      department: "Operations",
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString(),
      workflowPermissions: workflowStages.map((stage) => ({
        stage: stage.value,
        label: stage.label,
        description: stage.description,
        canAccess: false,
      })),
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkflowPermissionChange = (stage: WorkflowStage, canAccess: boolean) => {
    setFormData((prev) => ({
      ...prev,
      workflowPermissions: prev.workflowPermissions?.map((perm) =>
        perm.stage === stage ? { ...perm, canAccess } : perm
      ),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a database
    navigate("/admin/staff");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to={isNew ? "/admin/staff" : `/admin/staff/${staffId}`}>
          <Button
            variant="ghost"
            className="gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">
            {isNew ? "Add New Staff Member" : "Edit Staff Member"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    First Name *
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={handleChange}
                    className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Last Name *
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={handleChange}
                    className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Phone *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role & Department */}
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Role & Department
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role || "sales"}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    {staffRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Select the primary role for this staff member
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department || "Operations"}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Account Status
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status || "active"}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Inactive members cannot access the system
                </p>
              </div>
            </div>

            {/* Workflow Permissions */}
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Workflow Permissions
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Select which workflow stages this staff member is responsible for:
              </p>
              <div className="space-y-3">
                {workflowStages.map((stage) => {
                  const permission = formData.workflowPermissions?.find(
                    (p) => p.stage === stage.value
                  );
                  return (
                    <label
                      key={stage.value}
                      className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          checked={permission?.canAccess || false}
                          onChange={(e) =>
                            handleWorkflowPermissionChange(stage.value, e.target.checked)
                          }
                          className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{stage.label}</p>
                        <p className="text-sm text-slate-600">{stage.description}</p>
                      </div>
                      {permission?.canAccess && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Role Description */}
            <div className="pt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Role Information:</span> The{" "}
                <strong>
                  {staffRoles.find((r) => r.value === formData.role)?.label}
                </strong>{" "}
                role provides access to specific features based on their
                responsibilities. Permissions are assigned automatically based on
                the role.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-200 flex gap-3 justify-end">
              <Link to={isNew ? "/admin/staff" : `/admin/staff/${staffId}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white gap-2">
                <Save className="w-4 h-4" />
                {isNew ? "Create Staff" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
