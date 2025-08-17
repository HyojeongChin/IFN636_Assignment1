import { useEffect, useState } from 'react';
import api, { authHeader } from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function AttendanceSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null); // { total, checkedIn, denied }

  useEffect(() => {
    (async function run() {
      try {
        const res = await api.get('/api/attendance/summary', 
          { headers: authHeader() }
        );
        setSummary(res.data);
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to load summary');
      }
    })();
  }, [user]);

  if (!summary) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Attendance Summary</h2>
      <div className="grid grid-cols-3 gap-4">
        <Stat title="Registrations" value={summary.total} />
        <Stat title="Check-ins" value={summary.checkedIn} />
        <Stat title="Denied" value={summary.denied} />
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value ?? 0}</p>
    </div>
  );
}
