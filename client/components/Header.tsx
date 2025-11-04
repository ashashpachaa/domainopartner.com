import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Domaino
          </span>
        </Link>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-slate-600 hover:text-primary-600 transition-colors font-medium text-sm"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-slate-600 hover:text-primary-600 transition-colors font-medium text-sm"
          >
            How It Works
          </a>
          <a
            href="#benefits"
            className="text-slate-600 hover:text-primary-600 transition-colors font-medium text-sm"
          >
            Benefits
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/signin">
            <Button
              variant="ghost"
              className="text-slate-700 hover:text-primary-600 hover:bg-primary-50"
            >
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
