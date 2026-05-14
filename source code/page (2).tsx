'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const PredictPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, error: authError, fetchUserData: authFetchUserData } = useAuth();

  const [symptoms, setSymptoms] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientDetails, setPatientDetails] = useState<{ name: string; age: number; contact: string } | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Sync user from AuthContext
  useEffect(() => {
    if (!user) {
      setError('Not authenticated. Please log in.');
      router.push('/auth/login');
    } else {
      // Optional: fetch updated user data if needed
    }
  }, [user, router]);

  // Prefill patientId from URL query
  useEffect(() => {
    const pid = searchParams.get("patientId");
    if (pid) setPatientId(pid);
  }, [searchParams]);

  // Fetch patient details
  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!patientId || !user) return;

      try {
        const token = localStorage.getItem('jwt');
        if (!token) throw new Error('No token found');

        const res = await fetch(`http://localhost:4000/patients?search=${patientId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch patient details');
        }

        const data = await res.json();
        const patient = data.find((p: any) => p.patientId === patientId);
        if (patient) {
          setPatientDetails({ name: patient.name, age: patient.age, contact: patient.contact });
        } else {
          setPatientDetails(null);
          setError('Patient not found');
        }
      } catch (err: any) {
        console.error('🔐 Fetch patient details error:', err.message);
        setError(err.message || 'Error fetching patient details.');
      }
    };

    if (user) {
      fetchPatientDetails();
    }
  }, [patientId, user]);

  // Handle prediction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    if (!symptoms || !patientId) {
      setError('Please enter symptoms and patient ID.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          symptoms: symptoms.split(',').map(s => s.trim()).filter(s => s),
          patientId,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error('Unexpected server response');
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Prediction failed');
      }

      const data = await res.json();

      // Normalize arrays
      const normalize = (val: any) => Array.isArray(val) ? val : [val];
      data.metadata.medications = normalize(data.metadata.medication || []);
      data.metadata.diet = normalize(data.metadata.diet || []);
      data.metadata.workout = normalize(data.metadata.workout || []);
      data.metadata.precautions = normalize(data.metadata.precautions || []);
      data.metadata.symptoms = symptoms.split(',').map(s => s.trim()).filter(s => s);

      // Add patient info
      data.metadata.patientId = patientId;
      data.metadata.name = patientDetails?.name || '';
      data.metadata.age = patientDetails?.age || 0;
      data.metadata.contact = patientDetails?.contact || '';

      setResult(data);
    } catch (err: any) {
      console.error('Prediction error:', err);
      setError(err.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save diagnosis
  const handleSaveDiagnosis = async () => {
    if (!patientDetails || !result) {
      setError('Patient or diagnosis data missing.');
      return;
    }

    setSaveLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');
      if (!user) throw new Error('User not authenticated');

      const res = await fetch('http://localhost:4000/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: result.metadata.patientId,
          top_predictions: result.top_predictions,
          metadata: {
            ...result.metadata,
            name: patientDetails.name,
            age: patientDetails.age,
            contact: patientDetails.contact,
          },
          staffId: user.id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save diagnosis');
      }

      alert('Diagnosis saved successfully!');
      setShowModal(false);
      router.push('/patients');
    } catch (err: any) {
      console.error('Save diagnosis error:', err);
      setError(err.message || 'Failed to save diagnosis. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <section className="min-h-screen px-6 py-16 bg-white text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-sky-700 mb-6">AI Diagnosis</h1>
        <p className="text-gray-600 mb-8">
          Enter patient symptoms below to receive AI-assisted predictions.
        </p>

        {(error || authError) && (
          <p className="text-red-500 mb-4">{error || authError}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Symptoms (comma-separated)</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={5}
              placeholder="Enter comma-separated symptoms, e.g. fever, fatigue, headache"
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Patient ID</label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="e.g., P001"
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {patientDetails && (
            <div className="space-y-2 bg-sky-50 p-4 rounded-lg">
              <p><strong>Name:</strong> {patientDetails.name}</p>
              <p><strong>Age:</strong> {patientDetails.age}</p>
              <p><strong>Contact:</strong> {patientDetails.contact}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-sky-600 text-white px-6 py-2 rounded hover:bg-sky-700 transition shadow-md hover:shadow-lg hover:scale-[1.03] transform duration-300"
          >
            {loading ? "Predicting..." : "Get Diagnosis"}
          </button>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-12 bg-sky-50 p-6 rounded-xl shadow-inner space-y-6"
          >
            <h2 className="text-xl font-semibold text-sky-700">Top Predictions</h2>
            <ul className="space-y-3">
              {result.top_predictions?.map((item: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.4 }}
                  className="bg-white rounded shadow p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-sky-700">{item.disease}</strong>
                    <span className="text-sm text-gray-600">{(item.confidence * 100).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-sky-500 h-2 rounded-full transition-all duration-700 ease-in-out"
                      style={{ width: `${item.confidence * 100}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </ul>

            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <h3 className="text-lg font-bold text-sky-700">Diagnosis Report</h3>
              <p><strong>Patient ID:</strong> {result.metadata.patientId}</p>
              {patientDetails && (
                <>
                  <p><strong>Name:</strong> {patientDetails.name}</p>
                  <p><strong>Age:</strong> {patientDetails.age}</p>
                  <p><strong>Contact:</strong> {patientDetails.contact}</p>
                </>
              )}
              <p><strong>Description:</strong> {result.metadata.description || "No description available."}</p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Symptoms", data: result.metadata.symptoms },
                  { label: "Medications", data: result.metadata.medications },
                  { label: "Diet", data: result.metadata.diet },
                  { label: "Workout", data: result.metadata.workout },
                  { label: "Precautions", data: result.metadata.precautions }
                ].map(({ label, data }, i) => (
                  <div key={i}>
                    <h4 className="font-semibold text-gray-700">{label}</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {data?.length
                        ? data.map((item: string, j: number) => <li key={j}>{item}</li>)
                        : <li>No {label.toLowerCase()} listed.</li>}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition shadow-md hover:shadow-lg hover:scale-[1.03] transform duration-300 flex items-center gap-2"
                  disabled={saveLoading || !patientDetails}
                >
                  💾 {saveLoading ? "Saving..." : "Save Diagnosis"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4"
            >
              <h3 className="text-xl font-bold text-sky-700">Save Diagnosis</h3>
              <p><strong>Patient ID:</strong> {result.metadata.patientId}</p>
              {patientDetails && (
                <>
                  <p><strong>Name:</strong> {patientDetails.name}</p>
                  <p><strong>Age:</strong> {patientDetails.age}</p>
                  <p><strong>Contact:</strong> {patientDetails.contact}</p>
                </>
              )}
              <p><strong>Disease:</strong> {result.metadata.disease}</p>
              <p><strong>Description:</strong> {result.metadata.description}</p>
              <div className="flex justify-end gap-4 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDiagnosis}
                  className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
                  disabled={saveLoading || !patientDetails}
                >
                  {saveLoading ? "Saving..." : "Confirm Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PredictPage;