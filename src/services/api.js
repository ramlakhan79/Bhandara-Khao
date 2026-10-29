import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // send the HttpOnly session cookie
  timeout: 30000,
  headers: { "X-Requested-With": "XMLHttpRequest" }, // required by the server's CSRF defence
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isCancel(err)) return Promise.reject(err);

    const status = err.response?.status;
    const body = err.response?.data;

    err.userMessage =
      body?.message ||
      (err.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : !err.response
          ? "Cannot reach the server. Please check your connection."
          : "Something went wrong. Please try again.");

    err.fieldErrors = Array.isArray(body?.errors)
      ? Object.fromEntries(
          body.errors.filter((e) => e.field).map((e) => [e.field, e.message]),
        )
      : {};

    // A 401 on any non-auth endpoint means the session expired
    if (status === 401 && !err.config?.url?.startsWith("/auth/")) {
      window.dispatchEvent(new Event("bk:unauthorized"));
    }
    return Promise.reject(err);
  },
);

export const unwrap = (promise) => promise.then((r) => r.data.data);
export const envelope = (promise) => promise.then((r) => r.data);
export const isCancel = axios.isCancel;
export const errorMessage = (err) =>
  err?.userMessage || err?.message || "Something went wrong";

/** Drops empty values so they are not sent as query parameters. */
export const clean = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) =>
        v !== undefined &&
        v !== null &&
        v !== "" &&
        !(Array.isArray(v) && !v.length),
    ),
  );

export default api;
