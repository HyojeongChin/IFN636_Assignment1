// src/pages/RegisterEvent.jsx
import { useState } from 'react';
import api, { authHeader } from '../axiosConfig';
import QRPassCard from '../components/QRPassCard';

export default function RegisterEvent() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    studentId: '',
    eventID: '',
  });
  const [loading, setLoading] = useState(false);
  const [pass, setPass] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPass(null);

    try {
      const { data, status } = await api.post(
        '/api/passes',
        {
          name: form.name,
          email: form.email,
          studentId: form.studentId,
          eventName: form.eventName,
        },
        { headers: authHeader() }
      );

      const issuedPass =
        data?.pass || {
          qrCode: data?.qrCode || data?.qr || '',
          status: data?.status || 'issued',
          eventName: data?.eventName || form.eventName,
          holderName: data?.holderName || form.name,
          issuedAt: data?.issuedAt || new Date().toISOString(),
        };

      setPass(issuedPass);
      alert(data?.message || (status ===201 ? 'Registration completed!' : 'Registered.'));
    } catch (error) {
      const res = error?.response;
      const body = res?.data;
      const arrayMsg = Array.isArray(body?.errors)
        ? body.errors.map((e) => e?.msg || e).join('\n')
        : null;

      const msg =
        arrayMsg ||
        body?.message ||
        body?.error ||
        body?.detail ||
        (res?.status === 401 ? 'Please login again.' :error?.message) ||
        'Registration failed.';

      console.error('RegisterEvent error:', res || error);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16">
      <h1 className="text-2xl font-bold text-center mb-6">Event Registration</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded">
        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          className="w-full mb-3 p-2 border rounded"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Student ID"
          value={form.studentId}
          onChange={(e) => setForm({ ...form, studentId: e.target.value })}
          required
        />
        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Event Name"
          value={form.eventName}
          onChange={(e) => setForm({ ...form, eventName: e.target.value })}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-60"
        >
          {loading ? 'Registering...' : 'Register & Generate Pass'}
        </button>
      </form>

      {pass && (
        <div className="mt-6">
          <QRPassCard pass={pass} />
        </div>
      )}
    </div>
  );
}
