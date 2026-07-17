import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useStaffAuth from "../hooks/useStaffAuth";
import "./styles/StaffLogin.css";

const StaffLogin = () => {
  const navigate = useNavigate();
  const [login, , isLoading] = useStaffAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await login(data);

      if (user.role === "scanner") navigate("/staff/scanner");
      else if (user.role === "validator") navigate("/staff/validator");
      else navigate("/staff/admin");
    } catch (error) {
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="staffLogin">
      <div className="staffLogin__container">
        <div className="staffLogin__card">
          <div className="staffLogin__brand">
            <img className="staffLogin__logo" src="/logo.png" alt="North Events" />
            <div className="staffLogin__brandText">
              <div className="staffLogin__brandTitle">NORTH STAFF</div>
              <div className="staffLogin__brandSub">Acceso interno</div>
            </div>
          </div>

          <h2 className="staffLogin__title">Iniciar sesión</h2>
          <p className="staffLogin__subtitle">
            Ingresa tus credenciales para acceder al panel.
          </p>

          <form className="staffLogin__form" onSubmit={handleSubmit(onSubmit)}>
            <div className="staffLogin__field">
              <label className="staffLogin__label">Email</label>
              <input
                type="email"
                placeholder="Email"
                className={`staffLogin__input ${errors.email ? "staffLogin__input--error" : ""}`}
                {...register("email", { required: true })}
                disabled={isLoading}
              />
              {errors.email && <p className="staffLogin__error">Email requerido</p>}
            </div>

            <div className="staffLogin__field">
              <label className="staffLogin__label">Password</label>
              <input
                type="password"
                placeholder="Password"
                className={`staffLogin__input ${errors.password ? "staffLogin__input--error" : ""}`}
                {...register("password", { required: true })}
                disabled={isLoading}
              />
              {errors.password && <p className="staffLogin__error">Password requerido</p>}
            </div>

            <button className="staffLogin__btn" type="submit" disabled={isLoading}>
              {isLoading ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="staffLogin__note">
              Si olvidaste tu acceso, contacta a un administrador.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
