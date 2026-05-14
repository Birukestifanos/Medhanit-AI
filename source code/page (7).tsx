"use client";

const ServicePage = () => {
  const services = [
    "AI-powered symptom matching",
    "Diabetes & heart prediction dashboards",
    "Role-based access (admin, staff, patient)",
    "Secure cloud storage via MongoDB Atlas",
    "Type-safe FastAPI + Next.js integration",
  ];

  return (
    <section className="min-h-screen bg-sky-50 py-20 px-6 text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8 text-center">
        <h1 className="text-4xl font-bold text-sky-700">Our Services</h1>
        <ul className="grid gap-6 md:grid-cols-2 text-left list-disc list-inside text-lg text-sky-800">
          {services.map((s, i) => (
            <li key={i} className="hover:translate-x-1 transition duration-300">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ServicePage;