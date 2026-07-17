import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useStaffAuth from "../../hooks/useStaffAuth";
import "./StaffHeader.css";

const StaffHeader = () => {
  const navigate = useNavigate();
  const [, me] = useStaffAuth();

  const [staff, setStaff] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await me();
      setStaff(data);
    };
    load();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("staff");
    navigate("/staff/login", { replace: true });
  };

  const role = staff?.role;

  // links según rol (igual que ya lo tenías)
  const canScanner = role === "scanner" || role === "admin";
  const canValidator = role === "validator" || role === "admin";
  const canAdmin = role === "admin";

  return (
    <header className={`staffHeader ${open ? "isOpen" : ""}`}>
      <div className="staffHeader__brand">
        NORTH STAFF {staff?.full_name ? `· ${staff.full_name}` : ""}
      </div>

      {/* Desktop nav */}
      <nav className="staffHeader__nav">
        {canScanner && <NavLink to="/staff/scanner">Scanner</NavLink>}
        {canValidator && <NavLink to="/staff/validator">Validator</NavLink>}
        {canAdmin && <NavLink to="/staff/admin">Admin</NavLink>}
      </nav>

      <button className="staffHeader__logout" onClick={logout}>
        Cerrar sesión
      </button>

      {/* Mobile hamburger */}
      <button
        className="staffHeader__burger"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
      >
        <div className="staffHeader__burgerLines">
          <span />
          <span />
          <span />
        </div>
      </button>

      {/* Backdrop + Drawer (mobile) */}
      <div
        className="staffHeader__drawerBackdrop"
        onMouseDown={() => setOpen(false)}
      />

      <div className="staffHeader__drawer">
        <div className="staffHeader__drawerTitle">Menú</div>

        <nav className="staffHeader__drawerNav" onClick={() => setOpen(false)}>
          {canScanner && <NavLink to="/staff/scanner">Scanner</NavLink>}
          {canValidator && <NavLink to="/staff/validator">Validator</NavLink>}
          {canAdmin && <NavLink to="/staff/admin">Admin</NavLink>}
        </nav>

        <button className="staffHeader__drawerLogout" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default StaffHeader;
