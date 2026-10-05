import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    async function getCurrentUser() {
      try {
        const response = await fetch("http://localhost:3000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not retrieve current user.");
        }

        setUser(data.user);
      } catch (error) {
        console.error("Current user error:", error.message);
        setUser(null);
      }
    }

    getCurrentUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
