"use client";
import Link from "next/link";
import {
  Twitter,
  Linkedin,
  Mail,
  Instagram,
} from "lucide-react"; // Make sure `lucide-react` is installed

const Footer = () => {
  return (
    <footer className="w-full bg-sky-900 text-sky-100 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Logo & Mission */}
        <div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Medanit</h2>
          <p className="text-sm text-sky-200 leading-relaxed">
            A clinical AI platform empowering care with clarity, empathy, and predictive precision.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white transition">Home</Link></li>
            <li><Link href="/about" className="hover:text-white transition">About</Link></li>
            <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
            <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Connect</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition">
              <Twitter className="w-5 h-5 text-sky-300" />
            </a>
            <a href="#" className="hover:text-white transition">
              <Linkedin className="w-5 h-5 text-sky-300" />
            </a>
            <a href="#" className="hover:text-white transition">
              <Instagram className="w-5 h-5 text-sky-300" />
            </a>
            <a href="#" className="hover:text-white transition">
              <Mail className="w-5 h-5 text-sky-300" />
            </a>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Newsletter</h3>
          <form className="flex flex-col space-y-3">
            <input
              type="email"
              placeholder="you@example.com"
              className="px-4 py-2 rounded bg-white/10 border border-sky-600 placeholder-sky-200 text-white focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="bg-white text-sky-700 rounded py-2 px-4 font-semibold hover:bg-sky-100 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-12 text-center text-xs text-sky-300">
        &copy; {new Date().getFullYear()} Medanit. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;