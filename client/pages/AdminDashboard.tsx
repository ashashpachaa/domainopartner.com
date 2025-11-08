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
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Pause,
  Bell,
  Clock,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  mockUsers,
  User,
  UserStatus,
  mockClientRequests,
  ClientRequestStatus,
} from "@/lib/mockData";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "client-requests">(
    "users",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<UserStatus | "all">("all");
  const [clientRequests, setClientRequests] = useState(mockClientRequests);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientFilterStatus, setClientFilterStatus] = useState<
    ClientRequestStatus | "all"
  >("all");
  const [notificationDismissed, setNotificationDismissed] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  // Load users from both mock data and localStorage
  const users = useMemo(() => {
    const allUsers = [...mockUsers];

    // Load all users from localStorage (they're saved with keys like "user_*")
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('user_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          // Check if this user already exists in mockUsers
          if (!allUsers.find(u => u.id === userData.id)) {
            allUsers.push(userData);
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
    }

    return allUsers;
  }, []);

  // Load client requests from both mock data and localStorage
  useEffect(() => {
    const allRequests = [...mockClientRequests];
    const storedRequests = JSON.parse(
      localStorage.getItem("mockClientRequests") || "[]",
    );

    // Merge and remove duplicates
    const merged = [...allRequests];
    for (const request of storedRequests) {
      if (!merged.find((r) => r.id === request.id)) {
        merged.push(request);
      }
    }

    setClientRequests(merged);
  }, []);

  // Show notification for pending client requests
  useEffect(() => {
    const pendingCount = clientRequests.filter(
      (r) => r.status === "pending_approval",
    ).length;
    if (pendingCount > 0 && !notificationDismissed && !showNotificationToast) {
      setShowNotificationToast(true);
      toast.custom((t) => (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-blue-900">
                New Client Signup{pendingCount > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {pendingCount} client request{pendingCount > 1 ? "s" : ""}{" "}
                pending approval
              </p>
            </div>
            <button
              onClick={() => {
                setNotificationDismissed(true);
                toast.dismiss(t);
              }}
              className="text-blue-600 hover:text-blue-700 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ));
    }
  }, [notificationDismissed, showNotificationToast, clientRequests]);

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || user.status === filterStatus;

      return matchesSearch && matchesFilter;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const filteredClientRequests = clientRequests
    .filter((request) => {
      const matchesSearch =
        request.firstName
          .toLowerCase()
          .includes(clientSearchTerm.toLowerCase()) ||
        request.lastName
          .toLowerCase()
          .includes(clientSearchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        request.companyName
          .toLowerCase()
          .includes(clientSearchTerm.toLowerCase());

      const matchesFilter =
        clientFilterStatus === "all" || request.status === clientFilterStatus;

      return matchesSearch && matchesFilter;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const pendingClientCount = clientRequests.filter(
    (r) => r.status === "pending_approval",
  ).length;

  const updateUserStatus = (userId: string, newStatus: UserStatus) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user,
      ),
    );
  };

  const deleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "suspended":
        return <Pause className="w-4 h-4" />;
      case "inactive":
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getClientRequestStatusColor = (status: ClientRequestStatus) => {
    switch (status) {
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getClientRequestStatusIcon = (status: ClientRequestStatus) => {
    switch (status) {
      case "pending_approval":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle2 className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              User Management
            </h2>
            <p className="text-slate-600">
              Manage user accounts, subscriptions, and access
            </p>
          </div>
          {activeTab === "users" && (
            <Link to="/admin/users/new">
              <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add User
              </Button>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "users"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("client-requests")}
            className={`px-4 py-3 font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "client-requests"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Client Requests
            {pendingClientCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                {pendingClientCount}
              </span>
            )}
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            {/* Search & Filter */}
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as UserStatus | "all")
                  }
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <p className="text-sm text-slate-600 mt-3">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Plan
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center">
                          <p className="text-slate-600 text-sm">
                            No users found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-slate-600 mt-1">
                                ID: {user.id}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-900">
                            {user.companyName}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {user.city}, {user.country}
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                              {user.subscriptionPlan}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  user.status,
                                )}`}
                              >
                                {getStatusIcon(user.status)}
                                {user.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Link to={`/admin/users/${user.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Link to={`/admin/users/${user.id}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </Link>

                              {/* Status Actions */}
                              {user.status === "pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateUserStatus(user.id, "active")
                                    }
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="Approve"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateUserStatus(user.id, "inactive")
                                    }
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Reject"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}

                              {user.status === "active" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    updateUserStatus(user.id, "suspended")
                                  }
                                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                  title="Suspend"
                                >
                                  <Pause className="w-4 h-4" />
                                </Button>
                              )}

                              {user.status === "suspended" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    updateUserStatus(user.id, "active")
                                  }
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Reactivate"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteUser(user.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <p className="text-slate-600 text-sm font-medium mb-2">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {users.length}
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <p className="text-slate-600 text-sm font-medium mb-2">
                  Active
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter((u) => u.status === "active").length}
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <p className="text-slate-600 text-sm font-medium mb-2">
                  Pending Approval
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {users.filter((u) => u.status === "pending").length}
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <p className="text-slate-600 text-sm font-medium mb-2">
                  Suspended
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {users.filter((u) => u.status === "suspended").length}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Client Requests Tab */}
        {activeTab === "client-requests" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Pending Approval</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                      {
                        clientRequests.filter(
                          (r) => r.status === "pending_approval",
                        ).length
                      }
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Approved</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {
                        clientRequests.filter((r) => r.status === "approved")
                          .length
                      }
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Rejected</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {
                        clientRequests.filter((r) => r.status === "rejected")
                          .length
                      }
                    </p>
                  </div>
                  <X className="w-8 h-8 text-red-600 opacity-50" />
                </div>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, or company..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <select
                  value={clientFilterStatus}
                  onChange={(e) =>
                    setClientFilterStatus(
                      e.target.value as ClientRequestStatus | "all",
                    )
                  }
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <p className="text-sm text-slate-600 mt-3">
                Showing {filteredClientRequests.length} of{" "}
                {clientRequests.length} requests
              </p>
            </div>

            {/* Client Requests Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Plan
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Applied
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredClientRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center">
                          <p className="text-slate-600 text-sm">
                            No client requests found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredClientRequests.map((request) => (
                        <tr
                          key={request.id}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">
                              {request.firstName} {request.lastName}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {request.companyName}
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                            {request.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                              {request.subscriptionPlan}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getClientRequestStatusColor(
                                  request.status,
                                )}`}
                              >
                                {getClientRequestStatusIcon(request.status)}
                                {request.status === "pending_approval"
                                  ? "Pending"
                                  : request.status === "approved"
                                    ? "Approved"
                                    : "Rejected"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link to={`/admin/client-requests/${request.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
