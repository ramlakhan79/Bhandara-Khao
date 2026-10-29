import { clientsClaim } from "workbox-core";
import {
  cleanupOutdatedCaches,
  precacheAndRoute,
  matchPrecache,
} from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import { NetworkOnly } from "workbox-strategies";

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// Build assets + offline.html only. API responses and event data are never cached.
precacheAndRoute(self.__WB_MANIFEST, { directoryIndex: null });

// Page loads always go to the network. If that fails, show the offline page
// (never a stale copy of an event page).
registerRoute(({ request }) => request.mode === "navigate", new NetworkOnly());

setCatchHandler(async ({ request }) => {
  if (request.destination === "document") {
    return (await matchPrecache("/offline.html")) || Response.error();
  }
  return Response.error();
});
