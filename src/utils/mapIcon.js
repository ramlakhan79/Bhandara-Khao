import L from "leaflet";

const svg = (fill) => `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" aria-hidden="true">
  <path d="M16 0C7.2 0 0 7 0 15.7 0 27 16 40 16 40s16-13 16-24.3C32 7 24.8 0 16 0z" fill="${fill}" stroke="#fff" stroke-width="2"/>
  <circle cx="16" cy="15.5" r="6" fill="#fff"/>
</svg>`;

export const pinIcon = (fill = "#c74c07") =>
  L.divIcon({
    className: "bk-pin",
    html: svg(fill),
    iconSize: [32, 40],
    iconAnchor: [16, 38],
    popupAnchor: [0, -34],
  });
