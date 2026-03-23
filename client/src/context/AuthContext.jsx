import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Starts as true

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('servicoUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('servicoUser');
    } finally {
      // Loading becomes false only after the check is done
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('servicoUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('servicoUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {/* THIS IS THE FIX: Don't render the app until the initial auth check is finished */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};