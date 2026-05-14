"use client";
import { useState } from "react";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (key: string, value: string) =>
    setFormData({ ...formData, [key]: value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    // Optional: POST to backend or show toast
  };

  return (
    <section className="min-h-screen bg-white py-20 px-6 text-gray-800">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-sky-700 text-center">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-sky-600 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-sky-600 focus:outline-none"
          />
          <textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-sky-600 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-sky-600 text-white font-semibold py-2 px-6 rounded hover:bg-sky-700 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactPage;