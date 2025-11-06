import { useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, Building } from "lucide-react";

export default function ClientProfile() {
  const [currentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser") || "{}"),
  );
  const [isEditing, setIsEditing] = useState(false);

  return (
    <ClientLayout>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Account Settings
          </h1>
          <p className="text-slate-600 mt-2">
            Manage your profile and account information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Personal Information
            </h2>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "destructive" : "default"}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  First Name
                </label>
                {isEditing ? (
                  <Input
                    value={currentUser.firstName}
                    disabled
                    className="bg-slate-50"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">
                    {currentUser.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <Input
                    value={currentUser.lastName}
                    disabled
                    className="bg-slate-50"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">
                    {currentUser.lastName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                {isEditing ? (
                  <Input
                    value={currentUser.email}
                    disabled
                    className="bg-slate-50"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">
                    {currentUser.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <Input
                    value={currentUser.phone || ""}
                    disabled
                    className="bg-slate-50"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">
                    {currentUser.phone || "Not provided"}
                  </p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  WhatsApp
                </label>
                {isEditing ? (
                  <Input
                    value={currentUser.whatsappNumber || ""}
                    disabled
                    className="bg-slate-50"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">
                    {currentUser.whatsappNumber || "Not provided"}
                  </p>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  Company Name
                </label>
                {isEditing ? (
                  <Input
                    value={currentUser.companyName || ""}
                    disabled
                    className="bg-slate-50"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">
                    {currentUser.companyName || "Not provided"}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Country
                </label>
                {isEditing ? (
                  <Input
                    value={currentUser.country || ""}
                    disabled
                    className="bg-slate-50"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">
                    {currentUser.country || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-4">
                  Contact our support team to update your account information.
                </p>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Close Editor
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Account Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-600">Status</p>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-slate-600">Member Since</p>
              <p className="font-medium text-slate-900">
                {currentUser.joinDate
                  ? new Date(currentUser.joinDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700 mb-4">
            If you need to update your information or have any questions, please
            contact our support team.
          </p>
          <Button variant="outline" className="border-blue-300 text-blue-700">
            Contact Support
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
}
