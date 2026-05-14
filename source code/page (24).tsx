"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Input from "../components/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingModal from "../../components/LoadingModal";
import { useAuth } from "../../context/AuthContext";

const roles = ["staff", "admin"];

const SignupPage = () => {
  const router = useRouter();
  const { fetchUserData } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    role: "staff",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    setError(null);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // Sends/receives HTTP-only cookies
        body: JSON.stringify(formData),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const html = await res.text();
        console.error("Non-JSON response from /auth/signup:", html);
        throw new Error("Unexpected server response");
      }

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Signup failed");
      }

      console.log("✅ Signup successful, cookie set");

      // Update AuthContext user
      await fetchUserData();

      // Redirect based on role
      switch (formData.role) {
        case "admin":
          router.push("/dashboard/admin");
          break;
        case "staff":
          router.push("/dashboard/staff");
          break;
        default:
          router.push("/auth/login");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4 py-12"
    >
      {/* Decorative Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-1/3 w-64 h-64 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Main Form Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 80, damping: 20 }}
        className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-sky-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 text-center border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="text-gray-600 mt-2">Join MedAnit to manage patients and run AI-powered diagnoses</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-center text-sm font-medium bg-red-50 border border-red-200 px-4 py-3 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            {/* Row 1: Full Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(v) => handleChange("fullName", v)}
                placeholder="e.g. John Doe"
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(v) => handleChange("phone", v)}
                placeholder="e.g. +1234567890"
              />
            </div>

            {/* Row 2: Address & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Address"
                value={formData.address}
                onChange={(v) => handleChange("address", v)}
                placeholder="e.g. 123 Main St, City"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(v) => handleChange("email", v)}
                placeholder="e.g. john@example.com"
              />
            </div>

            {/* Row 3: Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(v) => handleChange("password", v)}
                placeholder="••••••••"
              />
              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(v) => handleChange("confirmPassword", v)}
                placeholder="••••••••"
              />
            </div>

            {/* Row 4: Organization & Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Organization"
                value={formData.organization}
                onChange={(v) => handleChange("organization", v)}
                placeholder="e.g. MedAnit Clinic"
              />
              <div className="flex flex-col space-y-1 relative">
                <label className="text-sm font-medium text-gray-600">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 appearance-none cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-11 text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </motion.button>
          </form>

          {/* Loading Modal */}
          <LoadingModal visible={loading} message="Creating your account..." />

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-sky-600 font-medium hover:underline transition"
              >
                Log In
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-sky-600">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-sky-600">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SignupPage;