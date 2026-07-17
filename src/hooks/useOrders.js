import axios from "axios";
import { useState } from "react";

const useOrders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const urlBase = import.meta.env.VITE_API_URL;

  const createOrder = async (data) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${urlBase}/orders`, data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [createOrder, isLoading, error];
};

export default useOrders;
