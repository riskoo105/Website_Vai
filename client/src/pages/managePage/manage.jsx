import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

export default function Manage() {
  const [reservations, setReservations] = useState([]);
  const [editReservation, setEditReservation] = useState(null);

  // Načítanie všetkých rezervácií
  const fetchReservations = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/reservations");
      setReservations(response.data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  // Zmazanie rezervácie
  const deleteReservation = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/reservations/${id}`);
      alert("Reservation deleted");
      fetchReservations();
    } catch (error) {
      alert("Error deleting reservation: " + error.message);
    }
  };

  // Začatie procesu editácie rezervácie
  const updateReservation = async (reservation) => {
    setEditReservation(reservation);
  };

  // Uloženie aktualizovanej rezervácie
  const saveUpdatedReservation = async () => {
    if (editReservation) {
        // Preformátovanie dátumov pred odoslaním na server
        const formattedStartTime = format(new Date(editReservation.startTime), 'yyyy-MM-dd HH:mm:ss');
        const formattedEndTime = format(new Date(editReservation.endTime), 'yyyy-MM-dd HH:mm:ss');

    // Uloženie na server s preformátovanými dátumami
    try {
        await axios.put(
          `http://localhost:8080/api/reservations/${editReservation.id}`,
          {
            ...editReservation,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
          }
        );
        alert("Reservation updated successfully!");
        fetchReservations();
        setEditReservation(null);
      } catch (error) {
        alert("Error updating reservation: " + error.message);
      }
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div>
      <h2>Manažovanie rezervácií</h2>
      <table>
        <thead>
          <tr>
            <th>Meno</th>
            <th>Priezvisko</th>
            <th>Email</th>
            <th>Zariadenie</th>
            <th>Čas začiatku</th>
            <th>Čas konca</th>
            <th>Akcie</th>
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
                <button onClick={() => updateReservation(reservation)}>
                  Upraviť
                </button>
                <button onClick={() => deleteReservation(reservation.id)}>
                  Zmazať
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Formulár na editáciu rezervácie */}
      {editReservation && (
        <div className="edit-form">
          <h3>Edit Reservation</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <label>
              First Name:
              <input
                type="text"
                value={editReservation.firstName}
                onChange={(e) =>
                  setEditReservation({
                    ...editReservation,
                    firstName: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Last Name:
              <input
                type="text"
                value={editReservation.lastName}
                onChange={(e) =>
                  setEditReservation({
                    ...editReservation,
                    lastName: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={editReservation.email}
                onChange={(e) =>
                  setEditReservation({ ...editReservation, email: e.target.value })
                }
              />
            </label>
            <label>
              Facility:
              <input
                type="text"
                value={editReservation.facility}
                onChange={(e) =>
                  setEditReservation({ ...editReservation, facility: e.target.value })
                }
              />
            </label>
            <label>
              Start Time:
              <input
                type="text"
                value={editReservation.startTime}
                onChange={(e) =>
                  setEditReservation({ ...editReservation, startTime: e.target.value })
                }
              />
            </label>
            <label>
              End Time:
              <input
                type="text"
                value={editReservation.endTime}
                onChange={(e) =>
                  setEditReservation({ ...editReservation, endTime: e.target.value })
                }
              />
            </label>
            <button type="button" onClick={saveUpdatedReservation}>
              Uložiť zmeny
            </button>
            <button type="button" onClick={() => setEditReservation(null)}>
              Zrušiť
            </button>
          </form>
        </div>
      )}
    </div>
  );
}