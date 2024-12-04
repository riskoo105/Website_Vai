import React, { useState } from "react";
import axios from "axios";
import { reservationSchema } from "../../validationSchemaClient"; // Import validačnej schémy

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

  const [errors, setErrors] = useState({});

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
      // Validácia údajov pomocou zdieľanej schémy
      reservationSchema.parse(formData);
      setErrors({}); // Resetovať chyby pri úspešnej validácii

      // Poslanie údajov na server, ak je validácia úspešná
      await axios.post("http://localhost:8080/api/reservations", formData);
      alert("Rezervácia úspešne odoslaná!");

      // Resetovanie formulára po úspešnom odoslaní
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        facility: "",
        startTime: "",
        endTime: "",
      });
    } catch (validationError) {
      // Ak validácia zlyhá, zobraziť chyby
      if (validationError.errors) {
        const errorMap = validationError.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});
        setErrors(errorMap);
      }
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
          {errors.firstName && <p className="error">{errors.firstName}</p>}

          <label htmlFor="last-name">Priezvisko:</label>
          <input
            type="text"
            id="last-name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          {errors.lastName && <p className="error">{errors.lastName}</p>}

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label htmlFor="phone">Telefónne číslo:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && <p className="error">{errors.phone}</p>}

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
          {errors.facility && <p className="error">{errors.facility}</p>}

          <label htmlFor="start-time">Čas začiatku rezervácie:</label>
          <input
            type="datetime-local"
            id="start-time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
          {errors.startTime && <p className="error">{errors.startTime}</p>}

          <label htmlFor="end-time">Čas konca rezervácie:</label>
          <input
            type="datetime-local"
            id="end-time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
          {errors.endTime && <p className="error">{errors.endTime}</p>}

          <button type="submit">Rezervovať</button>
        </form>
      </section>
    </div>
  );
}