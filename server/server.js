const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { reservationSchema } = require("../server/validationSchemaServer");

app.use(cors());
app.use(bodyParser.json());

require("dotenv").config();


const db = mysql.createConnection( {
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

    // Logovanie požiadavky pre diagnostiku
    console.log("Request body:", req.body);

    // Kontrola, či už existuje používateľ s týmto emailom
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        console.error("Error checking for existing user:", err);
        return res.status(500).send("Error checking for existing user");
      }

      if (results.length > 0) {
        return res.status(400).send("Email is already in use");
      }

      // Hashovanie hesla
      const hashedPassword = await bcrypt.hash(password, 10);

      // Vloženie nového používateľa do databázy
      const insertUserQuery = "INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)";
      db.query(
        insertUserQuery,
        [firstName, lastName, email, phone, hashedPassword],
        (err, result) => {
          if (err) {
            console.error("Error registering user:", err);
            return res.status(500).send("Error registering user");
          }
          console.log("User registered with ID:", result.insertId);
          res.status(201).send({ id: result.insertId });
        }
      );
    });
  } catch (error) {
    console.error("Server error during registration:", error);
    res.status(500).send("Error during registration");
  }
});

// POST - Login a user
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).send("Invalid email or password");
    }

    const user = results[0];

    // Porovnanie hesla
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).send("Invalid email or password");
    }

    // Generovanie JWT tokenu
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  });
});

// POST - Create reservation
app.post("/api/reservations", (req, res) => {
  try {
    // Validácia údajov pomocou schémy
    reservationSchema.parse(req.body);

    const { firstName, lastName, email, phone, facility, startTime, endTime } = req.body;
    const query =
      "INSERT INTO reservations (firstName, lastName, email, phone, facility, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(query, [firstName, lastName, email, phone, facility, startTime, endTime], (err, result) => {
      if (err) {
        res.status(500).send("Error inserting reservation");
        return;
      }
      res.status(201).send({ id: result.insertId });
    });
  } catch (validationError) {
    res.status(400).json({ errors: validationError.errors.map((err) => ({ path: err.path, message: err.message })) });
  }
});

// GET - Fetch all reservations
app.get("/api/reservations", (req, res) => {
    const query = "SELECT * FROM reservations";
    db.query(query, (err, results) => {
      if (err) {
        res.status(500).send("Error fetching reservations");
        return;
      }
      res.json(results);
    });
  });

// DELETE - Delete reservation
app.delete("/api/reservations/:id", (req, res) => {
    const query = "DELETE FROM reservations WHERE id = ?";
    db.query(query, [req.params.id], (err, result) => {
      if (err) {
        res.status(500).send("Error deleting reservation");
        return;
      }
      res.status(204).send();
    });
  });

// PUT - Update reservation
app.put("/api/reservations/:id", (req, res) => {
  try {
    // Validácia údajov pomocou schémy
    reservationSchema.parse(req.body);

    const { firstName, lastName, email, phone, facility, startTime, endTime } = req.body;
    const query = `
      UPDATE reservations 
      SET firstName = ?, lastName = ?, email = ?, phone = ?, facility = ?, startTime = ?, endTime = ?
      WHERE id = ?
    `;
    db.query(
      query,
      [firstName, lastName, email, phone, facility, startTime, endTime, req.params.id],
      (err, result) => {
        if (err) {
          res.status(500).send("Error updating reservation");
          return;
        }
        if (result.affectedRows === 0) {
          res.status(404).send("Reservation not found");
          return;
        }
        res.status(200).send("Reservation updated");
      }
    );
  } catch (validationError) {
    res.status(400).json({ errors: validationError.errors.map((err) => ({ path: err.path, message: err.message })) });
  }
});

const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

