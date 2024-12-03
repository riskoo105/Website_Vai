import React from "react";

export default function Reservation() {
  return (
    <div>
      <section>
        <h2>Vyplňte formulár pre rezerváciu</h2>
        <form action="#" method="post">
          <label htmlFor="first-name">Meno:</label>
          <input
            type="text"
            id="first-name"
            name="first-name"
            placeholder="Vaše meno"
            required
          />

          <label htmlFor="last-name">Priezvisko:</label>
          <input
            type="text"
            id="last-name"
            name="last-name"
            placeholder="Vaše priezvisko"
            required
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Váš email"
            required
          />

          <label htmlFor="phone">Telefónne číslo:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Váš telefón"
            required
          />

          <label htmlFor="facility">Zariadenie:</label>
          <select id="facility" name="facility" defaultValue="" required>
            <option value="" disabled>
              Vyberte zariadenie
            </option>
            <option value="football">Futbalové ihrisko</option>
            <option value="tennis">Tenisový kurt</option>
            <option value="basketball">Basketbalové ihrisko</option>
          </select>

          <label htmlFor="start-time">Čas začiatku rezervácie:</label>
          <input
            type="datetime-local"
            id="start-time"
            name="start-time"
            required
          />

          <label htmlFor="end-time">Čas konca rezervácie:</label>
          <input type="datetime-local" id="end-time" name="end-time" required />

          <button type="submit">Rezervovať</button>
        </form>
      </section>
    </div>
  );
}
