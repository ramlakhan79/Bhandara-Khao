import api, { unwrap, envelope, clean } from "./api.js";

export const bhandaraService = {
  list: (params, signal) =>
    envelope(api.get("/bhandaras", { params: clean(params), signal })),
  nearby: (params, signal) =>
    envelope(api.get("/bhandaras/nearby", { params: clean(params), signal })),
  featured: (limit = 6, signal) =>
    unwrap(api.get("/bhandaras/featured", { params: { limit }, signal })).then(
      (d) => d.items,
    ),
  categories: (signal) =>
    unwrap(api.get("/bhandaras/categories", { signal })).then(
      (d) => d.categories,
    ),
  stats: (signal) =>
    unwrap(api.get("/bhandaras/stats", { signal })).then((d) => d.stats),
  cities: (signal) =>
    unwrap(api.get("/bhandaras/cities", { signal })).then((d) => d.cities),
  suggest: (q, signal) =>
    unwrap(api.get("/bhandaras/suggest", { params: { q }, signal })),
  bySlug: (slug, signal) =>
    unwrap(api.get(`/bhandaras/${slug}`, { signal })).then((d) => d.event),
  related: (slug, signal) =>
    unwrap(api.get(`/bhandaras/${slug}/related`, { signal })),
  trackView: (id) => api.post(`/bhandaras/${id}/view`).catch(() => {}),

  mine: (params, signal) =>
    envelope(api.get("/users/me/bhandaras", { params: clean(params), signal })),
  create: (body) => unwrap(api.post("/bhandaras", body)).then((d) => d.event),
  update: (id, body) =>
    unwrap(api.patch(`/bhandaras/${id}`, body)).then((d) => d.event),
  cancel: (id, reason) =>
    unwrap(api.patch(`/bhandaras/${id}/cancel`, { reason })).then(
      (d) => d.event,
    ),
  remove: (id) => unwrap(api.delete(`/bhandaras/${id}`)),
  duplicate: (id) =>
    unwrap(api.post(`/bhandaras/${id}/duplicate`)).then((d) => d.event),

  /** Uploads up to 8 images; resolves { uploaded: [{url,publicId,width,height}], failed: [...] } */
  uploadImages(files, { onProgress, signal } = {}) {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    return unwrap(
      api.post("/bhandaras/images", fd, {
        signal,
        timeout: 120000,
        onUploadProgress: (e) =>
          e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
      }),
    );
  },
  deleteUploadedImage: (publicId) =>
    unwrap(api.delete("/bhandaras/images", { data: { publicId } })),
};
