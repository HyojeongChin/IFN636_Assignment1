import axios from 'axios';

const api = axios.create({
  baseURL: '',//process.env.REACT_APP_API_BASE || 'http://localhost:5001', // local
  //baseURL: 'http://3.26.96.188:5001', // live
  headers: { 'Content-Type': 'application/json' },
  // withCredentials: true,
});

export function authHeader() {
  try{
    //const direct = localStorage.getItem('token');
    //if (direct) return {Authorization: `Bearer ${token}`};
    const raw = localStorage.getItem("auth");
    if (!raw) return {};
      const { token }= JSON.parse(raw);
      return token ? {Authorization: `Bearer ${token}` } : {};
  } catch {
  return {};
  }
}

api.interceptors.request.use((config) => {
  const hdr = authHeader();
  if (hdr.Authorization) config.headers.Authorization = hdr.Authorization;
  return config;
});


export default api;
