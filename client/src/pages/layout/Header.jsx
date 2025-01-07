import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Cookies from "js-cookie";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Update the state based on the cookies when the component mounts
  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    const role = Cookies.get("role");
    setIsLoggedIn(!!accessToken);
    setUserRole(role);
  }, [Cookies.get("accessToken"), Cookies.get("role")]);  // Re-run effect when cookies change

  const handleLogout = () => {
    Cookies.remove("accessToken");  // Odstránenie 'accessToken'
    Cookies.remove("role");
    setIsLoggedIn(false);
    setUserRole("");
    window.location.href = "/login";
  };

  return (
    <header>
      <nav>
        <ul>
          <li>
            <NavLink to="/">Domov</NavLink>
          </li>
          <li>
            <NavLink to="/facilities">Zariadenia</NavLink>
          </li>
          {isLoggedIn && (
            <>
              <li>
                <NavLink to="/reservation">Rezervácia</NavLink>
              </li>
              {userRole === "admin" && (
                <li>
                  <NavLink to="/manage">Správa</NavLink>
                </li>
              )}
              <li>
                <button onClick={handleLogout}>Odhlásiť sa</button>
              </li>
            </>
          )}
          {!isLoggedIn && (
            <>
              <li>
                <NavLink to="/register">Registrácia</NavLink>
              </li>
              <li>
                <NavLink to="/login">Prihlásenie</NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
