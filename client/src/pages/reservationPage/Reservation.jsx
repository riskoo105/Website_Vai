import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { reservationSchema } from "../../validationSchemaClient";

export default function Reservation() {
  const [formData, setFormData] = useState({
    facility: "",
    startTime: "",
    endTime: "",
  });
  const [facilities, setFacilities] = useState([]); // Načítané zariadenia
  const [errors, setErrors] = useState({}); // Chyby validácie

  useEffect(() => {
    // Načítanie dostupných zariadení
    axios.get("http://localhost:8080/api/facilities/in-service")
      .then(response => {
        setFacilities(response.data);
      })
      .catch(() => {
        alert("Chyba pri načítavaní zariadení.");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
  
    if (!formData.facility) {
      alert("Prosím, vyberte zariadenie.");
      return;
    }

    try {
      reservationSchema.parse(formData);  // Validácia údajov
    } catch (validationError) {
      const errorMap = validationError.errors.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});
      setErrors(errorMap);
      return;  // Zastavíme odoslanie, ak sú chyby
    }
  
    try {
      let token = Cookies.get("accessToken");
      if (!token) {
        console.error("Access token chýba, pokúšam sa obnoviť...");
        const response = await axios.post("http://localhost:8080/api/refresh-token", {}, { withCredentials: true });
        token = response.data.accessToken;
        Cookies.set("accessToken", token, { path: "/" });
      }
  
      // Ensure token is not null before parsing
      if (!token) {
        throw new Error("Access token is missing even after refresh.");
      }
  
      const userInfo = JSON.parse(atob(token.split(".")[1]));
      console.log("Odosielané údaje pre rezerváciu:", {
        user_id: userInfo.id,
        facility_id: formData.facility,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
  
      await axios.post(
        "http://localhost:8080/api/reservations",
        {
          user_id: userInfo.id,
          facility_id: formData.facility,
          startTime: formData.startTime,
          endTime: formData.endTime,
        },
        { withCredentials: true }
      );
  
      alert("Rezervácia úspešne odoslaná!");
      setFormData({ facility: "", startTime: "", endTime: "" });
  
    } catch (error) {
      console.error("Chyba pri odosielaní rezervácie:", error);
      alert("Chyba pri odosielaní rezervácie.");
    }
  };
  

  return (
    <div>
      <section>
        <h2>Vyplňte formulár pre rezerváciu</h2>
        <form onSubmit={handleSubmit}>
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
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
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
