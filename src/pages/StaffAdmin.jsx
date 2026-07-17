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

  // ✅ Carga inicial: eventos + dashboard general + summary
  useEffect(() => {
    Promise.resolve(getEvents?.()).catch(() => {});
    Promise.resolve(getDashboard?.()).catch(() => {});
    Promise.resolve(getEventsSummary?.()).catch(() => {});
  }, []);

  // ✅ Cada vez que cambie el filtro
  useEffect(() => {
    Promise.resolve(getDashboard?.(eventId || undefined)).catch(() => {});
    if (!eventId) {
      Promise.resolve(getEventsSummary?.()).catch(() => {});
    }
  }, [eventId]);

  const loading = !!(isLoadingEvents || isLoadingDash);

  const eventSelected = useMemo(() => {
    return (events || []).find((e) => String(e.id) === String(eventId));
  }, [events, eventId]);

  // ===== KPIs con fallback =====
  const orders_count = dashboard?.orders?.orders_count ?? 0;
  const qty_total = dashboard?.orders?.qty_total ?? 0;

  const payments_count = dashboard?.payments?.payments_count ?? 0;
  const payments_validated_count =
    dashboard?.payments?.payments_validated_count ?? 0;

  const amount_total_all = Number(dashboard?.payments?.amount_total_all ?? 0);
  const amount_total_validated = Number(
    dashboard?.payments?.amount_total_validated ?? 0
  );

  const totalTickets = dashboard?.tickets?.totalTickets ?? 0;
  const usedTickets = dashboard?.tickets?.usedTickets ?? 0;
  const unusedTickets = dashboard?.tickets?.unusedTickets ?? 0;
  const voidTickets = dashboard?.tickets?.voidTickets ?? 0;

  const usedByStaff = dashboard?.used_by_staff || [];

  // ===== mensajes de error =====
  const errorMsgEvents =
    errorEvents?.response?.data?.message || errorEvents?.message || null;
  const errorMsgDash =
    errorDash?.response?.data?.message || errorDash?.message || null;

  return (
    <div className="staffAdmin">
      {/* Header top */}
      <div className="staffAdmin__top">
        <div>
          <h2 className="staffAdmin__title">Admin Dashboard</h2>
          <div className="staffAdmin__sub">
            Estadísticas generales y por evento
          </div>
        </div>

        <button
          onClick={() => {
            getDashboard?.(eventId || undefined).catch(() => {});
            if (!eventId) getEventsSummary?.().catch(() => {});
          }}
          disabled={loading}
          className="staffAdmin__btn"
        >
          {loading ? "Cargando..." : "Refrescar"}
        </button>
      </div>

      {/* Errores */}
      {(errorMsgEvents || errorMsgDash) && (
        <div className="staffAdmin__errorBox">
          {errorMsgEvents && (
            <div>
              <b>Error Events:</b> {errorMsgEvents}
            </div>
          )}
          {errorMsgDash && (
            <div style={{ marginTop: 6 }}>
              <b>Error Dashboard:</b> {errorMsgDash}
            </div>
          )}
        </div>
      )}

      {/* Selector */}
      <div className="staffAdmin__filters">
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="staffAdmin__select"
        >
          <option value="">📊 Todos los eventos (General)</option>
          {(events || []).map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title || "(Sin título)"}
            </option>
          ))}
        </select>

        <div className="staffAdmin__status">
          {loading ? "Actualizando..." : "Listo"}
        </div>
      </div>

      {/* Info evento */}
      {eventSelected && (
        <div className="staffAdmin__eventInfo">
          <div>
            <b>Evento:</b> {eventSelected.title}
          </div>
          <div>
            <b>Lugar:</b> {eventSelected.venue || "—"}
          </div>
          <div>
            <b>Fecha:</b>{" "}
            {eventSelected.starts_at
              ? new Date(eventSelected.starts_at).toLocaleString("es-EC", {
                  timeZone: "America/Guayaquil",
                })
              : "—"}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="staffAdmin__kpis">
        <Kpi
          title="Órdenes"
          value={orders_count}
          sub={`Cantidad total: ${qty_total}`}
        />
        <Kpi
          title="Pagos recibidos"
          value={payments_count}
          sub={`Validados: ${payments_validated_count}`}
        />
        <Kpi
          title="Recaudación (validados)"
          value={`$${amount_total_validated.toFixed(2)}`}
          sub={`Total recibido: $${amount_total_all.toFixed(2)}`}
        />
        <Kpi
          title="Tickets"
          value={totalTickets}
          sub={`Usados: ${usedTickets} | Sin usar: ${unusedTickets} | Anulados: ${voidTickets}`}
        />
      </div>

      {/* Resumen por evento (solo general) */}
      {!eventId && (
        <div className="staffAdmin__section">
          <div className="staffAdmin__sectionHead">
            <h3 className="staffAdmin__h3">Resumen por evento</h3>
            <div className="staffAdmin__hint">Click en una fila para filtrar</div>
          </div>

          {(summary || []).length === 0 ? (
            <div className="staffAdmin__muted">
              {loading
                ? "Cargando resumen..."
                : "Sin datos en el resumen (summary vacío)."}
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
                      className="staffAdmin__trClickable"
                      title="Click para ver el dashboard de este evento"
                    >
                      <td>{row.name || "(Sin nombre)"}</td>
                      <td>{row.totalTickets}</td>
                      <td>{row.usedTickets}</td>
                      <td>${Number(row.revenue || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Check-in por Staff */}
      <div className="staffAdmin__section">
        <div className="staffAdmin__sectionHead">
          <h3 className="staffAdmin__h3">Check-in por Staff</h3>
          <div className="staffAdmin__hint">
            Detalle por usuario que escaneó tickets
          </div>
        </div>

        {usedByStaff.length === 0 ? (
          <div className="staffAdmin__muted">
            {usedTickets > 0
              ? `Hay ${usedTickets} tickets usados, pero aún no hay detalle por staff (falta registrar quién escaneó).`
              : eventId
              ? "No hay tickets usados todavía en este evento."
              : "No hay tickets usados todavía."}
          </div>
        ) : (
          <div className="staffAdmin__tableWrap">
            <table className="staffAdmin__table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Tickets usados</th>
                  <th>Último scan</th>
                </tr>
              </thead>
              <tbody>
                {usedByStaff.map((row, idx) => (
                  <tr key={row.staff?.id || idx}>
                    <td>{row.staff?.full_name || "—"}</td>
                    <td>{row.staff?.email || "—"}</td>
                    <td>
                      <span className="staffAdmin__pill">
                        {row.staff?.role || "—"}
                      </span>
                    </td>
                    <td>
                      <b>{row.used_count}</b>
                    </td>
                    <td>
                      {row.last_scan_at
                        ? new Date(row.last_scan_at).toLocaleString("es-EC", {
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
      </div>
    </div>
  );
};

const Kpi = ({ title, value, sub }) => (
  <div className="staffAdmin__kpi">
    <div className="staffAdmin__kpiTitle">{title}</div>
    <div className="staffAdmin__kpiValue">{value}</div>
    {sub && <div className="staffAdmin__kpiSub">{sub}</div>}
  </div>
);

export default StaffAdmin;
