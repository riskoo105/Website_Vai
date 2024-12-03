import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Manage() {
  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/reservations");
      setReservations(response.data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const deleteReservation = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/reservations/${id}`);
      alert("Reservation deleted");
      fetchReservations();
    } catch (error) {
      alert("Error deleting reservation: " + error.message);
    }
  };

  const updateReservation = async (id) => {
    // Logic for updating a reservation goes here
    alert(`Update reservation with ID: ${id}`);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div>
      <h2>Manage Reservations</h2>
      <table>
        <thead>
          <tr>
            <th>Meno</th>
            <th>Priezvisko</th>
            <th>Email</th>
            <th>Facility</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td>{reservation.firstName}</td>
              <td>{reservation.lastName}</td>
              <td>{reservation.email}</td>
              <td>{reservation.facility}</td>
              <td>{reservation.startTime}</td>
              <td>{reservation.endTime}</td>
              <td>
                <button onClick={() => updateReservation(reservation.id)}>
                  Edit
                </button>
                <button onClick={() => deleteReservation(reservation.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}