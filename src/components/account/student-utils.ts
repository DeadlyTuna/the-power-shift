/** "Asha Rao" → "Asha". */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** "Asha Rao" → "AR", "asha" → "A". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "";
  return `${first}${last}`.toUpperCase();
}

/** "+919876543210" → "+91 98765 43210"; other numbers are returned as stored. */
export function formatPhone(phone: string): string {
  const indian = phone.match(/^\+91(\d{5})(\d{5})$/);
  return indian ? `+91 ${indian[1]} ${indian[2]}` : phone;
}

/** "November 2026" from an ISO date. */
export function formatMonthYear(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
}
