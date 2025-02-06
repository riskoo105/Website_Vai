import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header>
      <nav>
        <ul>
          <li><NavLink to="/">Domov</NavLink></li>
          <li><NavLink to="/facilities">Zariadenia</NavLink></li>
          {user ? (
            <>
              <li><NavLink to="/reservation">Rezervácia</NavLink></li>
              <li><NavLink to="/profile">Profil</NavLink></li>
              {user.role === "admin" && <li><NavLink to="/manage">Správa</NavLink></li>}
              <li><button onClick={logout}>Odhlásiť sa</button></li>
            </>
          ) : (
            <>
              <li><NavLink to="/register">Registrácia</NavLink></li>
              <li><NavLink to="/login">Prihlásenie</NavLink></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}