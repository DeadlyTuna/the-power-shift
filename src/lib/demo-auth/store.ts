/**
 * DEMO student accounts — browser-only, for showing the course experience
 * before a real backend exists.
 *
 * Everything lives in this browser's localStorage: accounts, the signed-in
 * session, and course enrollments with lesson progress. Nothing is sent to a
 * server, accounts don't sync between devices, and clearing site data removes
 * them. Passwords are never stored in plain text: each one is salted and
 * hashed with SHA-256 (Web Crypto). That is fine for a demo but is NOT a
 * substitute for real authentication — replace this module with a proper
 * auth provider (e.g. Auth.js, Clerk, Supabase) before taking real students.
 */

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

type StudentRecord = Student & { salt: string; passwordHash: string };

export type Enrollment = {
  slug: string;
  enrolledAt: string;
  /** Opaque checkout reference (demo or Razorpay). */
  reference: string;
  completedLessons: string[];
};

type Snapshot = {
  ready: boolean;
  student: Student | null;
  enrollments: Enrollment[];
};

const KEYS = {
  students: "tps-demo-students-v1",
  session: "tps-demo-session-v1",
  enrollments: "tps-demo-enrollments-v1",
} as const;

export const MIN_PASSWORD_LENGTH = 8;

/* ---------- storage helpers (every access guarded: private mode can throw) ---------- */

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/* ---------- crypto ---------- */

function toHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return toHex(arr);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  return toHex(await crypto.subtle.digest("SHA-256", data));
}

/** Web Crypto's `subtle` only exists on secure origins (https or localhost). */
async function tryHashPassword(password: string, salt: string): Promise<string | null> {
  try {
    return await hashPassword(password, salt);
  } catch {
    return null;
  }
}

const insecureContextError =
  "This browser can't secure a demo password on this connection. Open the site over https (or on localhost) and try again.";

function publicStudent(record: StudentRecord): Student {
  const { id, name, email, phone, createdAt } = record;
  return { id, name, email, phone, createdAt };
}

const normaliseEmail = (email: string) => email.trim().toLowerCase();

/* ---------- reactive snapshot for useSyncExternalStore ---------- */

const listeners = new Set<() => void>();
let snapshot: Snapshot = { ready: false, student: null, enrollments: [] };

function computeSnapshot(): Snapshot {
  const session = read<{ studentId: string } | null>(KEYS.session, null);
  const students = read<StudentRecord[]>(KEYS.students, []);
  const record = session ? students.find((s) => s.id === session.studentId) : undefined;
  const all = read<Record<string, Enrollment[]>>(KEYS.enrollments, {});
  return {
    ready: true,
    student: record ? publicStudent(record) : null,
    enrollments: record ? (all[record.id] ?? []) : [],
  };
}

function refresh() {
  snapshot = computeSnapshot();
  listeners.forEach((l) => l());
}

let storageListenerAttached = false;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    if (!snapshot.ready) snapshot = computeSnapshot();
    if (!storageListenerAttached) {
      // Keep other tabs in sync (sign-in/out, enrollments).
      window.addEventListener("storage", (e) => {
        if (e.key && (Object.values(KEYS) as string[]).includes(e.key)) refresh();
      });
      storageListenerAttached = true;
    }
  }
  return () => listeners.delete(listener);
}

export function getSnapshot(): Snapshot {
  if (typeof window !== "undefined" && !snapshot.ready) snapshot = computeSnapshot();
  return snapshot;
}

const serverSnapshot: Snapshot = { ready: false, student: null, enrollments: [] };
export function getServerSnapshot(): Snapshot {
  return serverSnapshot;
}

/* ---------- actions ---------- */

export type AuthResult =
  | { ok: true; student: Student; confirmEmail?: false }
  // Real accounts only: the account exists but the student must confirm their email before signing in.
  | { ok: true; student: null; confirmEmail: true; email: string }
  | { ok: false; error: string; field?: "email" | "password" };

export async function signUp(input: { name: string; email: string; phone: string; password: string }): Promise<AuthResult> {
  const email = normaliseEmail(input.email);
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, field: "password", error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  const students = read<StudentRecord[]>(KEYS.students, []);
  if (students.some((s) => s.email === email)) {
    return { ok: false, field: "email", error: "An account with this email already exists. Sign in instead." };
  }
  const salt = randomHex(16);
  const passwordHash = await tryHashPassword(input.password, salt);
  if (!passwordHash) return { ok: false, error: insecureContextError };
  const record: StudentRecord = {
    id: `stu_${randomHex(8)}`,
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    createdAt: new Date().toISOString(),
    salt,
    passwordHash,
  };
  if (!write(KEYS.students, [...students, record]) || !write(KEYS.session, { studentId: record.id })) {
    return { ok: false, error: "This browser is blocking storage, so a demo account can't be saved. Allow site data and try again." };
  }
  refresh();
  return { ok: true, student: publicStudent(record) };
}

export async function signIn(input: { email: string; password: string }): Promise<AuthResult> {
  const email = normaliseEmail(input.email);
  const record = read<StudentRecord[]>(KEYS.students, []).find((s) => s.email === email);
  // Same message for unknown email and wrong password, so accounts can't be probed.
  const failure: AuthResult = { ok: false, field: "password", error: "That email and password don't match a demo account in this browser." };
  if (!record) return failure;
  const passwordHash = await tryHashPassword(input.password, record.salt);
  if (!passwordHash) return { ok: false, error: insecureContextError };
  if (passwordHash !== record.passwordHash) return failure;
  write(KEYS.session, { studentId: record.id });
  refresh();
  return { ok: true, student: publicStudent(record) };
}

export function signOut() {
  remove(KEYS.session);
  refresh();
}

function updateEnrollments(update: (list: Enrollment[]) => Enrollment[]): boolean {
  const { student } = getSnapshot();
  if (!student) return false;
  const all = read<Record<string, Enrollment[]>>(KEYS.enrollments, {});
  all[student.id] = update(all[student.id] ?? []);
  const ok = write(KEYS.enrollments, all);
  refresh();
  return ok;
}

/** Adds a course to the signed-in student's enrollments (no-op if already enrolled). */
export function enroll(slug: string, reference: string): boolean {
  return updateEnrollments((list) =>
    list.some((e) => e.slug === slug)
      ? list
      : [...list, { slug, reference, enrolledAt: new Date().toISOString(), completedLessons: [] }],
  );
}

export function setLessonComplete(slug: string, lessonId: string, complete: boolean): boolean {
  return updateEnrollments((list) =>
    list.map((e) => {
      if (e.slug !== slug) return e;
      const done = new Set(e.completedLessons);
      if (complete) done.add(lessonId);
      else done.delete(lessonId);
      return { ...e, completedLessons: [...done] };
    }),
  );
}
