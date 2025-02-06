import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (error) {
      setErrorMessage("Chyba pri prihlásení. Skontrolujte email alebo heslo.");
    }
  };

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