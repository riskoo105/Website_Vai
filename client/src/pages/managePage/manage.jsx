import React, { useState, useEffect } from "react";
import axios from "axios";
import { reservationSchema } from "../../validationSchemaClient"; // Import validačnej schémy

export default function Manage() {
  const [reservations, setReservations] = useState([]);
  const [editReservation, setEditReservation] = useState(null);
  const [errors, setErrors] = useState({});

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
  const updateReservation = (reservation) => {
    const formattedStartTime = new Date(reservation.startTime).toISOString().slice(0, 16);
    const formattedEndTime = new Date(reservation.endTime).toISOString().slice(0, 16);

    setEditReservation({
      ...reservation,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    });
  };

  // Uloženie aktualizovanej rezervácie
  const saveUpdatedReservation = async () => {
    if (editReservation) {
      try {
        // Validácia údajov pred uložením
        reservationSchema.parse(editReservation);

        await axios.put(`http://localhost:8080/api/reservations/${editReservation.id}`, editReservation);
        alert("Reservation updated successfully!");
        fetchReservations();
        setEditReservation(null);
      } catch (validationError) {
        if (validationError.errors) {
          const errorMap = validationError.errors.reduce((acc, curr) => {
            acc[curr.path[0]] = curr.message;
            return acc;
          }, {});
          setErrors(errorMap);
        } else {
          alert("Error updating reservation: " + validationError.message);
        }
      }
    }
  };

  // Pridanie novej rezervácie
  const createReservation = () => {
    setEditReservation({
      id: null,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      facility: "",
      startTime: "",
      endTime: "",
    });
  };

  // Uloženie novej rezervácie
  const saveNewReservation = async () => {
    try {
      // Validácia údajov pred uložením
      reservationSchema.parse(editReservation);

      await axios.post("http://localhost:8080/api/reservations", editReservation);
      alert("Reservation created successfully!");
      fetchReservations();
      setEditReservation(null);
    } catch (validationError) {
      if (validationError.errors) {
        const errorMap = validationError.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});
        setErrors(errorMap);
      } else {
        alert("Error creating reservation: " + validationError.message);
      }
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div>
      <h2>Manažovanie rezervácií</h2>
      <button onClick={createReservation} className="create-button">
        Vytvoriť rezerváciu
      </button>
      <table>
        <thead>
          <tr>
            <th>Meno</th>
            <th>Priezvisko</th>
            <th>Email</th>
            <th>Telefónne číslo</th> {/* Pridaný stĺpec pre telefónne číslo */}
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
              <td>{reservation.phone}</td> {/* Zobrazenie telefónneho čísla */}
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

      {/* Formulár na editáciu alebo vytvorenie rezervácie */}
      {editReservation && (
        <div className="edit-form">
          <h3>{editReservation.id ? "Upraviť rezerváciu" : "Vytvoriť rezerváciu"}</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <label>
              Meno:
              <input
                type="text"
                value={editReservation.firstName}
                onChange={(e) =>
                  setEditReservation({ ...editReservation, firstName: e.target.value })
                }
              />
              {errors.firstName && <p className="error">{errors.firstName}</p>}
            </label>
            <label>
              Priezvisko:
              <input
                type="text"
                value={editReservation.lastName}
                onChange={(e) =>
                  setEditReservation({ ...editReservation, lastName: e.target.value })
                }
              />
              {errors.lastName && <p className="error">{errors.lastName}</p>}
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
              {errors.email && <p className="error">{errors.email}</p>}
            </label>
            <label>
              Tel.č:
              <input
                type="text"
                value={editReservation.phone}
                onChange={(e) =>
                  setEditReservation({ ...editReservation, phone: e.target.value })
                }
              />
              {errors.phone && <p className="error">{errors.phone}</p>}
            </label>
            <label>
              Zariadenie:
              <select
                value={editReservation.facility}
                onChange={(e) =>
                  setEditReservation({ ...editReservation, facility: e.target.value })
                }
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
            </label>
            <label>
              Čas začiatku:
              <input
                type="datetime-local"
                value={editReservation.startTime}
                onChange={(e) =>
                  setEditReservation({ ...editReservation, startTime: e.target.value })
                }
              />
              {errors.startTime && <p className="error">{errors.startTime}</p>}
            </label>
            <label>
              Čas konca:
              <input
                type="datetime-local"
                value={editReservation.endTime}
                onChange={(e) =>
                  setEditReservation({ ...editReservation, endTime: e.target.value })
                }
              />
              {errors.endTime && <p className="error">{errors.endTime}</p>}
            </label>
            <button
              type="button"
              onClick={editReservation.id ? saveUpdatedReservation : saveNewReservation}
            >
              {editReservation.id ? "Uložiť zmeny" : "Vytvoriť"}
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