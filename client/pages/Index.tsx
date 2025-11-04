import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Globe,
  Zap,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-80 h-80 bg-primary-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-80 h-80 bg-accent-200/40 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
              🌍 Setup Companies Worldwide
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent">
                Global Company Setup
              </span>
              {" "}
              Made Simple
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Establish your business in any country worldwide. Navigate regulations, handle paperwork, and launch internationally in days, not months.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-lg h-12 px-8 flex items-center gap-2 w-full sm:w-auto justify-center">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <button className="border-2 border-slate-300 hover:border-primary-300 hover:bg-primary-50 text-slate-700 text-lg h-12 px-8 rounded-lg transition-colors font-semibold">
                Watch Demo
              </button>
            </div>

            <p className="text-slate-500 text-sm">
              ✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600">
              A complete platform for international business expansion
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Multi-Country Support
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Register your business in 150+ countries with localized compliance and regulatory support.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Quick Setup Process
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Complete your company registration in as little as 48 hours with our streamlined digital process.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Legal Compliance
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Stay compliant with local laws, tax regulations, and reporting requirements in every jurisdiction.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Expert Support
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get personalized guidance from our team of international business experts and local partners.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Growth Analytics
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Track your expansion metrics and get insights to optimize your international operations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-accent-600 to-primary-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Document Management
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Securely store and manage all your legal documents, certificates, and compliance records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-lg text-slate-600">
              Get your company set up in just a few days
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex gap-6 md:gap-8 mb-12 relative">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold flex items-center justify-center text-lg">
                  1
                </div>
                <div className="w-1 h-24 bg-gradient-to-b from-primary-300 to-slate-200 mt-4 hidden md:block"></div>
              </div>
              <div className="pb-12 pt-2">
                <h3 className="text-2xl font-bold mb-2">Choose Your Country</h3>
                <p className="text-slate-600 text-lg">
                  Select where you want to establish your business and tell us about your company type.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 md:gap-8 mb-12 relative">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-white font-bold flex items-center justify-center text-lg">
                  2
                </div>
                <div className="w-1 h-24 bg-gradient-to-b from-accent-300 to-slate-200 mt-4 hidden md:block"></div>
              </div>
              <div className="pb-12 pt-2">
                <h3 className="text-2xl font-bold mb-2">Complete Questionnaire</h3>
                <p className="text-slate-600 text-lg">
                  Provide business details, shareholder information, and compliance requirements in our simple form.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 md:gap-8 mb-12 relative">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 text-white font-bold flex items-center justify-center text-lg">
                  3
                </div>
                <div className="w-1 h-24 bg-gradient-to-b from-primary-300 to-slate-200 mt-4 hidden md:block"></div>
              </div>
              <div className="pb-12 pt-2">
                <h3 className="text-2xl font-bold mb-2">We Handle the Paperwork</h3>
                <p className="text-slate-600 text-lg">
                  Our local experts file all necessary documents and handle government requirements for you.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 md:gap-8 relative">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white font-bold flex items-center justify-center text-lg">
                  4
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-2xl font-bold mb-2">Ready to Operate</h3>
                <p className="text-slate-600 text-lg">
                  Receive your registration certificate and start doing business immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Domaino?
            </h2>
            <p className="text-lg text-slate-600">
              Join thousands of companies expanding globally
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Fastest Setup</h3>
                <p className="text-slate-600">
                  Average setup time of just 48 hours compared to months with traditional methods
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Cost Effective</h3>
                <p className="text-slate-600">
                  Transparent pricing with no hidden fees or surprise charges
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Local Expertise</h3>
                <p className="text-slate-600">
                  Partner with local experts in 150+ countries who understand local regulations
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
                <p className="text-slate-600">
                  Round-the-clock customer support in multiple languages
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Fully Compliant</h3>
                <p className="text-slate-600">
                  100% compliant with local regulations and international standards
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Scalable Solution</h3>
                <p className="text-slate-600">
                  Expand to multiple countries effortlessly using our platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Go Global?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start your international expansion today with a 14-day free trial
            </p>
            <Link to="/signup">
              <Button className="bg-white text-primary-600 hover:bg-slate-100 text-lg h-12 px-8 font-bold">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">Domaino</span>
              </div>
              <p className="text-sm">Global company setup made simple</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-sm">
              © 2024 Domaino. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
