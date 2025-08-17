import { useState } from 'react';
import api from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  const [updateForm, setUpdateForm] = useState({ registrationId: '', name: '', email: '', studentId: '' });
  const [revokeId, setRevokeId] = useState('');
  const [logId, setLogId] = useState('');
  const [logPatch, setLogPatch] = useState({ status: '', note: '' });

  const auth = { headers: { Authorization: `Bearer ${user.token}` } };

  const updateRegistration = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/events/registration/${updateForm.registrationId}`, updateForm, auth);
      alert('Registration updated & pass reissued');
    } catch (err) {
      alert(err?.response?.data?.message || 'Update failed');
    }
  };

  const revokePass = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/events/registration/${revokeId}/revoke`, {}, auth);
      alert('Pass revoked');
    } catch (err) {
      alert(err?.response?.data?.message || 'Revoke failed');
    }
  };

  const editLog = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/api/attendance/logs/${logId}`, logPatch, auth);
      alert('Log edited');
    } catch (err) {
      alert(err?.response?.data?.message || 'Edit failed');
    }
  };

  const deleteLog = async () => {
    try {
      await api.delete(`/api/attendance/logs/${logId}`, auth);
      alert('Log deleted (soft)');
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 grid md:grid-cols-2 gap-6">
      <Section title="Update & Reissue (A3)">
        <form onSubmit={updateRegistration} className="space-y-2">
          <input className="w-full p-2 border rounded" placeholder="Registration ID" value={updateForm.registrationId} onChange={(e)=>setUpdateForm({...updateForm, registrationId:e.target.value})} required />
          <input className="w-full p-2 border rounded" placeholder="Name" value={updateForm.name} onChange={(e)=>setUpdateForm({...updateForm, name:e.target.value})} />
          <input className="w-full p-2 border rounded" placeholder="Email" value={updateForm.email} onChange={(e)=>setUpdateForm({...updateForm, email:e.target.value})} />
          <input className="w-full p-2 border rounded" placeholder="Student ID" value={updateForm.studentId} onChange={(e)=>setUpdateForm({...updateForm, studentId:e.target.value})} />
          <button className="w-full bg-blue-600 text-white py-2 rounded">Update & Reissue</button>
        </form>
      </Section>

      <Section title="Revoke Pass (A4)">
        <form onSubmit={revokePass} className="space-y-2">
          <input className="w-full p-2 border rounded" placeholder="Registration ID" value={revokeId} onChange={(e)=>setRevokeId(e.target.value)} required />
          <button className="w-full bg-red-600 text-white py-2 rounded">Revoke</button>
        </form>
      </Section>

      <Section title="Edit Attendance Log (B3)">
        <form onSubmit={editLog} className="space-y-2">
          <input className="w-full p-2 border rounded" placeholder="Log ID" value={logId} onChange={(e)=>setLogId(e.target.value)} required />
          <input className="w-full p-2 border rounded" placeholder="New Status (granted/denied)" value={logPatch.status} onChange={(e)=>setLogPatch({...logPatch, status:e.target.value})} />
          <input className="w-full p-2 border rounded" placeholder="Note (audit reason)" value={logPatch.note} onChange={(e)=>setLogPatch({...logPatch, note:e.target.value})} />
          <button className="w-full bg-amber-600 text-white py-2 rounded">Save Edit</button>
        </form>
      </Section>

      <Section title="Delete Attendance Log (B4)">
        <div className="space-y-2">
          <input className="w-full p-2 border rounded" placeholder="Log ID" value={logId} onChange={(e)=>setLogId(e.target.value)} />
          <button onClick={deleteLog} className="w-full bg-gray-700 text-white py-2 rounded">Soft Delete</button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
