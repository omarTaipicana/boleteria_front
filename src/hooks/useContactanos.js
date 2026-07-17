import axios from "axios";
import { useState } from "react";

const useContactanos = () => {
  const urlBase = import.meta.env.VITE_API_URL;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${urlBase}/contactanos`, payload);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [sendMessage, isLoading, error];
};

export default useContactanos;
