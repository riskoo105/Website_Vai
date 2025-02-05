import React, { useState, useEffect } from "react";
import axios from "axios";
//import { reservationSchema } from "../../validationSchemaClient"; 
import Cookies from "js-cookie";

export default function Reservation() {
  const [formData, setFormData] = useState({
    facility: "",
    startTime: "",
    endTime: "",
  });
  const [facilities, setFacilities] = useState([]); // Načítané zariadenia
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState({});

  // Načítanie prihláseného používateľa
  useEffect(() => {
    const verifyToken = async () => {
      let token = Cookies.get("accessToken");
  
      if (!token) {
        console.error("Access token chýba. Pokúšam sa obnoviť...");
        try {
          const response = await axios.post("http://localhost:8080/api/refresh-token", {}, { withCredentials: true });
          token = response.data.accessToken;
          Cookies.set("accessToken", token, { path: "/" });  // Uložíme nový token
        } catch (error) {
          console.error("Chyba pri obnove tokenu:", error);
          return;
        }
      }
  
      try {
        const userInfo = JSON.parse(atob(token.split(".")[1]));
        console.log("Dekódované údaje používateľa:", userInfo);
        setUserData({
          id: userInfo.id,
          email: userInfo.email,
        });
      } catch (error) {
        console.error("Chyba pri dekódovaní tokenu:", error);
      }
    };
  
    verifyToken();
  }, []);
  

  // Načítanie dostupných zariadení
  useEffect(() => {
    axios.get("http://localhost:8080/api/facilities")
      .then(response => {
        setFacilities(response.data); // Uloženie načítaných zariadení
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
  
    try {
      // Kontrola platnosti access tokenu
      let token = Cookies.get("accessToken");
      if (!token) {
        console.log("Access token chýba, pokúšam sa obnoviť...");
        const response = await axios.post("http://localhost:8080/api/refresh-token", {}, { withCredentials: true });
        token = response.data.accessToken;
        Cookies.set("accessToken", token, { path: "/" });
      }
  
      // Overenie dekódovania tokenu
      const userInfo = JSON.parse(atob(token.split(".")[1]));
      console.log("Dekódované údaje používateľa:", userInfo);
  
      // Odoslanie rezervácie
      console.log("Odosielané údaje:", {
        user_id: userInfo.id,
        facility: formData.facility,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
  
      await axios.post("http://localhost:8080/api/reservations", {
        user_id: userInfo.id,
        facility: formData.facility,
        startTime: formData.startTime,
        endTime: formData.endTime,
      }, {
        withCredentials: true  // Toto musí byť pridané pre odoslanie cookies
      });
  
      alert("Rezervácia úspešne odoslaná!");
      setFormData({
        facility: "",
        startTime: "",
        endTime: "",
      });
  
    } catch (error) {
      console.error("Chyba pri odosielaní rezervácie:", error);
      alert("Chyba pri odosielaní rezervácie.");
    }
  };
  
  

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response.status === 401 && error.response.data.message === "Invalid token") {
        try {
          // Požiadavka na obnovu tokenu
          await axios.post("http://localhost:8080/api/refresh-token");
          // Opätovné odoslanie pôvodnej požiadavky
          return axios(error.config);
        } catch (refreshError) {
          console.error("Unable to refresh token:", refreshError);
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

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
