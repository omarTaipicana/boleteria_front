import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useOrders from "../hooks/useOrders";
import "./styles/Checkout.css";

const HORNADO_IMAGE =
  "https://res.cloudinary.com/desgmhmg4/image/upload/v1784256827/hornado_u9yqnq.png";

const Checkout = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [createOrder, isLoading] = useOrders();

  const urlBase = import.meta.env.VITE_API_URL;

  const [event, setEvent] = useState(null);
  const [eventPrice, setEventPrice] = useState(0);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      quantity: 1,
    },
  });

  const quantity = Number(watch("quantity") || 1);
  const total = quantity * Number(eventPrice || 0);

  useEffect(() => {
    let mounted = true;

    const loadEvent = async () => {
      try {
        setEventLoading(true);
        setEventError("");

        const res = await axios.get(`${urlBase}/events/${eventId}`);

        if (!mounted) return;

        const eventData = res?.data || null;
        const price = Number(eventData?.price || 0);

        setEvent(eventData);
        setEventPrice(price);
      } catch (error) {
        console.error("Error cargando evento:", error);

        if (!mounted) return;

        setEvent(null);
        setEventPrice(0);
        setEventError(
          error?.response?.data?.message ||
            "No se pudo cargar la información de la venta."
        );
      } finally {
        if (mounted) {
          setEventLoading(false);
        }
      }
    };

    if (eventId) {
      loadEvent();
    } else {
      setEventLoading(false);
      setEventError("No se encontró el identificador de la venta.");
    }

    return () => {
      mounted = false;
    };
  }, [eventId, urlBase]);

  const onSubmit = async (data) => {
    try {
      const qty = Number(data.quantity || 1);
      const unitPrice = Number(eventPrice || 0);
      const orderTotal = (qty * unitPrice).toFixed(2);

      localStorage.setItem("north_prefill_amount", orderTotal);

      const order = await createOrder({
        ...data,
        buyer_name: data.buyer_name.trim(),
        buyer_email: data.buyer_email.trim().toLowerCase(),
        buyer_phone: data.buyer_phone.trim(),
        quantity: qty,
        eventId,
      });

      if (!order?.id) {
        throw new Error("La orden fue creada, pero no se recibió su ID.");
      }

      navigate(`/payment/${order.id}`);
    } catch (error) {
      console.error("Error creando orden:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "No se pudo crear el pedido. Intenta nuevamente."
      );
    }
  };

  return (
    <main className="checkout">
      <section className="checkout__container">
        <div className="checkout__hero">
          <img
            src={HORNADO_IMAGE}
            alt="Mr. Hornado, hornado ecuatoriano"
            className="checkout__heroImage"
          />

          <div className="checkout__heroShade" />

          <div className="checkout__heroContent">
            <span className="checkout__brand">🍖 MR. HORNADO</span>

            <h1 className="checkout__heroTitle">
              El hornado que todos quieren probar
            </h1>

            <p className="checkout__heroText">
              Crujiente por fuera, jugoso por dentro.
              <strong> Reserva ahora antes de que se termine.</strong>
            </p>
          </div>
        </div>

        <div className="checkout__content">
          <header className="checkout__head">
            <span className="checkout__step">PASO 1 DE 2</span>

            <h2 className="checkout__title">Realiza tu pedido</h2>

            <p className="checkout__subtitle">
              Completa tus datos y selecciona cuántos boletos de hornado deseas
              reservar.
            </p>
          </header>

          {eventLoading && (
            <div className="checkout__state">
              Cargando información de la venta...
            </div>
          )}

          {!eventLoading && eventError && (
            <div className="checkout__state checkout__state--error">
              {eventError}
            </div>
          )}

          {!eventLoading && event && (
            <div className="checkout__event">
              <div className="checkout__eventInfo">
                <span className="checkout__eventLabel">
                  Venta seleccionada
                </span>

                <h3 className="checkout__eventTitle">
                  {event.title || "Venta de Hornado"}
                </h3>

                {event.venue && (
                  <p className="checkout__eventMeta">📍 {event.venue}</p>
                )}

                {event.starts_at && (
                  <p className="checkout__eventMeta">
                    📅{" "}
                    {new Date(event.starts_at).toLocaleString("es-EC", {
                      timeZone: "America/Guayaquil",
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>

              <div className="checkout__eventPrice">
                <span>Precio por boleto</span>
                <strong>${eventPrice.toFixed(2)}</strong>
              </div>
            </div>
          )}

          <form className="checkout__form" onSubmit={handleSubmit(onSubmit)}>
            <div className="checkout__field">
              <label className="checkout__label" htmlFor="buyer_name">
                Nombre completo
              </label>

              <input
                id="buyer_name"
                type="text"
                autoComplete="name"
                placeholder="Ejemplo: Juan Pérez"
                className={`checkout__input ${
                  errors.buyer_name ? "checkout__input--error" : ""
                }`}
                {...register("buyer_name", {
                  required: "Ingresa tu nombre completo",
                  minLength: {
                    value: 3,
                    message: "El nombre es demasiado corto",
                  },
                })}
              />

              {errors.buyer_name && (
                <p className="checkout__error">
                  {errors.buyer_name.message}
                </p>
              )}
            </div>

            <div className="checkout__field">
              <label className="checkout__label" htmlFor="buyer_email">
                Correo electrónico
              </label>

              <input
                id="buyer_email"
                type="email"
                autoComplete="email"
                placeholder="correo@ejemplo.com"
                className={`checkout__input ${
                  errors.buyer_email ? "checkout__input--error" : ""
                }`}
                {...register("buyer_email", {
                  required: "Ingresa tu correo electrónico",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Ingresa un correo electrónico válido",
                  },
                })}
              />

              {errors.buyer_email && (
                <p className="checkout__error">
                  {errors.buyer_email.message}
                </p>
              )}

              <span className="checkout__help">
                Tus boletos con código QR llegarán a este correo.
              </span>
            </div>

            <div className="checkout__field">
              <label className="checkout__label" htmlFor="buyer_phone">
                Número de celular
              </label>

              <input
                id="buyer_phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                placeholder="09XXXXXXXX"
                className={`checkout__input ${
                  errors.buyer_phone ? "checkout__input--error" : ""
                }`}
                {...register("buyer_phone", {
                  required: "Ingresa tu número de celular",
                  pattern: {
                    value: /^09\d{8}$/,
                    message: "Ingresa un celular ecuatoriano válido",
                  },
                })}
              />

              {errors.buyer_phone && (
                <p className="checkout__error">
                  {errors.buyer_phone.message}
                </p>
              )}
            </div>

            <div className="checkout__field">
              <label className="checkout__label" htmlFor="quantity">
                Cantidad de boletos de hornado
              </label>

              <select
                id="quantity"
                className={`checkout__input checkout__input--select ${
                  errors.quantity ? "checkout__input--error" : ""
                }`}
                {...register("quantity", {
                  required: "Selecciona una cantidad",
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: "La cantidad mínima es 1",
                  },
                  max: {
                    value: 30,
                    message: "La cantidad máxima es 30",
                  },
                })}
              >
                {Array.from({ length: 30 }, (_, index) => index + 1).map(
                  (number) => (
                    <option key={number} value={number}>
                      {number} {number === 1 ? "boleto" : "boletos"}
                    </option>
                  )
                )}
              </select>

              {errors.quantity && (
                <p className="checkout__error">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div className="checkout__total">
              <div className="checkout__totalInfo">
                <span className="checkout__totalLabel">Total del pedido</span>

                <small>
                  {quantity} {quantity === 1 ? "boleto" : "boletos"} × $
                  {eventPrice.toFixed(2)}
                </small>
              </div>

              <strong className="checkout__totalValue">
                ${total.toFixed(2)}
              </strong>
            </div>

            <button
              className="checkout__button"
              type="submit"
              disabled={isLoading || eventLoading || eventPrice <= 0}
            >
              {isLoading ? "Procesando pedido..." : "Continuar al pago"}
            </button>

            <div className="checkout__notice">
              <span className="checkout__noticeIcon">📲</span>

              <p>
                Cuando validemos tu pago recibirás tus boletos digitales. El día
                de la entrega presenta cada código QR para reclamar tu hornado.
              </p>
            </div>

            <div className="checkout__security">
              🔒 Tus datos se utilizarán únicamente para gestionar tu pedido.
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Checkout;