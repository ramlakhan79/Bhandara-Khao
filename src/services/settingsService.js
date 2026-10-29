import api, { unwrap } from "./api.js";

export const settingsService = {
  get: (key, signal) => unwrap(api.get(`/settings/${key}`, { signal })),
};
