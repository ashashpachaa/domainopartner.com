import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, CheckCircle } from "lucide-react";
import { FormEvent, useState } from "react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Handle sign up logic here
    console.log("Sign up attempted with:", formData);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md">
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Get Started</h1>
              <p className="text-slate-600">
                Create your Domaino account and start expanding globally
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-10 h-12 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="h-12 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 h-12 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  At least 8 characters with mixed case and numbers
                </p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 h-12 border-slate-300 focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3 py-2">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 mt-1"
                  required
                />
                <label className="text-sm text-slate-600">
                  I agree to the{" "}
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Sign Up Button */}
              <Button
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white h-12 font-semibold flex items-center justify-center gap-2"
                disabled={!agreeTerms}
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Benefits */}
            <div className="mt-8 space-y-3 p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <span className="text-slate-700">14-day free trial</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <span className="text-slate-700">No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <span className="text-slate-700">Cancel anytime</span>
              </div>
            </div>

            {/* Sign In Link */}
            <p className="text-center mt-6 text-slate-600">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
