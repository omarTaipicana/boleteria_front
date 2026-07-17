import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

import usePaymentsAdmin from "../hooks/usePaymentsAdmin";
import useCrud from "../hooks/useCrud";

import "./styles/StaffValidator.css";

const StaffValidator = () => {
  const [
    getPayments,
    payments,
    validatePayment,
    togglePaymentActive,
    isLoading,
    error,
  ] = usePaymentsAdmin();

  const PATH_VARIABLES = "/variables";

  const [selected, setSelected] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [variables, getVariables, , , , ,] = useCrud();
  const [selectedBanco, setSelectedBanco] = useState("");

  const [confirmState, setConfirmState] = useState(null);
  const [toast, setToast] = useState(null);
  const [q, setQ] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    getVariables(PATH_VARIABLES);
  }, []);

  useEffect(() => {
    getPayments({ trash: showTrash });
  }, [showTrash]);

  const openModal = (payment) => {
    setSelected(payment);
    setSelectedBanco(payment.bank_name || "");

    reset({
      bank_name: payment.bank_name || "",
      deposit_id: payment.deposit_id || "",
    });
  };

  const closeModal = () => {
    setSelected(null);
    setSelectedBanco("");

    reset({
      bank_name: "",
      deposit_id: "",
    });
  };

  const showSuccess = (title, text) => {
    setToast({
      type: "success",
      title,
      text,
    });
  };

  const showError = (title, text) => {
    setToast({
      type: "error",
      title,
      text,
    });
  };

  const onValidate = async (data) => {
    try {
      await validatePayment(selected.id, {
        bank_name: data.bank_name,
        deposit_id: data.deposit_id,
        is_validated: true,
      });

      closeModal();

      showSuccess(
        "Pago validado",
        "Los tickets fueron enviados correctamente al correo del comprador."
      );

      getPayments({ trash: showTrash });
    } catch (e) {
      showError(
        "No se pudo validar",
        e?.response?.data?.message || "Error validando pago"
      );
    }
  };

  const askTrash = (paymentId) => {
    setConfirmState({
      title: "Enviar a papelera",
      text: "¿Deseas enviar este pago a la papelera? Podrás restaurarlo posteriormente.",

      onConfirm: async () => {
        try {
          await togglePaymentActive(paymentId, false);

          setConfirmState(null);

          showSuccess(
            "Enviado a papelera",
            "El pago fue movido correctamente a la papelera."
          );

          getPayments({ trash: showTrash });
        } catch (e) {
          setConfirmState(null);

          showError(
            "No se pudo eliminar",
            e?.response?.data?.message || "Error eliminando el pago"
          );
        }
      },
    });
  };

  const askRestore = (paymentId) => {
    setConfirmState({
      title: "Restaurar pago",
      text: "¿Deseas restaurar este pago y devolverlo a la lista de pagos activos?",

      onConfirm: async () => {
        try {
          await togglePaymentActive(paymentId, true);

          setConfirmState(null);

          showSuccess(
            "Pago restaurado",
            "El pago volvió correctamente a la lista de activos."
          );

          getPayments({ trash: showTrash });
        } catch (e) {
          setConfirmState(null);

          showError(
            "No se pudo restaurar",
            e?.response?.data?.message || "Error restaurando el pago"
          );
        }
      },
    });
  };

  const rowsPayments = useMemo(() => payments || [], [payments]);

  const rowsFiltered = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) {
      return rowsPayments;
    }

    return rowsPayments.filter((payment) => {
      const order =
        payment.order ||
        payment.Order ||
        payment.orden ||
        payment.Orden ||
        {};

      const email = String(
        order.buyer_email || order.buyerEmail || ""
      ).toLowerCase();

      const name = String(
        order.buyer_name || order.buyerName || ""
      ).toLowerCase();

      const phone = String(
        order.buyer_phone || order.buyerPhone || ""
      ).toLowerCase();

      const orderId = String(payment.orderId || "").toLowerCase();

      return (
        email.includes(search) ||
        name.includes(search) ||
        phone.includes(search) ||
        orderId.includes(search)
      );
    });
  }, [rowsPayments, q]);

  const errorMsg =
    error?.response?.data?.message ||
    error?.message ||
    (error ? String(error) : null);

const downloadTicketsPdf = async (orderId) => {
  try {
    const token = localStorage.getItem("token");
    const urlBase = import.meta.env.VITE_API_URL;

    const res = await axios.get(
      `${urlBase}/orders/${orderId}/tickets.pdf`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const url = window.URL.createObjectURL(
      new Blob([res.data], {
        type: "application/pdf",
      })
    );

    const a = document.createElement("a");

    a.href = url;
    a.download = `tickets_${orderId}.pdf`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

    showSuccess(
      "Descarga lista",
      "Se descargó el PDF de tickets."
    );
  } catch (error) {
    console.error("Error descargando PDF:", error);

    let message = "No se pudo descargar el PDF.";

    if (error?.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const data = JSON.parse(text);

        message = data?.message || data?.error || text || message;
      } catch {
        try {
          const text = await error.response.data.text();
          message = text || message;
        } catch {
          // Conserva el mensaje general.
        }
      }
    } else {
      message =
        error?.response?.data?.message ||
        error?.message ||
        message;
    }

    showError("Error al descargar", message);
  }
};

  return (
    <main className="staffVal">
      <section className="staffVal__container">
        <header className="staffVal__hero">
          <div className="staffVal__heroContent">
            <span className="staffVal__eyebrow">
              🍖 PANEL MR. HORNADO
            </span>

            <h1 className="staffVal__title">Validación de pagos</h1>

            <p className="staffVal__sub">
              Revisa comprobantes, valida depósitos, envía tickets y administra
              los registros enviados a papelera.
            </p>
          </div>

          <div className="staffVal__heroIcon" aria-hidden="true">
            🧾
          </div>
        </header>

        <section className="staffVal__toolbar">
          <div className="staffVal__toggle">
            <button
              className={`staffVal__toggleBtn ${
                !showTrash ? "isActive" : ""
              }`}
              onClick={() => setShowTrash(false)}
              disabled={!showTrash}
              type="button"
            >
              <span>💳</span>
              Pagos activos
            </button>

            <button
              className={`staffVal__toggleBtn ${
                showTrash ? "isActive" : ""
              }`}
              onClick={() => setShowTrash(true)}
              disabled={showTrash}
              type="button"
            >
              <span>🗑️</span>
              Papelera
            </button>
          </div>

          <div className="staffVal__summary">
            <span className="staffVal__summaryLabel">
              {showTrash ? "Registros en papelera" : "Pagos encontrados"}
            </span>

            <strong className="staffVal__summaryValue">
              {rowsFiltered.length}
            </strong>
          </div>
        </section>

        {errorMsg && (
          <div className="staffVal__errorBox">
            <span className="staffVal__errorIcon">!</span>

            <div>
              <strong>No se pudo cargar la información</strong>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        <section className="staffVal__searchSection">
          <div className="staffVal__search">
            <span className="staffVal__searchIcon">⌕</span>

            <input
              className="staffVal__searchInput"
              type="search"
              placeholder="Buscar por nombre, correo, celular u orden"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            {q && (
              <button
                className="staffVal__searchClear"
                type="button"
                onClick={() => setQ("")}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        <section className="staffVal__tableCard">
          <div className="staffVal__tableHead">
            <div>
              <span className="staffVal__tableLabel">
                {showTrash ? "Papelera de pagos" : "Registro de pagos"}
              </span>

              <h2>
                {showTrash ? "Pagos eliminados" : "Comprobantes recibidos"}
              </h2>
            </div>

            <span
              className={`staffVal__viewBadge ${
                showTrash ? "isTrash" : "isActive"
              }`}
            >
              {showTrash ? "Papelera" : "Activos"}
            </span>
          </div>

          <div className="staffVal__tableWrap">
            <table className="staffVal__table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Comprador</th>
                  <th>Celular</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Comprobante</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="staffVal__empty">
                        <span className="staffVal__loader" />

                        <strong>Cargando pagos</strong>

                        <p>Estamos consultando la información registrada.</p>
                      </div>
                    </td>
                  </tr>
                ) : rowsPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="staffVal__empty">
                        <span className="staffVal__emptyIcon">
                          {showTrash ? "🗑️" : "🧾"}
                        </span>

                        <strong>
                          {showTrash
                            ? "La papelera está vacía"
                            : "No existen pagos activos"}
                        </strong>

                        <p>
                          {showTrash
                            ? "Los pagos eliminados aparecerán en esta sección."
                            : "Los nuevos comprobantes aparecerán aquí cuando sean registrados."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : rowsFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="staffVal__empty">
                        <span className="staffVal__emptyIcon">🔎</span>

                        <strong>No encontramos coincidencias</strong>

                        <p>Prueba con otro nombre, correo, celular u orden.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rowsFiltered.map((payment) => {
                    const order =
                      payment.order ||
                      payment.Order ||
                      payment.orden ||
                      payment.Orden ||
                      null;

                    const buyerName =
                      order?.buyer_name || order?.buyerName || "Sin nombre";

                    const buyerEmail =
                      order?.buyer_email || order?.buyerEmail || "";

                    const buyerPhone =
                      order?.buyer_phone || order?.buyerPhone || "";

                    return (
                      <tr
                        key={payment.id}
                        className={
                          payment.is_validated ? "isValidated" : ""
                        }
                      >
                        <td data-label="Orden">
                          <span className="staffVal__orderCode">
                            #{payment.orderId}
                          </span>
                        </td>

                        <td data-label="Comprador">
                          <div className="staffVal__buyer">
                            <span className="staffVal__buyerAvatar">
                              {buyerName.charAt(0).toUpperCase()}
                            </span>

                            <div className="staffVal__buyerInfo">
                              <strong>{buyerName}</strong>

                              {buyerEmail && <span>{buyerEmail}</span>}
                            </div>
                          </div>
                        </td>

                        <td data-label="Celular">
                          {buyerPhone ? (
                            <a
                              className="staffVal__phone"
                              href={`tel:${buyerPhone}`}
                            >
                              <span>📱</span>
                              {buyerPhone}
                            </a>
                          ) : (
                            <span className="staffVal__mutedInline">—</span>
                          )}
                        </td>

                        <td data-label="Monto">
                          <div className="staffVal__amount">
                            <strong>${payment.amount}</strong>
                            <span>{payment.currency || "USD"}</span>
                          </div>
                        </td>

                        <td data-label="Estado">
                          <span
                            className={`staffVal__pill ${
                              payment.is_validated
                                ? "pillOk"
                                : "pillPending"
                            }`}
                          >
                            <span className="staffVal__pillDot" />

                            {payment.is_validated
                              ? "VALIDADO"
                              : "PENDIENTE"}
                          </span>
                        </td>

                        <td data-label="Comprobante">
                          {payment.proof_url ? (
                            <a
                              className="staffVal__link"
                              href={payment.proof_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span>🖼️</span>
                              Ver comprobante
                            </a>
                          ) : (
                            <span className="staffVal__noProof">
                              No disponible
                            </span>
                          )}
                        </td>

                        <td data-label="Acciones">
                          <div className="staffVal__actions">
                            {!showTrash && !payment.is_validated && (
                              <button
                                className="staffVal__btn staffVal__btn--primary"
                                type="button"
                                onClick={() => openModal(payment)}
                              >
                                <span>✓</span>
                                Validar
                              </button>
                            )}

                            {!showTrash && payment.is_validated && (
                              <button
                                className="staffVal__btn staffVal__btn--neutral"
                                type="button"
                                onClick={() => openModal(payment)}
                              >
                                <span>✎</span>
                                Ver / editar
                              </button>
                            )}

                            {!showTrash ? (
                              <button
                                className="staffVal__btn staffVal__btn--danger"
                                type="button"
                                onClick={() => askTrash(payment.id)}
                              >
                                <span>🗑️</span>
                                Eliminar
                              </button>
                            ) : (
                              <button
                                className="staffVal__btn staffVal__btn--success"
                                type="button"
                                onClick={() => askRestore(payment.id)}
                              >
                                <span>♻️</span>
                                Restaurar
                              </button>
                            )}

                            {payment.is_validated && (
                              <button
                                className="staffVal__btn staffVal__btn--download"
                                type="button"
                                onClick={() =>
                                  downloadTicketsPdf(payment.orderId)
                                }
                              >
                                <span>⬇</span>
                                Descargar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {selected && (
        <div
          className="staffModal__backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="staffModal__card">
            <div className="staffModal__decor" />

            <div className="staffModal__head">
              <div className="staffModal__heading">
                <span className="staffModal__icon">✓</span>

                <div>
                  <span className="staffModal__eyebrow">
                    Confirmación de depósito
                  </span>

                  <h3 className="staffModal__title">Validar pago</h3>

                  <p className="staffModal__sub">
                    Completa el banco y el identificador del depósito.
                  </p>
                </div>
              </div>

              <button
                className="staffModal__x"
                type="button"
                onClick={closeModal}
                aria-label="Cerrar ventana"
              >
                ✕
              </button>
            </div>

            <div className="staffModal__meta">
              <div className="staffModal__metaRow">
                <span className="staffModal__metaLabel">Pago</span>

                <span className="staffModal__metaValue staffVal__mono">
                  {selected.id}
                </span>
              </div>

              <div className="staffModal__metaRow">
                <span className="staffModal__metaLabel">Orden</span>

                <span className="staffModal__metaValue staffVal__mono">
                  {selected.orderId}
                </span>
              </div>

              <div className="staffModal__metaRow">
                <span className="staffModal__metaLabel">Monto recibido</span>

                <span className="staffModal__metaValue staffModal__amount">
                  <strong>${selected.amount}</strong>
                  <small>{selected.currency || "USD"}</small>
                </span>
              </div>

              {selected.proof_url && (
                <div className="staffModal__proof">
                  <a
                    className="staffModal__proofLink"
                    href={selected.proof_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>🖼️</span>

                    <div>
                      <strong>Abrir comprobante</strong>
                      <small>Ver imagen en una pestaña nueva</small>
                    </div>

                    <span className="staffModal__proofArrow">↗</span>
                  </a>
                </div>
              )}
            </div>

            <form
              className="staffModal__form"
              onSubmit={handleSubmit(onValidate)}
            >
              <div className="staffModal__field">
                <label
                  className="staffModal__label"
                  htmlFor="staff-payment-bank"
                >
                  Banco o entidad financiera
                </label>

                <select
                  id="staff-payment-bank"
                  {...register("bank_name", {
                    required: true,
                  })}
                  className={`staffModal__input staffModal__select ${
                    errors.bank_name ? "isError" : ""
                  }`}
                  value={selectedBanco}
                  onChange={(e) => setSelectedBanco(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Selecciona el banco</option>

                  {variables
                    ?.filter((variable) => variable.entidad)
                    .map((variable) => (
                      <option
                        key={variable.id}
                        value={variable.entidad}
                      >
                        {variable.entidad}
                      </option>
                    ))}
                </select>

                {errors.bank_name && (
                  <div className="staffModal__error">
                    Selecciona el banco correspondiente.
                  </div>
                )}
              </div>

              <div className="staffModal__field">
                <label
                  className="staffModal__label"
                  htmlFor="staff-payment-deposit"
                >
                  Identificador del depósito
                </label>

                <input
                  id="staff-payment-deposit"
                  className={`staffModal__input ${
                    errors.deposit_id ? "isError" : ""
                  }`}
                  type="text"
                  placeholder="Ejemplo: 00123456789"
                  {...register("deposit_id", {
                    required: true,
                  })}
                  disabled={isLoading}
                />

                {errors.deposit_id && (
                  <div className="staffModal__error">
                    Ingresa el identificador del depósito.
                  </div>
                )}
              </div>

              <div className="staffModal__actions">
                <button
                  className="staffVal__btn staffVal__btn--neutral staffModal__cancel"
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                >
                  Cancelar
                </button>

                <button
                  className="staffVal__btn staffVal__btn--primary staffModal__submit"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="staffModal__buttonLoader" />
                      Validando pago...
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      Validar y enviar tickets
                    </>
                  )}
                </button>
              </div>

              <div className="staffModal__note">
                <span>📨</span>

                <p>
                  Al validar el depósito, el sistema generará los tickets y los
                  enviará automáticamente al correo del comprador.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmState && (
        <div
          className="staffConfirm__backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setConfirmState(null);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="staffConfirm__card">
            <span className="staffConfirm__icon">
              {showTrash ? "♻️" : "🗑️"}
            </span>

            <div className="staffConfirm__content">
              <h3 className="staffConfirm__title">
                {confirmState.title}
              </h3>

              <p className="staffConfirm__text">
                {confirmState.text}
              </p>
            </div>

            <div className="staffConfirm__actions">
              <button
                className="staffVal__btn staffVal__btn--neutral"
                type="button"
                onClick={() => setConfirmState(null)}
              >
                Cancelar
              </button>

              <button
                className={`staffVal__btn ${
                  showTrash
                    ? "staffVal__btn--success"
                    : "staffVal__btn--danger"
                }`}
                type="button"
                onClick={confirmState.onConfirm}
              >
                {showTrash ? "Restaurar pago" : "Enviar a papelera"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`staffToast ${
            toast.type === "success" ? "isSuccess" : "isError"
          }`}
          role="status"
        >
          <div className="staffToast__icon">
            {toast.type === "success" ? "✓" : "!"}
          </div>

          <div className="staffToast__content">
            <strong className="staffToast__title">
              {toast.title}
            </strong>

            <p className="staffToast__text">{toast.text}</p>
          </div>

          <button
            className="staffToast__x"
            onClick={() => setToast(null)}
            type="button"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
};

export default StaffValidator;