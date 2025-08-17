import { useEffect, useState } from 'react';
import api, { authHeader } from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import QRPassCard from '../components/QRPassCard';

export default function ViewPass() {
  const { user } = useAuth();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function run() {
      try {
        const res = await api.get('/api/passes/me', {
          headers: authHeader()
        });
        setPass(res.data.pass || res.data);
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to load pass');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Event Pass</h2>
      {!pass ? <div>No pass found.</div> : <QRPassCard pass={pass} />}
    </div>
  );
}
