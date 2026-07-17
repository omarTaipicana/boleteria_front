import axios from "axios";
import { useState } from "react";

const useHomeEvents = () => {
  const urlBase = import.meta.env.VITE_API_URL;

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // trae eventos próximos (ajusta el endpoint a tu backend)
  const getHomeEvents = async (limit = 3) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${urlBase}/events`, {
        params: { limit, order: "starts_at", dir: "asc" },
      });

      // si tu backend devuelve { results: [...] } ajusta aquí
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setEvents(data);
      return data;
    } catch (err) {
      setError(err);
      setEvents([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [getHomeEvents, events, isLoading, error, setEvents];
};

export default useHomeEvents;
