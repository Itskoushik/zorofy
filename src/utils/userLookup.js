const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function userEmailFilter(email) {
  return { email: { $regex: `^${escapeRegex(String(email || "").trim())}$`, $options: "i" } };
}
