/** Copies server-side field errors (from our API's 422 response) into react-hook-form. */
export function applyServerErrors(err, setError) {
  const fields = err?.fieldErrors || {};
  const keys = Object.keys(fields);
  keys.forEach((name) =>
    setError(name, { type: "server", message: fields[name] }),
  );
  return keys.length > 0;
}
