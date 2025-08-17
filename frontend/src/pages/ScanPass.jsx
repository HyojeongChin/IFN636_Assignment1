import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../axiosConfig';
import QrScanner from 'react-qr-barcode-scanner';

export default function ScanPass() {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const onScan = useCallback(async (data) => {
    if (!data?.text) return;
    try {
      const res = await api.post(
        '/api/attendance/scan',
        { qrCode: data.text },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setResult(res.data); // { status:'granted'|'denied', reason? }
      setErrorMsg('');
    } catch (err) {
      setResult({ status: 'denied', reason: err?.response?.data?.message || 'Scan failed' });
    }
  }, [user]);

  const onError = (err) => setErrorMsg(err?.message || String(err));

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Scan Pass</h2>

      <div className="bg-white p-3 rounded shadow">
        <QrScanner
          onUpdate={(err, result) => {
            if (result) onScan(result);
            if (err) onError(err);
          }}
          constraints={{ facingMode: 'environment' }}
          style={{ width: '100%', minHeight: 320 }}
        />
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 rounded bg-yellow-100 text-yellow-800 text-sm">
          Camera/Error: {errorMsg}
        </div>
      )}

      {result && (
        <div
          className="mt-4 p-4 rounded text-white"
          style={{ background: result.status === 'granted' ? '#16a34a' : '#dc2626' }}
        >
          <p className="font-semibold text-lg">
            {result.status === 'granted' ? 'Entry Granted ✅' : 'Entry Denied ❌'}
          </p>
          {result.reason && <p className="text-sm mt-1">Reason: {result.reason}</p>}
        </div>
      )}
    </div>
  );
}
