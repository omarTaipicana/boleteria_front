import axios from "axios";
import { useState } from "react";

const usePayments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const urlBase = import.meta.env.VITE_API_URL;

  const createPayment = async (formData) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${urlBase}/payments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [createPayment, isLoading, error];
};

export default usePayments;
