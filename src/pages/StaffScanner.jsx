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
    const isUrlLike = text.startsWith("http://") || text.startsWith("https://");
    const url = new URL(text, isUrlLike ? undefined : "http://dummy.local");

    // ?code=...
    const qCode = url.searchParams.get("code");
    if (qCode) return qCode;

    // /ticket/:code
    const parts = url.pathname.split("/").filter(Boolean);
    const ticketIndex = parts.indexOf("ticket");
    if (ticketIndex !== -1 && parts[ticketIndex + 1])
      return parts[ticketIndex + 1];

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
  const [gate, setGate] = useState("PUERTA A");
  const [cameraOn, setCameraOn] = useState(false);

  // 🔥 fuerza remount del input (evita que el navegador “restaure” valores)
  const [inputKey, setInputKey] = useState(0);

  const scannerRef = useRef(null);

  // 🔥 token para invalidar callbacks viejos
  const scanNonceRef = useRef(0);

  // Modal pro (solo UI)
  const [modal, setModal] = useState(null); // {type:'error'|'info', title, text}

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      await scannerRef.current?.clear();
    } catch { }
    scannerRef.current = null;
  };
  useEffect(() => {
    getVariables(PATH_VARIABLES);
  }, []);

  // ✅ Lee ?code=... SOLO una vez al montar (sin useSearchParams)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const q = sp.get("code");
    if (q) {
      setCode(extractCode(q));
      // limpia la URL reemplazando
      navigate(location.pathname, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cámara on/off
  useEffect(() => {
    const start = async () => {
      if (!cameraOn) return;

      const elId = "qr-reader";
      scannerRef.current = new Html5Qrcode(elId);

      const myNonce = ++scanNonceRef.current; // nonce de esta sesión

      try {
        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            // ✅ si ya hubo un clear o nueva sesión, ignora callbacks viejos
            if (myNonce !== scanNonceRef.current) return;

            const onlyCode = extractCode(decodedText);

            // apaga scanner
            await stopScanner();
            setCameraOn(false);

            // vuelve a comprobar nonce por si justo limpiaron
            if (myNonce !== scanNonceRef.current) return;

            setCode(onlyCode);
          },
          () => { },
        );
      } catch (e) {
        console.error(e);
        setModal({
          type: "error",
          title: "No se pudo abrir la cámara",
          text: "Revisa permisos o usa HTTPS (o localhost).",
        });
        setCameraOn(false);
      }
    };

    const stop = async () => {
      await stopScanner();
    };

    if (cameraOn) start();
    else stop();

    return () => stop();
  }, [cameraOn]);

  const handleCheckin = async () => {
    const finalCode = extractCode(code);
    if (!finalCode) {
      setModal({
        type: "info",
        title: "Falta código",
        text: "Escanea un QR o pega el code.",
      });
      return;
    }
    try {
      await doCheckin({ code: finalCode, gate });
    } catch { }
  };

  const handleClear = async () => {
    // ✅ invalida cualquier callback pendiente del scanner
    scanNonceRef.current++;

    // limpia URL
    navigate(location.pathname, { replace: true });

    // apaga cámara y detiene scanner
    setCameraOn(false);
    await stopScanner();

    // limpia UI
    setCode("");
    setResult(null);

    // 🔥 fuerza remount del input (mata autofill/restores)
    setInputKey((k) => k + 1);

    // ✅ extra: por si algo intenta setear tarde, reafirmamos vacío
    setTimeout(() => setCode(""), 50);
  };

  const renderStatus = () => {
    if (!result) return null;

    const d = result.data || {};
    const buyer = d.buyer || {};
    const event = d.event || {};
    const order = d.order || {};
    const staff = d.staff || {};
    const usedByStaff = d.used_by_staff || {};

    // ✅ esta entrada siempre vale por 1 (aunque la orden tenga X)
    const totalInOrder = Number(order.quantity ?? order.total_tickets ?? order.cantidad ?? 0);
    const ticketOneOf = totalInOrder > 1 ? `1 de ${totalInOrder}` : null;



    const fmtDateTime = (iso) => {
      if (!iso) return "—";
      try {
        return new Date(iso).toLocaleString("es-EC", {
          timeZone: "America/Guayaquil",
        });
      } catch {
        return String(iso);
      }
    };

    const fmtDate = (iso) => {
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
      <div className={`scanStatus ${result.ok ? "scanStatus--ok" : "scanStatus--bad"}`}>
        <div className="scanStatus__title">
          {result.ok ? "✅ INGRESO REGISTRADO" : "❌ NO PERMITIDO"}
        </div>

        {/* Mensaje */}
        <div className="scanStatus__row">
          <span className="scanStatus__label">Mensaje</span>
          <span className="scanStatus__value">{d.message || "—"}</span>
        </div>

        {/* ===== Comprador ===== */}
        {(buyer.name || buyer.email || buyer.phone) && (
          <>
            <div className="scanStatus__divider" />
            <div className="scanStatus__section">Comprador</div>

            {buyer.name && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Nombre</span>
                <span className="scanStatus__value">{buyer.name}</span>
              </div>
            )}

            {buyer.email && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Email</span>
                <span className="scanStatus__value">{buyer.email}</span>
              </div>
            )}

            {buyer.phone && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Teléfono</span>
                <span className="scanStatus__value">{buyer.phone}</span>
              </div>
            )}
          </>
        )}

        {/* ===== Evento ===== */}
        {(event.title || event.venue || event.city || event.starts_at) && (
          <>
            <div className="scanStatus__divider" />
            <div className="scanStatus__section">Evento</div>

            {event.title && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Título</span>
                <span className="scanStatus__value">{event.title}</span>
              </div>
            )}

            {(event.city || event.venue) && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Lugar</span>
                <span className="scanStatus__value">
                  {(event.city || "—")}
                  {event.venue ? ` / ${event.venue}` : ""}
                </span>
              </div>
            )}

            {event.starts_at && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Fecha</span>
                <span className="scanStatus__value">{fmtDate(event.starts_at)}</span>
              </div>
            )}
          </>
        )}

        {/* ===== Orden ===== */}
        {(order.quantity != null || order.total != null) && (
          <>
            <div className="scanStatus__divider" />
            <div className="scanStatus__section">Orden</div>

            {ticketOneOf && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Entrada</span>
                <span className="scanStatus__value">{ticketOneOf}</span>
              </div>
            )}

            {totalInOrder > 0 && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Tickets comprados</span>
                <span className="scanStatus__value">{totalInOrder}</span>
              </div>
            )}


            {order.total != null && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Total</span>
                <span className="scanStatus__value">${order.total}</span>
              </div>
            )}
          </>
        )}

        {/* ===== Registro (usado/puerta/staff) ===== */}
        {(d.used_at || d.gate || staff.full_name) && (
          <>
            <div className="scanStatus__divider" />
            <div className="scanStatus__section">Registro</div>

            {usedByStaff.full_name && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Registrado por (antes)</span>
                <span className="scanStatus__value">
                  {usedByStaff.full_name}{usedByStaff.role ? ` (${usedByStaff.role})` : ""}
                </span>
              </div>
            )}


            {d.used_at && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Usado</span>
                <span className="scanStatus__value">{fmtDateTime(d.used_at)}</span>
              </div>
            )}

            {d.gate && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Puerta</span>
                <span className="scanStatus__value">{d.gate}</span>
              </div>
            )}

            {staff.full_name && (
              <div className="scanStatus__row">
                <span className="scanStatus__label">Registrado por</span>
                <span className="scanStatus__value">
                  {staff.full_name}{staff.role ? ` (${staff.role})` : ""}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    );
  };


  return (
    <div className="staffScan">
      <div className="staffScan__head">
        <div>
          <h2 className="staffScan__title">📷 Scanner</h2>
          <div className="staffScan__sub">
            Escanea el QR o pega el código. Selecciona la puerta y registra
            ingreso.
          </div>
        </div>

        <button className="staffScan__btn" type="button" onClick={handleClear}>
          Limpiar
        </button>
      </div>

      {cameraOn && (
        <div className="staffScan__camera staffScan__camera--top">
          <div className="staffScan__cameraFrame">
            <div id="qr-reader" className="staffScan__qr" />
          </div>
          <div className="staffScan__tip">
            Tip: en iPhone/Android suele requerir HTTPS (o localhost).
          </div>
        </div>
      )}

      <div className="staffScan__panel">
        <div className="staffScan__grid">
          <div className="staffScan__field staffScan__field--code">
            <label className="staffScan__label">Código</label>
            <input
              key={inputKey}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Escanea QR o pega code"
              autoComplete="off"
              inputMode="text"
              className="staffScan__input"
            />
          </div>

          <div className="staffScan__field">
            <label className="staffScan__label">Puerta</label>
            <select
              value={gate}
              onChange={(e) => setGate(e.target.value)}
              className="staffScan__select"
            >
              <option value="">Seleccione la Puerta</option>
              {variables
                ?.filter((e) => e.subsistema)
                .map((subsistema) => (
                  <option key={subsistema.id} value={subsistema.subsistema}>
                    {subsistema.subsistema}
                  </option>
                ))}
            </select>
          </div>

          <div className="staffScan__actions">
            <button
              type="button"
              className={`staffScan__btn staffScan__btn--ghost ${cameraOn ? "isOn" : ""}`}
              onClick={() => {
                setResult(null);
                // nueva sesión de scan (invalida callbacks viejos)
                scanNonceRef.current++;
                setCameraOn((v) => !v);
              }}
              disabled={isLoading}
            >
              {cameraOn ? "Apagar cámara" : "Usar cámara"}
            </button>

            <button
              className="staffScan__btn staffScan__btn--primary"
              onClick={handleCheckin}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? "Procesando..." : "Registrar ingreso"}
            </button>
          </div>
        </div>


      </div>

      {renderStatus()}

      {/* Modal simple PRO */}
      {modal && (
        <div
          className="staffScanModal__backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="staffScanModal__card">
            <div className="staffScanModal__head">
              <div className="staffScanModal__title">{modal.title}</div>
              <button
                className="staffScanModal__x"
                onClick={() => setModal(null)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="staffScanModal__text">{modal.text}</div>

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
    </div>
  );
};

export default StaffScanner;
