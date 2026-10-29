import api, { unwrap, envelope, clean } from "./api.js";

export const bookmarkService = {
  list: (params, signal) =>
    envelope(api.get("/bookmarks", { params: clean(params), signal })),
  add: (eventId) => unwrap(api.post(`/bookmarks/${eventId}`)),
  remove: (eventId) => unwrap(api.delete(`/bookmarks/${eventId}`)),
  setReminder: (eventId, remindBeforeHours) =>
    unwrap(api.put(`/bookmarks/${eventId}/reminder`, { remindBeforeHours })),
  removeReminder: (eventId) =>
    unwrap(api.delete(`/bookmarks/${eventId}/reminder`)),
};
