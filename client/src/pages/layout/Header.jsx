import React from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <div>
      <header>
        <h1>Rezervačný systém pre športové zariadenia</h1>
        <nav>
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>Domov</NavLink>
            </li>
            <li>
              <NavLink to="/facilities" className={({ isActive }) => (isActive ? "active" : "")}>Zariadenia</NavLink>
            </li>
            <li>
              <NavLink to="/reservation" className={({ isActive }) => (isActive ? "active" : "")}>Rezervácia</NavLink>
            </li>
            <li>
              <NavLink to="/manage" className={({ isActive }) => (isActive ? "active" : "")}>Správa</NavLink>
            </li>
            <li>
              <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>Registrácia</NavLink>
            </li>
            <li>
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>Prihlásenie</NavLink>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
}
