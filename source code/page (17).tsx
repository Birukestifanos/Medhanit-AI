"use client";
import { useState } from "react";

const FeedbackPage = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Feedback submitted:", message);
  };

  return (
    <section className="min-h-screen px-6 py-16 bg-sky-50 text-gray-800">
      <h1 className="text-2xl font-bold text-sky-700 mb-4">Submit Feedback</h1>
      <p className="text-sm text-gray-600 mb-8">Share your insights to help Medanit improve.</p>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Your feedback..."
          className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 transition"
        >
          Submit
        </button>
      </form>
    </section>
  );
};

export default FeedbackPage;