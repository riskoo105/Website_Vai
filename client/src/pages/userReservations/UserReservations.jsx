import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UserReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/user-reservations", { withCredentials: true });
      setReservations(response.data);
    } catch (err) {
      setError("Chyba pri načítaní rezervácií.");
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId) => {
    if (!window.confirm("Naozaj chcete zrušiť túto rezerváciu?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/reservations/${reservationId}`, { withCredentials: true });
      alert("Rezervácia bola úspešne zrušená.");
      fetchReservations();
    } catch (err) {
      alert("Chyba pri rušení rezervácie.");
    }
  };

  const isPastReservation = (endTime) => {
    return new Date(endTime) < new Date();
  };

  return (
    <div className="reservations-container">
      <h2>Moje rezervácie</h2>
      {loading && <p className="loading">Načítavam rezervácie...</p>}
      {error && <p className="error">{error}</p>}

      <h3>Naplánované rezervácie</h3>
      <ul className="reservation-list">
        {reservations
          .filter((reservation) => !isPastReservation(reservation.endTime))
          .map((reservation) => (
            <li key={reservation.id} className="reservation-item">
              <p><strong>Zariadenie:</strong> {reservation.facility_id}</p>
              <p><strong>Začiatok:</strong> {new Date(reservation.startTime).toLocaleString()}</p>
              <p><strong>Koniec:</strong> {new Date(reservation.endTime).toLocaleString()}</p>
              <button onClick={() => cancelReservation(reservation.id)} className="cancel-button">
                Zrušiť rezerváciu
              </button>
            </li>
          ))}
      </ul>

      <h3>História rezervácií</h3>
      <ul className="reservation-list">
        {reservations
          .filter((reservation) => isPastReservation(reservation.endTime))
          .map((reservation) => (
            <li key={reservation.id} className="reservation-item">
              <p><strong>Zariadenie:</strong> {reservation.facility_id}</p>
              <p><strong>Začiatok:</strong> {new Date(reservation.startTime).toLocaleString()}</p>
              <p><strong>Koniec:</strong> {new Date(reservation.endTime).toLocaleString()}</p>
              <p className="completed-reservation">Ukončené</p>
            </li>
          ))}
      </ul>
    </div>
  );
}
