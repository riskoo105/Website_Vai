const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const axios = require('axios');
//const { reservationSchema } = require("./validationSchemaServer");

app.use(cors({
  origin: "http://localhost:5173", // URL vašho frontendu
  credentials: true, // Povolenie odosielania a prijímania cookies
}));
app.use(bodyParser.json());
app.use(cookieParser()); // Pre prácu s cookies

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
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10s" });
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
          secure: false,
          sameSite: "Strict",
          path: "/"
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dní
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

// GET - Fetch facilities in service
app.get("/api/facilities", (req, res) => {
  const query = "SELECT id, name FROM facilities WHERE inService = TRUE";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching facilities");
    }
    res.json(results);
  });
});

// POST - Create reservation
app.post("/api/reservations", authenticateToken, (req, res) => {
  const { user_id, facility, startTime, endTime } = req.body;

  console.log("Prijaté dáta pre rezerváciu:", { user_id, facility, startTime, endTime });

  if (!user_id || !facility || !startTime || !endTime) {
    return res.status(400).send("Chýbajúce alebo nesprávne údaje pre rezerváciu.");
  }

  const query = `
    INSERT INTO reservations (user_id, facility_id, startTime, endTime) 
    VALUES (?, ?, ?, ?)
  `;
  db.query(query, [user_id, facility, startTime, endTime], (err, result) => {
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
  const query = "DELETE FROM reservations WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).send("Error deleting reservation");
    }
    res.status(204).send();
  });
});

// PUT - Update reservation
app.put("/api/reservations/:id", authenticateToken, (req, res) => {
  try {
    reservationSchema.parse(req.body);

    const { firstName, lastName, email, phone, facility, startTime, endTime } = req.body;
    const query = `UPDATE reservations 
                   SET firstName = ?, lastName = ?, email = ?, phone = ?, facility = ?, startTime = ?, endTime = ? 
                   WHERE id = ?`;
    db.query(
      query,
      [firstName, lastName, email, phone, facility, startTime, endTime, req.params.id],
      (err, result) => {
        if (err) {
          return res.status(500).send("Error updating reservation");
        }
        if (result.affectedRows === 0) {
          return res.status(404).send("Reservation not found");
        }
        res.status(200).send("Reservation updated");
      }
    );
  } catch (validationError) {
    res.status(400).json({ errors: validationError.errors });
  }
});

// POST - Refresh token
app.post("/api/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).send("Refresh token missing");
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send("Invalid refresh token");
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10s" }
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
