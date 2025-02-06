import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/profile", { withCredentials: true });
        setUserData(response.data);
      } catch (error) {
        console.error("Chyba pri načítavaní profilu používateľa:", error);
        alert("Chyba pri načítavaní údajov používateľa.");
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      await axios.put("http://localhost:8080/api/profile", userData, {
        withCredentials: true,
      });

      if (selectedFile) {
        const formData = new FormData();
        formData.append("profileImage", selectedFile);

        const imageUploadResponse = await axios.post(
          "http://localhost:8080/api/upload-profile-image",
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setUserData((prevData) => ({
          ...prevData,
          profileImage: imageUploadResponse.data.imageUrl,
        }));
      }

      alert("Údaje boli úspešne aktualizované.");
      setIsEditing(false);
    } catch (error) {
      console.error("Chyba pri aktualizácii profilu používateľa:", error);
      alert("Chyba pri ukladaní údajov.");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        {userData.profileImage ? (
          <img
            src={`http://localhost:8080${userData.profileImage}`}
            alt="Profilová fotka"
            className="profile-image"
          />
        ) : (
          <p>Žiadna fotka</p>
        )}
        <h2>
          {userData.firstName} {userData.lastName}
        </h2>
        <p>Email: {userData.email}</p>
        <p>Telefónne číslo: {userData.phone}</p>

        <div className="profile-actions">
          {!isEditing ? (
            <button onClick={handleEditToggle} className="btn-edit">
              Upraviť profil
            </button>
          ) : (
            <>
              <label className="file-input-label">
                Profilová fotka:
                <input type="file" onChange={handleFileChange} />
              </label>

              <div className="input-group">
                <label>Meno:</label>
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Priezvisko:</label>
                <input
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Telefónne číslo:</label>
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-buttons">
                <button onClick={handleSave} className="btn-save">
                  Uložiť
                </button>
                <button onClick={handleEditToggle} className="btn-cancel">
                  Zrušiť
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
