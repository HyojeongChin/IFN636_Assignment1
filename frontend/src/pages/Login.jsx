import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { authHeader } from '../axiosConfig';
import {Link} from 'react-router-dom'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [ loading, setLoading ] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/api/auth/login', formData);
      const token = 
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.data?.token;

      if(!token) {
        console.error('Login response without token: ', data);
        alert('There is no token in the server response. Please check the backend response format.');
        return;
      }
      const userInfo = data?.user || { email: data?.email || formData.email, name: data?.name };
      login({ token, user:userInfo });

      navigate('/events/register');
    } catch(error) {
      const msg=
      error?.response?.data?.message || 
      error?.response?.data?.error ||
      error?.message||
      'Login failed. Please try again.';
    console.error('Login error:', error?.response || error);
    alert(msg);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
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
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <button type="submit" 
        className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-60"
        disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center mt-3 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
