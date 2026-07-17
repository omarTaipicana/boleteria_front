import React from "react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">

        {/* Columna 1 */}
        <div className="footer__col">
          <img src="/logo_2.png" alt="North Events" className="footer__logo" />

          <h3 className="footer__title">
            Suscríbete para noticias <br /> de nuevos eventos
          </h3>

          <div className="footer__newsletter">
            <input
              type="email"
              placeholder="Ingresa tu correo electrónico"
              className="footer__input"
            />
            <button className="footer__btn">
              Enviar
            </button>
          </div>
        </div>

        {/* Columna 2 */}
        <div className="footer__col">
          <h3 className="footer__heading">Menú</h3>

          <a href="/">Inicio</a>
          <a href="/events">Conciertos y Eventos</a>
          <a href="#">Eventos Anteriores</a>
          <a href="/partners">Partners</a>
          <a href="/contact">Contactos</a>
        </div>

        {/* Columna 3 */}
        <div className="footer__col">
          <h3 className="footer__heading">¡Escríbenos!</h3>
          <a
            href="https://wa.me/593997808994"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__phone"
          >
            +593 99-780-8994
          </a>

          <h3 className="footer__heading footer__socialTitle">
            ¡Síguenos!
          </h3>

          <div className="footer__socials">
            <a href="https://www.facebook.com/share/18JSZ47oaV/" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>

            <a href="https://www.instagram.com/northevents04?utm_source=qr&igsh=cWlsMWo1eDNmbnFn" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>

            <a href="https://www.tiktok.com/@northevents04" target="_blank" rel="noopener noreferrer">
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        Copyright 2026 North Events
      </div>


      <img src="/logo_3.png" alt="North Events" className="footer__bgDeco" />

    </footer>
  );
};

export default Footer;
