'use client';

import { format } from 'date-fns';

interface ActivityDisplayProps {
  selectedDate: Date;
}

export default function ActivityDisplay({ selectedDate }: ActivityDisplayProps) {
  // Placeholder data for activities (replace with API call later)
  const activities = [
    {
      id: '1',
      disease: 'Flu',
      symptoms: ['Fever', 'Cough', 'Fatigue'],
      staff: 'Dr. Smith',
      patientId: 'P001',
      timestamp: new Date(selectedDate),
    },
    {
      id: '2',
      disease: 'Hypertension',
      symptoms: ['High BP', 'Headache', 'Dizziness'],
      staff: 'Dr. Jones',
      patientId: 'P002',
      timestamp: new Date(selectedDate),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Activities for {format(selectedDate, 'MMMM dd, yyyy')}
      </h3>
      {activities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Disease
                </th>
                <th scope="col" className="px-6 py-3">
                  Symptoms
                </th>
                <th scope="col" className="px-6 py-3">
                  Staff
                </th>
                <th scope="col" className="px-6 py-3">
                  Patient ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr
                  key={activity.id}
                  className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-4">{activity.disease}</td>
                  <td className="px-6 py-4">{activity.symptoms.join(', ')}</td>
                  <td className="px-6 py-4">{activity.staff}</td>
                  <td className="px-6 py-4">{activity.patientId}</td>
                  <td className="px-6 py-4">
                    {format(activity.timestamp, 'HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          No activities for this date.
        </p>
      )}
    </div>
  );
}