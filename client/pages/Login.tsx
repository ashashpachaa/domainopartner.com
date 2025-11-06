import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, ArrowRight, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { mockUsers, mockClientRequests } from "@/lib/mockData";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      try {
        // Check if user exists in mockUsers
        const user = mockUsers.find((u) => u.email === email);

        if (!user) {
          // Check if there's a pending client request
          const clientRequest = mockClientRequests.find((r) => r.email === email);

          if (clientRequest) {
            if (clientRequest.status === "pending_approval") {
              setError(
                "⏳ Your account request is pending admin approval. You will be notified once approved."
              );
              toast.info("Your signup is awaiting admin approval");
            } else if (clientRequest.status === "rejected") {
              setError(
                `❌ Your account request was rejected. Reason: ${clientRequest.rejectionReason || "Not provided"}`
              );
              toast.error("Your signup was rejected");
            } else {
              setError("Account not found. Please sign up.");
            }
          } else {
            setError("No account found. Please sign up first.");
          }
          setIsLoading(false);
          return;
        }

        // Check user status
        if (user.status === "suspended") {
          setError("Your account has been suspended. Please contact support.");
          setIsLoading(false);
          return;
        }

        if (user.status === "inactive") {
          setError("Your account is inactive. Please contact support.");
          setIsLoading(false);
          return;
        }

        // In a real app, would verify password here
        // For demo, accept any password for existing users
        if (password.length < 6) {
          setError("Invalid credentials");
          setIsLoading(false);
          return;
        }

        // Login successful
        localStorage.setItem("currentUser", JSON.stringify(user));
        toast.success(`Welcome back, ${user.firstName}!`);
        navigate("/client/dashboard");
      } catch (error: any) {
        setError("Login failed. Please try again.");
        console.error("Login error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-blue-100 mb-4">
              <LogIn className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Client Portal
            </h1>
            <p className="text-slate-600">
              Login to manage your orders
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-lg border ${
              error.includes("❌") || error.includes("rejected")
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"
            }`}>
              <p className={`text-sm font-medium ${
                error.includes("❌") || error.includes("rejected")
                  ? "text-red-700"
                  : "text-yellow-700"
              }`}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 font-semibold flex items-center justify-center gap-2"
            >
              {isLoading ? "Logging in..." : <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 font-medium mb-2">📝 Demo Credentials:</p>
            <div className="text-xs text-slate-600 space-y-1">
              <p><span className="font-medium">Email:</span> client@domaino.com</p>
              <p><span className="font-medium">Password:</span> any 6+ characters</p>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link to="/admin/login" className="text-slate-400 hover:text-slate-600 text-sm">
            Admin Login ���
          </Link>
        </div>
      </div>
    </div>
  );
}
