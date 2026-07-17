import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useEvents from "../hooks/useEvents";
import "./styles/EventList.css";

const EventList = () => {
  const navigate = useNavigate();
  const [getEvents, events, isLoading] = useEvents();

  useEffect(() => {
    Promise.resolve(getEvents?.()).catch(() => {});
  }, []);

  return (
    <div className="eventList">
      <div className="eventList__container">

        tambien 
        <div className="eventList__head">
          <h2 className="eventList__title">Conciertos y Eventos</h2>
          <div className="eventList__subtitle">
            Encuentra tu próxima experiencia NORTH
          </div>
        </div>

        {isLoading ? (
          <div className="eventList__state">Cargando eventos...</div>
        ) : (events || []).length === 0 ? (
          <div className="eventList__state">No hay eventos disponibles.</div>
        ) : (
          <div className="eventList__grid">
            {events.map((event) => (
              <button
                key={event.id}
                className="eventCard"
                onClick={() => navigate(`/event/${event.id}`)}
                type="button"
              >
                <div className="eventCard__top">
                  <div className="eventCard__badge">NORTH EVENT</div>
                </div>

                <div className="eventCard__body">
                  <div className="eventCard__title">
                    {event.title || "(Sin título)"}
                  </div>

                  <div className="eventCard__meta">
                    <div className="eventCard__metaRow">
                      <span className="eventCard__label">Lugar:</span>
                      <span className="eventCard__value">{event.venue || "—"}</span>
                    </div>

                    <div className="eventCard__metaRow">
                      <span className="eventCard__label">Fecha:</span>
                      <span className="eventCard__value">
                        {event.starts_at
                          ? new Date(event.starts_at).toLocaleString("es-EC", {
                              timeZone: "America/Guayaquil",
                            })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="eventCard__footer">
                  <span className="eventCard__cta">Ver detalles</span>
                  <span className="eventCard__arrow">›</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;
