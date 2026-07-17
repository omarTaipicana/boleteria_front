import React, { useEffect, useMemo, useState } from "react";
import useDashboard from "../hooks/useDashboard";
import useEvents from "../hooks/useEvents";
import "./styles/StaffAdmin.css";

const StaffAdmin = () => {
  const [getEvents, events, isLoadingEvents, errorEvents] = useEvents();

  const dashHook = useDashboard();

  const [
    getDashboard,
    dashboard,
    getEventsSummary,
    summary,
    isLoadingDash,
    errorDash,
  ] = dashHook;

  const [eventId, setEventId] = useState("");

  useEffect(() => {
    Promise.resolve(getEvents?.()).catch(() => {});
    Promise.resolve(getDashboard?.()).catch(() => {});
    Promise.resolve(getEventsSummary?.()).catch(() => {});
  }, []);

  useEffect(() => {
    Promise.resolve(getDashboard?.(eventId || undefined)).catch(() => {});

    if (!eventId) {
      Promise.resolve(getEventsSummary?.()).catch(() => {});
    }
  }, [eventId]);

  const loading = !!(isLoadingEvents || isLoadingDash);

  const eventSelected = useMemo(() => {
    return (events || []).find(
      (event) => String(event.id) === String(eventId)
    );
  }, [events, eventId]);

  const orders_count = dashboard?.orders?.orders_count ?? 0;
  const qty_total = dashboard?.orders?.qty_total ?? 0;

  const payments_count = dashboard?.payments?.payments_count ?? 0;

  const payments_validated_count =
    dashboard?.payments?.payments_validated_count ?? 0;

  const amount_total_all = Number(
    dashboard?.payments?.amount_total_all ?? 0
  );

  const amount_total_validated = Number(
    dashboard?.payments?.amount_total_validated ?? 0
  );

  const totalTickets = dashboard?.tickets?.totalTickets ?? 0;
  const usedTickets = dashboard?.tickets?.usedTickets ?? 0;
  const unusedTickets = dashboard?.tickets?.unusedTickets ?? 0;
  const voidTickets = dashboard?.tickets?.voidTickets ?? 0;

  const usedByStaff = dashboard?.used_by_staff || [];

  const errorMsgEvents =
    errorEvents?.response?.data?.message ||
    errorEvents?.message ||
    null;

  const errorMsgDash =
    errorDash?.response?.data?.message ||
    errorDash?.message ||
    null;

  const handleRefresh = () => {
    Promise.resolve(getDashboard?.(eventId || undefined)).catch(() => {});

    if (!eventId) {
      Promise.resolve(getEventsSummary?.()).catch(() => {});
    }
  };

  return (
    <div className="staffAdmin">
      <div className="staffAdmin__decoration staffAdmin__decoration--one" />
      <div className="staffAdmin__decoration staffAdmin__decoration--two" />

      <div className="staffAdmin__container">
        <header className="staffAdmin__hero">
          <div className="staffAdmin__heroMain">
            <div className="staffAdmin__brand">
              <div className="staffAdmin__logoBox">
                <img
                  className="staffAdmin__logo"
                  src="https://res.cloudinary.com/desgmhmg4/image/upload/v1784256827/hornado_u9yqnq.png"
                  alt="MR. HORNADO"
                />
              </div>

              <div className="staffAdmin__brandText">
                <span className="staffAdmin__brandSmall">
                  Panel administrativo
                </span>

                <span className="staffAdmin__brandName">
                  MR. HORNADO
                </span>
              </div>
            </div>

            <div className="staffAdmin__heroText">
              <span className="staffAdmin__eyebrow">
                Gestión general
              </span>

              <h1 className="staffAdmin__title">
                Dashboard administrativo
              </h1>

              <p className="staffAdmin__subtitle">
                Consulta órdenes, pagos, recaudación, tickets y entregas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="staffAdmin__refreshBtn"
          >
            {loading ? (
              <>
                <span className="staffAdmin__spinner" />
                Cargando...
              </>
            ) : (
              <>
                <svg
                  className="staffAdmin__refreshIcon"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M20 6V11H15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M4 18V13H9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M6.1 9A7 7 0 0 1 18.8 7.2L20 11"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M17.9 15A7 7 0 0 1 5.2 16.8L4 13"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                Refrescar información
              </>
            )}
          </button>
        </header>

        {(errorMsgEvents || errorMsgDash) && (
          <div className="staffAdmin__errorBox">
            <div className="staffAdmin__errorIcon">!</div>

            <div className="staffAdmin__errorContent">
              {errorMsgEvents && (
                <div>
                  <strong>Error al cargar eventos:</strong>{" "}
                  {errorMsgEvents}
                </div>
              )}

              {errorMsgDash && (
                <div className="staffAdmin__errorSecond">
                  <strong>Error al cargar el dashboard:</strong>{" "}
                  {errorMsgDash}
                </div>
              )}
            </div>
          </div>
        )}

        <section className="staffAdmin__card staffAdmin__filterCard">
          <div className="staffAdmin__cardHeader">
            <div>
              <span className="staffAdmin__sectionLabel">
                Filtro de información
              </span>

              <h2 className="staffAdmin__sectionTitle">
                Selecciona un evento
              </h2>
            </div>

            <div
              className={`staffAdmin__status ${
                loading
                  ? "staffAdmin__status--loading"
                  : "staffAdmin__status--ready"
              }`}
            >
              <span className="staffAdmin__statusDot" />

              {loading
                ? "Actualizando..."
                : "Información actualizada"}
            </div>
          </div>

          <div className="staffAdmin__selectWrapper">
            <svg
              className="staffAdmin__selectIcon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="5"
                width="16"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.7"
              />

              <path
                d="M8 3V7"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />

              <path
                d="M16 3V7"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />

              <path
                d="M4 9H20"
                stroke="currentColor"
                strokeWidth="1.7"
              />
            </svg>

            <select
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
              className="staffAdmin__select"
            >
              <option value="">
                Todos los eventos — Vista general
              </option>

              {(events || []).map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title || "(Sin título)"}
                </option>
              ))}
            </select>
          </div>
        </section>

        {eventSelected && (
          <section className="staffAdmin__card staffAdmin__eventInfo">
            <div className="staffAdmin__eventHeader">
              <div className="staffAdmin__eventIcon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 20V10L12 4L19 10V20H5Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M9 20V14H15V20"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <span className="staffAdmin__sectionLabel">
                  Evento seleccionado
                </span>

                <h2 className="staffAdmin__eventName">
                  {eventSelected.title}
                </h2>
              </div>
            </div>

            <div className="staffAdmin__eventDetails">
              <div className="staffAdmin__eventDetail">
                <span className="staffAdmin__eventDetailLabel">
                  Evento
                </span>

                <strong>{eventSelected.title}</strong>
              </div>

              <div className="staffAdmin__eventDetail">
                <span className="staffAdmin__eventDetailLabel">
                  Lugar
                </span>

                <strong>{eventSelected.venue || "—"}</strong>
              </div>

              <div className="staffAdmin__eventDetail">
                <span className="staffAdmin__eventDetailLabel">
                  Fecha
                </span>

                <strong>
                  {eventSelected.starts_at
                    ? new Date(
                        eventSelected.starts_at
                      ).toLocaleString("es-EC", {
                        timeZone: "America/Guayaquil",
                      })
                    : "—"}
                </strong>
              </div>
            </div>
          </section>
        )}

        <section className="staffAdmin__kpis">
          <Kpi
            icon="orders"
            title="Órdenes"
            value={orders_count}
            sub={`Cantidad total: ${qty_total}`}
          />

          <Kpi
            icon="payments"
            title="Pagos recibidos"
            value={payments_count}
            sub={`Validados: ${payments_validated_count}`}
          />

          <Kpi
            icon="revenue"
            title="Recaudación validada"
            value={`$${amount_total_validated.toFixed(2)}`}
            sub={`Total recibido: $${amount_total_all.toFixed(2)}`}
          />

          <Kpi
            icon="tickets"
            title="Tickets"
            value={totalTickets}
            sub={`Usados: ${usedTickets} | Sin usar: ${unusedTickets} | Anulados: ${voidTickets}`}
          />
        </section>

        {!eventId && (
          <section className="staffAdmin__card staffAdmin__section">
            <div className="staffAdmin__cardHeader">
              <div>
                <span className="staffAdmin__sectionLabel">
                  Vista general
                </span>

                <h3 className="staffAdmin__sectionTitle">
                  Resumen por evento
                </h3>
              </div>

              <div className="staffAdmin__hint">
                Selecciona una fila para filtrar
              </div>
            </div>

            {(summary || []).length === 0 ? (
              <div className="staffAdmin__emptyState">
                <div className="staffAdmin__emptyIcon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 20V10"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />

                    <path
                      d="M12 20V4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />

                    <path
                      d="M19 20V14"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="staffAdmin__muted">
                  {loading
                    ? "Cargando resumen..."
                    : "Sin datos en el resumen."}
                </div>
              </div>
            ) : (
              <div className="staffAdmin__tableWrap">
                <table className="staffAdmin__table">
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Tickets</th>
                      <th>Usados</th>
                      <th>Recaudación</th>
                    </tr>
                  </thead>

                  <tbody>
                    {summary.map((row) => (
                      <tr
                        key={row.eventId}
                        onClick={() => setEventId(row.eventId)}
                        className="staffAdmin__clickableRow"
                        title="Click para ver el dashboard de este evento"
                      >
                        <td>
                          <div className="staffAdmin__eventCell">
                            <span className="staffAdmin__eventDot" />

                            <strong>
                              {row.name || "(Sin nombre)"}
                            </strong>
                          </div>
                        </td>

                        <td>{row.totalTickets}</td>

                        <td>
                          <span className="staffAdmin__usedBadge">
                            {row.usedTickets}
                          </span>
                        </td>

                        <td>
                          <strong className="staffAdmin__money">
                            ${Number(row.revenue || 0).toFixed(2)}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <section className="staffAdmin__card staffAdmin__section">
          <div className="staffAdmin__cardHeader">
            <div>
              <span className="staffAdmin__sectionLabel">
                Control de entregas
              </span>

              <h3 className="staffAdmin__sectionTitle">
                Check-in por personal
              </h3>
            </div>

            <div className="staffAdmin__hint">
              Detalle por usuario que escaneó tickets
            </div>
          </div>

          {usedByStaff.length === 0 ? (
            <div className="staffAdmin__emptyState">
              <div className="staffAdmin__emptyIcon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M4.5 20C5.5 16.5 8 14.5 12 14.5C16 14.5 18.5 16.5 19.5 20"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="staffAdmin__muted">
                {usedTickets > 0
                  ? `Hay ${usedTickets} tickets usados, pero todavía no existe detalle por personal.`
                  : eventId
                  ? "No hay tickets usados todavía en este evento."
                  : "No hay tickets usados todavía."}
              </div>
            </div>
          ) : (
            <div className="staffAdmin__tableWrap">
              <table className="staffAdmin__table">
                <thead>
                  <tr>
                    <th>Personal</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Tickets usados</th>
                    <th>Último escaneo</th>
                  </tr>
                </thead>

                <tbody>
                  {usedByStaff.map((row, index) => (
                    <tr key={row.staff?.id || index}>
                      <td>
                        <div className="staffAdmin__staffCell">
                          <div className="staffAdmin__avatar">
                            {(row.staff?.full_name || "S")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>
                            {row.staff?.full_name || "—"}
                          </strong>
                        </div>
                      </td>

                      <td>{row.staff?.email || "—"}</td>

                      <td>
                        <span className="staffAdmin__roleBadge">
                          {row.staff?.role || "—"}
                        </span>
                      </td>

                      <td>
                        <strong className="staffAdmin__usedCount">
                          {row.used_count}
                        </strong>
                      </td>

                      <td>
                        {row.last_scan_at
                          ? new Date(
                              row.last_scan_at
                            ).toLocaleString("es-EC", {
                              timeZone: "America/Guayaquil",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const Kpi = ({ icon, title, value, sub }) => {
  const icons = {
    orders: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 3H17L20 7V20H4V7L7 3Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M4 7H20"
          stroke="currentColor"
          strokeWidth="1.7"
        />

        <path
          d="M9 11H15"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),

    payments: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.7"
        />

        <path
          d="M3 9H21"
          stroke="currentColor"
          strokeWidth="1.7"
        />

        <path
          d="M7 15H11"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),

    revenue: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.7"
        />

        <path
          d="M15 8.5C14.4 7.7 13.4 7.2 12.2 7.2C10.5 7.2 9.4 8.1 9.4 9.4C9.4 10.8 10.5 11.3 12.3 11.8C14.1 12.3 15 12.9 15 14.3C15 15.8 13.7 16.8 12 16.8C10.7 16.8 9.6 16.3 8.8 15.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M12 5.5V18.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),

    tickets: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7H20V10C18.9 10 18 10.9 18 12C18 13.1 18.9 14 20 14V17H4V14C5.1 14 6 13.1 6 12C6 10.9 5.1 10 4 10V7Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M12 8.5V15.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeDasharray="2 2"
        />
      </svg>
    ),
  };

  return (
    <article className="staffAdmin__kpi">
      <div className="staffAdmin__kpiTop">
        <div className="staffAdmin__kpiIcon">
          {icons[icon]}
        </div>

        <span className="staffAdmin__kpiBrand">
          MR. HORNADO
        </span>
      </div>

      <div className="staffAdmin__kpiTitle">
        {title}
      </div>

      <div className="staffAdmin__kpiValue">
        {value}
      </div>

      {sub && (
        <div className="staffAdmin__kpiSub">
          {sub}
        </div>
      )}
    </article>
  );
};

export default StaffAdmin;