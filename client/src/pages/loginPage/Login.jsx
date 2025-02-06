import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";
import { loginSchema } from "../../validationSchemaClient";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); 

    try {
      loginSchema.parse(formData);
    } catch (validationError) {
      const errorMap = validationError.errors.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});
      setErrors(errorMap);
      return;
    } 

    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (error) {
      setErrors({ apiError: "Chyba pri prihlásení. Skontrolujte email alebo heslo." });
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
        {errors.email && <p className="error">{errors.email}</p>}

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        {errors.password && <p className="error">{errors.password}</p>}

        {errors.apiError && <p className="error">{errors.apiError}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}