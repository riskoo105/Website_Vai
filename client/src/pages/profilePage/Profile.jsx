import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import { profileSchema, passwordSchema } from "../../validationSchemaClient";

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState({});
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/profile", {
          withCredentials: true,
        });
        setUserData(response.data);
        setEditData(response.data);  // Initialize the form data with fetched user data
      } catch (error) {
        console.error("Chyba pri načítavaní profilu používateľa:", error);
        alert("Chyba pri načítavaní údajov používateľa.");
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handlePasswordToggle = () => {
    setIsChangingPassword(!isChangingPassword);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const validateProfile = () => {
    try {
      profileSchema.parse(editData);
      setErrors({});
      return true;
    } catch (validationError) {
      const errorMap = {};
      validationError.errors.forEach((error) => {
        errorMap[error.path[0]] = error.message;
      });
      setErrors(errorMap);
      return false;
    }
  };

  const validatePassword = () => {
    try {
      passwordSchema.parse(passwordData);
      setErrors({});
      return true;
    } catch (validationError) {
      const errorMap = {};
      validationError.errors.forEach((error) => {
        errorMap[error.path[0]] = error.message;
      });
      setErrors(errorMap);
      return false;
    }
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    try {
      await axios.put("http://localhost:8080/api/profile", editData, {
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
        setEditData((prevData) => ({
          ...prevData,
          profileImage: imageUploadResponse.data.imageUrl,
        }));
      }

      alert("Údaje boli úspešne aktualizované.");
      setUserData(editData);  // Update the header data only after successful saving
      setIsEditing(false);
    } catch (error) {
      console.error("Chyba pri aktualizácii profilu používateľa:", error);
      alert("Chyba pri ukladaní údajov.");
    }
  };

  const handleSavePassword = async () => {
    if (!validatePassword()) return;

    try {
      await axios.put(
        "http://localhost:8080/api/profile/change-password",
        { password: passwordData.newPassword },
        { withCredentials: true }
      );
      alert("Heslo bolo úspešne zmenené.");
      setPasswordData({ newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
    } catch (error) {
      console.error("Chyba pri zmene hesla:", error);
      alert("Chyba pri zmene hesla.");
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
          <button onClick={handleEditToggle} className="btn-edit">
            Upraviť profil
          </button>
          <button onClick={handlePasswordToggle} className="btn-password">
            Zmeniť heslo
          </button>
        </div>

        {isEditing && (
          <div className="edit-section">
            <label className="file-input-label">
              Profilová fotka:
              <input type="file" onChange={handleFileChange} />
            </label>

            <div className="input-group">
              <label>Meno:</label>
              <input
                type="text"
                name="firstName"
                value={editData.firstName}
                onChange={handleChange}
                required
              />
              {errors.firstName && <p className="error">{errors.firstName}</p>}
            </div>

            <div className="input-group">
              <label>Priezvisko:</label>
              <input
                type="text"
                name="lastName"
                value={editData.lastName}
                onChange={handleChange}
                required
              />
              {errors.lastName && <p className="error">{errors.lastName}</p>}
            </div>

            <div className="input-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <div className="input-group">
              <label>Telefónne číslo:</label>
              <input
                type="tel"
                name="phone"
                value={editData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <p className="error">{errors.phone}</p>}
            </div>

            <div className="profile-buttons">
              <button onClick={handleSaveProfile} className="btn-save">
                Uložiť
              </button>
              <button onClick={handleEditToggle} className="btn-cancel">
                Zrušiť
              </button>
            </div>
          </div>
        )}

        {isChangingPassword && (
          <div className="password-section">
            <h3>Zmeniť heslo</h3>
            <div className="input-group">
              <label>Nové heslo:</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
              {errors.newPassword && <p className="error">{errors.newPassword}</p>}
            </div>

            <div className="input-group">
              <label>Potvrdenie hesla:</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
              {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
            </div>

            <div className="profile-buttons">
              <button onClick={handleSavePassword} className="btn-save">
                Uložiť heslo
              </button>
              <button onClick={() => setIsChangingPassword(false)} className="btn-cancel">
                Zrušiť
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
