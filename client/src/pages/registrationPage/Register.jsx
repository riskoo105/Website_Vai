import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { registerSchema } from "../../validationSchemaClient";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [errors, setErrors] = useState({}); // Chyby validácie

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      registerSchema.parse(formData);
    } catch (validationError) {
      const errorMap = validationError.errors.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});
      setErrors(errorMap);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Heslá sa musia zhodovať!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/register", formData);
      if (response.status === 201) {
        navigate("/login");  // Presmerovanie na login po úspešnej registrácii
      }
    } catch (error) {
      setErrorMessage("Chyba pri registrácii. Skúste to znova.");
    }
  };

  return (
    <div>
      <h2>Registrácia</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Meno"
          required
        />
        {errors.firstName && <p className="error">{errors.firstName}</p>}

        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Priezvisko"
          required
        />
        {errors.lastName && <p className="error">{errors.lastName}</p>}

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Telefónne číslo"
          required
        />
        {errors.phone && <p className="error">{errors.phone}</p>}

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Heslo"
          required
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Potvrdiť heslo"
          required
        />
        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

        {errorMessage && <p>{errorMessage}</p>}
        <button type="submit">Registrovať sa</button>
      </form>
    </div>
  );
}