import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Manage() {
  const [selectedTable, setSelectedTable] = useState("reservations");
  const [data, setData] = useState([]);
  const [facilities, setFacilities] = useState([]);  // Pridanie zariadení
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
    fetchFacilities();  // Načítanie zariadení
  }, [selectedTable]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/${selectedTable}`, {
        withCredentials: true,
      });
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
      const response = await axios.get("http://localhost:8080/api/facilities", {
        withCredentials: true,
      });
      setFacilities(response.data);
    } catch (error) {
      console.error("Chyba pri načítaní zariadení:", error);
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
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (selectedTable === "reservations" && !formData.facility_id) {
      alert("Prosím, vyberte zariadenie pre rezerváciu.");
      return;
    }

    try {
      const payload = {
        ...formData,
        facility_id: Number(formData.facility_id),  // Uistíme sa, že posielame číslo
      };
      
      if (isCreating) {
        await axios.post(`http://localhost:8080/api/${selectedTable}`, payload, { withCredentials: true });
        alert("Záznam bol úspešne vytvorený.");
      } else {
        await axios.put(`http://localhost:8080/api/${selectedTable}/${editItem.id}`, payload, { withCredentials: true });
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
        await axios.delete(`http://localhost:8080/api/${selectedTable}/${id}`, {
          withCredentials: true,
        });
        alert("Záznam bol úspešne zmazaný.");
        fetchData();
      } catch (error) {
        alert("Chyba pri mazaní záznamu.");
      }
    }
  };

  const renderTableHeaders = () => {
    if (data.length === 0) return null;
    return (
      <thead>
        <tr>
          {Object.keys(data[0]).map((key) => (
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
              Používateľ ID:
              <input type="number" name="user_id" value={formData.user_id || ""} onChange={handleFormChange} required />
            </label>
            <label>
              Zariadenie:
              <select name="facility_id" value={formData.facility_id || ""} onChange={handleFormChange} required>
                <option value="" disabled>Vyberte zariadenie</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>{facility.name}</option>
                ))}
              </select>
            </label>
            <label>
              Čas začiatku:
              <input type="datetime-local" name="startTime" value={formData.startTime || ""} onChange={handleFormChange} required />
            </label>
            <label>
              Čas konca:
              <input type="datetime-local" name="endTime" value={formData.endTime || ""} onChange={handleFormChange} required />
            </label>
          </>
        );
      case "users":
        return (
          <>
            <label>
              Meno:
              <input type="text" name="firstName" value={formData.firstName || ""} onChange={handleFormChange} required />
            </label>
            <label>
              Priezvisko:
              <input type="text" name="lastName" value={formData.lastName || ""} onChange={handleFormChange} required />
            </label>
            <label>
              Email:
              <input type="email" name="email" value={formData.email || ""} onChange={handleFormChange} required />
            </label>
            <label>
              Telefón:
              <input type="text" name="phone" value={formData.phone || ""} onChange={handleFormChange} required />
            </label>
            <label>
              Heslo:
              <input type="password" name="password" value={formData.password || ""} onChange={handleFormChange} required={isCreating} />
            </label>
            <label>
              Rola:
              <input type="text" name="role" value={formData.role || ""} onChange={handleFormChange} required />
            </label>
          </>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    if (data.length === 0) return null;
    return (
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            {Object.entries(item).map(([key, value], index) => (
              <td key={index}>{key === "inService" ? (value ? "Áno" : "Nie") : String(value)}</td>
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
    <div>
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
        <table border="1">
          {renderTableHeaders()}
          {renderTableRows()}
        </table>
      )}

      {loading && <p>Načítavam údaje...</p>}
    </div>
  );
}
