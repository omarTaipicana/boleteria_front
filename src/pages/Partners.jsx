import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import "./styles/Partners.css";
import useContactanos from "../hooks/useContactanos";

const PARTNERS = [
  { key: "area_51", img: "/partners/area_51.png" },
  { key: "eduka", img: "/partners/eduka.png" },
  { key: "fogan", img: "/partners/fogan.png" },
  { key: "scratch", img: "/partners/scratch.png" },
  { key: "gkm", img: "/partners/gkm.png" },

  { key: "gkm", img: "/partners/carrizal.png" },
  { key: "gkm", img: "/partners/syc.png" },
  { key: "gkm", img: "/partners/tuzy.png" },
  { key: "gkm", img: "/partners/illegal.png" },
  { key: "gkm", img: "/partners/huella_juridica.png" },
];

const WHATSAPP_LINK =
  "https://wa.me/593997808994?text=" +
  encodeURIComponent(
    "Hola NORTH EVENTS, quiero ser auspiciante. ¿Me brindan información?",
  );

const Partners = () => {
  const [sendMessage, isLoading] = useContactanos();

  const [modal, setModal] = useState({
    open: false,
    status: "success",
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

  const trackRef = useRef(null);

  const drag = useRef({
    isDown: false,
    startX: 0,
    startTranslate: 0,
    translate: 0,
    velocity: 0,
    lastX: 0,
    lastT: 0,
    raf: null,
  });

  const setTrackTranslate = (x) => {
    const el = trackRef.current;
    if (!el) return;
    drag.current.translate = x;
    el.style.transform = `translateX(${x}px)`;
  };

  const stopRaf = () => {
    if (drag.current.raf) cancelAnimationFrame(drag.current.raf);
    drag.current.raf = null;
  };

  const resumeAuto = () => {
    const el = trackRef.current;
    if (!el) return;

    // quitamos transform manual y volvemos a animación normal
    el.classList.remove("isDragging");
    el.style.transform = "";
  };

  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;

    stopRaf();

    drag.current.isDown = true;
    drag.current.startX = e.clientX;
    drag.current.lastX = e.clientX;
    drag.current.lastT = performance.now();
    drag.current.velocity = 0;

    // pausa animación automática y toma control manual
    el.classList.add("isDragging");
    el.style.animationPlayState = "paused";

    // lee el transform actual (si existe)
    const cs = window.getComputedStyle(el);
    const m = cs.transform;
    let currentX = 0;
    if (m && m !== "none") {
      const parts = m.match(/matrix\((.+)\)/);
      if (parts?.[1]) {
        const values = parts[1].split(",").map((v) => parseFloat(v.trim()));
        // matrix(a,b,c,d,tx,ty)
        currentX = values[4] || 0;
      }
    }

    drag.current.startTranslate = currentX;
    drag.current.translate = currentX;

    // capturar pointer para seguir aunque salgas del elemento
    el.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drag.current.isDown) return;
    const el = trackRef.current;
    if (!el) return;

    const dx = e.clientX - drag.current.startX;
    const next = drag.current.startTranslate + dx;

    // calcular velocidad
    const now = performance.now();
    const dt = Math.max(1, now - drag.current.lastT);
    const vx = (e.clientX - drag.current.lastX) / dt; // px por ms

    drag.current.velocity = vx;
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;

    setTrackTranslate(next);
  };

  const onPointerUp = () => {
    const el = trackRef.current;
    if (!el) return;

    drag.current.isDown = false;

    // “inercia” suave (según fuerza) y luego vuelve al auto
    const start = drag.current.translate;
    const v = drag.current.velocity; // px/ms
    const extra = v * 700; // tune: 700ms de “desliz”
    const target = start + extra;

    const duration = 450; // ms
    const t0 = performance.now();

    const animate = () => {
      const t = performance.now() - t0;
      const p = Math.min(1, t / duration);

      // easeOutCubic
      const ease = 1 - Math.pow(1 - p, 3);
      const x = start + (target - start) * ease;

      setTrackTranslate(x);

      if (p < 1) {
        drag.current.raf = requestAnimationFrame(animate);
      } else {
        // vuelve a autoplay
        el.style.animationPlayState = "";
        resumeAuto();
      }
    };

    drag.current.raf = requestAnimationFrame(animate);
  };

  // en tu JSX del marquee, pon ref y handlers:

  const onSubmit = async (data) => {
    try {
      await sendMessage({
        nombres: data.nombres,
        email: data.email,
        telefono: data.telefono || null,
        asunto: data.curso || "Auspiciantes",
        mensaje: data.mensaje,
      });

      setModal({
        open: true,
        status: "success",
        title: "¡Solicitud enviada!",
        message:
          "Gracias por escribirnos. En breve nuestro equipo te contactará con propuestas de auspicio.",
      });

      reset();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "No se pudo enviar tu solicitud. Intenta nuevamente en unos segundos.";

      setModal({
        open: true,
        status: "error",
        title: "No se pudo enviar",
        message: msg,
      });
    }
  };

  useEffect(() => {
    if (!modal.open) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal.open]);

  // duplicamos para loop perfecto
  const logos = useMemo(() => [...PARTNERS, ...PARTNERS, ...PARTNERS], []);

  return (
    <div className="partnersPage">
      <div className="partnersWrap">
        <section className="partnersHero">
          <h2 className="partnersTitle">Sé parte de nuestros auspiciantes</h2>
          <div className="partners__hero">
            <img
              className="partners__img"
              src={`/partners/general.png`}
              alt="partners"
            />
          </div>
          {/* <p className="partnersSub">
                        Marcas que confían en <b>NORTH EVENTS</b> y hacen posible la experiencia.
                    </p> */}

          {/* ===== MARQUEE SOLO LOGOS ===== */}
          {/* <div className="logoMarquee" aria-label="Auspiciantes">
                        <div
                            ref={trackRef}
                            className="logoMarquee__track"
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={onPointerUp}
                        >
                            {logos.map((p, idx) => (
                                <div className="logoMarquee__item" key={`${p.key}-${idx}`}>
                                    <img className="logoMarquee__img" src={p.img} alt="" loading="lazy" />
                                </div>
                            ))}
                        </div>
                    </div> */}
        </section>

        {/* ===== ABAJO (más compacto) ===== */}
        <section className="sponsorCompact">
          <div className="sponsorMiniCTA">
            <div className="sponsorMiniCTA__badge">AUSPICIANTES</div>
            <h3 className="sponsorMiniCTA__title">¿Quieres ser auspiciante?</h3>
            <p className="sponsorMiniCTA__text">
              Te enviamos propuestas de visibilidad, activaciones, stands y
              menciones en redes.
            </p>

            <a
              className="sponsorMiniCTA__whats"
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Hablar por WhatsApp <span>➜</span>
            </a>

            <div className="sponsorMiniCTA__hint">
              O llena el formulario y te contactamos.
            </div>
          </div>

          <div className="sponsorMiniFormCard">
            <div className="sponsorMiniFormHead">
              <div className="sponsorMiniFormTitle">Solicitud de auspicio</div>
              <div className="sponsorMiniFormSub">Completa tus datos.</div>
            </div>

            <form className="sponsorMiniForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="miniGrid">
                <input
                  className={`miniInput ${errors.nombres ? "isError" : ""}`}
                  placeholder="Nombre / Empresa"
                  disabled={isLoading}
                  {...register("nombres", { required: true, minLength: 3 })}
                />
                <input
                  className={`miniInput ${errors.telefono ? "isError" : ""}`}
                  placeholder="Celular"
                  disabled={isLoading}
                  {...register("telefono", { required: true, minLength: 7 })}
                />
                <input
                  type="email"
                  className={`miniInput ${errors.email ? "isError" : ""}`}
                  placeholder="Email"
                  disabled={isLoading}
                  {...register("email", { required: true })}
                />
                <input
                  className="miniInput"
                  placeholder="Asunto (opcional)"
                  disabled={isLoading}
                  {...register("curso")}
                />
              </div>

              <div className="miniRow">
                <textarea
                  className={`miniTextarea ${errors.mensaje ? "isError" : ""}`}
                  placeholder="Mensaje"
                  rows={3}
                  disabled={isLoading}
                  {...register("mensaje", {
                    required: true,
                    minLength: 10,
                    maxLength: 2000,
                  })}
                />
                <button className="miniBtn" type="submit" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar"} <span>➜</span>
                </button>
              </div>

              <div className="miniMeta">
                {errors.nombres ||
                errors.telefono ||
                errors.email ||
                errors.mensaje ? (
                  <div className="miniError">
                    Completa los campos requeridos.
                  </div>
                ) : (
                  <div className="miniHint">{chars}/2000</div>
                )}
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* MODAL */}
      {modal.open && (
        <div
          className="partnersModal__backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
          role="dialog"
          aria-modal="true"
        >
          <div className="partnersModal__card">
            <div
              className={[
                "partnersModal__icon",
                modal.status === "success"
                  ? "partnersModal__icon--success"
                  : "partnersModal__icon--error",
              ].join(" ")}
            >
              {modal.status === "success" ? "✓" : "!"}
            </div>
            <h3 className="partnersModal__title">{modal.title}</h3>
            <p className="partnersModal__text">{modal.message}</p>
            <div className="partnersModal__actions">
              <button
                type="button"
                className="partnersModal__btn"
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

export default Partners;
