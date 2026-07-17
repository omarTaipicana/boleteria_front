import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/EventDetail.css";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const urlBase = import.meta.env.VITE_API_URL;

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getEvent = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${urlBase}/events/${eventId}`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getEvent();
  }, [eventId]);
  const id = event?.id || eventId;
  // const coverSrc = useMemo(() => {
  //   const id = event?.id || eventId;
  //   return `/${id}.png`;
  // }, [event?.id, eventId]);

  if (isLoading) return <div className="eventDetail__state">Cargando evento...</div>;
  if (!event) return <div className="eventDetail__state">Evento no encontrado</div>;

  const dateText = new Date(event.starts_at).toLocaleDateString("es-EC", {
    timeZone: "America/Guayaquil",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const placeText = `${event.venue || ""}`.trim();
  const price = Number(event.price || 0).toFixed(2);

  // ✅ una sola localidad
  const localityName = "GENERAL";

  return (
    <div className="eventDetail">
      <div className="eventDetail__wrap">
        {/* Título */}
        <h1 className="eventDetail__title">{event.title} </h1>

        {/* Imagen */}
        <div className="eventDetail__hero">
          <img
            className="eventDetail__img"
            src={`/events/${id}.png`}
            alt={event.title}
            onError={(e) => {
              // fallback si no existe la imagen
              e.currentTarget.src = "/fondo.png";
            }}
          />
        </div>

        {/* Bottom layout (como el PDF) */}
        <div className="eventDetail__bottom">
          {/* Left card */}
          <div className="eventDetail__leftCard">
            <div className="eventDetail__metaBlock">
              <div className="eventDetail__date">{dateText}</div>
              <div className="eventDetail__place">{placeText}</div>
            </div>

            <button
              className="eventDetail__buyBtn"
              onClick={() => navigate(`/checkout/${event.id}`)}
            >
              Comprar entradas <span className="eventDetail__buyArrow">→</span>
            </button>
          </div>

          {/* Right table */}
          <div className="eventDetail__tableCard">
            <div className="eventDetail__tableHead">
              <div className="eventDetail__th">Localidad</div>
              <div className="eventDetail__th">Valor Unitario + IVA</div>
            </div>

            <div className="eventDetail__tableRow">
              <div className="eventDetail__td">{localityName}</div>
              <div className="eventDetail__td eventDetail__td--price">${price}</div>
            </div>

            <div className="eventDetail__tableNote">
              Pago seguro · Entradas digitales con QR
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
