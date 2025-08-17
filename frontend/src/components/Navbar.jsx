import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const isAuthed = !!auth?.token;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/events/register" className="text-2xl font-bold">Your apps name</Link>
      
      <div className = "flex items-center gap-4">
        {isAuthed ? (
          <>
            <Link to="/tasks" className="hover:underline">CRUD</Link>
            <Link to="/profile" className="hover:underline">Profile</Link>

            <Link to="/events/register" className="hover:underline">Register Event</Link>
            <Link to="/events/mine" className="hover:underline">My Pass</Link>
            <Link to="/attendance/scan" className="hover:underline">Scan</Link>
            <Link to="/attendance/summary" className="hover:underline">Summary</Link>
            <Link to="/admin" className="hover:underline">Admin</Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
