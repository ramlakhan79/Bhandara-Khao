import api, { unwrap, envelope, clean } from "./api.js";

export const notificationService = {
  list: (params, signal) =>
    envelope(api.get("/notifications", { params: clean(params), signal })),
  markRead: (id) => unwrap(api.patch(`/notifications/${id}/read`)),
  markAllRead: () => unwrap(api.patch("/notifications/read-all")),
  updatePreferences: (prefs) =>
    unwrap(api.patch("/notifications/preferences", prefs)),
};
