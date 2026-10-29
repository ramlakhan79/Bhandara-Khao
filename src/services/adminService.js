import api, { unwrap, envelope, clean } from "./api.js";

const list = (url) => (params, signal) =>
  envelope(api.get(url, { params: clean(params), signal }));

export const adminService = {
  dashboard: (signal) => unwrap(api.get("/admin/dashboard", { signal })),

  users: list("/admin/users"),
  setUserStatus: (id, body) =>
    unwrap(api.patch(`/admin/users/${id}/status`, body)),

  events: list("/admin/bhandaras"),
  moderate: (id, body) =>
    unwrap(api.patch(`/admin/bhandaras/${id}/moderation`, body)),

  reports: list("/admin/reports"),
  updateReport: (id, body) => unwrap(api.patch(`/admin/reports/${id}`, body)),

  organizers: list("/admin/organizers"),
  reviewOrganizer: (id, body) =>
    unwrap(api.patch(`/admin/organizers/${id}/verification`, body)),

  categories: (signal) =>
    unwrap(api.get("/admin/categories", { signal })).then((d) => d.categories),
  createCategory: (body) => unwrap(api.post("/admin/categories", body)),
  updateCategory: (id, body) =>
    unwrap(api.patch(`/admin/categories/${id}`, body)),
  deleteCategory: (id) => unwrap(api.delete(`/admin/categories/${id}`)),

  auditLogs: list("/admin/audit-logs"),

  settings: (signal) =>
    unwrap(api.get("/admin/settings", { signal })).then((d) => d.settings),
  saveSetting: (key, value) =>
    unwrap(api.put(`/admin/settings/${key}`, { value })),
};
