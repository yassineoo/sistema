import axios from "axios";

/**
 * Axios instance routed through the Next.js proxy (/api/proxy).
 * This solves cross-origin cookie issues: the browser calls same-origin /api/proxy/*,
 * which forwards cookies to the Django backend server-side.
 * No withCredentials or CORS config needed — same-origin requests carry cookies automatically.
 */
export const axiosAPI = axios.create({
  baseURL: "/api/proxy",
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
        await axios.post("/api/proxy/auth/refresh/", {});
        return axiosAPI(original);
      } catch {
        // Refresh failed — redirect to login
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
