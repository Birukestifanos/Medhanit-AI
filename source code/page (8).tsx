"use client";
import Link from "next/link";
import { useState } from "react";
import {
  FaUserMd,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
} from "react-icons/fa";

const mockDoctors = [
  {
    id: 1,
    name: "Dr. Hana Tesfaye",
    email: "hana.tesfaye@medanit.ai",
    phone: "+251912345678",
    role: "General Practitioner",
    address: "Addis Ababa, Ethiopia",
    active: true,
  },
  {
    id: 2,
    name: "Dr. Samuel Bekele",
    email: "samuel.bekele@medanit.ai",
    phone: "+251911223344",
    role: "Cardiologist",
    address: "Bahir Dar, Ethiopia",
    active: false,
  },
  {
    id: 3,
    name: "Dr. Meron Alemu",
    email: "meron.alemu@medanit.ai",
    phone: "+251910987654",
    role: "Pediatrician",
    address: "Hawassa, Ethiopia",
    active: true,
  },
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState(mockDoctors);

  const toggleStatus = (id: number) => {
    setDoctors((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, active: !doc.active } : doc
      )
    );
  };

  return (
    <main className="px-6 py-16 text-gray-800">
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-sky-700">Doctors Directory</h1>

        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-sky-50 text-sky-700 font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Address</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                    {doc.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {doc.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {doc.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {doc.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {doc.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-medium ${
                        doc.active ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {doc.active ? <FaCheckCircle /> : <FaTimesCircle />}
                      {doc.active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => toggleStatus(doc.id)}
                      className="text-xs bg-sky-600 text-white px-3 py-1 rounded hover:bg-sky-700 transition"
                    >
                      {doc.active ? "Suspend" : "Activate"}
                    </button>
                    <button className="text-xs text-sky-700 hover:text-sky-900 transition flex items-center gap-1">
                      <FaEdit />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center">
  <h1 className="text-2xl font-bold text-sky-700">Doctors Directory</h1>
  <Link
    href="/dashboard/admin/doctors/add"
    className="inline-block bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-sky-700 transition"
  >
    + Add Doctor
  </Link>
</div>

      </div>
    </main>
  );
}