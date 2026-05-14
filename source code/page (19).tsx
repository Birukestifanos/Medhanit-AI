'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { SearchIcon, DownloadIcon, EyeIcon, CalendarIcon, UserCircleIcon, BeakerIcon } from 'lucide-react';
import LoadingModal from '../../../components/LoadingModal';

// Mock Data
const mockHistory = [
  {
    id: 'pred-001',
    patientId: 'PAT001',
    patientName: 'Kidus T.',
    disease: 'Type 2 Diabetes',
    confidence: 0.92,
    symptoms: ['fatigue', 'increased thirst', 'blurred vision'],
    staff: 'Dr. Sarah Mitchell',
    date: '2025-07-18T10:30:00Z',
    description: 'Chronic condition affecting insulin production.',
    precautions: ['Monitor blood sugar', 'Regular exercise', 'Balanced diet'],
    medication: ['Metformin', 'Insulin (if needed)'],
    diet: ['Low sugar', 'High fiber', 'Lean proteins'],
    workout: ['Walking 30min daily', 'Light resistance training'],
  },
  {
    id: 'pred-002',
    patientId: 'PAT002',
    patientName: 'Sara M.',
    disease: 'Hypertension',
    confidence: 0.88,
    symptoms: ['headache', 'shortness of breath', 'chest pain'],
    staff: 'Dr. James Carter',
    date: '2025-07-16T14:15:00Z',
    description: 'Persistently high blood pressure requiring management.',
    precautions: ['Reduce salt intake', 'Avoid stress', 'Regular checkups'],
    medication: ['Lisinopril', 'Amlodipine'],
    diet: ['Low sodium', 'Leafy greens', 'Whole grains'],
    workout: ['Yoga', 'Swimming', 'Cycling'],
  },
  {
    id: 'pred-003',
    patientId: 'PAT003',
    patientName: 'Yared K.',
    disease: 'Asthma',
    confidence: 0.95,
    symptoms: ['wheezing', 'coughing', 'shortness of breath'],
    staff: 'Dr. Emily Zhang',
    date: '2025-07-15T09:00:00Z',
    description: 'Chronic respiratory condition with airway inflammation.',
    precautions: ['Avoid triggers', 'Carry inhaler', 'Monitor peak flow'],
    medication: ['Albuterol (rescue)', 'Fluticasone (maintenance)'],
    diet: ['Anti-inflammatory foods', 'Omega-3 rich'],
    workout: ['Light cardio', 'Breathing exercises'],
  },
];

interface Prediction {
  id: string;
  patientId: string;
  patientName: string;
  disease: string;
  confidence: number;
  symptoms: string[];
  staff: string;
  date: string;
  description: string;
  precautions: string[];
  medication: string[];
  diet: string[];
  workout: string[];
}

export default function HistoryPage() {
  const [history, setHistory] = useState<Prediction[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<Prediction[]>([]);
  const [search, setSearch] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedRecord, setSelectedRecord] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setHistory(mockHistory);
      setFilteredHistory(mockHistory);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    const filtered = history.filter((record) => {
      const matchesSearch =
        record.patientId.toLowerCase().includes(search.toLowerCase()) ||
        record.patientName.toLowerCase().includes(search.toLowerCase()) ||
        record.disease.toLowerCase().includes(search.toLowerCase()) ||
        record.staff.toLowerCase().includes(search.toLowerCase());

      const matchesDisease = diseaseFilter ? record.disease === diseaseFilter : true;
      const matchesStaff = staffFilter ? record.staff === staffFilter : true;
      const recordDate = new Date(record.date);
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;

      const matchesDate =
        (!start || recordDate >= start) &&
        (!end || recordDate <= end);

      return matchesSearch && matchesDisease && matchesStaff && matchesDate;
    });

    setFilteredHistory(filtered);
  }, [search, diseaseFilter, staffFilter, dateRange, history]);

  const handleExportCSV = () => {
    const csvContent = [
      'Patient ID,Patient Name,Disease,Confidence,Symptoms,Staff,Date,Description,Precautions,Medication,Diet,Workout',
      ...filteredHistory.map((r) =>
        `"${r.patientId}","${r.patientName}","${r.disease}","${(r.confidence * 100).toFixed(2)}%","${r.symptoms.join(';')}","${r.staff}","${format(new Date(r.date), 'yyyy-MM-dd HH:mm')}","${r.description.replace(/"/g, '""')}","${r.precautions.join(';')}","${r.medication.join(';')}","${r.diet.join(';')}","${r.workout.join(';')}"`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagnosis-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const diseaseOptions = [...new Set(history.map((h) => h.disease))];
  const staffOptions = [...new Set(history.map((h) => h.staff))];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen px-6 py-12 bg-gradient-to-br from-sky-50 via-white to-blue-50 text-gray-800"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Diagnosis History
            </h1>
            <p className="text-gray-600 mt-1">Track AI-powered predictions and clinical decisions over time.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transform transition-all"
          >
            <DownloadIcon className="w-5 h-5" />
            Export CSV
          </motion.button>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-center text-sm font-medium bg-red-50 border border-red-200 px-4 py-3 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
            <span className="ml-3 text-sky-700 font-medium">Loading history...</span>
          </div>
        )}

        {/* Filters */}
        {!loading && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-sky-100 p-6 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID, name, disease, or staff"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Disease Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Disease</label>
                <select
                  value={diseaseFilter}
                  onChange={(e) => setDiseaseFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800"
                >
                  <option value="">All Diseases</option>
                  {diseaseOptions.map((disease) => (
                    <option key={disease} value={disease}>
                      {disease}
                    </option>
                  ))}
                </select>
              </div>

              {/* Staff Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Staff</label>
                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800"
                >
                  <option value="">All Staff</option>
                  {staffOptions.map((staff) => (
                    <option key={staff} value={staff}>
                      {staff}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                    className="flex-1 px-3 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                    className="flex-1 px-3 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* History Grid */}
        {!loading && filteredHistory.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {filteredHistory.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 p-6 space-y-4"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{record.patientName}</h3>
                    <p className="text-sm text-gray-600">ID: {record.patientId}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      record.confidence > 0.9
                        ? 'bg-green-100 text-green-800'
                        : record.confidence > 0.8
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {(record.confidence * 100).toFixed(0)}% Conf
                  </span>
                </div>

                {/* Diagnosis */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Diagnosis</label>
                  <p className="font-medium text-gray-800">{record.disease}</p>
                </div>

                {/* Confidence Bar */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Confidence Level</label>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${record.confidence * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
                    />
                  </div>
                </div>

                {/* Staff & Date */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <UserCircleIcon className="w-4 h-4" />
                    <span>{record.staff}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{format(new Date(record.date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedRecord(record)}
                    className="p-2 text-sky-600 bg-sky-50 rounded-xl hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    aria-label={`View ${record.disease} prediction`}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          !loading && (
            <div className="text-center py-16">
              <BeakerIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {filteredHistory.length === 0 ? 'No records match your filters.' : 'No diagnosis history found.'}
              </p>
            </div>
          )
        )}

        {/* Record Detail Modal */}
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl max-w-2xl w-full mx-4 border border-sky-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-5">
                <h3 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  Diagnosis Record
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Patient</label>
                    <p className="font-medium text-gray-800">{selectedRecord.patientName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID</label>
                    <p className="font-medium text-gray-800">{selectedRecord.patientId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Disease</label>
                    <p className="font-medium text-gray-800">{selectedRecord.disease}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Confidence</label>
                    <p className="font-medium text-green-600">{(selectedRecord.confidence * 100).toFixed(2)}%</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Symptoms</label>
                    <p className="text-gray-800">{selectedRecord.symptoms.join(', ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Staff</label>
                    <p className="text-gray-800">{selectedRecord.staff}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date</label>
                    <p className="text-gray-800">{format(new Date(selectedRecord.date), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-800 leading-relaxed">{selectedRecord.description}</p>
                </div>

                {[
                  { label: 'Precautions', data: selectedRecord.precautions },
                  { label: 'Medication', data: selectedRecord.medication },
                  { label: 'Diet', data: selectedRecord.diet },
                  { label: 'Workout', data: selectedRecord.workout },
                ].map(({ label, data }) => (
                  <div key={label}>
                    <label className="text-sm font-medium text-gray-600">{label}</label>
                    <ul className="list-disc pl-5 text-gray-800">
                      {data.length > 0 ? (
                        data.map((item, i) => <li key={i}>{item}</li>)
                      ) : (
                        <li className="text-gray-500">No {label.toLowerCase()} listed.</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex justify-end p-6 pt-4 bg-gray-50/50 rounded-b-3xl border-t border-sky-100">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRecord(null)}
                  className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Loading Modal */}
        <LoadingModal visible={loading} message="Loading diagnosis history..." />
      </div>
    </motion.section>
  );
}