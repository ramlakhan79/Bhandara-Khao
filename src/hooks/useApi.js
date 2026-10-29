import { useCallback, useEffect, useRef, useState } from "react";
import { isCancel } from "../services/api.js";

/**
 * Runs `fetcher(signal)` whenever `deps` change. The previous request is cancelled automatically.
 *   const { data, loading, error, reload } = useApi((signal) => bhandaraService.stats(signal), []);
 */
export function useApi(
  fetcher,
  deps = [],
  { enabled = true, initialData = null } = {},
) {
  const [state, setState] = useState({
    data: initialData,
    loading: enabled,
    error: null,
  });
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) {
      setState((s) => ({ ...s, loading: false }));
      return undefined;
    }
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (isCancel(err) || controller.signal.aborted) return;
        setState((s) => ({ ...s, loading: false, error: err }));
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const setData = useCallback(
    (updater) =>
      setState((s) => ({
        ...s,
        data: typeof updater === "function" ? updater(s.data) : updater,
      })),
    [],
  );

  return { ...state, reload, setData };
}
