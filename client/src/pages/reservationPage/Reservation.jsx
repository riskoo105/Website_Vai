import React, { useState } from "react";
import axios from "axios";

export default function Reservation() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    facility: "",
    startTime: "",
    endTime: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/reservations", formData);
      alert("Reservation submitted successfully");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        facility: "",
        startTime: "",
        endTime: "",
      });
    } catch (error) {
      alert("Error submitting reservation: " + error.message);
    }
  };

  return (
    <div>
      <section>
        <h2>Vyplňte formulár pre rezerváciu</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="first-name">Meno:</label>
          <input
            type="text"
            id="first-name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <label htmlFor="last-name">Priezvisko:</label>
          <input
            type="text"
            id="last-name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="phone">Telefónne číslo:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label htmlFor="facility">Zariadenie:</label>
          <select
            id="facility"
            name="facility"
            value={formData.facility}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Vyberte zariadenie
            </option>
            <option value="football">Futbalové ihrisko</option>
            <option value="tennis">Tenisový kurt</option>
            <option value="basketball">Basketbalové ihrisko</option>
          </select>

          <label htmlFor="start-time">Čas začiatku rezervácie:</label>
          <input
            type="datetime-local"
            id="start-time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />

          <label htmlFor="end-time">Čas konca rezervácie:</label>
          <input
            type="datetime-local"
            id="end-time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />

          <button type="submit">Rezervovať</button>
        </form>
      </section>
    </div>
  );
}