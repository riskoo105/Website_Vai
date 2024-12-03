const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

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

// POST - Create reservation
app.post("/api/reservations", (req, res) => {
    const { firstName, lastName, email, phone, facility, startTime, endTime } = req.body;
    const query = "INSERT INTO reservations (firstName, lastName, email, phone, facility, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(query, [firstName, lastName, email, phone, facility, startTime, endTime], (err, result) => {
      if (err) {
        res.status(500).send("Error inserting reservation");
        return;
      }
      res.status(201).send({ id: result.insertId });
    });
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
          //console.error("Error updating reservation:", err);
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
  });

const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

