import api, { unwrap } from "./api.js";

export const authService = {
  register: (body) => unwrap(api.post("/auth/register", body)),
  login: (body) => unwrap(api.post("/auth/login", body)),
  google: (credential) => unwrap(api.post("/auth/google", { credential })),
  logout: () => unwrap(api.post("/auth/logout")),
  me: (signal) => unwrap(api.get("/auth/me", { signal })),
  verifyEmail: (token) => unwrap(api.post("/auth/verify-email", { token })),
  resendVerification: () => unwrap(api.post("/auth/resend-verification")),
  forgotPassword: (email) =>
    api.post("/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (body) =>
    api.post("/auth/reset-password", body).then((r) => r.data),
};
