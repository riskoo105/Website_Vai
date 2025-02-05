import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      let accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        console.log("Access token chýba, pokúšam sa obnoviť...");
        try {
          const response = await axios.post("http://localhost:8080/api/refresh-token", {}, { withCredentials: true });
          accessToken = response.data.accessToken;
          Cookies.set("accessToken", accessToken, { path: "/" });
          console.log("Access token obnovený.");
        } catch (error) {
          console.error("Chyba pri obnove tokenu:", error);
          return;
        }
      }
      try {
        const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
        setUser({ id: decodedToken.id, email: decodedToken.email, role: decodedToken.role });
      } catch (error) {
        console.error("Chyba pri dekódovaní tokenu", error);
      } finally {
        setLoading(false);
      }
    };
    checkAndRefreshToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:8080/api/login", { email, password }, { withCredentials: true });
      const { accessToken, refreshToken, role } = response.data;

      Cookies.set("accessToken", accessToken, { path: "/", expires: 7 });
      Cookies.set("refreshToken", refreshToken, { path: "/", expires: 7 });
      setUser({ id: response.data.id, email, role });
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const logout = async () => {
    await axios.post("http://localhost:8080/api/logout", {}, { withCredentials: true });
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
