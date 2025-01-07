import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/api/login", formData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        Cookies.set("accessToken", response.data.accessToken, { expires: 7, path: "/" });
        Cookies.set("refreshToken", response.data.refreshToken, { expires: 7, path: "/" });
        Cookies.set("role", response.data.role, { expires: 7, path: "/" });

        navigate("/");  // Redirect after successful login
      }
    } catch (error) {
      setErrorMessage("Error logging in. Please check your email or password.");
    }
  };

  // Helper function to refresh access token if expired
  const refreshAccessToken = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/refresh-token", null, {
        withCredentials: true,
      });

      // Update the new access token in cookies
      if (response.data.accessToken) {
        Cookies.set("accessToken", response.data.accessToken, { expires: 7, path: "/" });
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  // Effect to refresh token if the access token expires
  useEffect(() => {
    const accessToken = Cookies.get("accessToken");

    if (accessToken) {
      const tokenExpiration = new Date(JSON.parse(atob(accessToken.split(".")[1]))?.exp * 1000);
      const now = new Date();

      if (now >= tokenExpiration) {
        // Token has expired, refresh it
        refreshAccessToken();
      }
    }
  }, []);

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        {errorMessage && <p>{errorMessage}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
