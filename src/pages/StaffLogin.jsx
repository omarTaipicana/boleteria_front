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
      <div className="staffLogin__backgroundCircle staffLogin__backgroundCircle--one" />
      <div className="staffLogin__backgroundCircle staffLogin__backgroundCircle--two" />

      <div className="staffLogin__container">
        <div className="staffLogin__card">
          <section className="staffLogin__visual">
            <div className="staffLogin__visualOverlay" />

            <div className="staffLogin__visualContent">
              <div className="staffLogin__visualBadge">
                <span className="staffLogin__visualBadgeDot" />
                Sistema interno
              </div>

              <div className="staffLogin__visualText">
                <span className="staffLogin__visualLabel">
                  Gestión y validación
                </span>

                <h1 className="staffLogin__visualTitle">
                  MR.
                  <br />
                  HORNADO
                </h1>

                <p className="staffLogin__visualDescription">
                  Administración de pedidos, pagos y entregas.
                </p>
              </div>
            </div>

            <img
              className="staffLogin__foodImage"
              src="https://res.cloudinary.com/desgmhmg4/image/upload/v1784256827/hornado_u9yqnq.png"
              alt="Hornado ecuatoriano"
            />
          </section>

          <section className="staffLogin__panel">
            <div className="staffLogin__brand">
              <div className="staffLogin__logoWrapper">
                <img
                  className="staffLogin__logo"
                  src="/logo.png"
                  alt="MR. HORNADO"
                />
              </div>

              <div className="staffLogin__brandText">
                <span className="staffLogin__brandName">MR. HORNADO</span>
                <span className="staffLogin__brandSubtitle">
                  Panel administrativo
                </span>
              </div>
            </div>

            <div className="staffLogin__header">
              <span className="staffLogin__eyebrow">
                Acceso para personal autorizado
              </span>

              <h2 className="staffLogin__title">Bienvenido</h2>

              <p className="staffLogin__subtitle">
                Ingresa tus credenciales para acceder a las herramientas de
                administración.
              </p>
            </div>

            <form
              className="staffLogin__form"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="staffLogin__field">
                <label className="staffLogin__label" htmlFor="email">
                  Correo electrónico
                </label>

                <div
                  className={`staffLogin__inputContainer ${
                    errors.email ? "staffLogin__inputContainer--error" : ""
                  }`}
                >
                  <span className="staffLogin__inputIcon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6.75H20V17.25H4V6.75Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M4.5 7.25L12 13L19.5 7.25"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <input
                    id="email"
                    type="email"
                    placeholder="Ingresa tu correo"
                    className="staffLogin__input"
                    {...register("email", { required: true })}
                    disabled={isLoading}
                  />
                </div>

                {errors.email && (
                  <p className="staffLogin__error">
                    El correo electrónico es obligatorio.
                  </p>
                )}
              </div>

              <div className="staffLogin__field">
                <label className="staffLogin__label" htmlFor="password">
                  Contraseña
                </label>

                <div
                  className={`staffLogin__inputContainer ${
                    errors.password ? "staffLogin__inputContainer--error" : ""
                  }`}
                >
                  <span className="staffLogin__inputIcon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />

                      <path
                        d="M8 10V7.5C8 5.29086 9.79086 3.5 12 3.5C14.2091 3.5 16 5.29086 16 7.5V10"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  <input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    className="staffLogin__input"
                    {...register("password", { required: true })}
                    disabled={isLoading}
                  />
                </div>

                {errors.password && (
                  <p className="staffLogin__error">
                    La contraseña es obligatoria.
                  </p>
                )}
              </div>

              <button
                className="staffLogin__btn"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="staffLogin__spinner" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    <span>Ingresar al panel</span>

                    <svg
                      className="staffLogin__btnIcon"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12H19"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M14 7L19 12L14 17"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>

              <div className="staffLogin__note">
                <span className="staffLogin__noteIcon">i</span>

                <p>
                  Si olvidaste tus credenciales, comunícate con el administrador
                  del sistema.
                </p>
              </div>
            </form>

            <div className="staffLogin__footer">
              <span>MR. HORNADO</span>
              <span className="staffLogin__footerDot">•</span>
              <span>Acceso exclusivo para personal autorizado</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;