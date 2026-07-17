import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useStaffAuth from "../../hooks/useStaffAuth";

const ProtectedRoute = ({ roles = [] }) => {
  const token = localStorage.getItem("token");

  const [, me] = useStaffAuth();

  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!token) {
        if (alive) setLoading(false);
        return;
      }

      setLoading(true);
      const data = await me(); // ✅ pega a /staff/me (con token)
      if (!alive) return;

      setStaff(data);
      setLoading(false);
    };

    run();

    return () => {
      alive = false;
    };
  }, [token]); // si cambia token, revalida

  // 1) si no hay token -> login
  if (!token) return <Navigate to="/staff/login" replace />;

  // 2) mientras consulta /staff/me
  if (loading) {
    return (
      <div style={{ padding: 22, color: "white" }}>
        Validando acceso...
      </div>
    );
  }

  // 3) si /staff/me falló o devolvió null -> login
  if (!staff) return <Navigate to="/staff/login" replace />;

  const role = staff?.role; // ✅ role real del backend

  // 4) si no se especifican roles, solo necesita estar logueado
  if (roles.length === 0) return <Outlet />;

  // 5) admin entra a todo
  if (role === "admin") return <Outlet />;

  // 6) otros roles: deben estar permitidos
  const allowed = roles.includes(role);
  if (!allowed) return <Navigate to="/staff/unauthorized" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
