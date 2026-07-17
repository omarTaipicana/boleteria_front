import { useNavigate } from "react-router-dom";
import "./styles/StaffUnauthorized.css";

const StaffUnauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="unauth">
      <div className="unauth__card">
        <div className="unauth__icon">⛔</div>
        <h2 className="unauth__title">Acceso restringido</h2>
        <p className="unauth__text">
          Tu usuario no tiene permisos para ingresar a esta sección.
        </p>

        <button className="unauth__btn" onClick={() => navigate("/staff/scanner")}>
          Ir a mi sección
        </button>
      </div>
    </div>
  );
};

export default StaffUnauthorized;
