import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';

import RegisterEvent from './pages/RegisterEvent';
import ViewPass from './pages/ViewPass';
//import ScanPass from './pages/ScanPass';
import AttendanceSummary from './pages/AttendanceSummary';
//import AdminDashboard from './pages/AdminDashboard';
//import MyPass from './pages/MyPass';
import Scan from './pages/Scan';

import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { auth } = useAuth();
  return auth?.token ? children : <Navigate to ='/login' replace />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/profile" element={<Profile />} />
        <Route path="/tasks" element={<Tasks />} />

        <Route path="/events/register" element = {<PrivateRoute><RegisterEvent /></PrivateRoute>} />
        <Route path="/events/mine" element = {<PrivateRoute><ViewPass /></PrivateRoute>} />
        <Route path="/attendance/scan" element = {<PrivateRoute><Scan /></PrivateRoute>} />
        <Route path="/attendance/summary" element = {<PrivateRoute><AttendanceSummary /></PrivateRoute>} />
        
        {/*<Routes><</Router>Route path="/admin" element = {<PrivateRoute><AdminDashboard /></PrivateRoute>} /> */}

        <Route path="/" element = {<Navigate to = "/events/register" replace/>} />
        <Route path="*" element = {<Navigate to = "/events/register" replace/>} />
      </Routes>
    </Router>
  );
}

export default App;
