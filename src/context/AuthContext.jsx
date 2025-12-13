import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if already logged in (session cookie exists)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me/', { credentials: 'include' }); // We'll add this endpoint later
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {}
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);