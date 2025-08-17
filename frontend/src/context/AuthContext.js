import { createContext, useState, useContext } from 'react';

const KEY = 'auth';
const AuthContext = createContext(null);

export function AuthProvider ({ children }) {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  const login = (payload) => {
    const next = { token: payload?.token, user: payload?.user };
    localStorage.setItem( KEY, JSON.stringify(next));
    setAuth(next);
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setAuth(null);
  };

  const value = { 
    auth,                // { token, user }
    login: (data) => { setAuth(data); localStorage.setItem('auth', JSON.stringify(data)); },
    logout: () => { setAuth(null); localStorage.removeItem('auth'); }
  };


  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
