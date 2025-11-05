import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { mockClientRequests, mockUsers } from "@/lib/mockData";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setRejectionReason("");

    // Check if the email exists in client requests with pending approval
    const clientRequest = mockClientRequests.find((r) => r.email === email);

    if (clientRequest && clientRequest.status === "pending_approval") {
      setError("Your account is pending admin approval");
      return;
    }

    if (clientRequest && clientRequest.status === "rejected") {
      setError("Your signup request was rejected.");
      setRejectionReason(clientRequest.rejectionReason || "No reason provided");
      return;
    }

    // Check if user exists and is approved
    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      setError("Invalid email or password");
      return;
    }

    // Handle sign in logic here
    console.log("Sign in attempted with:", { email, password });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md">
          {/* Left side - Sign In Form */}
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
              <p className="text-slate-600">
                Sign in to your Domaino account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
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
                    className="pl-10 h-12 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
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
                    className="pl-10 h-12 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-primary-600"
                  />
                  <span className="text-slate-600">Remember me</span>
                </label>
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <Button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white h-12 font-semibold flex items-center justify-center gap-2">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* Social Sign In */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 border-slate-300 hover:bg-slate-50"
              >
                Google
              </Button>
              <Button
                variant="outline"
                className="h-12 border-slate-300 hover:bg-slate-50"
              >
                Microsoft
              </Button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center mt-6 text-slate-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
