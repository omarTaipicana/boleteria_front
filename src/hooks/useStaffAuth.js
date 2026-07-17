import axios from "axios";
import { useState } from "react";

const useStaffAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const urlBase = import.meta.env.VITE_API_URL;

  const login = async (data) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${urlBase}/staff/login`, data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("staff", JSON.stringify(res.data.user));
      return res.data.user;
    } catch (err) {
      setError(err);
      localStorage.removeItem("token");
      localStorage.removeItem("staff");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const me = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const res = await axios.get(`${urlBase}/staff/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("staff", JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("staff");
      return null;
    }
  };

  return [login, me, isLoading, error];
};

export default useStaffAuth;
