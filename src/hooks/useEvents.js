import axios from "axios";
import { useState } from "react";

const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const urlBase = import.meta.env.VITE_API_URL;

  const getEvents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${urlBase}/events`);
      setEvents(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return [getEvents, events, isLoading, error];
};

export default useEvents;
