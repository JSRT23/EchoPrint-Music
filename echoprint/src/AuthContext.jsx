import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.isLoggedIn()) {
      auth
        .profile()
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    await auth.login(email, password);
    const profile = await auth.profile();
    setUser(profile);
    return profile;
  }

  async function register(username, email, password) {
    const u = await auth.register(username, email, password);
    const profile = await auth.profile();
    setUser(profile);
    return profile;
  }

  async function logout() {
    await auth.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
