import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import useContactanos from "../hooks/useContactanos";
import "./styles/Contact.css";

const Contact = () => {
  const [sendMessage, isLoading] = useContactanos();

  const [modal, setModal] = useState({
    open: false,
    status: "success", // success | error
    title: "",
    message: "",
  });

  const closeModal = () => setModal((p) => ({ ...p, open: false }));

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      nombres: "",
      telefono: "",
      email: "",
      curso: "",
      mensaje: "",
    },
  });

  const mensaje = watch("mensaje") || "";
  const chars = useMemo(() => mensaje.length, [mensaje]);

  const onSubmit = async (data) => {
    try {
      await sendMessage({
        nombres: data.nombres,
        email: data.email,
        telefono: data.telefono || null,
        asunto: data.curso || null, // 👈 el diseñador lo pone como "Selecciona el Curso"
        mensaje: data.mensaje,
      });

      setModal({
        open: true,
        status: "success",
        title: "¡Mensaje enviado!",
        message:
          "Gracias por escribirnos. En breve nuestro equipo te contactará. Revisa tu correo para la confirmación.",
      });

      reset();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "No se pudo enviar tu mensaje. Intenta nuevamente en unos segundos.";

      setModal({
        open: true,
        status: "error",
        title: "No se pudo enviar",
        message: msg,
      });
    }
  };

  // cerrar con ESC
  useEffect(() => {
    if (!modal.open) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal.open]);

  return (
    <div className="contactPage">
      <div className="contactCard">
        <h2 className="contactCard__title">Contáctanos</h2>
        <p className="contactCard__subtitle">
          Para nosotros es un placer poder solucionar <br />
          sus dudas.
        </p>

        <form className="contactForm" onSubmit={handleSubmit(onSubmit)}>
          {/* Nombre */}
          <input
            className={`contactInput ${errors.nombres ? "contactInput--error" : ""}`}
            placeholder="Ingresa tu nombre completo"
            disabled={isLoading}
            {...register("nombres", { required: true, minLength: 3 })}
          />

          {/* Teléfono */}
          <input
            className={`contactInput ${errors.telefono ? "contactInput--error" : ""}`}
            placeholder="Ingresa tu número de celular"
            disabled={isLoading}
            {...register("telefono", { required: true, minLength: 7 })}
          />

          {/* Email */}
          <input
            type="email"
            className={`contactInput ${errors.email ? "contactInput--error" : ""}`}
            placeholder="Ingresa tu email"
            disabled={isLoading}
            {...register("email", { required: true })}
          />

          {/* Curso */}
          <input
            className="contactInput"
            placeholder="Ingrese el Asunto"
            disabled={isLoading}
            {...register("curso")}
          />

          {/* Mensaje + botón al lado */}
          <div className="contactRow">
            <textarea
              className={`contactTextarea ${errors.mensaje ? "contactInput--error" : ""}`}
              placeholder="Escribe tu mensaje"
              rows={3}
              disabled={isLoading}
              {...register("mensaje", { required: true, minLength: 10, maxLength: 2000 })}
            />
            <button className="contactBtn" type="submit" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar"}
              <span className="contactBtn__arrow">➜</span>
            </button>
          </div>

          {/* ayuda compacta */}
          <div className="contactMeta">
            {errors.nombres || errors.telefono || errors.email || errors.mensaje ? (
              <div className="contactError">
                Completa los campos requeridos.
              </div>
            ) : (
              <div className="contactHint">
                {chars}/2000
              </div>
            )}
          </div>
        </form>

        <div className="contactFollow">
          <div className="contactFollow__title">¡Síguenos!</div>

          <div className="contactFollow__icons">
            <a
              href="https://www.facebook.com/share/18JSZ47oaV/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://www.instagram.com/northevents04?utm_source=qr&igsh=cWlsMWo1eDNmbnFn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.tiktok.com/@northevents04"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modal.open && (
        <div
          className="contactModal__backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
          role="dialog"
          aria-modal="true"
        >
          <div className="contactModal__card">
            <div
              className={`contactModal__icon ${
                modal.status === "success"
                  ? "contactModal__icon--success"
                  : "contactModal__icon--error"
              }`}
            >
              {modal.status === "success" ? "✓" : "!"}
            </div>

            <h3 className="contactModal__title">{modal.title}</h3>
            <p className="contactModal__text">{modal.message}</p>

            <div className="contactModal__actions">
              <button
                type="button"
                className="contactModal__btn"
                onClick={closeModal}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
