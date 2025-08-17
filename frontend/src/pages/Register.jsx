// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, status } = await axiosInstance.post('/api/auth/register', formData);

      const okMsg =
        data?.message ||
        data?.msg ||
        (status === 201 ? 'Registration successful.' : 'Registered.');

      alert(okMsg);
      navigate('/login');
    } catch (error) {
      const server = error?.response?.data || error?.response || error;
      const arrayMsg = Array.isArray(server?.errors)
        ? server.errors.map(e => e?.msg || e).join('\n')
        : null;

      const msg =
        arrayMsg ||
        server?.message ||
        server?.error ||
        server?.detail ||
        error?.message ||
        'Registration failed. Please try again.';

      console.error('Register error:', server);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>

        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password (min 6)"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
          minLength={6}
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
