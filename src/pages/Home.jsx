import React, { useEffect, useMemo, useState } from "react";
import "./styles/Home.css";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import useHomeEvents from "../hooks/useHomeEvents";

const Home = () => {
  const navigate = useNavigate();

  const [getHomeEvents, homeEvents, isLoadingHomeEvents] = useHomeEvents();
  const [active, setActive] = useState(0);

  useEffect(() => {
    getHomeEvents(3).catch(() => { });
  }, []);

  // cuando cambia la lista, resetea active si se sale de rango
  useEffect(() => {
    if (active >= (homeEvents?.length || 0)) setActive(0);
  }, [homeEvents]);

  // autoplay (opcional)
  useEffect(() => {
    if (!homeEvents || homeEvents.length <= 1) return;

    const t = setInterval(() => {
      setActive((prev) => (prev + 1) % homeEvents.length);
    }, 5000);

    return () => clearInterval(t);
  }, [homeEvents]);

  const current = useMemo(() => {
    return (homeEvents && homeEvents.length > 0) ? homeEvents[active] : null;
  }, [homeEvents, active]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-EC", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Guayaquil",
    });
  };

  return (
    <div className="home">



      {/* Hero */}
      <section className="home__hero">
        <div className="home__heroBg" />
        <img src="/logo_3.png" alt="" className="home__heroDeco" />
        <div className="home__heroInner">
          <div className="home__eventCard">
            {isLoadingHomeEvents ? (
              <div style={{ padding: 10, opacity: 0.75 }}>Cargando evento...</div>
            ) : !current ? (
              <div style={{ padding: 10, opacity: 0.75 }}>No hay eventos para mostrar.</div>
            ) : (
              <>
                <div className="home__eventArtists">
                  {current.artists || "—"}
                </div>

                <div className="home__eventTitle">
                  {current.title || "(Sin nombre)"}
                </div>

                <div className="home__eventMeta">
                  <div className="home__eventDate">{formatDate(current.starts_at)}</div>
                  <div className="home__eventPlace">
                    {current.venue ? `${current.venue}` : ""}
                  </div>
                </div>

                <button
                  className="home__cta"
                  onClick={() => navigate(`/event/${current.id}`)}
                >
                  Comprar entradas <FaArrowRight className="buyArrow" />
                </button>
              </>
            )}
          </div>

          {/* Dots */}
          <div className="home__dots">
            {(homeEvents || []).slice(0, 3).map((_, idx) => (
              <span
                key={idx}
                className={`home__dotItem ${idx === active ? "home__dotItem--active" : ""}`}
                onClick={() => setActive(idx)}
                role="button"
                tabIndex={0}
              />
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;
