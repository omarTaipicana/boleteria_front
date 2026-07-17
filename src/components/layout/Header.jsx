import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import "./Header.css";

const Header = () => {
  const [open, setOpen] = useState(false);

  // cerrar drawer con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={`header ${open ? "isOpen" : ""}`}>
      {/* Topbar */}
      <div className="header__topbar">
        <div className="header__topbarLeft">
          {/* <a href="#">
            North Events Booking <span className="header__arrow">›</span>
          </a>

          <a href="#">
            Quieres ser Auspiciante <span className="header__arrow">›</span>
          </a>

          <a href="#">
            Gana Entradas <span className="header__arrow">›</span>
          </a> */}
        </div>

        <div className="header__socialBox">
          <a
            href="https://www.facebook.com/share/18JSZ47oaV/"
            target="_blank"
            rel="noopener noreferrer"
            className="header__social"
            aria-label="Facebook"
          >
            <FaFacebookF />
          </a>

          <a
            href="https://www.instagram.com/northevents04?utm_source=qr&igsh=cWlsMWo1eDNmbnFn"
            target="_blank"
            rel="noopener noreferrer"
            className="header__social"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>

          <a
            href="https://www.tiktok.com/@northevents04"
            target="_blank"
            rel="noopener noreferrer"
            className="header__social"
            aria-label="TikTok"
          >
            <FaTiktok />
          </a>
        </div>
      </div>

      {/* Navbar */}
      <div className="header__navbar">
        <div className="header__inner">
          <NavLink to="/" className="header__logoLink">
            <img src="/logo.png" alt="North Events" className="header__logo" />
          </NavLink>
          {/* Desktop nav */}
          <nav className="header__nav">
            <NavLink to="/" end className="header__link">
              Inicio
            </NavLink>

            <NavLink to="/event/072bc678-2eb1-4a0d-8e0f-e8f1dff219d0" className="header__link">
              Conciertos y Eventos
            </NavLink>

            <NavLink to="/partners" className="header__link">
              Partners
            </NavLink>

            <NavLink to="/contact" className="header__link">
              Contactos
            </NavLink>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="header__burger"
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="header__burgerIcon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

        </div>
      </div>

      {/* Mobile drawer + backdrop */}
      <div
        className="header__backdrop"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      />

      <aside className="header__drawer" aria-hidden={!open}>
        <div className="header__drawerHead">
          <div className="header__drawerTitle">Menú</div>
          <button
            className="header__drawerClose"
            type="button"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
          >
            <span className="header__x" aria-hidden="true" />

          </button>
        </div>

        <div className="header__drawerNav" onClick={() => setOpen(false)}>
          <NavLink to="/" end className="header__drawerLink">
            Inicio
          </NavLink>

          <NavLink to="/events" className="header__drawerLink">
            Conciertos y Eventos
          </NavLink>

          <NavLink to="/partners" className="header__drawerLink">
            Partners
          </NavLink>

          <NavLink to="/contact" className="header__drawerLink">
            Contactos
          </NavLink>
        </div>

        <div className="header__drawerSocial">
          <a
            href="https://www.facebook.com/share/18JSZ47oaV/"
            target="_blank"
            rel="noopener noreferrer"
            className="header__drawerSocialBtn"
            aria-label="Facebook"
          >
            <FaFacebookF />
          </a>

          <a
            href="https://www.instagram.com/northevents04?utm_source=qr&igsh=cWlsMWo1eDNmbnFn"
            target="_blank"
            rel="noopener noreferrer"
            className="header__drawerSocialBtn"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>

          <a
            href="https://www.tiktok.com/@northevents04"
            target="_blank"
            rel="noopener noreferrer"
            className="header__drawerSocialBtn"
            aria-label="TikTok"
          >
            <FaTiktok />
          </a>
        </div>
      </aside>
    </header>
  );
};

export default Header;
