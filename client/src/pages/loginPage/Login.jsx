import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/api/login", formData);
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);  // Uloženie tokenu do localStorage
        navigate("/");  // Presmerovanie na domovskú stránku po prihlásení
      }
    } catch (error) {
      setErrorMessage("Chyba pri prihlásení. Skontrolujte email alebo heslo.");
    }
  };

  return (
    <div>
      <h2>Prihlásenie</h2>
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
          placeholder="Heslo"
          required
        />
        {errorMessage && <p>{errorMessage}</p>}
        <button type="submit">Prihlásiť sa</button>
      </form>
    </div>
  );
}