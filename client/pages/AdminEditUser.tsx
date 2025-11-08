import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useState, useMemo, useEffect } from "react";
import { mockUsers, mockStaff, User, UserStatus } from "@/lib/mockData";
import { toast } from "sonner";

export default function AdminEditUser() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const isNew = userId === "new";

  // Load existing user from both mockUsers and localStorage
  const existingUser = useMemo(() => {
    if (isNew) return null;

    // First try to find in mockUsers
    const mockUser = mockUsers.find((u) => u.id === userId);

    // Then check localStorage for updated version
    const localStorageUser = localStorage.getItem(`user_${userId}`);
    if (localStorageUser) {
      try {
        return JSON.parse(localStorageUser);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }

    return mockUser;
  }, [userId, isNew]);

  // Load all staff from both mockStaff and localStorage
  const allStaff = useMemo(() => {
    const staffMap = new Map<string, any>();

    // First add all mock staff
    mockStaff.forEach((staff) => staffMap.set(staff.id, staff));

    // Then merge with localStorage staff (overwrites mock if exists)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("staff_")) {
        try {
          const staffData = JSON.parse(localStorage.getItem(key) || "{}");
          staffMap.set(staffData.id, staffData);
        } catch (e) {
          console.error("Error parsing staff from localStorage:", e);
        }
      }
    }

    return Array.from(staffMap.values()).sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(
        `${b.firstName} ${b.lastName}`,
      ),
    );
  }, []);

  const [formData, setFormData] = useState<Partial<User>>(
    existingUser || {
      id: Date.now().toString(),
      firstName: "",
      lastName: "",
      companyName: "",
      country: "",
      city: "",
      whatsappNumber: "",
      email: "",
      website: "",
      status: "pending" as UserStatus,
      subscriptionPlan: "free",
      subscriptionStatus: "active",
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString(),
      assignedToStaffId: undefined,
    },
  );

  // Update formData when existingUser changes
  useEffect(() => {
    if (existingUser) {
      setFormData(existingUser);
    }
  }, [existingUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if email already exists (for new users only)
    if (isNew && mockUsers.some((u) => u.email === formData.email)) {
      toast.error("Email already exists");
      return;
    }

    try {
      if (isNew) {
        // Generate a unique ID for the new user
        const userId = `U${Date.now()}`;

        // Create new user
        const newUser: User = {
          id: userId,
          firstName: formData.firstName || "",
          lastName: formData.lastName || "",
          email: formData.email || "",
          companyName: formData.companyName || "",
          country: formData.country || "",
          city: formData.city || "",
          whatsappNumber: formData.whatsappNumber || "",
          website: formData.website || "",
          status: formData.status || "active",
          subscriptionPlan: formData.subscriptionPlan || "free",
          subscriptionStatus: formData.subscriptionStatus || "active",
          createdAt: new Date().toISOString().split("T")[0],
          lastLogin: new Date().toISOString(),
          assignedToStaffId: formData.assignedToStaffId,
        };

        mockUsers.push(newUser);
        localStorage.setItem(`user_${newUser.id}`, JSON.stringify(newUser));
        localStorage.setItem("mockUsers", JSON.stringify(mockUsers));

        toast.success(
          `User ${newUser.firstName} ${newUser.lastName} created successfully!`,
        );
        navigate(`/admin/view-user/${newUser.id}`);
      } else {
        // Update existing user
        const updatedUser: User = {
          ...existingUser,
          ...formData,
        } as User;

        const userIndex = mockUsers.findIndex((u) => u.id === userId);
        if (userIndex >= 0) {
          mockUsers[userIndex] = updatedUser;
          localStorage.setItem(
            `user_${updatedUser.id}`,
            JSON.stringify(updatedUser),
          );
          localStorage.setItem("mockUsers", JSON.stringify(mockUsers));
        }

        toast.success("User updated successfully!");
        navigate(`/admin/users/${userId}`);
      }
    } catch (error: any) {
      toast.error("Error saving user: " + error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to={isNew ? "/admin/dashboard" : `/admin/users/${userId}`}>
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
            {isNew ? "Add New User" : "Edit User"}
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
                    WhatsApp Number *
                  </label>
                  <Input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber || ""}
                    onChange={handleChange}
                    className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Company Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    name="companyName"
                    value={formData.companyName || ""}
                    onChange={handleChange}
                    className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Website
                  </label>
                  <Input
                    type="url"
                    name="website"
                    value={formData.website || ""}
                    onChange={handleChange}
                    className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Country *
                  </label>
                  <Input
                    type="text"
                    name="country"
                    value={formData.country || ""}
                    onChange={handleChange}
                    className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    City *
                  </label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    className="border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Account Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status || "pending"}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Subscription Plan *
                  </label>
                  <select
                    name="subscriptionPlan"
                    value={formData.subscriptionPlan || "free"}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Subscription Status *
                  </label>
                  <select
                    name="subscriptionStatus"
                    value={formData.subscriptionStatus || "active"}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Staff Assignment */}
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Staff Assignment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Assign to Staff Member
                  </label>
                  <select
                    name="assignedToStaffId"
                    value={formData.assignedToStaffId || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                  >
                    <option value="">-- Select Staff Member --</option>
                    {allStaff.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.firstName} {staff.lastName} (
                        {staff.role.replace(/_/g, " ")})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Assign this user to a staff member for account management
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-200 flex gap-3 justify-end">
              <Link to={isNew ? "/admin/dashboard" : `/admin/users/${userId}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white gap-2">
                <Save className="w-4 h-4" />
                {isNew ? "Create User" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
