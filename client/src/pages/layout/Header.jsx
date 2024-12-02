import React from "react";

export default function Header() {
  return (
    <div>
      <header>
        <h1>Rezervačný systém pre športové zariadenia</h1>
        <nav>
          <ul>
            <li>
              <a href="index.html" class="active">
                Domov
              </a>
            </li>
            <li>
              <a href="facilities.html">Zariadenia</a>
            </li>
            <li>
              <a href="reservation.html">Rezervácia</a>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
}
