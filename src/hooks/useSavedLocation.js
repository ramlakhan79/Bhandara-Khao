import { useCallback, useState } from "react";
import { storage } from "../utils/storage.js";

const KEY = "bk-location";

/**
 * The visitor's chosen location, remembered on this device only.
 *   { type: 'coords', lat, lng }  or  { type: 'city', city }  or  null
 */
export function useSavedLocation() {
  const [location, setLocation] = useState(() => storage.get(KEY, null));

  const save = useCallback((value) => {
    if (value) storage.set(KEY, value);
    else storage.remove(KEY);
    setLocation(value || null);
  }, []);

  return [location, save];
}
