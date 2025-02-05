import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function AuthGuard({ children, roles }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    navigate("/");
    return null;
  }

  return <>{children}</>;
}