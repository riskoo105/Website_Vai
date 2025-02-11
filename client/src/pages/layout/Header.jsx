import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <header>
      <nav>
        <ul>
          <li><NavLink to="/">Domov</NavLink></li>
          <li><NavLink to="/facilities">Zariadenia</NavLink></li>
          {user ? (
            <>
              <li><NavLink to="/reservation">Rezervácia</NavLink></li>
              <li><NavLink to="/my-reservations">Moje rezervácie</NavLink></li>
              <li><NavLink to="/profile">Profil</NavLink></li>
              {user.role === "admin" && <li><NavLink to="/manage">Správa</NavLink></li>}
              <li>
                <NavLink to="/" onClick={handleLogout}>
                  Odhlásiť sa
                </NavLink>
              </li>
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
