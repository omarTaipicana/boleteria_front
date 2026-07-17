import axios from "axios";
import { useState } from "react";
import getConfigToken from "../services/getConfigToken";

const useDashboard = () => {
  const urlBase = import.meta.env.VITE_API_URL;

  const [dashboard, setDashboard] = useState(null);
  const [summary, setSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDashboard = async (eventId) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${urlBase}/admin/dashboard`, {
        ...getConfigToken(),
        params: eventId ? { eventId } : {}, // ✅ si no hay, global
      });
      setDashboard(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      setDashboard(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getEventsSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${urlBase}/admin/dashboard/events-summary`, {
        ...getConfigToken(),
      });
      setSummary(res.data || []);
      return res.data;
    } catch (err) {
      setError(err);
      setSummary([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [
    getDashboard,
    dashboard,
    getEventsSummary,
    summary,
    isLoading,
    error,
    setDashboard,
    setSummary,
  ];
};

export default useDashboard;
