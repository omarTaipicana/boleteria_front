import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import usePaymentsAdmin from "../hooks/usePaymentsAdmin";
import "./styles/StaffValidator.css";
import axios from "axios";
import useCrud from "../hooks/useCrud";

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

  // Modales
  const [confirmState, setConfirmState] = useState(null); // { title, text, onConfirm }
  const [toast, setToast] = useState(null); // { type: "success"|"error", title, text }

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

  const openModal = (p) => {
    setSelected(p);
    reset({
      bank_name: p.bank_name || "",
      deposit_id: p.deposit_id || "",
    });
  };

  const closeModal = () => {
    setSelected(null);
    reset({ bank_name: "", deposit_id: "" });
  };

  const showSuccess = (title, text) =>
    setToast({ type: "success", title, text });
  const showError = (title, text) => setToast({ type: "error", title, text });

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
        "✅ Tickets enviados correctamente al correo del comprador.",
      );
      getPayments({ trash: showTrash });
    } catch (e) {
      showError(
        "No se pudo validar",
        e?.response?.data?.message || "Error validando pago",
      );
    }
  };

  const askTrash = (paymentId) => {
    setConfirmState({
      title: "Enviar a papelera",
      text: "¿Deseas enviar este pago a la papelera? Podrás restaurarlo luego.",
      onConfirm: async () => {
        try {
          await togglePaymentActive(paymentId, false);
          setConfirmState(null);
          showSuccess(
            "Enviado a papelera",
            "El pago fue movido a la papelera.",
          );
          getPayments({ trash: showTrash });
        } catch (e) {
          setConfirmState(null);
          showError("Error", e?.response?.data?.message || "Error eliminando");
        }
      },
    });
  };

  const askRestore = (paymentId) => {
    setConfirmState({
      title: "Restaurar pago",
      text: "¿Deseas restaurar este pago y devolverlo a activos?",
      onConfirm: async () => {
        try {
          await togglePaymentActive(paymentId, true);
          setConfirmState(null);
          showSuccess("Restaurado", "El pago volvió a la lista de activos.");
          getPayments({ trash: showTrash });
        } catch (e) {
          setConfirmState(null);
          showError("Error", e?.response?.data?.message || "Error restaurando");
        }
      },
    });
  };



  // ✅ Buscador
  const [q, setQ] = useState("");

  // ✅ filas base (SIEMPRE antes del filtro)
  const rows_payments = useMemo(() => payments || [], [payments]);

  // ✅ filas filtradas
  const rowsFiltered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows_payments;

    return rows_payments.filter((p) => {
      const email = String(p?.order?.buyer_email || "").toLowerCase();
      const name = String(p?.order?.buyer_name || "").toLowerCase();
      const orderId = String(p?.orderId || "").toLowerCase();
      return email.includes(s) || name.includes(s) || orderId.includes(s);
    });
  }, [rows_payments, q]);



  const errorMsg =
    error?.response?.data?.message ||
    error?.message ||
    (error ? String(error) : null);

  const rows = useMemo(() => payments || [], [payments]);




  const downloadTicketsPdf = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const urlBase = import.meta.env.VITE_API_URL;

      const res = await axios.get(`${urlBase}/orders/${orderId}/tickets.pdf`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );

      const a = document.createElement("a");
      a.href = url;
      a.download = `tickets_${orderId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      showSuccess("Descarga lista", "Se descargó el PDF de tickets.");
    } catch (e) {
      showError("Error", e?.message || "No se pudo descargar el PDF");
    }
  };




  return (
    <div className="staffVal">
      <div className="staffVal__top">
        <div>
          <h2 className="staffVal__title">Validator · Pagos</h2>
          <div className="staffVal__sub">
            Valida comprobantes, envía tickets y gestiona papelera
          </div>
        </div>

        <div className="staffVal__toggle">
          <button
            className={`staffVal__toggleBtn ${!showTrash ? "isActive" : ""}`}
            onClick={() => setShowTrash(false)}
            disabled={!showTrash}
            type="button"
          >
            Pagos Activos
          </button>

          <button
            className={`staffVal__toggleBtn ${showTrash ? "isActive" : ""}`}
            onClick={() => setShowTrash(true)}
            disabled={showTrash}
            type="button"
          >
            🗑 Papelera
          </button>
        </div>
      </div>

      {errorMsg && <div className="staffVal__errorBox">Error: {errorMsg}</div>}

      <div className="staffVal__search">
        <input
          className="staffVal__searchInput"
          placeholder="Buscar por correo / nombre / orderId"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="staffVal__tableWrap">
        <table className="staffVal__table">
          <thead>
            <tr>
              <th>Order</th>
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
                <td colSpan={7} className="staffVal__empty">
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="staffVal__empty">
                  {showTrash
                    ? "No hay pagos en papelera."
                    : "No hay pagos activos."}
                </td>
              </tr>
            ) : (

              rowsFiltered.map((p) => {
                const ord = p.order || p.Order || p.orden || p.Orden || null;

                return (
                  <tr key={p.id} className={p.is_validated ? "isValidated" : ""}>
                    <td className="staffVal__mono">{p.orderId}</td>

                    <td>
                      <b>{ord?.buyer_name || ord?.buyerName || "—"}</b>
                      {ord?.buyer_email && (
                        <div className="staffVal__mutedInline">{ord.buyer_email}</div>
                      )}
                    </td>


                    <td>
                      {p?.order?.buyer_phone ? (
                        <a className="staffVal__phone" href={`tel:${p.order.buyer_phone}`}>
                          {p.order.buyer_phone}
                        </a>
                      ) : (
                        <span className="staffVal__mutedInline">—</span>
                      )}
                    </td>

                    <td>
                      <b>${p.amount}</b>{" "}
                      <span className="staffVal__mutedInline">
                        {p.currency || "USD"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`staffVal__pill ${p.is_validated ? "pillOk" : "pillPending"
                          }`}
                      >
                        {p.is_validated ? "VALIDADO" : "PENDIENTE"}
                      </span>
                    </td>

                    <td>
                      {p.proof_url ? (
                        <a
                          className="staffVal__link"
                          href={p.proof_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver
                        </a>
                      ) : (
                        <span className="staffVal__mutedInline">—</span>
                      )}
                    </td>

                    <td>
                      <div className="staffVal__actions">
                        {!showTrash && !p.is_validated && (
                          <button
                            className="staffVal__btn staffVal__btn--primary"
                            type="button"
                            onClick={() => openModal(p)}
                          >
                            Validar
                          </button>
                        )}

                        {!showTrash && p.is_validated && (
                          <button
                            className="staffVal__btn"
                            type="button"
                            onClick={() => openModal(p)}
                          >
                            Ver / Editar
                          </button>
                        )}

                        {!showTrash ? (
                          <button
                            className="staffVal__btn staffVal__btn--danger"
                            type="button"
                            onClick={() => askTrash(p.id)}
                          >
                            🗑 Eliminar
                          </button>
                        ) : (
                          <button
                            className="staffVal__btn staffVal__btn--success"
                            type="button"
                            onClick={() => askRestore(p.id)}
                          >
                            ♻ Restaurar
                          </button>
                        )}

                        {p.is_validated &&
                          <button
                            className="staffVal__btn staffVal__btn--success"
                            type="button"
                            onClick={() => downloadTicketsPdf(p.orderId)}
                          >
                            ⬇ Descargar
                          </button>


                        }



                      </div>
                    </td>

                  </tr>
                );
              })








            )}
          </tbody>
        </table>
      </div>

      {/* Modal Validación */}
      {selected && (
        <div
          className="staffModal__backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="staffModal__card">
            <div className="staffModal__head">
              <div>
                <h3 className="staffModal__title">Validar Pago</h3>
                <div className="staffModal__sub">
                  Completa banco e ID del depósito
                </div>
              </div>

              <button
                className="staffModal__x"
                type="button"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <div className="staffModal__meta">
              <div className="staffModal__metaRow">
                <div className="staffModal__metaLabel">Payment</div>
                <div className="staffModal__metaValue staffVal__mono">
                  {selected.id}
                </div>
              </div>
              <div className="staffModal__metaRow">
                <div className="staffModal__metaLabel">Order</div>
                <div className="staffModal__metaValue staffVal__mono">
                  {selected.orderId}
                </div>
              </div>
              <div className="staffModal__metaRow">
                <div className="staffModal__metaLabel">Monto</div>
                <div className="staffModal__metaValue">
                  <b>${selected.amount}</b>{" "}
                  <span className="staffVal__mutedInline">
                    {selected.currency || "USD"}
                  </span>
                </div>
              </div>

              {selected.proof_url && (
                <div className="staffModal__proof">
                  <a
                    className="staffVal__link"
                    href={selected.proof_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir comprobante
                  </a>
                </div>
              )}
            </div>

            <form
              className="staffModal__form"
              onSubmit={handleSubmit(onValidate)}
            >
              <div className="staffModal__field">
                <label className="staffModal__label">Banco (bank_name)</label>

                <select
                  style={{ border: "2px solid #cfd5e6" }}
                  {...register("bank_name", { required: true })}
                  className={`staffModal__input ${errors.bank_name ? "isError" : ""}`}
                  value={selectedBanco}
                  onChange={(e) => setSelectedBanco(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Seleccione el banco</option>
                  {variables
                    ?.filter((e) => e.entidad)
                    .map((entidad) => (
                      <option key={entidad.id} value={entidad.entidad}>
                        {entidad.entidad}
                      </option>
                    ))}
                </select>

                {errors.bank_name && (
                  <div className="staffModal__error">Banco requerido</div>
                )}
              </div>

              <div className="staffModal__field">
                <label className="staffModal__label">
                  ID depósito (deposit_id)
                </label>
                <input
                  className={`staffModal__input ${errors.deposit_id ? "isError" : ""}`}
                  placeholder="ID depósito"
                  {...register("deposit_id", { required: true })}
                  disabled={isLoading}
                />
                {errors.deposit_id && (
                  <div className="staffModal__error">ID depósito requerido</div>
                )}
              </div>

              <div className="staffModal__actions">
                <button
                  className="staffVal__btn"
                  type="button"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  className="staffVal__btn staffVal__btn--primary"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Validando..." : "Validar y enviar tickets"}
                </button>
              </div>

              <div className="staffModal__note">
                Al validar, el sistema genera tickets y los envía
                automáticamente por correo.
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmState && (
        <div
          className="staffConfirm__backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirmState(null);
          }}
        >
          <div className="staffConfirm__card">
            <div className="staffConfirm__title">{confirmState.title}</div>
            <div className="staffConfirm__text">{confirmState.text}</div>

            <div className="staffConfirm__actions">
              <button
                className="staffVal__btn"
                type="button"
                onClick={() => setConfirmState(null)}
              >
                Cancelar
              </button>
              <button
                className="staffVal__btn staffVal__btn--primary"
                type="button"
                onClick={confirmState.onConfirm}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`staffToast ${toast.type === "success" ? "isSuccess" : "isError"}`}
        >
          <div className="staffToast__title">{toast.title}</div>
          <div className="staffToast__text">{toast.text}</div>
          <button
            className="staffToast__x"
            onClick={() => setToast(null)}
            type="button"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffValidator;
