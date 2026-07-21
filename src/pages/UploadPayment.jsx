import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import usePayments from "../hooks/usePayments";
import "./styles/UploadPayment.css";

const HORNADO_IMAGE =
  "https://res.cloudinary.com/desgmhmg4/image/upload/v1784256827/hornado_u9yqnq.png";

const BANK_QR_IMAGE =
  "https://res.cloudinary.com/desgmhmg4/image/upload/v1784258731/img_w9mqwe.png";

const UploadPayment = () => {
  const { orderId } = useParams();
  const [createPayment, isLoading] = usePayments();
  const navigate = useNavigate();

  const [modal, setModal] = useState({
    open: false,
    status: "success",
    title: "",
    message: "",
  });

  const [countdown, setCountdown] = useState(3);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
    },
  });

  useEffect(() => {
    const prefill = localStorage.getItem("north_prefill_amount");

    if (prefill) {
      setValue("amount", prefill);
    }
  }, [setValue]);

  const file = watch("proof")?.[0];

  const isModalSuccess =
    modal.open && modal.status === "success";

  const closeModal = () => {
    setModal((previous) => ({
      ...previous,
      open: false,
    }));

    setCountdown(3);
  };

  const goHome = () => {
    closeModal();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (!isModalSuccess) return;

    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isModalSuccess]);

  useEffect(() => {
    if (!isModalSuccess) return;

    if (countdown <= 0) {
      goHome();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, isModalSuccess]);

  const onSubmit = async (data) => {
    try {
      if (!data.proof?.[0]) {
        throw new Error("Debes seleccionar un comprobante.");
      }

      const formData = new FormData();

      formData.append("orderId", orderId);
      formData.append("amount", data.amount);
      formData.append("currency", "USD");
      formData.append("file", data.proof[0]);

      await createPayment(formData);

      localStorage.removeItem("north_prefill_amount");

      setModal({
        open: true,
        status: "success",
        title: "¡Comprobante enviado!",
        message:
          "Recibimos tu comprobante. Cuando validemos el pago, enviaremos tus boletos de hornado con código QR a tu correo.",
      });
    } catch (error) {
      console.error("Error enviando comprobante:", error);

      setModal({
        open: true,
        status: "error",
        title: "No se pudo enviar",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Ocurrió un error al subir el comprobante. Intenta nuevamente.",
      });
    }
  };

  useEffect(() => {
    if (!modal.open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [modal.open]);

  return (
    <main className="uploadPay">
      <section className="uploadPay__container">
        {/* Imagen principal */}
        <div className="uploadPay__hero">
          <img
            src={HORNADO_IMAGE}
            alt="Mr. Hornado"
            className="uploadPay__heroImage"
          />

          <div className="uploadPay__heroShade" />

          <div className="uploadPay__heroContent">
            <span className="uploadPay__brand">
              🍖 MR. HORNADO
            </span>

            <h1 className="uploadPay__heroTitle">
              Ya casi puedes disfrutarlo
            </h1>

            <p className="uploadPay__heroText">
              Realiza el pago y sube tu comprobante para
              confirmar tu reserva.
            </p>
          </div>
        </div>

        <div className="uploadPay__content">
          {/* Encabezado */}
          <header className="uploadPay__head">
            <span className="uploadPay__step">
              PASO 2 DE 2
            </span>

            <h2 className="uploadPay__title">
              Confirmar pago
            </h2>

            <p className="uploadPay__subtitle">
              Código de orden
              <span className="uploadPay__orderId">
                {orderId}
              </span>
            </p>
          </header>

          {/* Información bancaria */}
          <section className="uploadPay__bankBox">
            {/* <div className="uploadPay__bankHeader">
              <div>
                <span className="uploadPay__bankBadge">
                  BANCO PICHINCHA
                </span>

                <h3 className="uploadPay__bankTitle">
                  Escanea el QR para pagar
                </h3>

                <p className="uploadPay__bankSubtitle">
                  Abre la aplicación de tu banco, escanea el
                  código QR y realiza el pago por el valor total
                  de tu pedido.
                </p>
              </div>

              <div className="uploadPay__bankIcon">
                🏦
              </div>
            </div> */}

            {/* QR de Banco Pichincha */}
            {/* <div className="uploadPay__qrSection">
              <a
                href={BANK_QR_IMAGE}
                target="_blank"
                rel="noopener noreferrer"
                className="uploadPay__qrLink"
                aria-label="Abrir QR de Banco Pichincha"
              >
                <div className="uploadPay__qrFrame">
                  <img
                    src={BANK_QR_IMAGE}
                    alt="Código QR para pago en Banco Pichincha"
                    className="uploadPay__qrImage"
                  />
                </div>
              </a>

              <div className="uploadPay__qrInfo">
                <span className="uploadPay__qrBadge">
                  PAGO MEDIANTE QR
                </span>

                <h4 className="uploadPay__qrTitle">
                  Paga desde tu celular
                </h4>

                <ol className="uploadPay__qrSteps">
                  <li>
                    Abre la aplicación de tu banco.
                  </li>

                  <li>
                    Selecciona la opción para escanear o pagar
                    mediante QR.
                  </li>

                  <li>
                    Escanea el código y verifica los datos del
                    beneficiario.
                  </li>

                  <li>
                    Ingresa el valor total de tu pedido y realiza
                    el pago.
                  </li>

                  <li>
                    Guarda el comprobante y súbelo en este
                    formulario.
                  </li>
                </ol>

                <a
                  href={BANK_QR_IMAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uploadPay__qrOpen"
                >
                  Ver QR en tamaño completo
                </a>
              </div>
            </div> */}

            <div className="uploadPay__divider">
              <span>Revisa los datos de la cuenta</span>
            </div>

            {/* Datos tradicionales de cuenta */}
            <div className="uploadPay__bankGrid">
              <div className="uploadPay__bankItem">
                <div className="uploadPay__bankLabel">
                  Banco
                </div>

                <div className="uploadPay__bankValue">
                  Banco Pichincha
                </div>
              </div>

              <div className="uploadPay__bankItem">
                <div className="uploadPay__bankLabel">
                  Tipo de cuenta
                </div>

                <div className="uploadPay__bankValue">
                  Cuenta de ahorro transaccional
                </div>
              </div>

              <div className="uploadPay__bankItem">
                <div className="uploadPay__bankLabel">
                  Número de cuenta
                </div>

                <div className="uploadPay__bankValue uploadPay__bankValue--mono">
                  2215965706
                </div>
              </div>

              <div className="uploadPay__bankItem">
                <div className="uploadPay__bankLabel">
                  Titular
                </div>

                <div className="uploadPay__bankValue">
                  Gabriela Zabala / 
                  CC: 1105806713
                </div>
              </div>
            </div>

            <div className="uploadPay__bankNote">
              <span>📌</span>

              <p>
                Antes de confirmar el pago, verifica que los
                datos mostrados en tu aplicación correspondan al
                beneficiario. Luego guarda una captura o descarga
                el comprobante.
              </p>
            </div>
          </section>

          {/* Formulario */}
          <form
            className="uploadPay__form"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Monto */}
            <div className="uploadPay__field">
              <label
                className="uploadPay__label"
                htmlFor="amount"
              >
                Monto depositado
              </label>

              <div className="uploadPay__amountWrap">
                <span className="uploadPay__currency">
                  $
                </span>

                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className={`uploadPay__input uploadPay__input--amount ${
                    errors.amount
                      ? "uploadPay__input--error"
                      : ""
                  }`}
                  {...register("amount", {
                    required:
                      "Ingresa el monto depositado",
                    min: {
                      value: 0.01,
                      message:
                        "El monto debe ser mayor a cero",
                    },
                  })}
                  disabled={isLoading}
                />
              </div>

              {errors.amount && (
                <p className="uploadPay__error">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Comprobante */}
            <div className="uploadPay__field">
              <label className="uploadPay__label">
                Comprobante de pago
              </label>

              <label
                className={`uploadPay__drop ${
                  errors.proof
                    ? "uploadPay__drop--error"
                    : ""
                } ${
                  file
                    ? "uploadPay__drop--selected"
                    : ""
                }`}
              >
                <div className="uploadPay__dropIcon">
                  {file ? "✓" : "📤"}
                </div>

                <div className="uploadPay__dropContent">
                  <div className="uploadPay__dropTitle">
                    {file
                      ? "Comprobante seleccionado"
                      : "Selecciona tu comprobante"}
                  </div>

                  <div className="uploadPay__dropHint">
                    {file ? (
                      <span className="uploadPay__fileName">
                        {file.name}
                      </span>
                    ) : (
                      "Haz clic aquí para subir una imagen o un archivo PDF"
                    )}
                  </div>

                  {!file && (
                    <div className="uploadPay__dropFormats">
                      JPG, PNG, WEBP o PDF
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="uploadPay__fileInput"
                  {...register("proof", {
                    required:
                      "Debes subir el comprobante",
                  })}
                  disabled={isLoading}
                />
              </label>

              {errors.proof && (
                <p className="uploadPay__error">
                  {errors.proof.message}
                </p>
              )}
            </div>

            <button
              className="uploadPay__btn"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? "Enviando comprobante..."
                : "Enviar comprobante"}
            </button>

            <div className="uploadPay__notice">
              <span className="uploadPay__noticeIcon">
                📲
              </span>

              <div>
                <strong>
                  ¿Qué sucede después?
                </strong>

                <p>
                  Validaremos tu pago y enviaremos tus boletos
                  digitales con código QR al correo registrado.
                  Cada boleto permitirá reclamar una porción de
                  hornado.
                </p>
              </div>
            </div>

            <div className="uploadPay__security">
              🔒 Tu comprobante se utilizará únicamente para
              validar este pago.
            </div>
          </form>
        </div>
      </section>

      {/* Modal */}
      {modal.open && (
        <div
          className="uploadPayModal__backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-payment-modal-title"
        >
          <div className="uploadPayModal__card">
            <div
              className={`uploadPayModal__icon ${
                modal.status === "success"
                  ? "uploadPayModal__icon--success"
                  : "uploadPayModal__icon--error"
              }`}
            >
              {modal.status === "success" ? "✓" : "!"}
            </div>

            <span className="uploadPayModal__brand">
              MR. HORNADO
            </span>

            <h3
              id="upload-payment-modal-title"
              className="uploadPayModal__title"
            >
              {modal.title}
            </h3>

            <p className="uploadPayModal__text">
              {modal.message}
            </p>

            {modal.status === "success" && (
              <div className="uploadPayModal__count">
                Redirigiendo al inicio en{" "}
                <b>{countdown}</b>...
              </div>
            )}

            <div className="uploadPayModal__actions">
              {modal.status === "success" ? (
                <>
                  <button
                    type="button"
                    className="uploadPayModal__btn uploadPayModal__btn--ghost"
                    onClick={closeModal}
                  >
                    Quedarme aquí
                  </button>

                  <button
                    type="button"
                    className="uploadPayModal__btn uploadPayModal__btn--primary"
                    onClick={goHome}
                  >
                    Ir al inicio
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="uploadPayModal__btn uploadPayModal__btn--primary"
                  onClick={closeModal}
                >
                  Intentar nuevamente
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default UploadPayment;