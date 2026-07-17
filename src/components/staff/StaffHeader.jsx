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

  const canScanner = role === "scanner" || role === "admin";
  const canValidator = role === "validator" || role === "admin";
  const canAdmin = role === "admin";

  return (
    <header className={`staffHeader ${open ? "isOpen" : ""}`}>
      <div className="staffHeader__brand">
        <div className="staffHeader__brandIcon">🍖</div>

        <div className="staffHeader__brandText">
          <span className="staffHeader__brandName">MR. HORNADO</span>

          <span className="staffHeader__staffName">
            {staff?.full_name || "Personal autorizado"}
          </span>
        </div>
      </div>

      <nav className="staffHeader__nav">
        {canScanner && (
          <NavLink to="/staff/scanner">
            <span className="staffHeader__linkIcon">📷</span>
            Scanner
          </NavLink>
        )}

        {canValidator && (
          <NavLink to="/staff/validator">
            <span className="staffHeader__linkIcon">✅</span>
            Validator
          </NavLink>
        )}

        {canAdmin && (
          <NavLink to="/staff/admin">
            <span className="staffHeader__linkIcon">⚙️</span>
            Admin
          </NavLink>
        )}
      </nav>

      <button
        className="staffHeader__logout"
        type="button"
        onClick={logout}
      >
        <span>↪</span>
        Cerrar sesión
      </button>

      <button
        className="staffHeader__burger"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Abrir menú"
        aria-expanded={open}
      >
        <div className="staffHeader__burgerLines">
          <span />
          <span />
          <span />
        </div>
      </button>

      <div
        className="staffHeader__drawerBackdrop"
        onMouseDown={() => setOpen(false)}
      />

      <div className="staffHeader__drawer">
        <div className="staffHeader__drawerHead">
          <div>
            <span className="staffHeader__drawerLabel">
              Panel del personal
            </span>

            <h3 className="staffHeader__drawerTitle">
              Menú de gestión
            </h3>
          </div>

          <button
            type="button"
            className="staffHeader__drawerClose"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>

        <div className="staffHeader__drawerUser">
          <div className="staffHeader__drawerAvatar">👤</div>

          <div>
            <strong>{staff?.full_name || "Personal autorizado"}</strong>
            <span>{role || "staff"}</span>
          </div>
        </div>

        <nav
          className="staffHeader__drawerNav"
          onClick={() => setOpen(false)}
        >
          {canScanner && (
            <NavLink to="/staff/scanner">
              <span>
                <span className="staffHeader__drawerLinkIcon">📷</span>
                Scanner
              </span>
            </NavLink>
          )}

          {canValidator && (
            <NavLink to="/staff/validator">
              <span>
                <span className="staffHeader__drawerLinkIcon">✅</span>
                Validator
              </span>
            </NavLink>
          )}

          {canAdmin && (
            <NavLink to="/staff/admin">
              <span>
                <span className="staffHeader__drawerLinkIcon">⚙️</span>
                Admin
              </span>
            </NavLink>
          )}
        </nav>

        <button
          className="staffHeader__drawerLogout"
          type="button"
          onClick={logout}
        >
          <span>↪</span>
          Cerrar sesión
        </button>

        <p className="staffHeader__drawerFooter">
          Sistema interno de gestión Mr. Hornado
        </p>
      </div>
    </header>
  );
};

export default StaffHeader;