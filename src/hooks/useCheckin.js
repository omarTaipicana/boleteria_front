import axios from "axios";
import { useState } from "react";
import getConfigToken from "../services/getConfigToken";

const useCheckin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const urlBase = import.meta.env.VITE_API_URL;

  const doCheckin = async ({ code, gate }) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(
        `${urlBase}/checkin`,
        { code, gate },
        getConfigToken()
      );
      setResult({ ok: true, data: res.data });
      return res.data;
    } catch (err) {
      // backend devuelve 409 con info cuando ya fue usada
      const data = err?.response?.data;
      setResult({ ok: false, data });
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [doCheckin, isLoading, result, error, setResult];
};

export default useCheckin;
