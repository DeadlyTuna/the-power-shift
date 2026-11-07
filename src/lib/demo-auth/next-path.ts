/**
 * Where to send a student after they sign in or create an account.
 *
 * Only same-site paths are accepted: they must start with a single "/"
 * (not "//" or "/\", which browsers treat as another host), contain no
 * control characters, and resolve to this origin. Anything else, and the
 * sign-in / sign-up pages themselves (to avoid loops), falls back to
 * `fallback`.
 */

export const ACCOUNT_HOME = "/account";
export const SIGN_IN_PATH = "/account/sign-in";
export const SIGN_UP_PATH = "/account/sign-up";

const PROBE_ORIGIN = "https://same-site.invalid";

export function safeNextPath(raw: string | null | undefined, fallback: string = ACCOUNT_HOME): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return fallback;

  let url: URL;
  try {
    url = new URL(raw, PROBE_ORIGIN);
  } catch {
    return fallback;
  }
  if (url.origin !== PROBE_ORIGIN) return fallback;
  if (url.pathname === SIGN_IN_PATH || url.pathname === SIGN_UP_PATH) return fallback;
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Link to an auth page that returns to `next` afterwards (omitted when it's the default). */
export function authHref(page: typeof SIGN_IN_PATH | typeof SIGN_UP_PATH, next?: string | null): string {
  const target = safeNextPath(next);
  return target === ACCOUNT_HOME ? page : `${page}?next=${encodeURIComponent(target)}`;
}
