import { useCallback, useState } from "react";

/** status: idle | loading | granted | denied | unsupported */
export function useGeolocation() {
  const [state, setState] = useState({
    coords: null,
    status: navigator.geolocation ? "idle" : "unsupported",
    error: null,
  });

  const request = useCallback(
    () =>
      new Promise((resolve) => {
        if (!navigator.geolocation) {
          setState({
            coords: null,
            status: "unsupported",
            error: "Location is not supported on this device.",
          });
          return resolve(null);
        }
        setState((s) => ({ ...s, status: "loading", error: null }));
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = {
              lat: +pos.coords.latitude.toFixed(5),
              lng: +pos.coords.longitude.toFixed(5),
            };
            setState({ coords, status: "granted", error: null });
            resolve(coords);
          },
          (err) => {
            const denied = err.code === err.PERMISSION_DENIED;
            setState({
              coords: null,
              status: denied ? "denied" : "idle",
              error: denied
                ? "Location permission was denied. You can choose a city instead."
                : "Could not get your location. Please try again or choose a city.",
            });
            resolve(null);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 5 * 60 * 1000,
          },
        );
      }),
    [],
  );

  return { ...state, request };
}
