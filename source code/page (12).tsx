'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentTextIcon, ChartBarIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components and datalabels plugin
ChartJS.register(CategoryScale, LinearScale, BarElement, PieController, ArcElement, Tooltip, Legend, ChartDataLabels);

interface ReportData {
  date: string;
  patients: number;
  staffActive: number;
  predictions: number;
}

interface Summary {
  totalPatients: number;
  totalStaff: number;
  activeToday: number;
  avgPredictionsPerDay: number;
  topDisease: string;
  growthRate: number;
}

interface PieData {
  name: string;
  value: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const { user: authUser, error: authError } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'insights'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pieData, setPieData] = useState<PieData[]>([]);

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

  // Fetch report data
  useEffect(() => {
    const fetchReports = async () => {
      if (!authUser || authUser.role !== 'admin') return;

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('jwt');
        if (!token) throw new Error('No token found');

        // Fetch all predictions with pagination
        let allPredictions: any[] = [];
        let page = 1;
        let totalPages = 1;
        do {
          const predictionsRes = await fetch(`http://localhost:8000/predictions?page=${page}&limit=100`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!predictionsRes.ok) {
            const text = await predictionsRes.text();
            console.error('❌ [ReportsPage] Predictions fetch failed:', {
              status: predictionsRes.status,
              statusText: predictionsRes.statusText,
              responseText: text,
            });
            throw new Error(`Failed to fetch predictions (status: ${predictionsRes.status}, ${predictionsRes.statusText})`);
          }
          const predictionsData = await predictionsRes.json();
          allPredictions = [...allPredictions, ...predictionsData.predictions];
          totalPages = predictionsData.pagination.totalPages;
          page++;
        } while (page <= totalPages);

        // Fetch patients and users
        const [patientsRes, usersRes] = await Promise.all([
          fetch('http://localhost:4000/patients', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }).catch((err) => {
            console.error('❌ [ReportsPage] Patients fetch error:', err.message);
            throw new Error(`Failed to fetch patients: ${err.message}`);
          }),
          fetch('http://localhost:4000/users', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }).catch((err) => {
            console.error('❌ [ReportsPage] Users fetch error:', err.message);
            throw new Error(`Failed to fetch users: ${err.message}`);
          }),
        ]);

        // Check responses
        if (!patientsRes.ok) {
          const text = await patientsRes.text();
          console.error('❌ [ReportsPage] Patients response error:', {
            status: patientsRes.status,
            statusText: patientsRes.statusText,
            responseText: text,
          });
          throw new Error(`Failed to fetch patients (status: ${patientsRes.status}, ${patientsRes.statusText})`);
        }
        if (!usersRes.ok) {
          const text = await usersRes.text();
          console.error('❌ [ReportsPage] Users response error:', {
            status: usersRes.status,
            statusText: usersRes.statusText,
            responseText: text,
          });
          throw new Error(`Failed to fetch users (status: ${usersRes.status}, ${usersRes.statusText})`);
        }

        const patientsData = await patientsRes.json();
        const usersData = await usersRes.json();

        console.log('✅ [ReportsPage] Fetched patients:', patientsData);
        console.log('✅ [ReportsPage] Fetched users:', usersData);
        console.log('✅ [ReportsPage] Fetched predictions:', allPredictions);

        // Normalize data
        const patients = Array.isArray(patientsData) ? patientsData : patientsData.patients || [];
        const users = Array.isArray(usersData) ? usersData : usersData.users || [];
        const predictions = allPredictions;

        // Aggregate weekly data (last 7 days)
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const reportData: ReportData[] = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(weekAgo.getTime() + i * 24 * 60 * 60 * 1000);
          const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

          const patientsCount = patients.filter((p: any) => {
            const createdAt = new Date(p.createdAt || p.created_at);
            return createdAt >= dateStart && createdAt < dateEnd;
          }).length;

          const staffActiveCount = users.filter((u: any) => {
            const lastLogin = u.lastLogin ? new Date(u.lastLogin) : null;
            return u.active && lastLogin && lastLogin >= dateStart && lastLogin < dateEnd;
          }).length;

          const predictionsCount = predictions.filter((p: any) => {
            const createdAt = new Date(p.createdAt);
            return createdAt >= dateStart && createdAt < dateEnd;
          }).length;

          return { date: days[date.getDay()], patients: patientsCount, staffActive: staffActiveCount, predictions: predictionsCount };
        });

        // Calculate summary
        const totalPatients = patients.length;
        const totalStaff = users.filter((u: any) => u.active).length;
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const activeToday = users.filter((u: any) => {
          const lastLogin = u.lastLogin ? new Date(u.lastLogin) : null;
          return u.active && lastLogin && lastLogin >= todayStart;
        }).length;

        const totalPredictions = predictions.length;
        const avgPredictionsPerDay = totalPredictions / 7;

        // Calculate disease distribution
        const diseaseCounts = predictions.reduce((acc: any, p: any) => {
          const disease = p.disease || 'Other';
          acc[disease] = (acc[disease] || 0) + 1;
          return acc;
        }, {});
        const topDisease = Object.keys(diseaseCounts).reduce((a, b) => (diseaseCounts[a] > diseaseCounts[b] ? a : b), 'N/A');
        const pieData: PieData[] = Object.entries(diseaseCounts).map(([name, value]) => ({
          name,
          value: value as number,
        }));

        // Calculate growth rate (patients this week vs. last week)
        const lastWeekStart = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastWeekPatients = patients.filter((p: any) => {
          const createdAt = new Date(p.createdAt || p.created_at);
          return createdAt >= lastWeekStart && createdAt < weekAgo;
        }).length;
        const thisWeekPatients = patients.filter((p: any) => {
          const createdAt = new Date(p.createdAt || p.created_at);
          return createdAt >= weekAgo && createdAt <= today;
        }).length;
        const growthRate = lastWeekPatients ? ((thisWeekPatients - lastWeekPatients) / lastWeekPatients) * 100 : 0;

        const summary: Summary = {
          totalPatients,
          totalStaff,
          activeToday,
          avgPredictionsPerDay: Number(avgPredictionsPerDay.toFixed(1)),
          topDisease,
          growthRate: Number(growthRate.toFixed(1)),
        };

        setReportData(reportData);
        setSummary(summary);
        setPieData(pieData);
        console.log('✅ [ReportsPage] Aggregated data:', { reportData, summary, pieData });
      } catch (err: any) {
        console.error('❌ [ReportsPage] Fetch error:', err.message);
        setError(`Failed to load reports: ${err.message}. Check console for details.`);
        setReportData([]);
        setSummary(null);
        setPieData([]);
      } finally {
        setLoading(false);
      }
    };

    if (authUser && authUser.role === 'admin') {
      fetchReports();
    }
  }, [authUser]);

  const COLORS = ['#6c63ff', '#4880ff', '#00c4cc', '#ff8042', '#a4b2c0'];

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
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1">View comprehensive reports for patients, staff, and predictions.</p>
          </div>
          <div className="flex space-x-2 bg-white/70 px-2 py-1 rounded-full backdrop-blur-sm border border-sky-100">
            {(['overview', 'trends', 'insights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mr-3"></div>
            <span className="text-sky-700 font-medium">Generating reports...</span>
          </div>
        )}

        {/* Tabs */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard label="Total Patients" value={summary?.totalPatients || 0} color="emerald" />
              <StatCard label="Total Staff" value={summary?.totalStaff || 0} color="sky" />
              <StatCard label="Active Today" value={summary?.activeToday || 0} color="amber" />
              <StatCard label="Avg Predictions/Day" value={summary?.avgPredictionsPerDay || 0} color="violet" />
              <StatCard label="Top Disease" value={summary?.topDisease || 'N/A'} color="rose" />
              <StatCard label="Growth Rate" value={`${summary?.growthRate || 0}%`} color="teal" />
            </motion.div>
          )}

          {activeTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-sky-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Weekly Trends</h3>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: reportData.map((item) => item.date),
                      datasets: [
                        {
                          label: 'Patients',
                          data: reportData.map((item) => item.patients),
                          backgroundColor: '#10b981',
                          borderColor: '#10b981',
                          borderWidth: 1,
                        },
                        {
                          label: 'Staff Active',
                          data: reportData.map((item) => item.staffActive),
                          backgroundColor: '#0ea5e9',
                          borderColor: '#0ea5e9',
                          borderWidth: 1,
                        },
                        {
                          label: 'Predictions',
                          data: reportData.map((item) => item.predictions),
                          backgroundColor: '#f59e0b',
                          borderColor: '#f59e0b',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: { grid: { display: false }, title: { display: true, text: 'Day' } },
                        y: { beginAtZero: true, title: { display: true, text: 'Count' } },
                      },
                      plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          titleColor: '#333',
                          bodyColor: '#333',
                          borderColor: '#ccc',
                          borderWidth: 1,
                          cornerRadius: 8,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-sky-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Disease Distribution</h3>
                <div className="h-80">
                  <Pie
                    data={{
                      labels: pieData.map((item) => item.name),
                      datasets: [
                        {
                          data: pieData.map((item) => item.value),
                          backgroundColor: COLORS,
                          borderColor: '#ffffff',
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              const label = context.label || '';
                              const value = Number(context.raw) || 0;
                              const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${label}: ${value} (${percentage}%)`;
                            },
                          },
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          titleColor: '#333',
                          bodyColor: '#333',
                          borderColor: '#ccc',
                          borderWidth: 1,
                          cornerRadius: 8,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

// Reusable StatCard component
function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-emerald-600',
    sky: 'from-sky-500 to-sky-600',
    amber: 'from-amber-500 to-amber-600',
    violet: 'from-violet-500 to-violet-600',
    rose: 'from-rose-500 to-rose-600',
    teal: 'from-teal-500 to-teal-600',
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-sky-100 hover:shadow-xl transition-all">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} bg-clip-text text-transparent mt-1`}>
        {value}
      </p>
    </div>
  );
}