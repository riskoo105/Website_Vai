const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const axios = require('axios');
const multer = require("multer");
const path = require("path");
//const { reservationSchema } = require("./validationSchemaServer");

app.use(cors({
  origin: "http://localhost:5173", // URL vašho frontendu
  credentials: true, // Povolenie odosielania a prijímania cookies
}));
app.use(bodyParser.json());
app.use(cookieParser()); // Pre prácu s cookies
app.use("/uploads", express.static("uploads"));

require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database.");
  }
});

// Nastavenie úložiska súborov
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");  // Súbory sa budú ukladať do priečinka "uploads"
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// POST - Register a new user
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).send("Error checking for existing user");
      }

      if (results.length > 0) {
        return res.status(400).send("Email is already in use");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertUserQuery = "INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)";
      db.query(
        insertUserQuery,
        [firstName, lastName, email, phone, hashedPassword],
        (err, result) => {
          if (err) {
            return res.status(500).send("Error registering user");
          }
          res.status(201).send({ id: result.insertId });
        }
      );
    });
  } catch (error) {
    res.status(500).send("Error during registration");
  }
});

// POST - Login (prihlásenie používateľa)
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).send("Invalid email or password");
      }

      const user = results[0];
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).send("Invalid email or password");
      }

      // Generujeme access a refresh token
      const payload = { id: user.id, email: user.email, role: user.role };
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10m" });
      const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expirácia access tokenu
      const insertQuery = `
        INSERT INTO user_tokens (user_id, accessToken, refreshToken, expiresAt)
        VALUES (?, ?, ?, ?)
      `;
      db.query(insertQuery, [user.id, accessToken, refreshToken, expiresAt], (err) => {
        if (err) {
          return res.status(500).send("Error saving token");
        }

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: false, // Zmena na false pre lokálne testovanie
          sameSite: "Strict",
          path: "/"
        });
        
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: "Strict",
          path: "/"
        });

        res.status(200).send({
          message: "Login successful",
          accessToken: accessToken,
          refreshToken: refreshToken,
          role: user.role,
          id: user.id, // Posielame aj ID užívateľa pre lepšiu navigáciu vo frontende
        });
      });
    });
  } catch (error) {
    res.status(500).send("Error during login");
  }
});

// Middleware na autentifikáciu s kontrolou obnovy
const authenticateToken = async (req, res, next) => {
  let accessToken = req.cookies.accessToken;

  if (!accessToken) {
    console.log("Access token chýba, pokúšam sa obnoviť...");
    try {
      const refreshResponse = await axios.post("http://localhost:8080/api/refresh-token", {}, { withCredentials: true });
      accessToken = refreshResponse.data.accessToken;
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        path: "/",
      });
    } catch (error) {
      console.error("Obnova tokenu zlyhala:", error);
      return res.status(401).json({ message: "Unable to authenticate" });
    }
  }

  try {
    const user = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.error("Access token je neplatný:", err);
    res.status(403).json({ message: "Invalid token" });
  }
};

// GET - Overenie prihlásenia
app.get("/api/auth-check", authenticateToken, (req, res) => {
  res.status(200).json({ message: "User is authenticated", role: req.user.role });
});

// POST - Create reservation
app.post("/api/reservations", authenticateToken, (req, res) => {
  const { user_id, facility_id, startTime, endTime } = req.body;

  if (!user_id || !facility_id || !startTime || !endTime) {
    return res.status(400).send("Chýbajúce alebo nesprávne údaje pre rezerváciu.");
  }

  const query = `
    INSERT INTO reservations (user_id, facility_id, startTime, endTime) 
    VALUES (?, ?, ?, ?)
  `;
  db.query(query, [user_id, facility_id, startTime, endTime], (err, result) => {
    if (err) {
      console.error("Chyba pri vkladaní rezervácie:", err);
      return res.status(500).send("Error inserting reservation");
    }
    res.status(201).send({ id: result.insertId });
  });
});



// GET - Fetch all reservations
app.get("/api/reservations", authenticateToken, (req, res) => {
  const query = "SELECT * FROM reservations";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching reservations");
    }
    res.json(results);
  });
});

// DELETE - Delete reservation
app.delete("/api/reservations/:id", authenticateToken, (req, res) => {
  const reservationId = req.params.id;

  if (!reservationId) {
    return res.status(400).send("Reservation ID is required.");
  }

  const query = "DELETE FROM reservations WHERE id = ?";

  db.query(query, [reservationId], (err, result) => {
    if (err) {
      console.error("Chyba pri mazaní rezervácie:", err);
      return res.status(500).send("Error deleting reservation");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Reservation not found");
    }

    res.status(200).send("Reservation deleted successfully");
  });
});


// PUT - Update reservation
app.put("/api/reservations/:id", authenticateToken, (req, res) => {
  try {
    const { user_id, facility_id, startTime, endTime } = req.body;

    if (!user_id || !facility_id || !startTime || !endTime) {
      return res.status(400).send("Chýbajúce alebo neplatné údaje pre aktualizáciu rezervácie.");
    }

    const query = `
      UPDATE reservations 
      SET user_id = ?, facility_id = ?, startTime = ?, endTime = ? 
      WHERE id = ?
    `;

    db.query(query, [user_id, facility_id, startTime, endTime, req.params.id], (err, result) => {
      if (err) {
        console.error("Chyba pri aktualizácii rezervácie:", err);
        return res.status(500).send("Error updating reservation");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Reservation not found");
      }

      res.status(200).send("Reservation updated successfully");
    });
  } catch (error) {
    console.error("Chyba pri validácii alebo aktualizácii rezervácie:", error);
    res.status(400).json({ error: "Invalid request" });
  }
});

// POST - Add new user
app.post("/api/users", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }

  const { firstName, lastName, email, phone, password, role } = req.body;

  if (!firstName || !lastName || !email || !phone || !password || !role) {
    return res.status(400).send("Chýbajúce údaje na vytvorenie používateľa.");
  }

  try {
    // Hashovanie hesla
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = "INSERT INTO users (firstName, lastName, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [firstName, lastName, email, phone, hashedPassword, role], (err, result) => {
      if (err) {
        console.error("Chyba pri vkladaní používateľa:", err);
        return res.status(500).send("Error creating user");
      }
      res.status(201).send("User created successfully");
    });
  } catch (error) {
    console.error("Chyba pri hashovaní hesla:", error);
    res.status(500).send("Error hashing password");
  }
});

// Endpoint na nahrávanie profilovej fotky
app.post("/api/upload-profile-image", authenticateToken, upload.single("profileImage"), (req, res) => {
  const imageUrl = `/uploads/${req.file.filename}`;

  const query = "UPDATE users SET profileImage = ? WHERE id = ?";
  db.query(query, [imageUrl, req.user.id], (err) => {
    if (err) {
      console.error("Chyba pri ukladaní profilovej fotky:", err);
      return res.status(500).send("Error updating profile image");
    }
    res.status(200).json({ imageUrl });
  });
});

// Získanie aj s fotkou údajov
app.get("/api/profile", authenticateToken, (req, res) => {
  const userId = req.user.id; // Získame ID aktuálneho používateľa z tokenu

  const query = "SELECT firstName, lastName, email, phone, profileImage FROM users WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Chyba pri načítavaní profilu:", err);
      return res.status(500).send("Chyba servera");
    }
    if (results.length === 0) {
      return res.status(404).send("Používateľ neexistuje");
    }
    res.json(results[0]);
  });
});

// PUT - profile settings of user (without password change)
app.put("/api/profile", authenticateToken, async (req, res) => {
  const userId = req.user.id; // Take the ID directly from the authenticated user
  
  const { firstName, lastName, email, phone } = req.body;
  const updateQuery = "UPDATE users SET firstName = ?, lastName = ?, email = ?, phone = ? WHERE id = ?";
  const queryParams = [firstName, lastName, email, phone, userId];

  try {
    db.query(updateQuery, queryParams, (err) => {
      if (err) {
        console.error("Error updating profile:", err);
        return res.status(500).send("Error updating profile");
      }
      res.send("Profile updated successfully");
    });
  } catch (error) {
    console.error("Error processing profile update:", error);
    res.status(500).send("Error processing profile update");
  }
});

// PUT - Change password of the user
app.put("/api/profile/change-password", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { password } = req.body;

  if (!password) {
    return res.status(400).send("Password is required");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "UPDATE users SET password = ? WHERE id = ?";

    db.query(query, [hashedPassword, userId], (err) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).send("Error updating password");
      }
      res.send("Password updated successfully");
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).send("Error processing password update");
  }
});

// PUT - Update user (with password option)
app.put("/api/users/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }

  const { firstName, lastName, email, phone, role, password } = req.body;
  let updateQuery = "UPDATE users SET firstName = ?, lastName = ?, email = ?, phone = ?, role = ?";
  const queryParams = [firstName, lastName, email, phone, role];

  try {
    // Ak je poskytnuté nové heslo, hashujeme ho a pridáme do update query
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ", password = ?";
      queryParams.push(hashedPassword);
    }
    updateQuery += " WHERE id = ?";
    queryParams.push(req.params.id);

    db.query(updateQuery, queryParams, (err, result) => {
      if (err) {
        console.error("Chyba pri aktualizácii používateľa:", err);
        return res.status(500).send("Error updating user");
      }
      res.send("User updated successfully");
    });
  } catch (error) {
    console.error("Chyba pri hashovaní hesla:", error);
    res.status(500).send("Error hashing password");
  }
});

// GET - získanie konkrétneho používateľa
app.get("/api/users/:id", authenticateToken, (req, res) => {
  const userId = req.params.id;

  const query = "SELECT id, firstName, lastName, email, phone FROM users WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Chyba pri získavaní používateľa:", err);
      return res.status(500).send("Chyba servera");
    }

    if (results.length === 0) {
      return res.status(404).send("Používateľ nebol nájdený");
    }

    res.status(200).json(results[0]);
  });
});

// GET - Zobrazenie všetkých používateľov
app.get("/api/users", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }
  db.query("SELECT id, firstName, lastName, email, phone, role FROM users", (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching users");
    }
    res.json(results);
  });
});

// DELETE - Zmazanie používateľa
app.delete("/api/users/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      return res.status(500).send("Error deleting user");
    }
    res.send("User deleted successfully");
  });
});

// GET - Fetch facilities in service (pre Reservation.jsx)
app.get("/api/facilities/in-service", (req, res) => {
  const query = "SELECT id, name FROM facilities WHERE inService = TRUE";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching in-service facilities");
    }
    res.json(results);
  });
});

// GET - Zobrazenie všetkých zariadení
app.get("/api/facilities", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }
  db.query("SELECT * FROM facilities", (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching facilities");
    }
    res.json(results);
  });
});

// POST - Pridanie zariadenia
app.post("/api/facilities", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }
  const { name, inService } = req.body;
  db.query("INSERT INTO facilities (name, inService) VALUES (?, ?)", [name, inService], (err) => {
    if (err) {
      return res.status(500).send("Error adding facility");
    }
    res.send("Facility added successfully");
  });
});

// PUT - Aktualizácia zariadenia
app.put("/api/facilities/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }
  const { name, inService } = req.body;
  db.query("UPDATE facilities SET name = ?, inService = ? WHERE id = ?", [name, inService, req.params.id], (err) => {
    if (err) {
      return res.status(500).send("Error updating facility");
    }
    res.send("Facility updated successfully");
  });
});

// DELETE - Zmazanie zariadenia
app.delete("/api/facilities/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }
  db.query("DELETE FROM facilities WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      return res.status(500).send("Error deleting facility");
    }
    res.send("Facility deleted successfully");
  });
});


// POST - Refresh token
app.post("/api/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).send("Refresh token missing");
  }

  // Overíme, či je refresh token v databáze
  const query = "SELECT * FROM user_tokens WHERE refreshToken = ?";
  db.query(query, [refreshToken], (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).send("Invalid refresh token");
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send("Invalid refresh token");
      }

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );

      // Uloženie nového access tokenu do cookies
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
      });

      res.status(200).send({
        message: "Access token refreshed",
        accessToken: newAccessToken,
      });
    });
  });
});


// POST - Logout
app.post("/api/logout", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).send("Refresh token missing");
  }

  const query = "DELETE FROM user_tokens WHERE refreshToken = ?";
  db.query(query, [refreshToken], (err) => {
    if (err) {
      return res.status(500).send("Error during logout");
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).send({ message: "Logout successful" });
  });
});

const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});