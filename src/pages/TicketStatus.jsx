import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTicketStatus from "../hooks/useTicketStatus";
import "./styles/TicketStatus.css";

const TicketStatus = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [getStatus, ticket, isLoading] = useTicketStatus();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const staff = localStorage.getItem("staff");

    if (token && staff) {
      navigate(`/staff/scanner?code=${encodeURIComponent(code)}`, {
        replace: true,
      });
      return;
    }

    getStatus(code).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (isLoading) return <div className="ticketStatus__state">Cargando...</div>;

  if (!ticket) {
    return (
      <div className="ticketStatus">
        <div className="ticketStatus__container">
          <h2 className="ticketStatus__title">Ticket</h2>
          <p className="ticketStatus__text">
            No se pudo verificar el ticket, no existe en nuestra Base de Datos
          </p>
          <p className="ticketStatus__text">
            Si crees que es un error, contacta a soporte.
          </p>
        </div>
      </div>
    );
  }

  // ✅ si el backend devolviera redirect (por token staff), lo manejamos por si acaso
  if (ticket.redirect) {
    navigate(ticket.redirect, { replace: true });
    return null;
  }

  // ✅ AHORA viene así por tu endpoint:
  // ticket.status (string)
  // ticket.ticket.used_at, ticket.ticket.gate
  // ticket.event (obj)
  const status = ticket.status; // "unused" | "used" | "void"  (según tu DB)
  const t = ticket.ticket || {}; // { used_at, gate, code, ... }
  const ev = ticket.event || null;

  // ✅ mapeo a lo que tu UI esperaba (active/used/cancelled)
  const uiStatus =
    status === "used" ? "used" : status === "void" ? "cancelled" : "active";

  return (
    <div className="ticketStatus">
      <div className="ticketStatus__container">
        <div className="ticketStatus__head">
          <h2 className="ticketStatus__title">Estado de tu Entrada</h2>
          <div className="ticketStatus__subtitle">
            Verificación automática · NORTH EVENTS
          </div>
        </div>

        {/* ✅ INFO DEL EVENTO (ahora viene en ticket.event) */}
        {ev && (
          <div className="ticketStatus__event">
            <div className="ticketStatus__eventTitle">{ev.title}</div>
            <div className="ticketStatus__eventMeta">
              <span>📍 {ev.venue}</span>
              <span>
                📅{" "}
                {ev.starts_at
                  ? new Date(ev.starts_at).toLocaleString("es-EC", {
                      timeZone: "America/Guayaquil",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        )}

        <div
          className={[
            "ticketStatus__card",
            uiStatus === "active"
              ? "ticketStatus__card--ok"
              : uiStatus === "used"
              ? "ticketStatus__card--warn"
              : "ticketStatus__card--bad",
          ].join(" ")}
        >
          {uiStatus === "active" && (
            <>
              <div className="ticketStatus__icon ticketStatus__icon--ok">✓</div>
              <h3 className="ticketStatus__statusTitle">Entrada válida</h3>
              <p className="ticketStatus__statusText">
                Presenta este QR en el ingreso.
              </p>
            </>
          )}

          {uiStatus === "used" && (
            <>
              <div className="ticketStatus__icon ticketStatus__icon--warn">!</div>
              <h3 className="ticketStatus__statusTitle">Entrada ya utilizada</h3>

              {t.used_at && (
                <p className="ticketStatus__statusText">
                  <b>Usada:</b>{" "}
                  {new Date(t.used_at).toLocaleString("es-EC", {
                    timeZone: "America/Guayaquil",
                  })}
                </p>
              )}

              {t.gate && (
                <p className="ticketStatus__statusText">
                  <b>Puerta:</b> {t.gate}
                </p>
              )}
            </>
          )}

          {uiStatus === "cancelled" && (
            <>
              <div className="ticketStatus__icon ticketStatus__icon--bad">✕</div>
              <h3 className="ticketStatus__statusTitle">Entrada anulada</h3>
              <p className="ticketStatus__statusText">
                Contacta a soporte si necesitas ayuda.
              </p>
            </>
          )}

          <div className="ticketStatus__code">
            <div className="ticketStatus__codeLabel">Código</div>
            <div className="ticketStatus__codeValue">{code}</div>
          </div>

          <div className="ticketStatus__note">
            Si estás en el ingreso, muestra esta pantalla al staff.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketStatus;
