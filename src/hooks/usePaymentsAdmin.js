import axios from "axios";
import { useState } from "react";
import getConfigToken from "../services/getConfigToken";

const usePaymentsAdmin = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const urlBase = import.meta.env.VITE_API_URL;

  // Listar pagos: activos o papelera
  const getPayments = async ({ trash = false } = {}) => {
    setIsLoading(true);
    try {
      const url = trash ? `${urlBase}/payments?trash=true` : `${urlBase}/payments`;
      const res = await axios.get(url, getConfigToken());
      setPayments(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Validar pago (bank + deposit + is_validated true)
  const validatePayment = async (paymentId, data) => {
    setIsLoading(true);
    try {
      const res = await axios.put(
        `${urlBase}/payments/${paymentId}`,
        data,
        getConfigToken()
      );
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar a papelera / restaurar
  const togglePaymentActive = async (paymentId, is_active) => {
    setIsLoading(true);
    try {
      const res = await axios.put(
        `${urlBase}/payments/${paymentId}`,
        { is_active },
        getConfigToken()
      );
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [
    getPayments,
    payments,
    validatePayment,
    togglePaymentActive,
    isLoading,
    error,
  ];
};

export default usePaymentsAdmin;
