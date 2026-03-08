import axios from "axios";

/**
 * Axios instance for the Ibn Badis API.
 * Auth is handled via httpOnly cookies (access_token / refresh_token).
 * No Authorization header is needed — the browser sends cookies automatically.
 */
export const axiosAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-retry with refresh token on 401
axiosAPI.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/auth/refresh/`, {}, { withCredentials: true });
        return axiosAPI(original);
      } catch {
        // Refresh failed — redirect to login
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
