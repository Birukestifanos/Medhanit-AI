"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserMd, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserTag } from "react-icons/fa";

export default function AddDoctorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    address: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🧠 Submitting doctor to backend:", form);
    // TODO: Send POST request to backend API
    router.push("/dashboard/admin/doctors");
  };

  return (
    <main className="px-6 py-16 text-gray-800">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold text-sky-700">Add New Doctor</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { name: "name", label: "Full Name", icon: <FaUserMd /> },
            { name: "email", label: "Email Address", icon: <FaEnvelope /> },
            { name: "phone", label: "Phone Number", icon: <FaPhone /> },
            { name: "address", label: "Address", icon: <FaMapMarkerAlt /> },
          ].map(({ name, label, icon }) => (
            <div key={name}>
              <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                {label}
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 overflow-hidden bg-white">
                <span className="px-3 text-gray-400">{icon}</span>
                <input
                  type="text"
                  name={name}
                  id={name}
                  value={(form as any)[name]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 text-sm outline-none"
                  placeholder={`Enter ${label.toLowerCase()}...`}
                />
              </div>
            </div>
          ))}

          {/* Role Selector */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Role
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 bg-white">
              <span className="px-3 text-gray-400">
                <FaUserTag />
              </span>
              <select
                name="role"
                id="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm bg-white outline-none"
              >
                <option value="">Select Role</option>
                <option value="General Practitioner">General Practitioner</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-sky-700 transition"
          >
            Add Doctor
          </button>
        </form>
      </div>
    </main>
  );
}