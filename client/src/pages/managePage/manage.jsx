import React, { useState, useEffect } from "react";
import axios from "axios";
import { facilitySchema, reservationManageSchema, userSchema } from "../../validationSchemaClient";

export default function Manage() {
  const [selectedTable, setSelectedTable] = useState("reservations");
  const [data, setData] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
    fetchFacilities();
    fetchUsers();
  }, [selectedTable]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/${selectedTable}`, { withCredentials: true });
      setData(response.data);
    } catch (error) {
      console.error("Chyba pri načítaní údajov:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/facilities", { withCredentials: true });
      setFacilities(response.data);
    } catch (error) {
      console.error("Chyba pri načítaní zariadení:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/users", { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      console.error("Chyba pri načítaní používateľov:", error);
    }
  };

  const handleTableChange = (e) => {
    setSelectedTable(e.target.value);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditItem(item);
    setFormData(item);
    setErrors({});
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({});
    setErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    try {
      switch (selectedTable) {
        case "facilities":
          facilitySchema.parse(formData);
          break;
        case "reservations":
          reservationManageSchema.parse(formData);
          break;
        case "users":
          userSchema.parse(formData);
          break;
        default:
          throw new Error("Neznáma tabuľka.");
      }
      setErrors({});
      return true;
    } catch (validationError) {
      const errorMap = validationError.errors.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});
      setErrors(errorMap);
      return false;
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isCreating) {
        await axios.post(`http://localhost:8080/api/${selectedTable}`, formData, { withCredentials: true });
        alert("Záznam bol úspešne vytvorený.");
      } else {
        await axios.put(`http://localhost:8080/api/${selectedTable}/${editItem.id}`, formData, { withCredentials: true });
        alert("Záznam bol úspešne upravený.");
      }
      fetchData();
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      alert("Chyba pri ukladaní údajov.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Naozaj chcete zmazať tento záznam?")) {
      try {
        await axios.delete(`http://localhost:8080/api/${selectedTable}/${id}`, { withCredentials: true });
        alert("Záznam bol úspešne zmazaný.");
        fetchData();
      } catch (error) {
        alert("Chyba pri mazaní záznamu.");
      }
    }
  };

  const renderTableHeaders = () => {
    if (data.length === 0) return null;
    const keysToExclude = ["createdAt", "updatedAt"];

    return (
      <thead>
        <tr>
          {Object.keys(data[0])
            .filter((key) => !keysToExclude.includes(key))
            .map((key) => (
              <th key={key}>{key}</th>
            ))}
          <th>Akcie</th>
        </tr>
      </thead>
    );
  };

  const renderFormFields = () => {
    switch (selectedTable) {
      case "facilities":
        return (
          <>
            <label>
              Názov zariadenia:
              <input type="text" name="name" value={formData.name || ""} onChange={handleFormChange} required />
              {errors.name && <p className="error">{errors.name}</p>}
            </label>
            <label>
              V prevádzke:
              <input type="checkbox" name="inService" checked={formData.inService || false} onChange={handleFormChange} />
            </label>
          </>
        );
      case "reservations":
        return (
          <>
            <label>
              Používateľ:
              <select name="user_id" value={formData.user_id || ""} onChange={handleFormChange} required>
                <option value="" disabled>Vyberte používateľa</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.lastName}</option>
                ))}
              </select>
              {errors.user_id && <p className="error">{errors.user_id}</p>}
            </label>
            <label>
              Zariadenie:
              <select name="facility_id" value={formData.facility_id || ""} onChange={handleFormChange} required>
                <option value="" disabled>Vyberte zariadenie</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>{facility.name}</option>
                ))}
              </select>
              {errors.facility_id && <p className="error">{errors.facility_id}</p>}
            </label>
            <label>
              Čas začiatku:
              <input type="datetime-local" name="startTime" value={formData.startTime || ""} onChange={handleFormChange} required />
              {errors.startTime && <p className="error">{errors.startTime}</p>}
            </label>
            <label>
              Čas konca:
              <input type="datetime-local" name="endTime" value={formData.endTime || ""} onChange={handleFormChange} required />
              {errors.endTime && <p className="error">{errors.endTime}</p>}
            </label>
          </>
        );
      case "users":
        return (
          <>
            <label>
              Meno:
              <input type="text" name="firstName" value={formData.firstName || ""} onChange={handleFormChange} required />
              {errors.firstName && <p className="error">{errors.firstName}</p>}
            </label>
            <label>
              Priezvisko:
              <input type="text" name="lastName" value={formData.lastName || ""} onChange={handleFormChange} required />
              {errors.lastName && <p className="error">{errors.lastName}</p>}
            </label>
            <label>
              Email:
              <input type="email" name="email" value={formData.email || ""} onChange={handleFormChange} required />
              {errors.email && <p className="error">{errors.email}</p>}
            </label>
            <label>
              Telefón:
              <input type="text" name="phone" value={formData.phone || ""} onChange={handleFormChange} required />
              {errors.phone && <p className="error">{errors.phone}</p>}
            </label>
            <label>
              Heslo:
              <input type="password" name="password" value={formData.password || ""} onChange={handleFormChange} required={isCreating} />
              {errors.password && <p className="error">{errors.password}</p>}
            </label>
            <label>
              Rola:
              <input type="text" name="role" value={formData.role || ""} onChange={handleFormChange} required />
              {errors.role && <p className="error">{errors.role}</p>}
            </label>
          </>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("sk-SK", options);
  };

  const renderTableRows = () => {
    if (data.length === 0) return null;
    const keysToExclude = ["createdAt", "updatedAt"];

    return (
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            {Object.entries(item)
              .filter(([key]) => !keysToExclude.includes(key))
              .map(([key, value], index) => (
                <td key={index}>
                  {key === "startTime" || key === "endTime" ? formatDate(value) : String(value)}
                </td>
              ))}
            <td>
              <button onClick={() => handleEdit(item)}>Upraviť</button>
              <button onClick={() => handleDelete(item.id)}>Zmazať</button>
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div className="manage-container">
      <h2>Správa údajov</h2>
      <label htmlFor="table-select">Vyber tabuľku:</label>
      <select id="table-select" value={selectedTable} onChange={handleTableChange}>
        <option value="reservations">Rezervácie</option>
        <option value="users">Používatelia</option>
        <option value="facilities">Zariadenia</option>
      </select>

      <button onClick={handleCreate}>Vytvoriť nový záznam</button>

      {isEditing || isCreating ? (
        <form onSubmit={handleFormSubmit}>
          <h3>{isCreating ? "Vytvoriť nový záznam" : "Upraviť záznam"}</h3>
          {renderFormFields()}
          <button type="submit">Uložiť</button>
          <button type="button" onClick={() => { setIsEditing(false); setIsCreating(false); }}>Zrušiť</button>
        </form>
      ) : (
        <div className="table-container">
          <table>
            {renderTableHeaders()}
            {renderTableRows()}
          </table>
        </div>
      )}

      {loading && <p className="loading">Načítavam údaje...</p>}
    </div>
  );
}
