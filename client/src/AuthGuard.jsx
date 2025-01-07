import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function AuthGuard({ children, roles }) {
  const navigate = useNavigate();
  const token = Cookies.get("accessToken");
  const userRole = Cookies.get("role");

  useEffect(() => {
    if (!token || (roles && !roles.includes(userRole))) {
      navigate("/login");
    }
  }, [token, userRole, roles, navigate]);

  return <>{children}</>;
}