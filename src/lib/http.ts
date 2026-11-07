import { z } from "zod";
import { fieldErrors } from "./validation";

/**
 * Helpers for JSON route handlers and the forms that call them.
 *
 * Every API route responds with either
 *   { ok: true, ...payload }
 * or
 *   { ok: false, error: "Human-readable message", fields?: { field: message } }
 */

export type ApiError = { ok: false; error: string; fields?: Record<string, string> };
export type ApiSuccess<T extends object = object> = { ok: true } & T;
export type ApiResult<T extends object = object> = ApiSuccess<T> | ApiError;

export function apiError(status: number, error: string, fields?: Record<string, string>) {
  return Response.json({ ok: false, error, ...(fields ? { fields } : {}) } satisfies ApiError, { status });
}

export function apiOk<T extends object>(payload: T = {} as T, init?: ResponseInit) {
  return Response.json({ ok: true, ...payload }, init);
}

/** Parse and validate a JSON request body. Returns data or a ready-made 400 response. */
export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<{ data: z.infer<S>; response?: never } | { data?: never; response: Response }> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { response: apiError(400, "The request could not be read. Please refresh the page and try again.") };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return { response: apiError(422, "Please check the highlighted fields.", fieldErrors(parsed.error)) };
  }
  return { data: parsed.data };
}

/** Client-side: POST JSON and always resolve to an ApiResult (network failures included). */
export async function postJSON<T extends object = object>(url: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as ApiResult<T> | null;
    if (json && typeof json === "object" && "ok" in json) return json;
    return { ok: false, error: `Something went wrong (error ${res.status}). Please try again.` };
  } catch {
    return { ok: false, error: "You appear to be offline. Check your connection and try again." };
  }
}
