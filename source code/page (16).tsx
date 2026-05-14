"use client";

const AlertsPage = () => {
  return (
    <section className="min-h-screen px-6 py-16 bg-sky-50 text-gray-800">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Flagged Cases</h1>
      <p className="text-sm text-gray-600 mb-8">View and resolve urgent clinical alerts submitted by staff.</p>

      <ul className="space-y-4">
        {["Case #4021", "Case #4023"].map((caseId, i) => (
          <li key={i} className="p-4 border rounded bg-white shadow-sm hover:shadow-md transition">
            <strong>{caseId}</strong> — Elevated blood pressure, needs review.
            <button className="ml-4 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition">
              Resolve
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AlertsPage;