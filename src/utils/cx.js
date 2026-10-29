/** Joins truthy class names. */
export const cx = (...args) => args.flat().filter(Boolean).join(" ");
