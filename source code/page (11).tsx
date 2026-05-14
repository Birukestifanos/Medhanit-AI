'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import PredictionModal from '../components/PredictionModal';
import { SearchIcon, DownloadIcon, EyeIcon } from 'lucide-react';

interface Prediction {
  id: string;
  patientId: string;
  disease: string;
  symptoms: string[];
  staff: string;
  date: string;
  description: string;
  precautions: string[];
  medication: string[];
  workout: string[];
  diet: string[];
}

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ totalItems: 0, totalPages: 1, currentPage: 1 });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { user: authUser, error: authError } = useAuth();
  const router = useRouter();

  // Sync with AuthContext user and error
  useEffect(() => {
    if (!authUser) {
      setError(authError || 'Not authenticated. Please log in.');
      setTimeout(() => router.push('/auth/login'), 3000);
    } else if (authUser.role !== 'admin') {
      setError('Access denied. Admin role required.');
      setTimeout(() => router.push('/auth/login'), 3000);
    } else {
      setError(null);
    }
  }, [authUser, authError, router]);

  // Parse field safely (handles arrays, strings, JSON strings)
  const parseField = (field: any): string[] => {
    try {
      if (Array.isArray(field)) {
        if (field.length === 1 && typeof field[0] === 'string' && field[0].startsWith('[') && field[0].endsWith(']')) {
          return JSON.parse(field[0]);
        }
        return field;
      }
      if (typeof field === 'string' && field.startsWith('[') && field.endsWith(']')) {
        return JSON.parse(field);
      }
      return Array.isArray(field) ? field : [field].filter(Boolean);
    } catch (e) {
      console.warn(`🔍 [PredictionsPage] Failed to parse field: ${field}, error: ${e}`);
      return Array.isArray(field) ? field : [field].filter(Boolean);
    }
  };

  // Fetch predictions
  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      console.log('🔑 [PredictionsPage] Fetching predictions');
      const url = `http://localhost:8000/predictions?page=${page}&limit=${limit}`;
      console.log(`🔍 [PredictionsPage] Fetching URL: ${url}`);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let errorMessage = `Failed to fetch predictions (status: ${res.status})`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.detail || errorMessage;
          console.error('🔍 [PredictionsPage] /predictions error response:', JSON.stringify(errorData, null, 2));
        } catch (jsonError) {
          console.error('🔍 [PredictionsPage] /predictions non-JSON response:', await res.text());
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log('✅ [PredictionsPage] /predictions raw response:', JSON.stringify(data, null, 2));

      if (!data.predictions || !Array.isArray(data.predictions)) {
        console.warn('⚠️ [PredictionsPage] Predictions array is missing or invalid:', data.predictions);
        throw new Error(`Invalid predictions data received. Total items: ${data.pagination?.totalItems || 0}`);
      }

      if (data.predictions.length === 0 && data.pagination?.totalItems > 0) {
        console.warn(`⚠️ [PredictionsPage] Empty predictions array but totalItems: ${data.pagination.totalItems}`);
      }

      const transformedPredictions = data.predictions.map((pred: any) => ({
        id: pred._id || `pred-${Math.random().toString(36).substring(2)}`,
        patientId: pred.patientId || 'N/A',
        disease: pred.disease || 'Unknown',
        symptoms: Array.isArray(pred.symptoms) ? pred.symptoms : [],
        staff: pred.staffId || 'Unknown',
        date: pred.createdAt || new Date().toISOString(),
        description: pred.description || 'No description available',
        precautions: Array.isArray(pred.precautions) ? pred.precautions : [],
        medication: parseField(pred.medication),
        diet: parseField(pred.diet),
        workout: parseField(pred.workout),
      }));

      setPredictions(transformedPredictions);
      setPagination({
        totalItems: data.pagination?.totalItems || 0,
        totalPages: data.pagination?.totalPages || 1,
        currentPage: data.pagination?.currentPage || page,
      });
      console.log(`✅ [PredictionsPage] Fetched ${transformedPredictions.length} predictions, page: ${page}, totalItems: ${data.pagination?.totalItems}`);
      setRetryCount(0);
    } catch (err: any) {
      console.error('❌ [PredictionsPage] Fetch predictions error:', err.message);
      if (retryCount < 3) {
        console.log(`🔄 [PredictionsPage] Retrying fetch (attempt ${retryCount + 2}/3)...`);
        setTimeout(() => setRetryCount(retryCount + 1), 1000);
      } else {
        setError(`Error fetching predictions: ${err.message}. Check backend or try another page.`);
        setPredictions([]);
        setPagination({ totalItems: 0, totalPages: 1, currentPage: page });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch on page or auth change
  useEffect(() => {
    if (authUser && authUser.role === 'admin') {
      fetchPredictions();
    }
  }, [page, retryCount, authUser]);

  // Filter predictions
  const filteredPredictions = predictions.filter((prediction) => {
    const matchesSearch =
      (prediction.disease?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (prediction.patientId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (prediction.staff?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesDisease = !diseaseFilter || prediction.disease === diseaseFilter;
    const matchesStaff = !staffFilter || prediction.staff === staffFilter;

    const predictionDate = new Date(prediction.date);
    const start = dateRange.start ? new Date(dateRange.start) : null;
    const end = dateRange.end ? new Date(dateRange.end) : null;
    const matchesDate =
      (!start || predictionDate >= start) &&
      (!end || predictionDate <= end);

    return matchesSearch && matchesDisease && matchesStaff && matchesDate;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const csvContent = [
      'Patient ID,Disease,Symptoms,Staff,Date,Description,Precautions,Medication,Diet,Workout',
      ...filteredPredictions.map((p) =>
        `"${p.patientId || ''}","${p.disease || ''}","${(p.symptoms || []).join(';')}","${p.staff || ''}","${format(new Date(p.date), 'yyyy-MM-dd')}","${(p.description || '').replace(/"/g, '""')}","${(p.precautions || []).join(';')}","${(p.medication || []).join(';')}","${(p.diet || []).join(';')}","${(p.workout || []).join(';')}"`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'predictions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      setRetryCount(0);
    }
  };

  // Get unique options for filters
  const staffOptions = [...new Set(predictions.map((p) => p.staff).filter((s) => s && s !== 'Unknown'))];
  const diseaseOptions = [...new Set(predictions.map((p) => p.disease).filter((d) => d && d !== 'Unknown'))];

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
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-500 bg-clip-text text-transparent">
              Prediction Records
            </h1>
            <p className="text-gray-600 mt-1">View and manage all AI-assisted diagnosis history.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transform transition-all"
          >
            <DownloadIcon className="w-5 h-5 mr-2" /> Export CSV
          </motion.button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-sky-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, disease, or staff"
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                />
                <SearchIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Disease</label>
              <select
                value={diseaseFilter}
                onChange={(e) => setDiseaseFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
              >
                <option value="">All Diseases</option>
                {diseaseOptions.map((disease) => (
                  <option key={disease} value={disease}>
                    {disease}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Staff</label>
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
              >
                <option value="">All Staff</option>
                {staffOptions.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">From Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">To Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mr-3"></div>
            <span className="text-sky-700">Loading predictions...</span>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-sky-100"
          >
            <table className="w-full">
              <thead className="bg-sky-50">
                <tr>
                  <th className="px-6 py-4 text-left">Patient ID</th>
                  <th className="px-6 py-4 text-left">Disease</th>
                  <th className="px-6 py-4 text-left">Symptoms</th>
                  <th className="px-6 py-4 text-left">Staff</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {filteredPredictions.map((prediction, index) => (
                  <motion.tr
                    key={prediction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(12, 165, 236, 0.04)' }}
                    className="transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{prediction.patientId}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{prediction.disease}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {prediction.symptoms.slice(0, 2).join(', ')}
                      {prediction.symptoms.length > 2 ? '...' : ''}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{prediction.staff}</td>
                    <td className="px-6 py-4 text-gray-600">{format(new Date(prediction.date), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedPrediction(prediction)}
                        className="p-2 text-sky-600 bg-sky-50 rounded-xl hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        aria-label={`View ${prediction.disease} prediction`}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredPredictions.length === 0 && (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No predictions found matching your filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setDiseaseFilter('');
                setStaffFilter('');
                setDateRange({ start: '', end: '' });
              }}
              className="mt-4 text-sky-600 hover:text-sky-700 font-medium underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredPredictions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-600 text-sm">
              Showing <strong>{(page - 1) * limit + 1}–{Math.min(page * limit, pagination.totalItems)}</strong> of{' '}
              <strong>{pagination.totalItems}</strong> predictions
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${
                      page === pageNum
                        ? 'bg-sky-500 text-white'
                        : 'bg-white text-sky-600 hover:bg-sky-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {pagination.totalPages > 5 && <span className="w-10 h-10 flex items-center justify-center text-gray-500">...</span>}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Prediction Modal */}
        <PredictionModal
          isOpen={!!selectedPrediction}
          onClose={() => setSelectedPrediction(null)}
          prediction={selectedPrediction}
        />
      </div>
    </motion.section>
  );
}