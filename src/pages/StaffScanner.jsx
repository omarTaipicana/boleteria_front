import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";

import useCheckin from "../hooks/useCheckin";
import useCrud from "../hooks/useCrud";

import "./styles/StaffScanner.css";

const extractCode = (raw) => {
  if (!raw) return "";

  const text = String(raw).trim();

  try {
    const isUrlLike =
      text.startsWith("http://") || text.startsWith("https://");

    const url = new URL(
      text,
      isUrlLike ? undefined : "http://dummy.local"
    );

    const qCode = url.searchParams.get("code");

    if (qCode) {
      return qCode;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    const ticketIndex = parts.indexOf("ticket");

    if (ticketIndex !== -1 && parts[ticketIndex + 1]) {
      return parts[ticketIndex + 1];
    }

    return text;
  } catch {
    return text;
  }
};

const StaffScanner = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const PATH_VARIABLES = "/variables";

  const [variables, getVariables, , , , ,] = useCrud();
  const [doCheckin, isLoading, result, , setResult] = useCheckin();

  const [code, setCode] = useState("");
  const [selectedPuerta, setSelectedPuerta] = useState("");
  const [gate, setGate] = useState("PUESTO A");
  const [cameraOn, setCameraOn] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [modal, setModal] = useState(null);

  const scannerRef = useRef(null);
  const scanNonceRef = useRef(0);

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }

      await scannerRef.current?.clear();
    } catch {
      // El scanner puede estar detenido previamente.
    }

    scannerRef.current = null;
  };

  useEffect(() => {
    getVariables(PATH_VARIABLES);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryCode = searchParams.get("code");

    if (queryCode) {
      setCode(extractCode(queryCode));

      navigate(location.pathname, {
        replace: true,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const startScanner = async () => {
      if (!cameraOn) return;

      const elementId = "qr-reader";

      scannerRef.current = new Html5Qrcode(elementId);

      const currentNonce = ++scanNonceRef.current;

      try {
        await scannerRef.current.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
          },
          async (decodedText) => {
            if (currentNonce !== scanNonceRef.current) {
              return;
            }

            const scannedCode = extractCode(decodedText);

            await stopScanner();
            setCameraOn(false);

            if (currentNonce !== scanNonceRef.current) {
              return;
            }

            setCode(scannedCode);
          },
          () => {}
        );
      } catch (error) {
        console.error(error);

        setModal({
          type: "error",
          title: "No se pudo abrir la cámara",
          text: "Revisa los permisos del navegador. La cámara requiere HTTPS o localhost.",
        });

        setCameraOn(false);
      }
    };

    const stop = async () => {
      await stopScanner();
    };

    if (cameraOn) {
      startScanner();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [cameraOn]);

  const handleCheckin = async () => {
    const finalCode = extractCode(code);

    if (!finalCode) {
      setModal({
        type: "info",
        title: "Código requerido",
        text: "Escanea un código QR o pega manualmente el código de la entrada.",
      });

      return;
    }

    try {
      await doCheckin({
        code: finalCode,
        gate,
      });
    } catch {
      // El resultado del hook controla el mensaje presentado.
    }
  };

  const handleClear = async () => {
    scanNonceRef.current++;

    navigate(location.pathname, {
      replace: true,
    });

    setCameraOn(false);

    await stopScanner();

    setCode("");
    setResult(null);

    setInputKey((currentKey) => currentKey + 1);

    setTimeout(() => {
      setCode("");
    }, 50);
  };

  const toggleCamera = () => {
    setResult(null);

    scanNonceRef.current++;

    setCameraOn((currentValue) => !currentValue);
  };

  const renderStatus = () => {
    if (!result) return null;

    const data = result.data || {};
    const buyer = data.buyer || {};
    const event = data.event || {};
    const order = data.order || {};
    const staff = data.staff || {};
    const usedByStaff = data.used_by_staff || {};

    const totalInOrder = Number(
      order.quantity ??
        order.total_tickets ??
        order.cantidad ??
        0
    );

    const ticketOneOf =
      totalInOrder > 1 ? `1 de ${totalInOrder}` : null;

    const formatDateTime = (iso) => {
      if (!iso) return "—";

      try {
        return new Date(iso).toLocaleString("es-EC", {
          timeZone: "America/Guayaquil",
        });
      } catch {
        return String(iso);
      }
    };

    const formatDate = (iso) => {
      if (!iso) return "—";

      try {
        return new Date(iso).toLocaleDateString("es-EC", {
          year: "numeric",
          month: "long",
          day: "2-digit",
          timeZone: "America/Guayaquil",
        });
      } catch {
        return String(iso);
      }
    };

    return (
      <section
        className={`scanStatus ${
          result.ok ? "scanStatus--ok" : "scanStatus--bad"
        }`}
      >
        <div className="scanStatus__hero">
          <div className="scanStatus__heroIcon">
            {result.ok ? "✓" : "✕"}
          </div>

          <div className="scanStatus__heroContent">
            <span className="scanStatus__eyebrow">
              Resultado de validación
            </span>

            <h2 className="scanStatus__title">
              {result.ok
                ? "Ingreso registrado"
                : "Ingreso no permitido"}
            </h2>

            <p className="scanStatus__message">
              {data.message || "No se recibió información adicional."}
            </p>
          </div>

          <span className="scanStatus__badge">
            {result.ok ? "APROBADO" : "RECHAZADO"}
          </span>
        </div>

        <div className="scanStatus__content">
          {(buyer.name || buyer.email || buyer.phone) && (
            <section className="scanStatus__group">
              <div className="scanStatus__groupHead">
                <span className="scanStatus__groupIcon">👤</span>

                <div>
                  <span>Información personal</span>
                  <h3>Comprador</h3>
                </div>
              </div>

              <div className="scanStatus__grid">
                {buyer.name && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Nombre
                    </span>

                    <strong className="scanStatus__value">
                      {buyer.name}
                    </strong>
                  </div>
                )}

                {buyer.email && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Correo electrónico
                    </span>

                    <strong className="scanStatus__value">
                      {buyer.email}
                    </strong>
                  </div>
                )}

                {buyer.phone && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Teléfono
                    </span>

                    <a
                      className="scanStatus__value scanStatus__value--link"
                      href={`tel:${buyer.phone}`}
                    >
                      {buyer.phone}
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {(event.title ||
            event.venue ||
            event.city ||
            event.starts_at) && (
            <section className="scanStatus__group">
              <div className="scanStatus__groupHead">
                <span className="scanStatus__groupIcon">🍖</span>

                <div>
                  <span>Información de la venta</span>
                  <h3>Evento</h3>
                </div>
              </div>

              <div className="scanStatus__grid">
                {event.title && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Título
                    </span>

                    <strong className="scanStatus__value">
                      {event.title}
                    </strong>
                  </div>
                )}

                {(event.city || event.venue) && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Lugar
                    </span>

                    <strong className="scanStatus__value">
                      {event.city || "—"}
                      {event.venue ? ` / ${event.venue}` : ""}
                    </strong>
                  </div>
                )}

                {event.starts_at && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Fecha
                    </span>

                    <strong className="scanStatus__value">
                      {formatDate(event.starts_at)}
                    </strong>
                  </div>
                )}
              </div>
            </section>
          )}

          {(order.quantity != null || order.total != null) && (
            <section className="scanStatus__group">
              <div className="scanStatus__groupHead">
                <span className="scanStatus__groupIcon">🎟️</span>

                <div>
                  <span>Detalle de compra</span>
                  <h3>Orden</h3>
                </div>
              </div>

              <div className="scanStatus__grid">
                {ticketOneOf && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Entrada
                    </span>

                    <strong className="scanStatus__value">
                      {ticketOneOf}
                    </strong>
                  </div>
                )}

                {totalInOrder > 0 && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Tickets comprados
                    </span>

                    <strong className="scanStatus__value">
                      {totalInOrder}
                    </strong>
                  </div>
                )}

                {order.total != null && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Total
                    </span>

                    <strong className="scanStatus__value scanStatus__value--amount">
                      ${order.total}
                    </strong>
                  </div>
                )}
              </div>
            </section>
          )}

          {(data.used_at ||
            data.gate ||
            staff.full_name ||
            usedByStaff.full_name) && (
            <section className="scanStatus__group">
              <div className="scanStatus__groupHead">
                <span className="scanStatus__groupIcon">🚪</span>

                <div>
                  <span>Control de acceso</span>
                  <h3>Registro</h3>
                </div>
              </div>

              <div className="scanStatus__grid">
                {usedByStaff.full_name && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Registrado anteriormente por
                    </span>

                    <strong className="scanStatus__value">
                      {usedByStaff.full_name}

                      {usedByStaff.role
                        ? ` (${usedByStaff.role})`
                        : ""}
                    </strong>
                  </div>
                )}

                {data.used_at && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Fecha de uso
                    </span>

                    <strong className="scanStatus__value">
                      {formatDateTime(data.used_at)}
                    </strong>
                  </div>
                )}

                {data.gate && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Puesto
                    </span>

                    <strong className="scanStatus__value scanStatus__value--gate">
                      {data.gate}
                    </strong>
                  </div>
                )}

                {staff.full_name && (
                  <div className="scanStatus__item">
                    <span className="scanStatus__label">
                      Registrado por
                    </span>

                    <strong className="scanStatus__value">
                      {staff.full_name}

                      {staff.role ? ` (${staff.role})` : ""}
                    </strong>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </section>
    );
  };

  return (
    <main className="staffScan">
      <div className="staffScan__container">
        <header className="staffScan__hero">
          <div className="staffScan__heroContent">
            <span className="staffScan__eyebrow">
              🍖 CONTROL DE ENTREGA
            </span>

            <h1 className="staffScan__title">
              Escáner de entradas
            </h1>

            <p className="staffScan__sub">
              Escanea el código QR o ingresa el código manualmente para
              registrar la entrega del hornado.
            </p>
          </div>

          <div className="staffScan__heroVisual" aria-hidden="true">
            <div className="staffScan__heroQr">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </header>

        <section className="staffScan__controlCard">
          <div className="staffScan__controlHead">
            <div>
              <span className="staffScan__controlLabel">
                Registro de ingreso
              </span>

              <h2>Validar código QR</h2>
            </div>

            <button
              className="staffScan__clearBtn"
              type="button"
              onClick={handleClear}
            >
              <span>↻</span>
              Limpiar
            </button>
          </div>

          {cameraOn && (
            <div className="staffScan__camera">
              <div className="staffScan__cameraHead">
                <div>
                  <span className="staffScan__cameraLive">
                    <span />
                    Cámara activa
                  </span>

                  <p>Coloca el código QR dentro del recuadro.</p>
                </div>

                <button
                  className="staffScan__cameraClose"
                  type="button"
                  onClick={toggleCamera}
                  disabled={isLoading}
                  aria-label="Apagar cámara"
                >
                  ✕
                </button>
              </div>

              <div className="staffScan__cameraFrame">
                <div className="staffScan__corner staffScan__corner--one" />
                <div className="staffScan__corner staffScan__corner--two" />
                <div className="staffScan__corner staffScan__corner--three" />
                <div className="staffScan__corner staffScan__corner--four" />

                <div id="qr-reader" className="staffScan__qr" />
              </div>

              <div className="staffScan__tip">
                <span>🔒</span>

                <p>
                  En celulares, el acceso a la cámara normalmente requiere
                  HTTPS o localhost.
                </p>
              </div>
            </div>
          )}

          <div className="staffScan__form">
            <div className="staffScan__fields">
              <div className="staffScan__field staffScan__field--code">
                <label
                  className="staffScan__label"
                  htmlFor="staff-scanner-code"
                >
                  Código de entrada
                </label>

                <div className="staffScan__inputWrap">
                  <span className="staffScan__inputIcon">
                    🎟️
                  </span>

                  <input
                    id="staff-scanner-code"
                    key={inputKey}
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value)
                    }
                    placeholder="Escanea el QR o pega el código"
                    autoComplete="off"
                    inputMode="text"
                    className="staffScan__input"
                  />

                  {code && (
                    <span className="staffScan__codeReady">
                      ✓
                    </span>
                  )}
                </div>

                <span className="staffScan__help">
                  Puedes pegar el código completo o la URL incluida en el QR.
                </span>
              </div>

              <div className="staffScan__field">
                <label
                  className="staffScan__label"
                  htmlFor="staff-scanner-gate"
                >
                  Puesto de entrega
                </label>

                <div className="staffScan__inputWrap">
                  <span className="staffScan__inputIcon">
                    🚪
                  </span>

                  <select
                    id="staff-scanner-gate"
                    value={gate}
                    onChange={(event) =>
                      setGate(event.target.value)
                    }
                    className="staffScan__select"
                  >
                    <option value="">
                      Seleccione el puesto de entrega
                    </option>

                    {variables
                      ?.filter((variable) => variable.subsistema)
                      .map((variable) => (
                        <option
                          key={variable.id}
                          value={variable.subsistema}
                        >
                          {variable.subsistema}
                        </option>
                      ))}
                  </select>
                </div>

                <span className="staffScan__help">
                  El puesto seleccionado quedará registrado.
                </span>
              </div>
            </div>

            <div className="staffScan__actions">
              <button
                type="button"
                className={`staffScan__btn staffScan__btn--camera ${
                  cameraOn ? "isOn" : ""
                }`}
                onClick={toggleCamera}
                disabled={isLoading}
              >
                <span className="staffScan__btnIcon">
                  {cameraOn ? "⏹" : "📷"}
                </span>

                {cameraOn
                  ? "Apagar cámara"
                  : "Escanear con cámara"}
              </button>

              <button
                className="staffScan__btn staffScan__btn--primary"
                onClick={handleCheckin}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? (
                  <>
                    <span className="staffScan__loader" />
                    Procesando entrada...
                  </>
                ) : (
                  <>
                    <span className="staffScan__btnIcon">
                      ✓
                    </span>
                    Registrar ingreso
                  </>
                )}
              </button>
            </div>

            <div className="staffScan__notice">
              <span className="staffScan__noticeIcon">💡</span>

              <div>
                <strong>Antes de registrar</strong>

                <p>
                  Confirma que la puerta seleccionada corresponda al punto
                  donde se entregará el hornado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {renderStatus()}
      </div>

      {modal && (
        <div
          className="staffScanModal__backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModal(null);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`staffScanModal__card ${
              modal.type === "error"
                ? "staffScanModal__card--error"
                : "staffScanModal__card--info"
            }`}
          >
            <div className="staffScanModal__topLine" />

            <div className="staffScanModal__head">
              <div className="staffScanModal__heading">
                <span className="staffScanModal__icon">
                  {modal.type === "error" ? "!" : "i"}
                </span>

                <div>
                  <span className="staffScanModal__eyebrow">
                    Aviso del sistema
                  </span>

                  <h3 className="staffScanModal__title">
                    {modal.title}
                  </h3>
                </div>
              </div>

              <button
                className="staffScanModal__x"
                onClick={() => setModal(null)}
                type="button"
                aria-label="Cerrar aviso"
              >
                ✕
              </button>
            </div>

            <p className="staffScanModal__text">
              {modal.text}
            </p>

            <div className="staffScanModal__actions">
              <button
                className="staffScan__btn staffScan__btn--primary"
                onClick={() => setModal(null)}
                type="button"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default StaffScanner;