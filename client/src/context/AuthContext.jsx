import { API_URL } from "../config/api";
import { useEffect, useState } from "react";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => ({
    token: localStorage.getItem("token"),
    user: null,
  }));
  const { token, user } = session;

  function login(newToken) {
    localStorage.setItem("token", newToken);
    setSession({ token: newToken, user: null });
  }

  function logout() {
    localStorage.removeItem("token");
    setSession({ token: null, user: null });
  }

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();

    async function getCurrentUser() {
      try {
        const response = await fetch(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json();
        if (controller.signal.aborted) return;

        if (response.status === 401 || response.status === 404) {
          localStorage.removeItem("token");
          setSession({ token: null, user: null });
          return;
        }
        if (!response.ok) {
          throw new Error(data.message || "Could not retrieve current user.");
        }
        setSession({ token, user: data.user });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Current user error:", error.message);
        }
      }
    }

    getCurrentUser();
    return () => controller.abort();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
