"use client";

const SchedulePage = () => {
  return (
    <section className="min-h-screen px-6 py-16 bg-white text-gray-800">
      <h1 className="text-2xl font-bold text-sky-700 mb-4">Staff Schedule</h1>
      <p className="text-sm text-gray-600 mb-8">Manage follow-up appointments and availability.</p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-sky-100 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold mb-2">July 21</h2>
          <p>09:00 – Follow-up: Patient #3412</p>
        </div>
        <div className="bg-sky-100 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold mb-2">July 22</h2>
          <p>14:00 – Consultation: Dr. Menelik</p>
        </div>
      </div>
    </section>
  );
};

export default SchedulePage;