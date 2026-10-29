import api, { unwrap } from "./api.js";

export const userService = {
  updateProfile: (body) =>
    unwrap(api.patch("/users/me", body)).then((d) => d.user),
  uploadAvatar(file) {
    const fd = new FormData();
    fd.append("image", file);
    return unwrap(api.post("/users/me/avatar", fd, { timeout: 60000 })).then(
      (d) => d.user,
    );
  },
  removeAvatar: () =>
    unwrap(api.delete("/users/me/avatar")).then((d) => d.user),
  changePassword: (body) => unwrap(api.patch("/users/me/password", body)),
  getOrganizerVerification: (signal) =>
    unwrap(api.get("/users/me/organizer-verification", { signal })),
  requestOrganizerVerification: (body) =>
    unwrap(api.post("/users/me/organizer-verification", body)),
};
