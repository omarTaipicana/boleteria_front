import axios from "axios";
import { useState } from "react";

const useTicketStatus = () => {
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const urlBase = import.meta.env.VITE_API_URL;

  const getStatus = async (code) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token"); // si existe lo manda
      const res = await axios.get(`${urlBase}/ticket/${code}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setTicket(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      setTicket(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [getStatus, ticket, isLoading, error];
};

export default useTicketStatus;
