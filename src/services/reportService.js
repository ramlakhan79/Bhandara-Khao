import api, { unwrap } from "./api.js";

export const reportService = {
  create: (body) => unwrap(api.post("/reports", body)),
};
