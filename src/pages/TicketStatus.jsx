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

  if (isLoading) {
    return (
      <main className="ticketStatus">
        <div className="ticketStatus__loading">
          <div className="ticketStatus__loader" />

          <span className="ticketStatus__eyebrow">
            MR. HORNADO
          </span>

          <h2>Verificando entrada</h2>

          <p>Estamos consultando el estado de tu código QR.</p>
        </div>
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="ticketStatus">
        <div className="ticketStatus__container">
          <header className="ticketStatus__brand">
            <span className="ticketStatus__brandIcon">🍖</span>

            <div>
              <span>MR. HORNADO</span>
              <strong>Verificación de entrada</strong>
            </div>
          </header>

          <section className="ticketStatus__notFound">
            <div className="ticketStatus__notFoundIcon">?</div>

            <span className="ticketStatus__eyebrow">
              Código no encontrado
            </span>

            <h1 className="ticketStatus__title">
              No pudimos verificar esta entrada
            </h1>

            <p className="ticketStatus__text">
              El ticket no existe en nuestra base de datos o el código
              ingresado no es válido.
            </p>

            <p className="ticketStatus__text">
              Si consideras que se trata de un error, comunícate con soporte.
            </p>

            <div className="ticketStatus__code ticketStatus__code--simple">
              <span className="ticketStatus__codeLabel">
                Código consultado
              </span>

              <strong className="ticketStatus__codeValue">
                {code}
              </strong>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (ticket.redirect) {
    navigate(ticket.redirect, {
      replace: true,
    });

    return null;
  }

  const status = ticket.status;
  const currentTicket = ticket.ticket || {};
  const event = ticket.event || null;

  const uiStatus =
    status === "used"
      ? "used"
      : status === "void"
        ? "cancelled"
        : "active";

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("es-EC", {
      timeZone: "America/Guayaquil",
    });
  };

  return (
    <main className="ticketStatus">
      <div className="ticketStatus__container">
        <header className="ticketStatus__brand">
          <span className="ticketStatus__brandIcon">🍖</span>

          <div>
            <span>MR. HORNADO</span>
            <strong>Verificación de entrada</strong>
          </div>
        </header>

        <section className="ticketStatus__head">
          <span className="ticketStatus__eyebrow">
            COMPROBANTE DIGITAL
          </span>

          <h1 className="ticketStatus__title">
            Estado de tu entrada
          </h1>

          <p className="ticketStatus__subtitle">
            Consulta automática del código QR registrado para la entrega.
          </p>
        </section>

        {event && (
          <section className="ticketStatus__event">
            <div className="ticketStatus__eventIcon">🍽️</div>

            <div className="ticketStatus__eventContent">
              <span className="ticketStatus__eventLabel">
                Venta seleccionada
              </span>

              <h2 className="ticketStatus__eventTitle">
                {event.title || "Venta de Hornado"}
              </h2>

              <div className="ticketStatus__eventMeta">
                {event.venue && (
                  <span>
                    <span className="ticketStatus__metaIcon">📍</span>
                    {event.venue}
                  </span>
                )}

                <span>
                  <span className="ticketStatus__metaIcon">📅</span>

                  {event.starts_at
                    ? formatDateTime(event.starts_at)
                    : "Fecha no disponible"}
                </span>
              </div>
            </div>
          </section>
        )}

        <section
          className={[
            "ticketStatus__card",
            uiStatus === "active"
              ? "ticketStatus__card--ok"
              : uiStatus === "used"
                ? "ticketStatus__card--warn"
                : "ticketStatus__card--bad",
          ].join(" ")}
        >
          <div className="ticketStatus__statusHead">
            <div
              className={[
                "ticketStatus__icon",
                uiStatus === "active"
                  ? "ticketStatus__icon--ok"
                  : uiStatus === "used"
                    ? "ticketStatus__icon--warn"
                    : "ticketStatus__icon--bad",
              ].join(" ")}
            >
              {uiStatus === "active"
                ? "✓"
                : uiStatus === "used"
                  ? "!"
                  : "✕"}
            </div>

            <div className="ticketStatus__statusContent">
              <span className="ticketStatus__statusLabel">
                Resultado de verificación
              </span>

              {uiStatus === "active" && (
                <>
                  <h2 className="ticketStatus__statusTitle">
                    Entrada válida
                  </h2>

                  <p className="ticketStatus__statusText">
                    Este código puede utilizarse para reclamar el hornado.
                  </p>
                </>
              )}

              {uiStatus === "used" && (
                <>
                  <h2 className="ticketStatus__statusTitle">
                    Entrada ya utilizada
                  </h2>

                  <p className="ticketStatus__statusText">
                    Este código ya fue registrado anteriormente.
                  </p>
                </>
              )}

              {uiStatus === "cancelled" && (
                <>
                  <h2 className="ticketStatus__statusTitle">
                    Entrada anulada
                  </h2>

                  <p className="ticketStatus__statusText">
                    Esta entrada fue anulada y no puede ser utilizada.
                  </p>
                </>
              )}
            </div>

            <span className="ticketStatus__badge">
              {uiStatus === "active"
                ? "VÁLIDA"
                : uiStatus === "used"
                  ? "UTILIZADA"
                  : "ANULADA"}
            </span>
          </div>

          {uiStatus === "used" && (
            <div className="ticketStatus__usedInfo">
              {currentTicket.used_at && (
                <div className="ticketStatus__infoItem">
                  <span className="ticketStatus__infoIcon">🕒</span>

                  <div>
                    <span>Fecha de uso</span>
                    <strong>
                      {formatDateTime(currentTicket.used_at)}
                    </strong>
                  </div>
                </div>
              )}

              {currentTicket.gate && (
                <div className="ticketStatus__infoItem">
                  <span className="ticketStatus__infoIcon">🚪</span>

                  <div>
                    <span>Puerta registrada</span>
                    <strong>{currentTicket.gate}</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="ticketStatus__code">
            <div className="ticketStatus__codeHead">
              <span className="ticketStatus__codeIcon">🎟️</span>

              <div>
                <span className="ticketStatus__codeLabel">
                  Código único de entrada
                </span>

                <small>
                  Presenta este código junto con el QR.
                </small>
              </div>
            </div>

            <strong className="ticketStatus__codeValue">
              {code}
            </strong>
          </div>

          <div className="ticketStatus__note">
            <span className="ticketStatus__noteIcon">📱</span>

            <div>
              <strong>Presenta esta pantalla</strong>

              <p>
                Al llegar al punto de entrega, muestra esta pantalla al
                personal autorizado de Mr. Hornado.
              </p>
            </div>
          </div>
        </section>

        <footer className="ticketStatus__footer">
          <span>🔒</span>

          <p>
            Consulta segura del sistema de entradas de Mr. Hornado.
          </p>
        </footer>
      </div>
    </main>
  );
};

export default TicketStatus;