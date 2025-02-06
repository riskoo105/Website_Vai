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
          const refreshResponse = await axios.post("http://localhost:8080/api/refresh-token", {}, { withCredentials: true });
          accessToken = refreshResponse.data.accessToken;
          Cookies.set("accessToken", accessToken, { path: "/", expires: 7 });
        } catch (error) {
          console.error("Obnova tokenu zlyhala", error);
          setUser(null);
          setLoading(false);
          return;
        }
      }
  
      try {
        const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
        setUser({ id: decodedToken.id, email: decodedToken.email, role: decodedToken.role });
      } catch (error) {
        console.error("Chyba pri dekódovaní tokenu", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
  
    checkAndRefreshToken();
  }, []);

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        try {
          const refreshResponse = await axios.post(
            "http://localhost:8080/api/refresh-token",
            {},
            { withCredentials: true }
          );
          
          const newAccessToken = refreshResponse.data.accessToken;
          Cookies.set("accessToken", newAccessToken, { path: "/", expires: 7 });
  
          // Zopakuj pôvodnú požiadavku
          error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axios(error.config);
        } catch (refreshError) {
          console.error("Unable to refresh token:", refreshError);
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          setUser(null);
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
  

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